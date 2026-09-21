/**
 * Visitenkarte, 85 × 55 mm, zweiseitig.
 *
 *   node scripts/build-business-card.mjs
 *
 * Every value on the card — name, number, address, the eight services — is read from
 * the same files the website renders from. A card carrying its own copy of the phone
 * number is exactly the failure `contactRoutes` was introduced to stop, just on paper
 * where it cannot be corrected after printing.
 *
 * Two layouts, because the website's rounded-card identity reaches paper two ways:
 *
 *   karten     The page structure itself — a rounded panel floating on the ground, the
 *              ground showing as a frame. That is what the site *is*: cards on
 *              `--co-page`, not a rounded page. Costs nothing at the printer, and the
 *              dark side stops bleeding off the edge, so guillotine drift cannot leave
 *              a white sliver along a navy border and handling cannot wear one.
 *   flaechig   Colour to the edge. Becomes one of the site's cards only if the printer
 *              die-cuts the corners, which is a paid extra on every German print shop.
 *
 * Both are generated. `ecken-gestanzt.png` previews what the die-cut would look like on
 * the flat layout, so the paid option can be judged before it is paid for.
 *
 * Output, in brand/visitenkarte/ — see the README there for what the printer needs.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import sharp from 'sharp';
import path from 'node:path';

const OUT = 'brand/visitenkarte';
mkdirSync(OUT, { recursive: true });

// --- Data ------------------------------------------------------------------
const content = JSON.parse(readFileSync('src/data/content.json', 'utf8'));

/** services.ts is TypeScript, so the titles come out of it by pattern rather than by
 *  import — but they come out of it, not out of a list retyped here. */
const drafted = [...readFileSync('src/data/services.ts', 'utf8').matchAll(/^\s*title: '([^']+)'/gm)]
  .map((m) => m[1]);
const fromContent = content.services.map((s) => s.title);
const allServices = [...fromContent, ...drafted.filter((s) => !fromContent.includes(s))];
if (allServices.length !== 8) throw new Error(`expected 8 services, found ${allServices.length}`);

const owner = { name: 'Oguz Cakir', role: 'Inhaber' };
const { phone, email, address, areaLong } = content.company;
const site = 'co-gebaeudeservice.de';

// --- Assets ----------------------------------------------------------------
const abs = (p) => `file://${path.resolve(p)}`;
const dataSvg = (p) =>
  `data:image/svg+xml;base64,${Buffer.from(readFileSync(p)).toString('base64')}`;

/** QR to the site. Level M: the card is handled, and a code that fails on a smudge is
 *  worse than one two millimetres larger. */
