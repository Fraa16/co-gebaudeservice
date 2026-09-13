import { test, expect } from '@playwright/test';
import { ROUTES } from './routes';

/** Placeholder contact details must never reach structured data: an entity built from
 *  a fake phone number gets cross-referenced against every other citation of the
 *  business, and inconsistent NAP is the fastest way to damage local ranking. */
const PLACEHOLDERS = /000000|Musterstra(ß|ss)e|beispiel\.de/i;

for (const route of ROUTES) {
  test(`${route} emits a valid JSON-LD graph`, async ({ page }) => {
    await page.goto(route);
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    expect(raw, `${route} has JSON-LD`).toBeTruthy();

    const parsed = JSON.parse(raw!);
    expect(parsed['@context']).toBe('https://schema.org');

    const graph = parsed['@graph'] as Record<string, unknown>[];
    const types = graph.flatMap((n) => [n['@type']].flat());
    expect(types).toContain('WebSite');
    expect(types).toContain('Organization');

    // Every @id referenced inside the graph must resolve within it.
    const ids = new Set(graph.map((n) => n['@id']));
    for (const ref of JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g)) {
      expect(ids, `${route} dangling @id ${ref[1]}`).toContain(ref[1]);
    }

    expect(raw, `${route} leaks a placeholder into structured data`).not.toMatch(PLACEHOLDERS);
  });
}

test('placeholder phone and email are never linked', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    expect(await page.locator('a[href^="tel:"]').count(), route).toBe(0);
    expect(await page.locator('a[href^="mailto:"]').count(), route).toBe(0);
  }
});

test('the site stays noindex until the launch gate opens', async ({ page, request }) => {
  await page.goto('/');
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  expect(robots).toContain('noindex');
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');
});

test('breadcrumbs appear on every page below root', async ({ page }) => {
  for (const route of ROUTES.filter((r) => r !== '/')) {
    await page.goto(route);
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(raw!)['@graph'].map((n: any) => n['@type']).flat(), route).toContain(
      'BreadcrumbList',
    );
  }
});
