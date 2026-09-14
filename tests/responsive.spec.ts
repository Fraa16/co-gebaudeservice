import { test, expect } from '@playwright/test';
import { ROUTES } from './routes';

/** The suite previously checked four viewports for horizontal overflow only, which is
 *  the coarsest possible responsiveness test. A sweep found three classes of fault it
 *  could not see: a type scale that sat on its floor from 320px to 704px, rows of four
 *  that stranded a lone item at tablet widths, and prose running past 100 characters.
 *  These run once, at the reference viewport, and drive the browser themselves. */

const WIDTHS = [320, 360, 390, 414, 480, 540, 600, 667, 720, 768, 834, 900, 1024, 1180, 1280, 1440, 1600, 1920];

test('the type scale is fluid, not flat, across the phone-to-tablet band', async ({ page }) => {
  const sizes: number[] = [];
  for (const w of [360, 480, 600, 768]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    sizes.push(
      await page.locator('.hero__title').evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    );
  }
  // Each step up in viewport must grow the display type.
  for (let i = 1; i < sizes.length; i++) {
    expect(sizes[i], `display type did not grow between steps: ${sizes.join(' → ')}`).toBeGreaterThan(
      sizes[i - 1]!,
    );
  }
});

test('no row of four strands a single item on its own line', async ({ page }) => {
  const stranded: string[] = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const route of ['/', '/ueber-uns', '/kontakt', '/leistungen/treppenhausreinigung']) {
      await page.goto(route);
      const bad = await page.evaluate(() => {
        const out: string[] = [];
        for (const row of document.querySelectorAll('.co-row-4')) {
          const kids = [...row.children].filter((k) => k.getBoundingClientRect().width > 0);
          if (kids.length < 3) continue;
          const rows = new Map<number, number>();
          for (const k of kids) {
            const top = Math.round(k.getBoundingClientRect().top);
            rows.set(top, (rows.get(top) ?? 0) + 1);
          }
          const counts = [...rows.values()];
          if (counts.length > 1 && counts.at(-1) === 1 && Math.max(...counts) >= 3) {
            out.push(`${[...row.classList][0]} (${counts.join('+')})`);
          }
        }
        return out;
      });
      for (const b of bad) stranded.push(`${w}px ${route}: ${b}`);
    }
  }
  expect(stranded).toEqual([]);
});

test('running prose stays within a readable measure', async ({ page }) => {
  const tooWide: string[] = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const route of ROUTES) {
      await page.goto(route);
      const bad = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll('p, li')) {
          const text = (el.textContent ?? '').trim();
          if (text.length < 120) continue;
          const fs = parseFloat(getComputedStyle(el).fontSize);
          const width = el.getBoundingClientRect().width;
          if (!fs || !width) continue;
          const ch = width / (fs * 0.5);
          if (ch > 95) out.push(`${[...el.classList][0] ?? el.tagName} ≈${Math.round(ch)}ch`);
        }
        return out;
      });
      for (const b of bad) tooWide.push(`${w}px ${route}: ${b}`);
    }
  }
  expect(tooWide).toEqual([]);
});

test('no horizontal scroll at any width', async ({ page }) => {
  const overflowing: string[] = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const route of ROUTES) {
      await page.goto(route);
      const over = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (over > 1) overflowing.push(`${w}px ${route} +${over}px`);
    }
  }
  expect(overflowing).toEqual([]);
});

/** The sweep that caught the flat type scale still missed a hero whose floating panels
 *  landed on top of the buttons, and a header eating a fifth of a phone screen —
 *  absolutely-positioned elements overlap without ever causing overflow, and a tall
 *  header is perfectly valid layout. These two check for that directly. */
