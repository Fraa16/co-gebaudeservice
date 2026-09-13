/**
 * Generates the logo SVGs and the full favicon set, then rasterises the PNGs.
 * Text is converted to outlines so the SVGs carry no font dependency.
 *
 * One-shot: the outputs are committed. Re-run only when the mark changes:
 *   npm i --no-save fontkit @fontsource/archivo @fontsource/source-sans-3
 *   node scripts/build-brand-assets.mjs
 *
 * Construction rules from the CI sheet (design/prototypes/ci-sheet.dc.html):
 *   "Der Bogen steht für den Wisch- und Reinigungszug und verbindet die beiden
 *    Buchstaben. Schutzraum: mindestens die Höhe des 'C' auf allen Seiten.
 *    Mindestbreite der horizontalen Variante 90 px, der Bildmarke 24 px."
 */
import { createRequire } from 'node:module';
const fontkit = createRequire(import.meta.url)('fontkit');
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';

const INK = '#03045E';
const CYAN = '#00B4D8';
const ICE = '#90E0EF';
const WHITE = '#FFFFFF';

const ARCHIVO_700 = 'node_modules/@fontsource/archivo/files/archivo-latin-700-normal.woff2';
const SOURCE_600 = 'node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-600-normal.woff2';

/** Lay out a string and return its outline path plus metrics, in font units (Y up). */
function outline(fontPath, text, letterSpacingEm = 0) {
  const font = fontkit.openSync(fontPath);
  const run = font.layout(text);
  const tracking = letterSpacingEm * font.unitsPerEm;
  let d = '';
  let x = 0;
  const bbox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const glyph of run.glyphs) {
    const p = glyph.path.translate(x, 0);
    const b = p.bbox;
    if (Number.isFinite(b.minX)) {
      bbox.minX = Math.min(bbox.minX, b.minX);
      bbox.minY = Math.min(bbox.minY, b.minY);
      bbox.maxX = Math.max(bbox.maxX, b.maxX);
      bbox.maxY = Math.max(bbox.maxY, b.maxY);
    }
    d += p.toSVG() + ' ';
    x += glyph.advanceWidth + tracking;
  }
  return { d: d.trim(), advance: x - tracking, upm: font.unitsPerEm, bbox };
}

/** Wrap a font-unit path in a group that scales it to `size` px and flips Y. */
function glyphGroup({ d, upm, bbox }, size, tx, ty, fill) {
  const s = size / upm;
  // Place the cap-height top at ty.
  const top = bbox.maxY * s;
  return `<g transform="translate(${round(tx)} ${round(ty + top)}) scale(${round(s, 6)} ${round(-s, 6)})"><path d="${d}" fill="${fill}"/></g>`;
}

const round = (n, p = 3) => Number(n.toFixed(p));

/** The Bildmarke: rounded square, the cleaning swoosh, "CO" on top. */
function mark({ size = 64, bg = INK, letters = WHITE, swoosh = CYAN, radius }) {
  const co = outline(ARCHIVO_700, 'CO');
  const r = radius ?? round(size * (12 / 38)); // --co-radius-logo at the prototype's 38px
  const letterSize = size * 0.37; // matches the header mark
  const scaled = (letterSize / co.upm);
  const textW = (co.bbox.maxX - co.bbox.minX) * scaled;
  const capH = co.bbox.maxY * scaled;
  const tx = (size - textW) / 2 - co.bbox.minX * scaled;
  const ty = (size - capH) / 2;

  // The prototype's arc, expressed in the 38-unit space and scaled to `size`.
  const k = size / 38;
  const arc = `M${round(-3 * k)} ${round(29 * k)} C ${round(8 * k)} ${round(14 * k)}, ${round(21 * k)} ${round(35 * k)}, ${round(44 * k)} ${round(10 * k)}`;

  return `<rect width="${size}" height="${size}" rx="${r}" fill="${bg}"/>
  <path d="${arc}" stroke="${swoosh}" stroke-width="${round(3.6 * k)}" fill="none" stroke-linecap="round"/>
  ${glyphGroup(co, letterSize, tx, ty, letters)}`;
}

