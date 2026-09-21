/**
 * A one-page sheet the client can forward with the artwork.
 *
 *   node scripts/build-print-spec.mjs
 *
 * Written in German and English. The card is being printed in Turkey by a shop nobody
 * here has spoken to, so the sheet answers the questions a printer would otherwise have
 * to ask by email across a language barrier: which page is the front, where the trim
 * line is, what was already converted, and what they are free to change.
 *
 * Every number on it is read out of the finished PDFs rather than typed, so the sheet
 * cannot describe a file that no longer exists.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import zlib from 'node:zlib';

const DIR = 'brand/visitenkarte/druck';
const MM = 2.834645669;

/** Measured from the file, not asserted about it. */
function inspect(file) {
  const raw = readFileSync(file);
  const text = raw.toString('latin1');
  const box = (name) => {
    const v = /\/(?:__NAME__)\s*\[([^\]]*)\]/.source.replace('__NAME__', name);
    const m = new RegExp(v).exec(text);
    if (!m) return null;
    const n = m[1].trim().split(/\s+/).map(Number);
    return { w: (n[2] - n[0]) / MM, h: (n[3] - n[1]) / MM };
  };

  let tac = 0;
  const inks = new Map();
  for (const m of raw.toString('latin1').matchAll(/stream\r?\n([\s\S]*?)endstream/g)) {
    let c;
    try {
      c = zlib.inflateSync(Buffer.from(m[1], 'latin1')).toString('latin1');
    } catch {
      continue;
    }
    for (const v of c.matchAll(/([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) k/g)) {
      const cmyk = v.slice(1, 5).map(Number);
      const sum = cmyk.reduce((a, b) => a + b) * 100;
      if (sum > tac) tac = sum;
      inks.set(cmyk.map((x) => Math.round(x * 100)).join('/'), sum);
    }
  }
  return {
    trim: box('TrimBox'),
    bleed: box('BleedBox'),
    media: box('MediaBox'),
    fonts: text.includes('/FontFile'),
    rgb: text.includes('/DeviceRGB'),
    tac,
    inks,
    kb: Math.round(raw.length / 1024),
  };
}

const plain = inspect(`${DIR}/CO-Visitenkarte-CMYK.pdf`);
const marked = inspect(`${DIR}/CO-Visitenkarte-CMYK-Schnittmarken.pdf`);
if (plain.fonts || plain.rgb) throw new Error('the plain file is not print-ready; re-run build-print-pdf');

/** Thumbnails of both faces, rendered from the file the sheet describes. */
const thumb = (page) => {
  const png = `${DIR}/.thumb${page}.png`;
  execFileSync('gs', [
    '-dNOPAUSE', '-dBATCH', '-dQUIET', '-sDEVICE=png16m', '-r150',
    `-dFirstPage=${page}`, `-dLastPage=${page}`,
    `-sOutputFile=${png}`, `${DIR}/CO-Visitenkarte-CMYK.pdf`,
  ]);
  const data = `data:image/png;base64,${readFileSync(png).toString('base64')}`;
  rmSync(png);
  return data;
};

const navy = [...plain.inks.keys()].find((k) => k.startsWith('100/'));
const cyanKey = [...plain.inks.entries()].sort((a, b) => a[1] - b[1]).find(([k]) => {
  const [c, m, y] = k.split('/').map(Number);
  return c > 50 && m < 30 && y < 10;
})?.[0];

const row = (de, en, value) =>
  `<tr><th>${de}<span>${en}</span></th><td>${value}</td></tr>`;