const { toString: qrToString } = await import('qrcode');
const qrSvg = await qrToString(`https://${site}`, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 0,
  color: { dark: '#010E40', light: '#00000000' },
});
const qrData = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`;

/* The white panel behind the code is not decoration, it is the quiet zone, and the spec
 * puts that at four modules on every side. Sized by hand it was 2.7, which decoded fine
 * from a clean 300 dpi render and stopped decoding the moment the render was degraded —
 * i.e. it would have been discovered on printed cards. So derive it: read the module
 * count out of the generated symbol, and let the panel follow. If the URL ever grows
 * past this version's capacity the symbol gets denser and the panel grows with it. */
const QR_MODULES = Number(/viewBox="0 0 (\d+)/.exec(qrSvg)?.[1]);
if (!QR_MODULES) throw new Error('could not read the QR module count');
const QR_CODE_MM = 11.8;
const QR_QUIET_MODULES = 4;
const QR_MODULE_MM = QR_CODE_MM / QR_MODULES;
const QR_PANEL_MM = QR_CODE_MM + 2 * QR_QUIET_MODULES * QR_MODULE_MM;
if (QR_MODULE_MM < 0.4) {
  throw new Error(`QR module ${QR_MODULE_MM.toFixed(3)} mm is under the 0.4 mm print floor`);
}

/* The variable faces the site itself serves, so the card is set in the same metal as
 * the website rather than in something that merely shares a name. */
const FONTS = {
  archivo: abs('node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2'),
  body: abs('node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2'),
};
for (const [name, url] of Object.entries(FONTS)) {
  if (!existsSync(url.replace('file://', ''))) throw new Error(`font missing: ${name}`);
}

// --- Geometry --------------------------------------------------------------
const TRIM_W = 85;
const TRIM_H = 55;
const BLEED = 3;
const PAGE_W = TRIM_W + BLEED * 2; // 91
const PAGE_H = TRIM_H + BLEED * 2; // 61
/** Nothing important crosses this distance from the trim edge. 4 mm is the usual
 *  minimum; the guillotine has a tolerance of about 1 mm either way. */
const SAFE = 4;

/* Ink from brand/, not from the site tokens. On paper the logo sits directly on a large
 * navy field, which is the one place the two navies would read as a mistake — so the
 * field takes the logo's own value. See brand/README.md. */
const INK = '#010E40';
const CYAN = '#27AAE1';
const GROUND = '#E7EDF3';
const LINE = '#DCE6EF';
const RULE = '#C6D4E2';
const MUTED = '#4C6B85';
const WHITE = '#FFFFFF';
const ICE = '#CAF0F8';

const LAYOUTS = {
  /* inset: ground left visible around the panel. The site's own gutter is
     clamp(10px, 1.4vw, 20px) — about 1.4 % of the page — which would be 1.2 mm here.
     2.5 mm instead, because a 1 mm cut tolerance must not be able to eat it.
     radius: chosen by eye at physical size, not by scaling a CSS value. The site's
     32 px on a laptop reads about like 5 mm does in the hand; proportional scaling
     gives 2 mm, which stops reading as rounded at all. */
  karten: { inset: 2.5, radius: 5, pad: 4, border: true },
  flaechig: { inset: 0, radius: 0, pad: SAFE, border: false },
};

/** The content box a layout leaves, in mm. Both must hold the back face. */
const contentBox = (L) => ({
  w: TRIM_W - 2 * (L.inset + L.pad),
  h: TRIM_H - 2 * (L.inset + L.pad),
});

const css = (L) => `
  @font-face { font-family: Archivo; src: url('${FONTS.archivo}') format('woff2'); font-weight: 100 900; }
  @font-face { font-family: Source; src: url('${FONTS.body}') format('woff2'); font-weight: 200 900; }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: ${PAGE_W}mm ${PAGE_H}mm; margin: 0; }
  html, body { width: ${PAGE_W}mm; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* The sheet is the full bleed. In the karten layout it is the ground the panel floats
     on; in flaechig the panel covers it entirely and it is never seen. */
  .card {
    width: ${PAGE_W}mm;
    height: ${PAGE_H}mm;
    padding: ${BLEED + L.inset}mm;
    background: ${GROUND};
    font-family: Source, sans-serif;
    font-weight: 400;
    /* Break exactly between the two faces, never inside one. */
    break-after: page;
  }
  .card:last-child { break-after: auto; }

  .panel {
    width: 100%;
    height: 100%;
    padding: ${L.pad}mm;
    border-radius: ${L.radius}mm;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  /* The site's cards carry a 1px --co-line border. 0.2 mm is about the thinnest rule
     that survives a press; anything finer breaks up. */
  .panel--front {
    background: ${WHITE};
    color: ${INK};
    ${L.border ? `border: 0.2mm solid ${LINE};` : ''}
  }
  .panel--back { background: ${INK}; color: ${WHITE}; }

  /* Front ---------------------------------------------------------------- */
  /* Everything hangs off one left edge. The earlier version split the face into two
     tidy columns with a hairline and a footer row underneath — which is the layout
     every business-card generator produces, and it read like one. */
  .panel--front { justify-content: space-between; }

  /* 34 mm, not 40. The three blocks on this face summed to 38 of the 42 mm the tighter
     layout leaves, so space-between had under 2 mm per gap to work with and the whole
     column crowded against the top. The air has to be earned first. */
  .lockup { width: 34mm; display: block; }

  .front__call { display: block; }
  /* The site's voice is scale contrast — 80px display against 11px kickers, about 8:1.
     The first card ran 11.5pt against 5.6pt, barely 2:1, which is why every element
     looked equally important and therefore inert. This is the number the card is kept
     for, so it gets the display size and everything else gets out of its way. */
  .tel {
    font-family: Archivo, sans-serif;
    font-weight: 700;
    font-size: 16pt;
    line-height: 1;
    letter-spacing: -0.035em;
    color: ${INK};
  }
  /* Under the number, not above it. Above, it landed directly beneath the logo's own
     "HAUSMEISTER & REINIGUNG" and the two letterspaced caps lines read as one block. */
  .kicker-line {
    margin-top: 1.6mm;
    font-size: 5pt;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: ${MUTED};
  }
  .kicker-line b { color: ${CYAN}; font-weight: 600; }

  .front__details {
    font-size: 6.5pt;
    line-height: 1.45;
    color: ${MUTED};
  }
  .front__details .who {
    font-weight: 600;
    font-size: 7.4pt;
    color: ${INK};
  }
  .front__details .site { font-weight: 600; color: ${INK}; }

  /* Back ----------------------------------------------------------------- */
  .panel--back { position: relative; }

  /* The site puts an oversized mark behind its ink sections and lets it run off the
     edge — 190px numerals at 0.14, a 130px wordmark at 0.11. Same move, same weight. */
  .ghost {
    position: absolute;
    right: -13mm;
    bottom: -9mm;
    width: 50mm;
    opacity: 0.13;
    pointer-events: none;
  }

  .back__inner { position: relative; display: flex; flex-direction: column; height: 100%; }

  .back__head { display: flex; align-items: baseline; justify-content: space-between; gap: 4mm; }
  /* Cyan, so the accent still lands on this face now that the separators are gone. */
  .back__head .kicker-line { margin: 0; color: ${CYAN}; }

  /* A dense typographic block, not a bulleted list — two columns of dotted items was
     the other thing that made the first card look generated.
     Set as a wrapping row with real gaps rather than a run separated by middots: with
     separators, three of the four lines ended on one, which reads as a mistake. Nothing
     to strand this way, and each item stays unbreakable. */
  .services {
    margin-top: 3.4mm;
    display: flex;
    flex-wrap: wrap;
    column-gap: 4.2mm;
    row-gap: 2.6mm;
    font-size: 7pt;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: 0.055em;
    text-transform: uppercase;
    color: ${WHITE};
  }
  .services span { white-space: nowrap; }

  .back__foot {
    margin-top: auto;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 4mm;
  }
  .back__where { font-size: 6.2pt; line-height: 1.5; color: ${ICE}; }
  .back__where .site { display: block; font-weight: 600; font-size: 7.6pt; color: ${WHITE}; }

  /* The QR sits on white: inverted codes read unreliably. The panel is the code plus
     four modules of quiet zone on each side — see QR_PANEL_MM. */
  .qr {
    flex: none;
    width: ${QR_PANEL_MM.toFixed(2)}mm;
    height: ${QR_PANEL_MM.toFixed(2)}mm;
    background: ${WHITE};
    border-radius: 1.4mm;
    display: grid;
    place-items: center;
  }
  .qr img { width: ${QR_CODE_MM}mm; height: ${QR_CODE_MM}mm; display: block; }
`;

const html = (L) => `<!doctype html><html lang="de"><meta charset="utf-8"><style>${css(L)}</style><body>

<section class="card"><div class="panel panel--front">
  <img class="lockup" src="${dataSvg('public/logo.svg')}" alt="">

  <div class="front__call">
    <p class="tel">${phone}</p>
    <p class="kicker-line">Telefon <b>&middot;</b> WhatsApp</p>
  </div>

  <p class="front__details">
    <span class="who">${owner.name}</span>, ${owner.role}<br>
    ${email}<br>
    ${address}<br>
    <span class="site">${site}</span>
  </p>
</div></section>

<section class="card"><div class="panel panel--back">
  <img class="ghost" src="${dataSvg('public/mark-invert.svg')}" alt="" aria-hidden="true">
  <div class="back__inner">
    <div class="back__head">
      <p class="kicker-line">Leistungen</p>
    </div>

    <p class="services">
      ${allServices.map((s) => `<span>${s.toUpperCase()}</span>`).join('\n      ')}
    </p>

    <div class="back__foot">
      <p class="back__where">
        ${areaLong}
        <span class="site">${site}</span>
      </p>
      <div class="qr"><img src="${qrData}" alt=""></div>
    </div>
  </div>
</div></section>

</body></html>`;

// --- Render ----------------------------------------------------------------
const browser = await chromium.launch();
const page = await browser.newPage();

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

const GUIDE_DPI = 200;

/** Decode the QR back out of the finished render, and again from a degraded copy.
 *
 *  A code that does not scan is the classic way a business card is wasted, and it is
 *  only found after the run is paid for. So this is a gate, not a report: the script
 *  refuses to leave behind a card whose own QR it could not read.
 *
 *  It decodes the code's own corner of the card, derived from the layout rather than
 *  guessed, because that is what a phone is pointed at. Handing jsQR the whole blurred
 *  card instead made it fail on cards whose codes were perfectly good — a gate that
 *  cries wolf gets switched off, which is worse than no gate.
 *
 *  The passes are stated in pixels per module, not dpi, because that is what decoding
 *  actually depends on. The clean pass is the file as rendered; the degraded pass is
 *  3.2 px per module with a blur, i.e. a poor capture of a small code. Below about
 *  2.5 px per module jsQR gives up on a 29-module symbol whatever the print quality, so
 *  a dpi figure there would measure the decoder rather than the card.
 */
async function readsBack(file, L) {
  const { default: jsQR } = await import('jsqr');
  const expected = `https://${site}`;

  // The panel sits in the bottom-right of the content box; 1 mm of slack around it.
  const edge = L.inset + L.pad;
  const box = {
    x: TRIM_W - edge - QR_PANEL_MM - 1,
    y: TRIM_H - edge - QR_PANEL_MM - 1,
    size: QR_PANEL_MM + 2,
  };

  for (const [perModule, blur] of [[4.8, 0], [3.2, 0.6]]) {
    const px = perModule / QR_MODULE_MM; // px per mm
    let pipeline = sharp(file).resize(Math.round(TRIM_W * px));
    if (blur) pipeline = pipeline.blur(blur);
    const { data, info } = await sharp(await pipeline.png().toBuffer())
      .extract({
        left: Math.round(box.x * px),
        top: Math.round(box.y * px),
        width: Math.round(box.size * px),
        height: Math.round(box.size * px),
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const found = jsQR(new Uint8ClampedArray(data), info.width, info.height);
    if (found?.data !== expected) {
      throw new Error(
        `${file}: QR unreadable at ${perModule} px/module (blur ${blur}) — ` +
          `got ${found?.data ?? 'nothing'}`,
      );
    }
  }
  return `${QR_MODULES}×${QR_MODULES} Module à ${QR_MODULE_MM.toFixed(2)} mm, ` +
    `lesbar bis 3,2 px/Modul mit Weichzeichner`;
}

for (const [name, L] of Object.entries(LAYOUTS)) {
  const tmp = path.resolve(OUT, `.${name}.html`);
  writeFileSync(tmp, html(L));
  await page.goto(`file://${tmp}`);
  await page.evaluate(() => document.fonts.ready);

  await page.pdf({
    path: `${OUT}/visitenkarte-${name}-druck.pdf`,
    preferCSSPageSize: true,
    printBackground: true,
  });
  await face(0, `${OUT}/${name}-vorne.png`);
  await face(1, `${OUT}/${name}-hinten.png`);

  // Control sheet: full bleed with the trim line and the safety margin drawn over it.
  const s = GUIDE_DPI / 25.4;
  const pw = Math.round(PAGE_W * s);
  const ph = Math.round(PAGE_H * s);
  await face(0, `${OUT}/.bleed-0.png`, { trim: false, dpi: GUIDE_DPI });
  await face(1, `${OUT}/.bleed-1.png`, { trim: false, dpi: GUIDE_DPI });

  const guides = (x0) => `
    <rect x="${x0 + BLEED * s}" y="${BLEED * s}" width="${TRIM_W * s}" height="${TRIM_H * s}"
          fill="none" stroke="#E4003A" stroke-width="1.2" stroke-dasharray="6 4"/>
    <rect x="${x0 + (BLEED + SAFE) * s}" y="${(BLEED + SAFE) * s}"
          width="${(TRIM_W - SAFE * 2) * s}" height="${(TRIM_H - SAFE * 2) * s}"
          fill="none" stroke="#00A36C" stroke-width="1.2" stroke-dasharray="3 5"/>`;

  const gap = 24;
  const legendH = 46;
  await sharp({
    create: { width: pw * 2 + gap, height: ph + legendH, channels: 4, background: '#FFFFFF' },
  })
    .composite([
      { input: `${OUT}/.bleed-0.png`, left: 0, top: 0 },
      { input: `${OUT}/.bleed-1.png`, left: pw + gap, top: 0 },
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
    .toFile(`${OUT}/${name}-kontrolle.png`);

  rmSync(tmp);
  rmSync(`${OUT}/.bleed-0.png`);
  rmSync(`${OUT}/.bleed-1.png`);

  const scan = await readsBack(`${OUT}/${name}-hinten.png`, L);
  const box = contentBox(L);
  console.log(
    `  ${name.padEnd(9)} Inhaltsfläche ${box.w} × ${box.h} mm, Radius ${L.radius} mm, ` +
      `QR ${scan}`,
  );
}

await browser.close();

// --- Die-cut preview -------------------------------------------------------
/* What the flat layout looks like with the corners cut. 3 mm is what German print shops
 * offer as standard; some also do 5 mm. Rendered rather than described, because it is
 * a paid extra and worth seeing before it is bought. */
const CUT_R = 3;
{
  const dpi = 300;
  const s = dpi / 25.4;
  const w = Math.round(TRIM_W * s);
  const h = Math.round(TRIM_H * s);
  const r = CUT_R * s;
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
       <rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/>
     </svg>`,
  );
  const rounded = async (src) =>
    sharp(src)
      .resize(w, h, { fit: 'fill' })
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer();

  const pad = 20;
  await sharp({
    create: { width: w * 2 + pad * 3, height: h + pad * 2, channels: 4, background: '#FFFFFF' },
  })
    .composite([
      { input: await rounded(`${OUT}/flaechig-vorne.png`), left: pad, top: pad },
      { input: await rounded(`${OUT}/flaechig-hinten.png`), left: pad * 2 + w, top: pad },
    ])
    .png()
    .toFile(`${OUT}/ecken-gestanzt.png`);
}

// --- Comparison ------------------------------------------------------------
{
  const scale = 0.62;
  const w = Math.round(1004 * scale);
  const h = Math.round(650 * scale);
  const pad = 18;
  const labelH = 30;
  const row = async (file) => sharp(file).resize(w, h).png().toBuffer();
  await sharp({
    create: {
      width: w * 2 + pad * 3,
      height: (h + labelH) * 3 + pad,
      channels: 4,
      background: '#FFFFFF',
    },
  })
    .composite([
      { input: await row(`${OUT}/karten-vorne.png`), left: pad, top: labelH },
      { input: await row(`${OUT}/karten-hinten.png`), left: pad * 2 + w, top: labelH },
      { input: await row(`${OUT}/flaechig-vorne.png`), left: pad, top: labelH * 2 + h },
      { input: await row(`${OUT}/flaechig-hinten.png`), left: pad * 2 + w, top: labelH * 2 + h },
      {
        input: await sharp(`${OUT}/ecken-gestanzt.png`)
          .resize(w * 2 + pad, null)
          .png()
          .toBuffer(),
        left: pad,
        top: labelH * 3 + h * 2,
      },
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 2 + pad * 3}" height="${(h + labelH) * 3 + pad}">
             <text x="${pad}" y="20" font-family="sans-serif" font-size="17" font-weight="bold" fill="#111">A — Karte auf Grund (ohne Stanzung, kostet nichts extra)</text>
             <text x="${pad}" y="${labelH * 2 + h - 10}" font-family="sans-serif" font-size="17" font-weight="bold" fill="#111">B — flächig bis zum Rand (heutiger Stand)</text>
             <text x="${pad}" y="${labelH * 3 + h * 2 - 10}" font-family="sans-serif" font-size="17" font-weight="bold" fill="#111">C — B mit gestanzten Ecken, 3 mm (Aufpreis bei der Druckerei)</text>
           </svg>`,
        ),
        left: 0,
        top: 0,
      },
    ])
    .png()
    .toFile(`${OUT}/vergleich.png`);
}

console.log(`Visitenkarte: ${TRIM_W} × ${TRIM_H} mm + ${BLEED} mm Beschnitt, ${allServices.length} Leistungen, QR → https://${site}`);
