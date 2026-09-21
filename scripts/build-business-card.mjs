/**
 * Visitenkarte, 85 × 55 mm, zweiseitig.
 *
 * Needs a QR encoder and Chromium, neither of which the site itself uses:
 *   npm i --no-save qrcode
 *   node scripts/build-business-card.mjs
 *
 * Every value on the card — name, number, address, the eight services — is read from
 * the same files the website renders from. A card carrying its own copy of the phone
 * number is exactly the failure `contactRoutes` was introduced to stop, just on paper
 * where it cannot be corrected after printing.
 *
 * Output (brand/visitenkarte/):
 *   visitenkarte-druck.pdf     what goes to the printer — 91 × 61 mm, i.e. 85 × 55 mm
 *                              plus 3 mm bleed all round, two pages, no crop marks
 *   vorschau-vorne.png         300 dpi review renders, trimmed to the finished size
 *   vorschau-hinten.png
 *   kontrolle.png              the same two with bleed, trim and safety margin drawn on
 *
 * Colour: this is RGB. A printer converts to CMYK against the profile for the stock,
 * and the navy will lose depth doing so — see brand/visitenkarte/README.md.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import path from 'node:path';

const OUT = 'brand/visitenkarte';
mkdirSync(OUT, { recursive: true });

// --- Data ------------------------------------------------------------------
const content = JSON.parse(readFileSync('src/data/content.json', 'utf8'));

/** services.ts is TypeScript, so the titles come out of it by pattern rather than by
 *  import — but they come out of it, not out of a list retyped here. */
const services = [...readFileSync('src/data/services.ts', 'utf8').matchAll(/^\s*title: '([^']+)'/gm)]
  .map((m) => m[1]);
const fromContent = content.services.map((s) => s.title);
const allServices = [...fromContent, ...services.filter((s) => !fromContent.includes(s))];
if (allServices.length !== 8) throw new Error(`expected 8 services, found ${allServices.length}`);

const owner = { name: 'Oguz Cakir', role: 'Inhaber' };
const { phone, email, address, areaLong } = content.company;
const site = 'co-gebaeudeservice.de';

// --- Assets ----------------------------------------------------------------
const abs = (p) => `file://${path.resolve(p)}`;
const dataSvg = (p) =>
  `data:image/svg+xml;base64,${Buffer.from(readFileSync(p)).toString('base64')}`;

/** QR to the site. Level M: the card is handled, and a QR that fails on a smudge is
 *  worse than one two millimetres larger. */
let qr = null;
try {
  const { toString } = await import('qrcode');
  qr = await toString(`https://${site}`, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 0,
    color: { dark: '#010E40', light: '#00000000' },
  });
} catch {
  throw new Error('qrcode not installed — run: npm i --no-save qrcode');
}
const qrData = `data:image/svg+xml;base64,${Buffer.from(qr).toString('base64')}`;

/* The variable faces the site itself serves, so the card is set in the same metal as
 * the website rather than in something that merely shares a name. */
const FONTS = {
  archivo: abs('node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2'),
  body: abs('node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2'),
};
for (const [name, url] of Object.entries(FONTS)) {
  if (!existsSync(url.replace('file://', ''))) {
    throw new Error(`font missing: ${name} — run npm install`);
  }
}

// --- Geometry --------------------------------------------------------------
const TRIM_W = 85;
const TRIM_H = 55;
const BLEED = 3;
const PAGE_W = TRIM_W + BLEED * 2; // 91
const PAGE_H = TRIM_H + BLEED * 2; // 61
/** Distance from the trim edge that nothing important crosses. 4 mm is the usual
 *  minimum; the guillotine has a tolerance of about 1 mm either way. */
const SAFE = 4;
const PAD = BLEED + SAFE; // from the page edge to the content box

/* Ink from brand/, not from the site tokens. On paper the logo sits directly on a large
 * navy field, which is the one place the two navies would read as a mistake — so the
 * field takes the logo's own value. See brand/README.md. */
const INK = '#010E40';
const CYAN = '#27AAE1';
const GROUND = '#E7EDF3';
const LINE = '#C6D4E2';
const MUTED = '#4C6B85';
const WHITE = '#FFFFFF';
const ICE = '#CAF0F8';

