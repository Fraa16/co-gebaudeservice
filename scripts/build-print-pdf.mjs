/**
 * Turns the card PDF into a file a print shop can use without asking questions.
 *
 *   sudo apt-get install ghostscript      # not a project dependency
 *   node scripts/build-business-card.mjs  # first, this produces the source PDF
 *   node scripts/build-print-pdf.mjs
 *
 * The source is what Chromium writes, and three things about it are wrong for print:
 *
 *  1. **Type3 fonts.** Skia cannot subset a variable font, so it emits the glyphs as
 *     Type3 charprocs. The drawing is all there, but Type3 is the classic "fine on
 *     screen, trouble at the RIP" case and preflight tools flag it. `-dNoOutputFonts`
 *     turns every glyph into a filled path, so the file carries no fonts at all and
 *     there is nothing left to substitute, subset or misinterpret.
 *  2. **RGB.** Converted to CMYK here. Ghostscript's default conversion is generic, not
 *     a press profile, so the values are a starting point the printer may override —
 *     the spec sheet says so, and prints the resulting navy so it can be checked.
 *  3. **No TrimBox.** Chromium writes only a MediaBox, so a prepress system has no way
 *     to know where the 85 × 55 mm card sits inside the 91 × 61 mm sheet. Both boxes
 *     are set here.
 *
 * Nothing about the layout changes. The rendered pages are compared against the source
 * afterwards, pixel for pixel, because a colour-space conversion that quietly drops an
 * element is exactly the kind of fault that is only found on paper.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, renameSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'brand/visitenkarte/druck';
mkdirSync(OUT, { recursive: true });

const MM = 2.834645669; // pt per mm
const TRIM_W = 85;
const TRIM_H = 55;
const BLEED = 3;

/** Page boxes in points, read from the source rather than recomputed, so a rounding
 *  difference in Chromium's page size cannot put the trim box off-centre. */
function boxes(file) {
  const media = /\/MediaBox\s*\[([^\]]*)\]/.exec(readFileSync(file, 'latin1'));
  if (!media) throw new Error(`${file}: no MediaBox`);
  const [, , w, h] = media[1].trim().split(/\s+/).map(Number);
  /* The inset is whatever is left over once the card is centred, so the same code
     serves the plain sheet and the one carrying crop marks. */
  const inset = (w - TRIM_W * MM) / 2;
  const bleedInset = inset - BLEED * MM;
  const trim = [inset, (h - TRIM_H * MM) / 2, w - inset, h - (h - TRIM_H * MM) / 2];
  // The drawn card must actually be the size the trim box claims.
  const gotW = (trim[2] - trim[0]) / MM;
  const gotH = (trim[3] - trim[1]) / MM;
  if (Math.abs(gotW - TRIM_W) > 0.2 || Math.abs(gotH - TRIM_H) > 0.2) {
    throw new Error(`trim would be ${gotW.toFixed(2)} × ${gotH.toFixed(2)} mm, want ${TRIM_W} × ${TRIM_H}`);
  }
  return { media: [0, 0, w, h], trim, bleed: [trim[0] - BLEED * MM, trim[1] - BLEED * MM, trim[2] + BLEED * MM, trim[3] + BLEED * MM] };
}

function prepress(src, dest) {
  const { media, trim, bleed } = boxes(src);
  execFileSync('gs', [
    '-dNOPAUSE', '-dBATCH', '-dQUIET', '-dSAFER',
    '-sDEVICE=pdfwrite',
    '-dNoOutputFonts',                  // glyphs become paths; no fonts survive
    '-sColorConversionStrategy=CMYK',
    '-dProcessColorModel=/DeviceCMYK',
    '-dCompatibilityLevel=1.4',
    '-dPDFSETTINGS=/prepress',
    '-dAutoRotatePages=/None',
    '-dDownsampleColorImages=false',
    '-dDownsampleGrayImages=false',
    '-dDownsampleMonoImages=false',
    `-sOutputFile=${dest}`,
    src,
  ]);

  setBoxes(dest, trim, bleed);
  normalise(dest);
  return { media, trim };
}

