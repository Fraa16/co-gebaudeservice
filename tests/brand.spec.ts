import { test, expect } from '@playwright/test';
import { ROUTES } from './routes';

/** The logo is the client's artwork, served as four conditioned SVGs out of
 *  scripts/build-brand-assets.mjs. Nothing covered it before, and the two ways it can
 *  break are both silent: a file that 404s still leaves an <img> box the right size, and
 *  a conditioning bug shows up only as the wrong crop. */

test('every brand asset the page asks for actually loads', async ({ page }) => {
  /* A missing SVG is invisible in a screenshot test — the reserved box is still there,
     just empty. Assert the decoded bitmap has pixels. */
  await page.goto('/');
  const broken = await page.locator('img').evaluateAll((imgs) =>
    imgs
      .filter((img) => !(img as HTMLImageElement).complete || (img as HTMLImageElement).naturalWidth === 0)
      .map((img) => img.getAttribute('src')),
  );
  expect(broken, 'images that did not decode').toEqual([]);
});

test('the header shows exactly one logo at any width', async ({ page }) => {
  /* variant="auto" keeps both artworks in the DOM and hides one with a container query.
     Get the query wrong and the header shows the mark and the lockup side by side, or
     neither. Asserting "exactly one visible" catches both without pinning a width. */
  await page.goto('/');
  const logos = page.locator('.site-header .logo__art:visible');
  await expect(logos).toHaveCount(1);
});

test('the short logo carries the narrow header, the lockup the wide one', async ({ page }) => {
  /* The swap is the point of the two files: below the breakpoint the header has a CTA
     and a burger beside the logo, and the full signature does not fit. */
  await page.setViewportSize({ width: 360, height: 700 });
  await page.goto('/');
  await expect(page.locator('.site-header .logo__art--mark')).toBeVisible();
  await expect(page.locator('.site-header .logo__art--lockup')).toBeHidden();

  await page.setViewportSize({ width: 1100, height: 800 });
  await expect(page.locator('.site-header .logo__art--lockup')).toBeVisible();
  await expect(page.locator('.site-header .logo__art--mark')).toBeHidden();
});

test('the logo reserves its box before the file arrives', async ({ page }) => {
  /* width/height attributes, so the header does not reflow when the SVG lands. The CSS
     sets the height too — the attributes alone lose to any author rule — so this also
     checks the two agree, which is what keeps the rendered size honest. */
  await page.goto('/');
  const arts = await page.locator('.logo__art').evaluateAll((els) =>
    els.map((el) => {
      const img = el as HTMLImageElement;
      return {
        src: img.getAttribute('src'),
        attrW: Number(img.getAttribute('width')),
        attrH: Number(img.getAttribute('height')),
        naturalRatio: img.naturalWidth / img.naturalHeight,
      };
    }),
  );

  expect(arts.length).toBeGreaterThan(0);
  for (const art of arts) {
    expect(art.attrW, `${art.src} has no width attribute`).toBeGreaterThan(0);
    expect(art.attrH, `${art.src} has no height attribute`).toBeGreaterThan(0);
    // The declared box must match the artwork, or the reserved space is a lie.
    expect(
      Math.abs(art.attrW / art.attrH - art.naturalRatio),
      `${art.src}: declared ${art.attrW}×${art.attrH} does not match the artwork`,
    ).toBeLessThan(0.02);
  }
});

test('the logo links home and is announced once', async ({ page }) => {
  /* The <img>s are alt="" because the link carries the name. Two alt texts would read
     the company twice; none at all would leave the link unlabelled. */
  for (const route of ROUTES) {
    await page.goto(route);
    const link = page.locator('.site-header a.logo');
    await expect(link, `${route}: the header logo links home`).toHaveAttribute('href', '/');
    await expect(link).toHaveAccessibleName(/CO Gebäudeservice/);

    const alts = await page
      .locator('.logo__art')
      .evaluateAll((els) => els.map((el) => el.getAttribute('alt')));
    expect(alts.every((a) => a === ''), `${route}: a logo image has its own alt text`).toBe(true);
  }
});

test('a colourway swap never moves the artwork', async ({ page, request }) => {
  /* logo.svg and logo-invert.svg are the same drawing in two colours, cropped to one
     measured box. If they ever get different viewBoxes the mark jumps between the header
     and the footer — the kind of half-pixel drift nobody files a bug about. */
  for (const [light, dark] of [
    ['/logo.svg', '/logo-invert.svg'],
    ['/mark.svg', '/mark-invert.svg'],
  ]) {
    const vb = async (path: string) => {
      const res = await request.get(path);
      expect(res.status(), `${path} is served`).toBe(200);
      return /viewBox="([^"]+)"/.exec(await res.text())?.[1];
    };
    const a = await vb(light);
    expect(a, `${light} has a viewBox`).toBeTruthy();
    expect(await vb(dark), `${dark} is cropped differently from ${light}`).toBe(a);
  }
});

test('the icon set is square and the favicon follows the tab theme', async ({ request }) => {
  /* The mark is 1.38:1 but every icon slot is square, so the crop is a decision the
     build script makes — this asserts it still makes one. The favicon additionally
     carries both colourways, because the mark has no ground of its own and a navy-only
     version disappears in a dark tab bar. */
  const res = await request.get('/favicon.svg');
  expect(res.status()).toBe(200);
  const svg = await res.text();

  const [, , w, h] = /viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/.exec(svg)!.slice(1);
  expect(Number(w), 'the favicon viewBox is square').toBeCloseTo(Number(h), 1);
  expect(svg, 'the favicon has no dark-tab variant').toContain('prefers-color-scheme');

  for (const path of ['/favicon-96.png', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png']) {
    expect((await request.get(path)).status(), `${path} is served`).toBe(200);
  }
});