const css = `
  @font-face { font-family: Archivo; src: url('${FONTS.archivo}') format('woff2'); font-weight: 100 900; }
  @font-face { font-family: Source; src: url('${FONTS.body}') format('woff2'); font-weight: 200 900; }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: ${PAGE_W}mm ${PAGE_H}mm; margin: 0; }
  html, body { width: ${PAGE_W}mm; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  .card {
    position: relative;
    width: ${PAGE_W}mm;
    height: ${PAGE_H}mm;
    padding: ${PAD}mm;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: Source, sans-serif;
    font-weight: 400;
    /* Break exactly between the two faces, never inside one. */
    break-after: page;
  }
  .card:last-child { break-after: auto; }

  .card--front { background: ${GROUND}; color: ${INK}; }
  .card--back  { background: ${INK}; color: ${WHITE}; }

  /* Front ---------------------------------------------------------------- */
  .lockup { width: 39mm; display: block; }

  /* The site's editorial split, on paper: one column carries the identity from the top,
     the other the running detail from the bottom. Pinning the signature to the top and
     everything else to the bottom instead left a dead band straight across the middle. */
  .front__body { flex: 1 1 auto; display: flex; align-items: stretch; gap: 4mm; }
  .front__who { flex: 1 1 auto; min-width: 0; }
  .name {
    margin-top: 6.5mm;
    font-family: Archivo, sans-serif;
    font-weight: 700;
    font-size: 11.5pt;
    line-height: 1.05;
    letter-spacing: -0.02em;
  }
  .role {
    margin-top: 1.1mm;
    font-size: 5.6pt;
    font-weight: 600;
    letter-spacing: 0.17em;
    text-transform: uppercase;
    color: ${MUTED};
  }

  .front__contact {
    flex: none;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    text-align: right;
    font-size: 6.9pt;
    line-height: 1.62;
  }
  /* The number is the single thing a card is kept for, so it gets the weight. Saying
     "Telefon · WhatsApp" once beats printing the same eleven digits twice. */
  .front__contact .tel { font-size: 10pt; line-height: 1.1; }
  .front__contact .tel b { font-weight: 600; letter-spacing: -0.01em; }
  .front__contact .via {
    margin-top: 0.7mm;
    font-size: 5.2pt;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${MUTED};
  }
  .front__contact .mail { margin-top: 1.6mm; font-size: 7pt; }

  .rule { height: 0.18mm; background: ${LINE}; margin: 3.4mm 0 2.6mm; }
  .front__foot {
    display: flex;
    justify-content: space-between;
    gap: 3mm;
    font-size: 6.2pt;
    color: ${MUTED};
  }
  .front__foot .site { font-weight: 600; color: ${INK}; }

  /* Back ----------------------------------------------------------------- */
  .back__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 4mm; }
  .mark { width: 11mm; display: block; }
  .kicker {
    font-size: 5.2pt;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: ${CYAN};
    text-align: right;
    padding-top: 0.6mm;
  }

  /* 4 rows at 6.8pt/1.2 plus the gaps is 15.3 mm; the head is 8 and the foot 19.8, so
     the 47 mm box keeps about 4 mm of air. Sized deliberately: at the previous values
     the sum was 46.7 and the first row printed across the mark's wave. */
  .services {
    margin-top: 3.2mm;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 4mm;
    row-gap: 1.25mm;
    font-size: 6.8pt;
    line-height: 1.2;
  }
  .services li { list-style: none; display: flex; align-items: baseline; gap: 1.6mm; }
  .services .dot {
    flex: none;
    width: 0.9mm;
    height: 0.9mm;
    border-radius: 50%;
    background: ${CYAN};
    transform: translateY(-0.15mm);
  }

  .back__foot {
    margin-top: auto;
    padding-top: 2.6mm;
    border-top: 0.18mm solid rgba(255, 255, 255, 0.22);
    display: flex;
    /* Centred, not bottom-aligned: the QR is twice the height of the two lines beside
       it, and aligning their baselines left a hole under the rule. */
    align-items: center;
    justify-content: space-between;
    gap: 4mm;
  }
  .back__where { font-size: 6.4pt; line-height: 1.5; color: ${ICE}; }
  .back__where .site { display: block; font-weight: 600; font-size: 7pt; color: ${WHITE}; }

  /* The QR sits on white: inverted codes read unreliably, and the white panel is the
     site's rounded language showing up on paper. */
  /* 14 mm panel, 11.8 mm code. The URL needs a 29×29 symbol, so that is 0.41 mm per
     module — just over the 0.4 mm most printers give as the floor for a reliable scan. */
  .qr {
    flex: none;
    width: 14mm;
    height: 14mm;
    background: ${WHITE};
    border-radius: 1.6mm;
    display: grid;
    place-items: center;
  }
  .qr img { width: 11.8mm; height: 11.8mm; display: block; }
`;