/** Write TrimBox and BleedBox into every page dictionary.
 *
 *  The obvious route is a pdfmark prologue, and it silently does the wrong thing: a
 *  `/PAGES pdfmark` applies to the page that is current when it runs, so the boxes
 *  landed on page 1 and page 2 was left with nothing but a MediaBox. A card whose back
 *  has no trim box is a card whose back a prepress system will centre by guessing.
 *
 *  So the dictionaries are edited directly. At compatibility level 1.4 Ghostscript
 *  writes no object streams, which means the page objects are plain text in the file
 *  and this is an ordinary substitution rather than a gamble. The count is asserted
 *  afterwards. */
function setBoxes(file, trim, bleed) {
  const pdf = readFileSync(file, 'latin1');
  const box = (name, v) => `/${name} [${v.map((n) => n.toFixed(3)).join(' ')}]`;
  let patched = 0;
  const out = pdf.replace(/\/Type\s*\/Page(?![s])/g, (m) => {
    patched++;
    return `${m} ${box('TrimBox', trim)} ${box('BleedBox', bleed)}`;
  });
  if (patched !== 2) throw new Error(`${file}: expected 2 page objects, patched ${patched}`);
  writeFileSync(file, out, 'latin1');
}

/** Rewrite the file so its cross-reference table matches its bytes again.
 *
 *  setBoxes() inserts text into page dictionaries and every byte offset after the first
 *  edit is then wrong. Ghostscript repairs such a file silently and says nothing unless
 *  asked, which is precisely why it is dangerous: it reads fine here and may be refused
 *  by the prepress software of a shop we cannot ring up. Running it back through
 *  pdfwrite rebuilds the table, and both boxes survive the trip. */
function normalise(file) {
  const tmp = `${file}.tmp`;
  execFileSync('gs', [
    '-dNOPAUSE', '-dBATCH', '-dQUIET', '-dSAFER',
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    '-dPDFSETTINGS=/prepress',
    '-dAutoRotatePages=/None',
    `-sOutputFile=${tmp}`,
    file,
  ]);
  renameSync(tmp, file);

  const pdf = readFileSync(file, 'latin1');
  const at = /startxref\s+(\d+)/.exec(pdf);
  if (!at || !/^xref/.test(pdf.slice(Number(at[1])))) {
    throw new Error(`${file}: startxref still does not point at a table`);
  }
}

/** Ghostscript reports PDFINFO on stderr, not stdout, so both streams are taken. */
function pdfInfo(file) {
  const r = spawnSync('gs', ['-q', '-dNODISPLAY', '-dPDFINFO', file, '-c', 'quit'], {
    encoding: 'utf8',
  });
  return `${r.stdout ?? ''}${r.stderr ?? ''}`;
}

/** Render a page to pixels so the converted file can be compared with its source. */
let renderSeq = 0;
async function page(file, index, dpi = 200) {
  /* Unique per call: the two renders being compared run concurrently, and sharing one
     temp name meant each deleted the file the other was still reading. */
  const png = `${OUT}/.p${renderSeq++}.png`;
  execFileSync('gs', [
    '-dNOPAUSE', '-dBATCH', '-dQUIET', '-dSAFER',
    '-sDEVICE=png16m', `-r${dpi}`,
    `-dFirstPage=${index + 1}`, `-dLastPage=${index + 1}`,
    `-sOutputFile=${png}`, file,
  ]);
  const buf = await sharp(png).resize(700, null).raw().toBuffer({ resolveWithObject: true });
  rmSync(png);
  return buf;
}

/** Decode the QR out of the *finished* file.
 *
 *  The card generator already gates on this, but it gates on its own render. By the
 *  time a file reaches a printer it has been through glyph outlining, an RGB to CMYK
 *  conversion and two pdfwrite passes, and none of that was ever checked against the
 *  code. A QR that stops scanning is only discovered on printed cards.
 *
 *  Decoded from a crop of the bottom-right quarter of the trim area rather than the
 *  whole page: jsQR hunts finder patterns across everything it is given and the crop
 *  marks near the sheet edge were enough to distract it, which reads as a broken code
 *  when the code is fine. A phone is pointed at the symbol, not at the sheet. */
