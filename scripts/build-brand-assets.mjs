/**
 * Turns the four delivered logo files in `brand/` into every asset the site serves.
 *
 * The client supplies the artwork; this script only *conditions* it. Nothing here
 * draws a shape or picks a colour — if the mark is wrong, the fix belongs in `brand/`,
 * not in this file. (It used to construct the old placeholder mark from font outlines;
 * that mark is gone.)
 *
 * Re-run after replacing anything in brand/:
 *   node scripts/build-brand-assets.mjs
 *
 * What conditioning means, and why each step is needed:
 *
 *  1. **Tight viewBox.** Every delivered file declares a 1500×1500 canvas with the
 *     artwork floating somewhere inside it. Shipped as-is, a 38px header logo would
 *     draw a 14px lockup adrift in a 38px square. The ink bounding box is measured by
 *     rasterising the file and scanning the alpha channel, so it is the real extent of
 *     the drawing rather than whatever clip rectangle the exporter happened to write.
 *
 *  2. **Namespaced ids.** All four files use the same clipPath ids (`a`…`f`). Two of
 *     them on one page — the header lockup and a footer mark, say — and the second
 *     silently steals the first's clip. Each file gets its own prefix.
 *
 *  3. **No width/height.** With both present the browser ignores the CSS box and the
 *     logo renders at 2000px. Removing them lets the aspect ratio come from the
 *     viewBox, which is what every consumer here wants.
 *
 * The pair for one artwork is cropped to the *same* box, so `logo.svg` and
 * `logo-invert.svg` swap without the mark shifting by a pixel.
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

/* svgo roughly halves the exports, which carry six decimal places of precision on a
 * 1500-unit canvas. It is not a declared dependency — this script is one-shot and its
 * outputs are committed, so a missing optimiser must not be able to break a build.
 * Without it the assets are correct, just larger. */
let optimize = null;
try {
  ({ optimize } = await import('svgo'));
} catch {
  console.warn('svgo not installed — writing unoptimised SVGs');
}

/** @param {string} svg @param {boolean} keepStyles */
function shrink(svg, { keepStyles = false } = {}) {
  if (!optimize) return svg;
  return optimize(svg, {
    multipass: true,
    floatPrecision: 2,
    plugins: [
      {
        name: 'preset-default',
        params: { overrides: keepStyles ? { inlineStyles: false, minifyStyles: false } : {} },
      },
    ],
  }).data;
}

/** The site ground. Icon formats that cannot be transparent sit on this, so a home
 *  screen or a tab bar shows the mark as the design intends: ink and cyan on light. */
const GROUND = '#E7EDF3';
/** Only for the manifest's theme_color, which is a browser-chrome colour, not artwork. */
const THEME = '#03045E';

const SOURCES = {
  lockup: { onLight: 'brand/lockup-on-light.svg', onDark: 'brand/lockup-on-dark.svg' },
  mark: { onLight: 'brand/mark-on-light.svg', onDark: 'brand/mark-on-dark.svg' },
};

const LABEL = 'CO Gebäudeservice';

/** Ink bounding box in user units, by rendering 1:1 with the viewBox and scanning alpha.
 *  Anything under the threshold is antialiasing spill, not drawing. */
async function inkBox(file) {
  const source = readFileSync(file);
  const box = viewBox(source.toString('utf8'));
  const { data, info } = await sharp(source)
    .resize(Math.round(box.w), Math.round(box.h), {
      fit: 'fill',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!Number.isFinite(minX)) throw new Error(`${file} appears to be blank`);
  return { x: box.x + minX, y: box.y + minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function viewBox(svg) {
  const m = /viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/.exec(svg);
  if (!m) throw new Error('no viewBox');
  return { x: +m[1], y: +m[2], w: +m[3], h: +m[4] };
}

/** The `<defs>`/body of one file, with its ids prefixed so two can share a document. */
function body(file, prefix) {
  const svg = readFileSync(file, 'utf8');
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return inner
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}${id})`);
}

/** One artwork, one colourway, cropped to `box`. */
function conditioned(file, box, prefix, extraAttrs = '') {
  const vb = `${round(box.x)} ${round(box.y)} ${round(box.w)} ${round(box.h)}`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img"` +
    ` aria-label="${LABEL}"${extraAttrs}>${body(file, prefix)}</svg>\n`
  );
}

const round = (n) => Number(n.toFixed(2));

/** A square crop of `box`, centred on it.
 *
 *  `side` is a framing decision, not a measurement. The mark is 1.38:1 — an interlocked
 *  CO with a wave running wider than the letters — so a square that contains all of it
 *  leaves the CO at 55% of the tile height and mush at 16px. Squaring on the *letters*
 *  instead lets the wave's two tips run off the edges, where at icon sizes it reads as
 *  an underline rather than a clipped shape, and buys the CO a sixth of its height back.
 *  Re-look at this fraction if the mark is ever redrawn. */