const html = `<!doctype html><html lang="de"><meta charset="utf-8"><style>${css}</style><body>

<section class="card card--front">
  <div class="front__body">
    <div class="front__who">
      <img class="lockup" src="${dataSvg('public/logo.svg')}" alt="">
      <p class="name">${owner.name}</p>
      <p class="role">${owner.role}</p>
    </div>
    <div class="front__contact">
      <div class="tel"><b>${phone}</b></div>
      <div class="via">Telefon &middot; WhatsApp</div>
      <div class="mail">${email}</div>
    </div>
  </div>

  <div class="rule"></div>
  <div class="front__foot">
    <span>${address}</span>
    <span class="site">${site}</span>
  </div>
</section>

<section class="card card--back">
  <div class="back__head">
    <img class="mark" src="${dataSvg('public/mark-invert.svg')}" alt="">
    <p class="kicker">Leistungen</p>
  </div>

  <ul class="services">
    ${allServices.map((s) => `<li><span class="dot"></span>${s}</li>`).join('\n    ')}
  </ul>

  <div class="back__foot">
    <p class="back__where">
      ${areaLong}
      <span class="site">${site}</span>
    </p>
    <div class="qr"><img src="${qrData}" alt=""></div>
  </div>
</section>

</body></html>`;

const htmlPath = path.resolve(OUT, '.visitenkarte.html');
writeFileSync(htmlPath, html);

// --- Render ----------------------------------------------------------------
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file://${htmlPath}`);
await page.evaluate(() => document.fonts.ready);

await page.pdf({
  path: `${OUT}/visitenkarte-druck.pdf`,
  preferCSSPageSize: true,
  printBackground: true,
});

/** One face as a PNG at `dpi`, optionally trimmed to the finished size. */
async function face(index, file, { trim = true, dpi = 300 } = {}) {
  const scale = dpi / 25.4; // px per mm
  const shot = await page.locator('.card').nth(index).screenshot({ scale: 'device' });
  const img = sharp(shot).resize(Math.round(PAGE_W * scale), Math.round(PAGE_H * scale), {
    fit: 'fill',
  });
  if (!trim) return img.png().toFile(file);
  return img
    .extract({
      left: Math.round(BLEED * scale),
      top: Math.round(BLEED * scale),
      width: Math.round(TRIM_W * scale),
      height: Math.round(TRIM_H * scale),
    })
    .png()
    .toFile(file);
}

await face(0, `${OUT}/vorschau-vorne.png`);
await face(1, `${OUT}/vorschau-hinten.png`);

/* The control sheet: both faces at full bleed with the trim line and the safety margin
 * drawn over them, so it is visible at a glance what the guillotine may take. */
const dpi = 200;
const s = dpi / 25.4;
const pw = Math.round(PAGE_W * s);
const ph = Math.round(PAGE_H * s);
await face(0, `${OUT}/.bleed-front.png`, { trim: false, dpi });
await face(1, `${OUT}/.bleed-back.png`, { trim: false, dpi });

const guides = (x0) => `
  <rect x="${x0 + BLEED * s}" y="${BLEED * s}" width="${TRIM_W * s}" height="${TRIM_H * s}"
        fill="none" stroke="#E4003A" stroke-width="1.2" stroke-dasharray="6 4"/>
  <rect x="${x0 + PAD * s}" y="${PAD * s}" width="${(TRIM_W - SAFE * 2) * s}" height="${(TRIM_H - SAFE * 2) * s}"
        fill="none" stroke="#00A36C" stroke-width="1.2" stroke-dasharray="3 5"/>`;

const gap = 24;
const legendH = 46;
await sharp({
  create: { width: pw * 2 + gap, height: ph + legendH, channels: 4, background: '#FFFFFF' },
})
  .composite([
    { input: `${OUT}/.bleed-front.png`, left: 0, top: 0 },
    { input: `${OUT}/.bleed-back.png`, left: pw + gap, top: 0 },
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${pw * 2 + gap}" height="${ph + legendH}">
           ${guides(0)}${guides(pw + gap)}
           <text x="0" y="${ph + 20}" font-family="sans-serif" font-size="15" fill="#E4003A">— — Endformat 85 × 55 mm (Schnittkante)</text>
           <text x="0" y="${ph + 40}" font-family="sans-serif" font-size="15" fill="#00A36C">· · · Sicherheitsabstand 4 mm — nichts Wichtiges außerhalb</text>
           <text x="${pw + gap}" y="${ph + 20}" font-family="sans-serif" font-size="15" fill="#555">Alles außerhalb der roten Linie ist Beschnitt (3 mm) und wird weggeschnitten.</text>
         </svg>`,
      ),
      left: 0,
      top: 0,
    },
  ])
  .png()
  .toFile(`${OUT}/kontrolle.png`);

await browser.close();
execFileSync('rm', ['-f', htmlPath, `${OUT}/.bleed-front.png`, `${OUT}/.bleed-back.png`]);

console.log(
  `Visitenkarte: ${PAGE_W} × ${PAGE_H} mm (${TRIM_W} × ${TRIM_H} mm + ${BLEED} mm Beschnitt), ` +
    `${allServices.length} Leistungen, QR → https://${site}`,
);
