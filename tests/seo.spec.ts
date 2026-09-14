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

test('a contact detail is linked only if it also appears in structured data', async ({ page }) => {
  /* Both sides are driven by the same `verified` flag in src/data/company.ts, so they
     must agree: a field good enough to link is good enough for the graph, and one that
     is not reaches neither. Asserting the agreement rather than a fixed answer means
     this keeps testing the gate as each detail is confirmed — the previous version
     asserted "no tel: link anywhere" and silently became wrong the moment the client
     supplied a real number. */
  await page.goto('/');
  const graph = (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '';
  const telephone = /"telephone":"([^"]+)"/.exec(graph)?.[1];
  const email = /"email":"([^"]+)"/.exec(graph)?.[1];

  for (const route of ROUTES) {
    await page.goto(route);

    const tels = await page.locator('a[href^="tel:"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute('href')!.replace(/^tel:/, '')),
    );
    const mails = await page.locator('a[href^="mailto:"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute('href')!.replace(/^mailto:/, '')),
    );

    if (telephone) {
      expect(tels.every((t) => t === telephone), `${route}: tel: links must use ${telephone}`).toBe(true);
    } else {
      expect(tels, `${route}: an unverified number must not be linked`).toEqual([]);
    }

    if (email) {
      expect(mails.every((m) => m === email), `${route}: mailto: links must use ${email}`).toBe(true);
    } else {
      expect(mails, `${route}: an unverified address must not be linked`).toEqual([]);
    }

    for (const value of [...tels, ...mails]) {
      expect(value, `${route}: a placeholder must never be linked`).not.toMatch(PLACEHOLDERS);
    }
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

test('a linked contact detail matches the text shown for it', async ({ page }) => {
  /* content.json carried a second copy of the phone and e-mail under contact.rows, and
     the renderers read the value from there while taking the href from company.ts. The
     moment a real number arrived the Kontakt page displayed the old placeholder and
     linked the new number. A page that disagrees with itself about the NAP is exactly
     what the per-field gating exists to prevent, so assert the two agree. */
  const digits = (s: string) => s.replace(/[^0-9]/g, '');

  for (const route of ROUTES) {
    await page.goto(route);

    const links = await page.locator('a[href^="tel:"], a[href^="mailto:"]').evaluateAll((els) =>
      els.map((e) => ({ href: e.getAttribute('href')!, text: (e.textContent ?? '').trim() })),
    );

    for (const { href, text } of links) {
      if (href.startsWith('mailto:')) {
        expect(text, `${route}: ${href} shows different text`).toBe(href.slice('mailto:'.length));
        continue;
      }
      /* A German number displays as "0172 3001489" and links as "+491723001489": the
         same subscriber digits, once the 0/+49 trunk prefix is normalised away. */
      const shown = digits(text).replace(/^0/, '');
      const linked = digits(href).replace(/^49/, '');
      expect(linked, `${route}: ${href} is not the number shown as "${text}"`).toBe(shown);
    }
  }
});