const ICON_CROP = 0.928; // of the mark's full width — i.e. the width of the CO itself

function squared(box, sideRatio = 1) {
  const side = box.w * sideRatio;
  return {
    x: box.x + box.w / 2 - side / 2,
    y: box.y + box.h / 2 - side / 2,
    w: side,
    h: side,
  };
}

mkdirSync('public/og', { recursive: true });

const lockupBox = await inkBox(SOURCES.lockup.onLight);
const markBox = await inkBox(SOURCES.mark.onLight);
const iconBox = squared(markBox, ICON_CROP);

// --- SVGs ------------------------------------------------------------------
writeFileSync('public/logo.svg', shrink(conditioned(SOURCES.lockup.onLight, lockupBox, 'l-')));
writeFileSync('public/logo-invert.svg', shrink(conditioned(SOURCES.lockup.onDark, lockupBox, 'li-')));
writeFileSync('public/mark.svg', shrink(conditioned(SOURCES.mark.onLight, markBox, 'm-')));
writeFileSync('public/mark-invert.svg', shrink(conditioned(SOURCES.mark.onDark, markBox, 'mi-')));

/* The favicon carries both colourways and switches on the tab bar's own theme. The mark
 * has no ground of its own, so a single navy version vanishes in a dark tab — and a
 * ground bolted on here would invent a container the logo does not have. An SVG loaded
 * as an icon renders its own <style>, and the document's CSP does not reach into it. */
const faviconVb = iconBox;
writeFileSync(
  'public/favicon.svg',
  shrink(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${round(faviconVb.x)} ${round(
    faviconVb.y,
  )} ${round(faviconVb.w)} ${round(faviconVb.h)}" role="img" aria-label="${LABEL}">` +
    `<style>.on-dark{display:none}@media (prefers-color-scheme:dark){` +
    `.on-light{display:none}.on-dark{display:inline}}</style>` +
    `<g class="on-light">${body(SOURCES.mark.onLight, 'fl-')}</g>` +
      `<g class="on-dark">${body(SOURCES.mark.onDark, 'fd-')}</g>` +
      `</svg>\n`,
    { keepStyles: true },
  ),
);

// --- Rasters ---------------------------------------------------------------
/* PNG icons cannot follow the tab theme, so they take the ground the artwork was drawn
 * for. Rasterising from the conditioned SVG rather than the 1500px original keeps the
 * mark filling the tile instead of sitting in a third of it. */
const iconSvg = Buffer.from(
  conditioned(SOURCES.mark.onLight, iconBox, 'i-', ' width="512" height="512"'),
);
const png = (size) =>
  sharp(iconSvg, { density: 512 })
    .resize(size, size)
    .flatten({ background: GROUND })
    .png({ compressionLevel: 9 });

await png(96).toFile('public/favicon-96.png');
await png(192).toFile('public/icon-192.png');
await png(512).toFile('public/icon-512.png');
await png(180).toFile('public/apple-touch-icon.png');

/* Maskable: Android crops to a circle inscribed in the middle 80%, so the mark is inset
 * into that safe zone rather than run to the edges. */
await sharp({ create: { width: 512, height: 512, channels: 4, background: GROUND } })
  .composite([
    {
      input: await sharp(iconSvg, { density: 512 })
        .resize(328, 328)
        .png()
        .toBuffer(),
      gravity: 'centre',
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile('public/icon-512-maskable.png');

// favicon.ico, for the browsers that still ask for one.
writeFileSync(
  'public/favicon.ico',
  await toIco([await png(48).toBuffer(), await png(32).toBuffer(), await png(16).toBuffer()]),
);

writeFileSync(
  'public/site.webmanifest',
  JSON.stringify(
    {
      name: 'CO Gebäudeservice',
      short_name: 'CO',
      lang: 'de',
      start_url: '/',
      display: 'standalone',
      background_color: GROUND,
      theme_color: THEME,
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

/** The aspect ratios the components need, so Logo.astro never hard-codes a number that
 *  a redraw would silently invalidate. */
writeFileSync(
  'src/data/brand-assets.json',
  JSON.stringify(
    {
      note: 'Generated by scripts/build-brand-assets.mjs — do not edit by hand.',
      lockup: { width: round(lockupBox.w), height: round(lockupBox.h) },
      mark: { width: round(markBox.w), height: round(markBox.h) },
    },
    null,
    2,
  ) + '\n',
);

console.log(
  `brand assets written — lockup ${round(lockupBox.w)}×${round(lockupBox.h)}, ` +
    `mark ${round(markBox.w)}×${round(markBox.h)}`,
);