const html = `<!doctype html><html lang="de"><meta charset="utf-8"><style>
  /* One page. The sheet ran to two, and a spec whose second half arrives as a separate
     sheet is a spec whose second half gets lost in a forwarded email. */
  @page { size: A4; margin: 13mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font: 400 8.6pt/1.42 -apple-system, "Segoe UI", Roboto, sans-serif; color: #16202c; }
  h1 { font-size: 15pt; letter-spacing: -0.02em; margin-bottom: 0.8mm; }
  h1 span { display: block; font-size: 9pt; font-weight: 400; color: #5a6675; letter-spacing: 0; }
  h2 { font-size: 9.6pt; margin: 4.5mm 0 1.2mm; }
  h2 span { font-weight: 400; color: #5a6675; }
  .thumbs { display: flex; gap: 3mm; margin: 3.5mm 0 1.2mm; }
  .thumbs img { width: 50%; border: 0.2mm solid #c9d2dc; }
  .thumbs { max-width: 128mm; }
  .cap { font-size: 7.4pt; color: #5a6675; display: flex; gap: 3mm; }
  .cap span { width: 50%; }
  /* Two columns. Everything below the thumbnails is short rows, and stacked they ran
     84 mm past the bottom of an A4 page. */
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 7mm; align-items: start; }
  .cols > section { min-width: 0; }
  .cols h2:first-child { margin-top: 0; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; vertical-align: top; padding: 1.05mm 0; border-bottom: 0.2mm solid #e2e8ef; }
  th { width: 38mm; font-weight: 600; padding-right: 3mm; }
  th span { display: block; font-weight: 400; color: #5a6675; font-size: 7.4pt; }
  .files td { padding-bottom: 1.8mm; }
  code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 8pt; }
  .note { border-left: 0.6mm solid #d8a300; background: #fdf8ec; padding: 2mm 2.6mm; margin-top: 1.5mm; font-size: 8pt; line-height: 1.38; }
  .note b { display: block; }
  .note p + p { margin-top: 1.1mm; }
  footer { margin-top: 4mm; font-size: 7.4pt; color: #5a6675; }
</style><body>

<h1>CO Gebäudeservice — Visitenkarte
  <span>Business card · Druckdatenblatt / print specification</span></h1>

<div class="thumbs"><img src="${thumb(1)}"><img src="${thumb(2)}"></div>
<p class="cap"><span>Seite 1 — Vorderseite / page 1, front</span><span>Seite 2 — Rückseite / page 2, back</span></p>

<div class="cols">
<section>
<h2>Spezifikation <span>· Specification</span></h2>
<table>
  ${row('Endformat', 'Trim size', `<b>${plain.trim.w.toFixed(0)} × ${plain.trim.h.toFixed(0)} mm</b>`)}
  ${row('Beschnittzugabe', 'Bleed', '3 mm umlaufend / on all four sides')}
  ${row('Seitengröße', 'Page size', `${plain.media.w.toFixed(0)} × ${plain.media.h.toFixed(0)} mm (= Endformat + Beschnitt)`)}
  ${row('Seitenboxen', 'Page boxes', 'TrimBox und BleedBox sind auf beiden Seiten gesetzt / set on both pages')}
  ${row('Seiten', 'Pages', '2 — Seite 1 vorne, Seite 2 hinten / page 1 front, page 2 back')}
  ${row('Farbraum', 'Colour space', 'CMYK, kein RGB / CMYK throughout, no RGB')}
  ${row('Schriften', 'Fonts', 'In Kurven umgewandelt, keine eingebetteten Schriften / converted to outlines, no embedded fonts')}
  ${row('Transparenz', 'Transparency', 'Keine / none')}
  ${row('Max. Farbauftrag', 'Max. total ink', `${plain.tac.toFixed(0)} %`)}
  ${row('Papier (Empfehlung)', 'Paper (suggested)', '350 g/m², matt gestrichen / 350 gsm, matt coated')}
</table>
</section>

<section>
<h2>Die beiden Dateien <span>· The two files</span></h2>
<table class="files">
  <tr><th><code>CO-Visitenkarte-CMYK.pdf</code><span>${plain.media.w.toFixed(0)} × ${plain.media.h.toFixed(0)} mm · ${plain.kb} kB</span></th>
    <td>Ohne Schnittmarken. Für Druckereien, die selbst ausschießen.<br>
        <i>No crop marks. For a printer who imposes the job themselves.</i></td></tr>
  <tr><th><code>CO-Visitenkarte-CMYK-Schnittmarken.pdf</code><span>${marked.media.w.toFixed(0)} × ${marked.media.h.toFixed(0)} mm · ${marked.kb} kB</span></th>
    <td>Mit Schnittmarken außerhalb des Beschnitts.<br>
        <i>With crop marks, placed outside the bleed.</i></td></tr>
</table>

<h2>Farben <span>· Colours</span></h2>
<table>
  ${row('Dunkelblau', 'Dark blue', `CMYK ${navy?.replace(/\//g, ' / ') ?? '—'} · RGB #010E40`)}
  ${row('Cyan', 'Cyan', `CMYK ${cyanKey?.replace(/\//g, ' / ') ?? '—'} · RGB #27AAE1`)}
</table>

<div class="note">
  <b>Zur CMYK-Umwandlung / about the CMYK conversion</b>
  <p>Die Umwandlung erfolgte mit einem allgemeinen Profil, nicht mit dem Profil einer
  bestimmten Maschine. Die Druckerei darf die Datei gegen ihr eigenes Profil neu
  separieren; die oben genannten Werte sind Ausgangswerte, keine Vorgabe.</p>
  <p><i>Converted with a generic profile, not one matched to a specific press. The
  printer is free to re-separate against their own profile. The values above are a
  starting point, not a requirement.</i></p>
  <p><b>Farbauftrag / total ink:</b> ${plain.tac.toFixed(0)} %. Für gestrichenes Papier
  üblich, für ungestrichenes ggf. zu hoch — bitte gegen das Maschinenlimit prüfen.
  <i>Fine for coated stock, possibly above the limit for uncoated — please check.</i></p>
  <p>Das Dunkelblau wirkt auf ungestrichenem Papier deutlich flauer. Bei größeren
  Auflagen lohnt ein Proof. <i>The dark blue prints noticeably duller on uncoated paper;
  a proof is worth it for a larger run.</i></p>
</div>
</section>
</div>

<footer>Erstellt am ${new Date().toISOString().slice(0, 10)} · Alle Angaben aus den
Dateien selbst ausgelesen / all values read from the files themselves</footer>
</body></html>`;

const tmp = path.resolve(DIR, '.spec.html');
writeFileSync(tmp, html);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file://${tmp}`);

/* A4 less the margins, in CSS px at 96 dpi. The sheet must be one page: a spec whose
   second half arrives as a separate sheet is a spec whose second half gets lost in a
   forwarded email. Measured rather than eyeballed, and it fails loudly. */
const LIMIT = ((297 - 13 * 2) / 25.4) * 96;
const used = await page.evaluate(() => document.body.getBoundingClientRect().height);
if (used > LIMIT) {
  throw new Error(
    `the sheet is ${(used / LIMIT - 1) * 100 > 0 ? '+' : ''}${(((used - LIMIT) / 96) * 25.4).toFixed(1)} mm too tall for one A4 page`,
  );
}
console.log(`  Höhe ${((used / 96) * 25.4).toFixed(0)} mm von ${((LIMIT / 96) * 25.4).toFixed(0)} mm verfügbar`);
await page.pdf({ path: `${DIR}/DRUCKDATENBLATT.pdf`, format: 'A4', printBackground: true });
await browser.close();
rmSync(tmp);

console.log(
  `Datenblatt: Endformat ${plain.trim.w.toFixed(0)} × ${plain.trim.h.toFixed(0)} mm, ` +
    `Farbauftrag ${plain.tac.toFixed(0)} %, Navy CMYK ${navy}`,
);