async function qrSurvives(file, trim) {
  const { default: jsQR } = await import('jsqr');
  const expected = 'https://co-gebaeudeservice.de';

  for (const [dpi, blur] of [[300, 0], [200, 0.8]]) {
    const png = `${OUT}/.qr.png`;
    execFileSync('gs', [
      '-dNOPAUSE', '-dBATCH', '-dQUIET', '-sDEVICE=png16m', `-r${dpi}`,
      '-dFirstPage=2', '-dLastPage=2', `-sOutputFile=${png}`, file,
    ]);
    const px = dpi / 72; // the render is in points, like the boxes
    let pipe = sharp(png).extract({
      left: Math.round((trim[0] + (trim[2] - trim[0]) / 2) * px),
      top: Math.round((trim[1] + (trim[3] - trim[1]) / 2) * px),
      width: Math.round(((trim[2] - trim[0]) / 2) * px),
      height: Math.round(((trim[3] - trim[1]) / 2) * px),
    });
    if (blur) pipe = pipe.blur(blur);
    const { data, info } = await pipe.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const found = jsQR(new Uint8ClampedArray(data), info.width, info.height);
    rmSync(png);
    if (found?.data !== expected) {
      throw new Error(
        `${file}: the QR no longer decodes at ${dpi} dpi (blur ${blur}) — got ${found?.data ?? 'nothing'}`,
      );
    }
  }
  return 'QR lesbar bei 300 und 200 dpi mit Weichzeichner';
}

/** Mean absolute difference per channel, 0–255. */
async function diff(a, b) {
  const [x, y] = await Promise.all([a, b]);
  if (x.info.width !== y.info.width || x.info.height !== y.info.height) return Infinity;
  let sum = 0;
  for (let i = 0; i < x.data.length; i++) sum += Math.abs(x.data[i] - y.data[i]);
  return sum / x.data.length;
}

/* Only the chosen layout reaches the print folder. The rounded-panel variant stays in
 * the parent directory as a design alternative: a folder handed to a printer abroad
 * should contain one artwork, not a choice they might make for us.
 *
 * flaechig is that layout as of the client's decision: the colour runs to the cut edge
 * and the corners are square. The rounded panel it replaces was printed rounding on a
 * straight-cut card, which a printer could have mistaken for a die-cut instruction and
 * then cut through. */
const SOURCES = {
  'CO-Visitenkarte-CMYK': 'brand/visitenkarte/visitenkarte-flaechig-druck.pdf',
  'CO-Visitenkarte-CMYK-Schnittmarken':
    'brand/visitenkarte/visitenkarte-flaechig-schnittmarken-druck.pdf',
};

for (const [name, src] of Object.entries(SOURCES)) {
  const dest = `${OUT}/${name}.pdf`;
  const { trim } = prepress(src, dest);

  const info = pdfInfo(dest);
  const raw = readFileSync(dest, 'latin1');

  const problems = [];
  if (/Fonts used:\s*\n\s*\S/.test(info)) problems.push('the file still carries fonts');
  const count = (needle) => raw.split(needle).length - 1;
  if (count('/TrimBox') !== 2) problems.push(`TrimBox on ${count('/TrimBox')} of 2 pages`);
  if (count('/BleedBox') !== 2) problems.push(`BleedBox on ${count('/BleedBox')} of 2 pages`);
  if (/\/DeviceRGB/.test(raw)) problems.push('DeviceRGB survived the conversion');
  if (!/File has 2 pages/.test(info)) problems.push('page count is not 2');
  if (problems.length) throw new Error(`${dest}: ${problems.join('; ')}`);

  for (const i of [0, 1]) {
    const d = await diff(page(src, i), page(dest, i));
    /* A colour-space conversion moves every pixel a little; a dropped element moves a
       lot. The threshold is loose enough for the first and nowhere near the second. */
    if (d > 12) throw new Error(`${dest} page ${i + 1}: renders differ by ${d.toFixed(1)}/255`);
    if (i === 0) console.log(`  ${name.padEnd(9)} Seite 1 Abweichung ${d.toFixed(2)}/255`);
    else console.log(`  ${' '.repeat(9)} Seite 2 Abweichung ${d.toFixed(2)}/255`);
  }
  const qr = await qrSurvives(dest, trim);
  console.log(
    `  ${' '.repeat(9)} TrimBox ${((trim[2] - trim[0]) / MM).toFixed(2)} × ` +
      `${((trim[3] - trim[1]) / MM).toFixed(2)} mm, CMYK, ohne Schriften`,
  );
  console.log(`  ${' '.repeat(9)} ${qr}`);
}
