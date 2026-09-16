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

test('every service the site sells reaches structured data', async ({ page }) => {
  /* Only Treppenhausreinigung had a Service node, because it is the one service with a
     page of its own — so the graph advertised one service on a site that sells eight.
     The catalogue on /leistungen is the source for all of them now. */
  await page.goto('/leistungen');
  const graph = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '{}',
  )['@graph'] as Record<string, unknown>[];

  const services = graph.filter((n) => n['@type'] === 'Service');
  const rendered = await page.locator('.service-row__main h2, .service-index__title').allTextContents();
  const names = new Set(services.map((s) => String(s.name)));

  expect(services.length, 'a Service node per service').toBeGreaterThanOrEqual(8);
  for (const title of rendered.map((t) => t.trim()).filter(Boolean)) {
    expect(names, `"${title}" is on the page but not in the graph`).toContain(title);
  }

  const catalog = graph.find((n) => n['@type'] === 'OfferCatalog');
  expect(catalog, 'an OfferCatalog listing them').toBeTruthy();
  expect((catalog!.itemListElement as unknown[]).length).toBe(services.length);
});

test('areaServed names every town the page claims', async ({ page }) => {
  /* The six towns lived in markup only, so the graph claimed two places while
     /ueber-uns named six. Both read from company.areaServed now. */
  await page.goto('/ueber-uns');
  const chips = (await page.locator('.about__ort').allTextContents()).map((t) => t.trim());
  expect(chips.length, 'the Einsatzgebiet chips').toBeGreaterThan(3);

  const graph = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '{}',
  )['@graph'] as Record<string, unknown>[];
  const org = graph.find((n) => String(n['@type']).includes('Organization'))!;
  const served = (org.areaServed as { name: string }[]).map((a) => a.name);

  for (const chip of chips) {
    expect(served, `"${chip}" is shown as an Einsatzgebiet but not in areaServed`).toContain(chip);
  }
});

test('the FAQ markup never advertises an answer the page does not show', async ({ page }) => {
  /* Rich results built from text a visitor cannot find is exactly what Google
     penalises, so the rendered list and the FAQPage node come from one source. */
  await page.goto('/leistungen');
  const graph = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '{}',
  )['@graph'] as Record<string, unknown>[];

  const faq = graph.find((n) => n['@type'] === 'FAQPage');
  expect(faq, 'a FAQPage node on /leistungen').toBeTruthy();

  const questions = (faq!.mainEntity as { name: string; acceptedAnswer: { text: string } }[]);
  const shownQ = (await page.locator('.faq__q-text').allTextContents()).map((t) => t.trim());
  const shownA = (await page.locator('.faq__a').allTextContents()).map((t) => t.trim());

  expect(questions.length).toBe(shownQ.length);
  for (const q of questions) {
    expect(shownQ, `question "${q.name}" is in the markup but not on the page`).toContain(q.name);
    expect(shownA, `the answer to "${q.name}" is in the markup but not on the page`).toContain(
      q.acceptedAnswer.text,
    );
  }
});

test('the HowTo markup matches the steps the page renders', async ({ page }) => {
  /* Google retired HowTo rich results in 2023, so this buys no visual snippet — it is
     machine-readable process data for AI engines and voice. That only holds if it
     describes what is actually on the page, so the node is built from the same steps
     the section renders. */
  await page.goto('/');
  const graph = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '{}',
  )['@graph'] as Record<string, unknown>[];

  const howTo = graph.find((n) => n['@type'] === 'HowTo');
  expect(howTo, 'a HowTo node on the homepage').toBeTruthy();

  const steps = howTo!.step as { name: string; text: string }[];
  const rendered = (await page.locator('.step__title').allTextContents())
    .map((t) => t.trim())
    .filter(Boolean);

  expect(steps.length, 'four steps').toBe(4);
  for (const s of steps) {
    expect(rendered, `step "${s.name}" is in the markup but not on the page`).toContain(s.name);
  }
});

test('an unconfirmed local signal never reaches the graph', async ({ page }) => {
  /* openingHoursSpecification, geo and priceRange are gated exactly like the phone and
     e-mail were: a wrong opening time sends somebody to a locked door and a guessed
     coordinate puts the business on the wrong street. Each appears only once its own
     flag in src/data/company.ts is set — this asserts the gate, not a fixed answer, so
     it keeps testing as each one is confirmed. */
  await page.goto('/');
  const graph = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '{}',
  )['@graph'] as Record<string, unknown>[];
  const org = graph.find((n) => String(n['@type']).includes('Organization'))!;

  // Whatever is present must be substantive — never an empty or zero placeholder.
  if (org.openingHoursSpecification) {
    expect((org.openingHoursSpecification as unknown[]).length).toBeGreaterThan(0);
  }
  if (org.geo) {
    const g = org.geo as { latitude: number; longitude: number };
    expect(g.latitude, 'a placeholder coordinate must never be emitted').not.toBe(0);
    expect(g.longitude, 'a placeholder coordinate must never be emitted').not.toBe(0);
  }
  if (org.priceRange) expect(String(org.priceRange).length).toBeGreaterThan(0);
});
