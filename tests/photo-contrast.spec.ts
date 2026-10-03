import { test, expect } from '@playwright/test';
import sharp from 'sharp';

/* Text over a photograph is the one place contrast cannot be checked from the tokens:
   it depends on the pixels behind the words, which change whenever a photo does. axe
   cannot judge it either — it reports text over an image as "needs review" and moves on.

   This is how the problem was found. With a photo in all five home tiles, white titles
   measured 2.2:1 over snow, sky and a lit lobby, and the translucent chips 1.9:1. The
   fix was a darker --co-card-scrim and an opaque label pill; this keeps it fixed when
   the next, brighter photo arrives.

   Method: hide the glyphs (colour transparent, backgrounds kept), screenshot the tile,
   and compare each element's own text colour against the brightest tenth and the
   darkest tenth of the pixels under its box. The minimum of the two is the worst case
   for light and dark text alike. 4.5:1 throughout, the small-text threshold, even for
   the titles: stricter than they need, and they clear it by a wide margin. */

const lin = (c: number) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const lum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const PARTS = [
  ['title', '.tile__title'],
  ['text', '.tile__text'],
  ['chip', '.tile__chip'],
  ['number', '.tile__num'],
] as const;

const HIDE_GLYPHS =
  '.tile__num,.tile__chip,.tile__title,.tile__title a,.tile__text{color:transparent!important}';

/** Luminance values of the screenshot pixels inside one rectangle, sorted. */
function pixelsIn(
  data: Buffer,
  width: number,
  height: number,
  r: { x: number; y: number; w: number; h: number },
) {
  const values: number[] = [];
  for (let y = Math.max(0, Math.floor(r.y)); y < Math.min(height, Math.ceil(r.y + r.h)); y++) {
    for (let x = Math.max(0, Math.floor(r.x)); x < Math.min(width, Math.ceil(r.x + r.w)); x++) {
      const o = (y * width + x) * 3;
      values.push(lum(data[o]!, data[o + 1]!, data[o + 2]!));
    }
  }
  return values.sort((a, b) => a - b);
}

test('the hero headline and lead keep their contrast over the photograph at every width', async ({
  page,
}, testInfo) => {
  /* The hero is text over a photograph too, and it moves with the width: from 720px
     the photo is enlarged to put the subject beside the headline. Below 720px it no
     longer sits behind the text at all (it follows it as a framed image), so there
     this measures the pale ground — and would catch the photo sliding back under the
     type. Both layouts have failed once: the headline across his face on desktop, and
     "und im Kreis Calw" in dark type on his navy shirt on phones, 1.3:1. Measured per
     line box rather than per element, so the background beside a short line does not
     count against it. */
  test.skip(testInfo.project.name !== 'ref-924', 'drives the viewport itself');
  for (const width of [360, 390, 600, 768, 900, 1024, 1180, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    // The hero photo only. decode() on every image hung once r-detail became a real
    // photo: lazy, far below the fold, it never starts loading, so it never decodes.
    await page.locator('.hero img').evaluate((i: HTMLImageElement) => i.decode().catch(() => undefined));
    const hero = page.locator('.hero');
    const origin = (await hero.boundingBox())!;
    const parts = await page.evaluate(() =>
      ['.hero__title', '.hero__sub'].map((selector) => {
        const el = document.querySelector(selector)!;
        const range = document.createRange();
        range.selectNodeContents(el);
        const rgb = getComputedStyle(el).color.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number);
        const lines = [...range.getClientRects()].map((q) => ({
          x: q.x,
          y: q.y + scrollY,
          w: q.width,
          h: q.height,
        }));
        return { selector, rgb, lines };
      }),
    );

    const hide = await page.addStyleTag({
      content: '.hero__title,.hero__sub{color:transparent!important}',
    });
    const shot = await hero.screenshot();
    await hide.evaluate((el) => (el as Element).remove());
    const { data, info } = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true });

    for (const { selector, rgb, lines } of parts) {
      const fg = lum(rgb[0]!, rgb[1]!, rgb[2]!);
      for (const line of lines) {
        const values = pixelsIn(data, info.width, info.height, {
          x: line.x - origin.x,
          y: line.y - origin.y,
          w: line.w,
          h: line.h,
        });
        if (!values.length) continue;
        const worst = Math.min(
          ratio(fg, values[Math.floor(values.length * 0.9)]!),
          ratio(fg, values[Math.floor(values.length * 0.1)]!),
        );
        expect
          .soft(worst, `${width}px ${selector}: a line measures ${worst.toFixed(2)}:1`)
          .toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});

test('text over a photograph on the home page keeps 4.5:1 against every pixel behind it', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  // The fixed header can sit over a tile once it is scrolled into view.
  await page.addStyleTag({ content: '.site-header{visibility:hidden!important}' });

  const tiles = page.locator('.tile--photo');
  const count = await tiles.count();
  expect(count, 'the home page shows photo tiles').toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const tile = tiles.nth(i);
    await tile.scrollIntoViewIfNeeded();
    await tile.locator('img').evaluate((img: HTMLImageElement) => {
      img.loading = 'eager';
      return img.decode().catch(() => undefined);
    });

    const name = (await tile.locator('.tile__title').innerText()).trim();
    const origin = (await tile.boundingBox())!;
    const parts = [];
    for (const [label, selector] of PARTS) {
      const el = tile.locator(selector);
      const box = await el.boundingBox();
      if (!box) continue;
      const rgb = await el.evaluate((node) =>
        getComputedStyle(node).color.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number),
      );
      parts.push({ label, box, fg: lum(rgb[0]!, rgb[1]!, rgb[2]!) });
    }

    const hide = await page.addStyleTag({ content: HIDE_GLYPHS });
    const shot = await tile.screenshot();
    await hide.evaluate((el) => (el as Element).remove());

    const { data, info } = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    for (const { label, box, fg } of parts) {
      const values: number[] = [];
      const x0 = Math.max(0, Math.floor(box.x - origin.x));
      const y0 = Math.max(0, Math.floor(box.y - origin.y));
      const x1 = Math.min(info.width, Math.ceil(box.x - origin.x + box.width));
      const y1 = Math.min(info.height, Math.ceil(box.y - origin.y + box.height));
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const o = (y * info.width + x) * 3;
          values.push(lum(data[o]!, data[o + 1]!, data[o + 2]!));
        }
      }
      values.sort((a, b) => a - b);
      const brightest = values[Math.floor(values.length * 0.9)]!;
      const darkest = values[Math.floor(values.length * 0.1)]!;
      const worst = Math.min(ratio(fg, brightest), ratio(fg, darkest));
      expect.soft(worst, `${name}: ${label} measures ${worst.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  }
});