function svg(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="CO Gebäudeservice">\n  ${body}\n</svg>\n`;
}

/** Horizontal lockup: mark + "CO" + cyan rule + "GEBÄUDESERVICE". */
function horizontal({ onDark = false } = {}) {
  const size = 64;
  const gap = 18;
  const co = outline(ARCHIVO_700, 'CO');
  const word = outline(SOURCE_600, 'GEBÄUDESERVICE', 0.18);

  const coSize = 34;
  const coScale = coSize / co.upm;
  // Width from the advance, not the ink bbox: the bbox omits the final glyph's
  // right side bearing and the tracking, which clipped the wordmark.
  const coW = co.advance * coScale;

  const wordSize = 11;
  const wordScale = wordSize / word.upm;
  const wordW = word.advance * wordScale;

  const textX = size + gap;
  const textW = Math.max(coW, wordW);
  const width = Math.ceil(textX + textW + 2);
  // The text column (CO + rule + label) is a little taller than the mark, so the
  // canvas follows the text and the mark is centred against it.
  const textTop = 4;
  const ruleY = textTop + coSize * 1.02;
  const labelTop = ruleY + 10;
  const height = Math.max(size, Math.ceil(labelTop + wordSize * 1.1));
  const markY = Math.max(0, (height - size) / 2);

  const inkFill = onDark ? WHITE : INK;
  const ruleFill = onDark ? ICE : CYAN;
  const labelFill = onDark ? ICE : INK;

  return svg(
    width,
    height,
    [
      `<g transform="translate(0 ${round(markY)})">${mark({
        size,
        bg: onDark ? WHITE : INK,
        letters: onDark ? INK : WHITE,
        swoosh: CYAN,
      })}</g>`,
      glyphGroup(co, coSize, textX - co.bbox.minX * coScale, textTop, inkFill),
      `<rect x="${textX}" y="${round(ruleY)}" width="${round((co.bbox.maxX - co.bbox.minX) * coScale)}" height="2" rx="1" fill="${ruleFill}"/>`,
      glyphGroup(word, wordSize, textX - word.bbox.minX * wordScale, round(labelTop), labelFill),
    ].join('\n  '),
  );
}

mkdirSync('public/og', { recursive: true });

// --- SVGs ------------------------------------------------------------------
const markSvg = svg(64, 64, mark({ size: 64 }));
const markSvgOnDark = svg(64, 64, mark({ size: 64, bg: WHITE, letters: INK, swoosh: CYAN }));

writeFileSync('public/favicon.svg', markSvg);
writeFileSync('public/mark.svg', markSvg);
writeFileSync('public/mark-invert.svg', markSvgOnDark);
writeFileSync('public/logo.svg', horizontal());
writeFileSync('public/logo-invert.svg', horizontal({ onDark: true }));

// --- Rasters ---------------------------------------------------------------
const buf = Buffer.from(markSvg);
const png = (size) => sharp(buf, { density: 384 }).resize(size, size).png({ compressionLevel: 9 });

await png(96).toFile('public/favicon-96.png');
await png(192).toFile('public/icon-192.png');
await png(512).toFile('public/icon-512.png');

// Apple wants an opaque square with no transparency and no rounding of its own.
await sharp(buf, { density: 384 })
  .resize(180, 180)
  .flatten({ background: INK })
  .png({ compressionLevel: 9 })
  .toFile('public/apple-touch-icon.png');

// Maskable: the mark inset into the safe zone on a solid ground.
await sharp({
  create: { width: 512, height: 512, channels: 4, background: INK },
})
  .composite([{ input: await png(320).toBuffer(), gravity: 'centre' }])
  .png({ compressionLevel: 9 })
  .toFile('public/icon-512-maskable.png');

// favicon.ico (16/32/48 in one file)
const ico = await sharp(buf, { density: 384 }).resize(48, 48).png().toBuffer();
writeFileSync('public/favicon.ico', await toIco([ico]));

writeFileSync(
  'public/site.webmanifest',
  JSON.stringify(
    {
      name: 'CO Gebäudeservice',
      short_name: 'CO',
      lang: 'de',
      start_url: '/',
      display: 'standalone',
      background_color: '#E7EDF3',
      theme_color: INK,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  ) + '\n',
);

/** Minimal ICO container around PNG entries. */
async function toIco(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6 + 16 * count);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = header.length;
  const parts = [header];
  for (let i = 0; i < count; i++) {
    const meta = await sharp(pngs[i]).metadata();
    const dir = 6 + 16 * i;
    header.writeUInt8(meta.width >= 256 ? 0 : meta.width, dir);
    header.writeUInt8(meta.height >= 256 ? 0 : meta.height, dir + 1);
    header.writeUInt8(0, dir + 2);
    header.writeUInt8(0, dir + 3);
    header.writeUInt16LE(1, dir + 4);
    header.writeUInt16LE(32, dir + 6);
    header.writeUInt32LE(pngs[i].length, dir + 8);
    header.writeUInt32LE(offset, dir + 12);
    offset += pngs[i].length;
    parts.push(pngs[i]);
  }
  return Buffer.concat(parts);
}

console.log('brand assets written to public/');