test('no element overlaps another at mobile widths', async ({ page }) => {
  const collisions: string[] = [];
  for (const w of [320, 360, 380, 414, 480, 600, 768]) {
    await page.setViewportSize({ width: w, height: 800 });
    for (const route of ['/', '/leistungen', '/ueber-uns', '/kontakt']) {
      await page.goto(route);
      const hits = await page.evaluate(() => {
        const clipped = (el: Element) => {
          for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.overflowX === 'hidden' || cs.overflowX === 'clip' || cs.clipPath !== 'none') return true;
          }
          return getComputedStyle(el).clipPath !== 'none';
        };
        const label = (e: Element) => `${e.tagName.toLowerCase()}.${[...e.classList][0] ?? ''}`;
        // A closed <details> still reports boxes for its contents, so visibility has
        // to be checked properly rather than inferred from the rect.
        const visible = (el: Element) =>
          typeof el.checkVisibility === 'function'
            ? el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true })
            : true;
        const nodes = [...document.querySelectorAll('a, button, h1, h2, h3, .hero__float, .co-btn')]
          .map((e) => ({ e, b: e.getBoundingClientRect() }))
          .filter((x) => x.b.width > 8 && x.b.height > 8 && visible(x.e) && !clipped(x.e));
        const out: string[] = [];
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const A = nodes[i]!, B = nodes[j]!;
            if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
            const ox = Math.min(A.b.right, B.b.right) - Math.max(A.b.left, B.b.left);
            const oy = Math.min(A.b.bottom, B.b.bottom) - Math.max(A.b.top, B.b.top);
            if (ox > 6 && oy > 6) out.push(`${label(A.e)} over ${label(B.e)}`);
          }
        }
        return [...new Set(out)];
      });
      for (const h of hits) collisions.push(`${w}px ${route}: ${h}`);
    }
  }
  expect(collisions).toEqual([]);
});

test('the header stays compact on a phone and its menu works without JS', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 380, height: 751 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');

  // A header taller than ~80px eats the top of a phone screen; it was 162px.
  const header = (await page.locator('.site-header').boundingBox())!;
  expect(Math.round(header.height), 'header height on a 380px screen').toBeLessThanOrEqual(80);

  // The menu button must be reachable, not pushed off the edge.
  const toggle = (await page.locator('.site-header__toggle').boundingBox())!;
  expect(toggle.x + toggle.width, 'menu button right edge').toBeLessThanOrEqual(381);

  await expect(page.locator('.site-header__panel')).toBeHidden();
  await page.locator('.site-header__toggle').click();
  await expect(page.locator('.site-header__panel')).toBeVisible();
  expect(await page.locator('.site-header__panel-link').count()).toBeGreaterThan(2);
  await ctx.close();
});

test('interactive targets meet the WCAG 2.5.8 minimum of 24px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const small: string[] = [];
  for (const route of ['/', '/kontakt']) {
    await page.goto(route);
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll('button, input:not([type="hidden"]), textarea, select')]
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter((x) => x.r.width > 0 && (x.r.width < 24 || x.r.height < 24))
        .map((x) => `${x.el.tagName.toLowerCase()}.${[...x.el.classList][0]} ${Math.round(x.r.width)}x${Math.round(x.r.height)}`),
    );
    for (const b of bad) small.push(`${route}: ${b}`);
  }
  expect(small).toEqual([]);
});

test('hairline dividers do not survive a wrap into a stacked column', async ({ page }) => {
  /* A `border-left` divider on a wrapping row stays put when the row stacks, so items
     2..n render indented behind a stray vertical rule while the first sits flush. It
     shipped twice — on the stat band, and on the Leistungen and Kontakt fact rows — and
     is invisible to an overflow test because nothing overflows. Once there is a single
     column, every item in a divided group must start at the same x. */
  const GROUPS = [
    { route: '/', selector: '.co-row-4--divided' },
    { route: '/leistungen', selector: '.page-hero__meta' },
    { route: '/kontakt', selector: '.reach__routes' },
    { route: '/impressum', selector: '.page-hero__meta' },
  ];

  const bad: string[] = [];
  for (const width of [320, 360, 390, 480]) {
    await page.setViewportSize({ width, height: 900 });
    for (const { route, selector } of GROUPS) {
      await page.goto(route);
      const report = await page.evaluate((sel) => {
        const group = document.querySelector(sel);
        if (!group) return { missing: true, offsets: [], borders: [] };
        const kids = [...group.children];
        return {
          missing: false,
          offsets: kids.map((el) => Math.round(el.getBoundingClientRect().left)),
          borders: kids.map((el) => parseFloat(getComputedStyle(el).borderLeftWidth)),
        };
      }, selector);

      expect(report.missing, `${route} ${selector} should exist`).toBe(false);

      const stacked = new Set(report.offsets).size === 1 || report.offsets.length < 2;
      if (!stacked) continue; // side by side at this width: a left rule is correct there

      const leftEdges = new Set(report.offsets);
      if (leftEdges.size > 1) {
        bad.push(`${width}px ${route} ${selector}: ragged left edges ${[...leftEdges].join(', ')}`);
      }
      report.borders.forEach((b, i) => {
        if (b > 0) bad.push(`${width}px ${route} ${selector}: item ${i} keeps a ${b}px left rule while stacked`);
      });
    }
  }
  expect(bad).toEqual([]);
});
