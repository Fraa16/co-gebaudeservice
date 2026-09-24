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

test('the nav never offers one destination under two names', async ({ page }) => {
  /* "Kontakt" and "Angebot anfordern" both pointed at /kontakt, so the nav had two
     entries for one place and the CTA promised an action while delivering a page. */
  await page.goto('/leistungen');
  const hrefs = await page
    .locator('.site-header__inline a, .site-header__cta')
    .evaluateAll((els) => els.map((e) => e.getAttribute('href')!));

  expect(hrefs.length).toBeGreaterThan(2);
  expect(new Set(hrefs).size, `duplicate nav destinations: ${hrefs.join(', ')}`).toBe(hrefs.length);
});

test('a link that promises an action lands on the form, not on a page top', async ({ page }) => {
  /* "Angebot anfordern", "Termin vereinbaren" and "Anfrage starten" are promises. Each
     must land on the enquiry form itself — which means a fragment, and a fragment that
     exists where it points. */
  const ACTIONS = ['Angebot anfordern', 'Termin vereinbaren', 'Anfrage starten'];
  const bad: string[] = [];

  for (const route of ['/', '/leistungen', '/ueber-uns', '/leistungen/treppenhausreinigung']) {
    await page.goto(route);
    const links = await page.locator('a').evaluateAll((els, actions) =>
      els
        .map((e) => ({ text: (e.textContent ?? '').trim(), href: e.getAttribute('href') ?? '' }))
        .filter((l) => actions.some((a: string) => l.text.startsWith(a))),
      ACTIONS,
    );

    expect(links.length, `${route} has no action link to check`).toBeGreaterThan(0);
    for (const { text, href } of links) {
      if (!href.includes('#')) bad.push(`${route}: "${text}" -> ${href} (no section target)`);
    }
  }

  // The target it names must actually be there.
  await page.goto('/kontakt');
  await expect(page.locator('#anfrage')).toBeAttached();
  await expect(page.locator('#anfrage form')).toBeAttached();

  expect(bad).toEqual([]);
});

test('no draft banner reaches a built page', async ({ page }) => {
  /* The "Entwurf" chips are an internal review aid, and the switch that hides them read
     `!== 'false'` — so any deploy that simply did not set PUBLIC_SHOW_DRAFT_NOTES showed
     them to whoever opened the link, the client included. It is opt-in now, and this
     asserts the default the build actually ships. Set PUBLIC_SHOW_DRAFT_NOTES="true"
     locally to see them; this suite runs without it, which is the point. */
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(page.locator('.draft-note'), `${route} ships a draft banner`).toHaveCount(0);
    await expect(page.getByText('Entwurf', { exact: false })).toHaveCount(0);
  }
});

test('the photo band on /ueber-uns is four photographs or none', async ({ page }) => {
  /* The band used to render as soon as one of its four slots held a photo, showing
     only the filled ones — so the first photo to arrive, r-l1, which the home page
     also needs, would have stood alone in a row built for four. Photos land one at a
     time; this holds the page to looking finished at every count in between. It
     passes today with none and has to keep passing as they arrive. */
  await page.goto('/ueber-uns');
  const tiles = await page.locator('.about__band-item').count();
  expect([0, 4], `the band shows ${tiles} tile(s)`).toContain(tiles);
  if (tiles === 0) {
    await expect(page.locator('.about__band-single'), 'the stand-in panel').toHaveCount(1);
  } else {
    await expect(page.locator('.about__band img'), 'every tile a real photograph').toHaveCount(4);
  }
});
