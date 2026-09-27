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
