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
