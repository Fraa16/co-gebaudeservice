import { test, expect } from '@playwright/test';
import { ROUTES } from './routes';

for (const route of ROUTES) {
  test(`${route} renders correctly`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));

    const res = await page.goto(route);
    expect(res?.status(), `${route} status`).toBe(200);

    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.locator('h1')).toHaveCount(1);

    const title = await page.title();
    expect(title.length, `${route} title length`).toBeGreaterThan(15);
    expect(title.length, `${route} title length`).toBeLessThan(75);

    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc?.length ?? 0).toBeGreaterThan(70);
    expect(desc?.length ?? 0).toBeLessThan(200);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain(route === '/' ? '' : route);

    expect(errors, `${route} console errors`).toEqual([]);
  });
}

test('every internal link resolves', async ({ page, request }) => {
  const seen = new Set<string>();
  for (const route of ROUTES) {
    await page.goto(route);
    for (const href of await page.locator('a[href^="/"]').evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).getAttribute('href')!),
    )) {
      seen.add(href.split('#')[0] || '/');
    }
  }
  for (const href of seen) {
    expect((await request.get(href)).status(), `link ${href}`).toBe(200);
  }
});

test('the page never scrolls horizontally', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${route} horizontal overflow`).toBeLessThanOrEqual(1);
  }
});
