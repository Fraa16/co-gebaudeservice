import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

/* Read from the file rather than through src/data/content.ts: that module imports the
   JSON, and Playwright's ESM loader refuses a JSON import without an import attribute
   that Astro would then choke on. csp.spec.ts reads its inputs the same way. */
const content = JSON.parse(readFileSync('src/data/content.json', 'utf8'));

test.describe('enquiry form', () => {
  test.beforeEach(async ({ page }) => await page.goto('/kontakt'));

  test('chips toggle and mirror into the payload field', async ({ page }) => {
    const chip = page.getByRole('button', { name: 'Treppenhausreinigung' });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');

    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-chip-mirror]')).toHaveValue('Treppenhausreinigung');

    await page.getByRole('button', { name: 'Winterdienst' }).click();
    await expect(page.locator('[data-chip-mirror]')).toHaveValue(
      'Treppenhausreinigung, Winterdienst',
    );

    await chip.click();
    await expect(page.locator('[data-chip-mirror]')).toHaveValue('Winterdienst');
  });

  test('an empty submit reports German errors and no success', async ({ page }) => {
    await page.getByRole('button', { name: 'Anfrage senden' }).click();

    await expect(page.locator('[data-error-for="name"]')).toHaveText(/Namen/);
    await expect(page.locator('[data-error-for="email"]')).toHaveText(/E-Mail/);
    await expect(page.locator('[data-error-for="message"]')).toHaveText(/Objekt/);
    await expect(page.locator('[data-error-for="consent"]')).toHaveText(/zu/);
    await expect(page.locator('[data-form-success]')).toBeHidden();
  });

  test('consent is required, not implied', async ({ page }) => {
    await page.fill('[name="name"]', 'Maria Muster');
    await page.fill('[name="email"]', 'maria@example.de');
    await page.fill('[name="message"]', 'Wohnobjekt mit 12 Einheiten, Turnus wöchentlich.');
    await page.getByRole('button', { name: 'Anfrage senden' }).click();

    await expect(page.locator('[data-error-for="consent"]')).not.toHaveText('');
    await expect(page.locator('[data-form-success]')).toBeHidden();
  });

  /** Fill the form the way a person would, slowly enough to clear the timing trap. */
  const fillValidly = async (page: import('@playwright/test').Page) => {
    await page.fill('[name="name"]', 'Maria Muster');
    await page.fill('[name="email"]', 'maria@example.de');
    await page.fill('[name="message"]', 'Wohnobjekt mit 12 Einheiten, Turnus wöchentlich.');
    await page.check('[name="consent"]');
    await page.getByRole('button', { name: 'Treppenhausreinigung' }).click();
    // The honeypot's timing check rejects submissions faster than a human.
    await page.waitForTimeout(3200);
    await page.getByRole('button', { name: 'Anfrage senden' }).click();
  };

  test('a valid submit posts the enquiry and shows the success message', async ({ page }) => {
    /* This build has no PUBLIC_FORM_ENDPOINT, so the success path is not reachable by
       filling the form: without an endpoint the form now refuses instead (see the test
       below). Point it at the endpoint and answer the request here, so what is
       asserted is the path that actually runs once Resend is configured — the old
       version of this test passed against a submit that sent nothing at all. */
    let posted: Record<string, unknown> | null = null;
    await page.route('**/api/kontakt', async (route) => {
      posted = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page
      .locator('[data-contact-form]')
      .evaluate((el: HTMLElement) => (el.dataset.endpoint = '/api/kontakt'));

    await fillValidly(page);

    await expect(page.locator('[data-form-success]')).toBeVisible();
    /* Read from the data, not retyped here. The test's own name said "from
       content.json", but it held a second copy of the sentence, so the editorial pass
       that rewrote the copy broke the test rather than being checked by it. */
    await expect(page.locator('[data-form-success]')).toHaveText(
      content.contact.form.successMessage,
    );
    expect(posted, 'the enquiry reached the endpoint').not.toBeNull();
    expect(posted!.name).toBe('Maria Muster');
    expect(posted!.email).toBe('maria@example.de');
  });

  test('without a delivery endpoint the form refuses instead of confirming', async ({ page }) => {
    /* The regression this exists for: with PUBLIC_FORM_ENDPOINT unset the submit used
       to fall through to "Danke, wir melden uns innerhalb von zwei Werktagen" while
       sending nothing anywhere. On a noindex site nobody could find that; once the
       domain went live it became a way to lose a customer silently. */
    const endpoint = await page.locator('[data-contact-form]').getAttribute('data-endpoint');
    test.skip(!!endpoint, 'an endpoint is configured, so the refusal path cannot run');

    const notice = content.contact.form.offlineNotice;
    await expect(
      page.locator('[data-form-offline]'),
      'the state is stated before anyone fills six fields',
    ).toHaveText(notice);

    await fillValidly(page);

    await expect(
      page.locator('[data-form-success]'),
      'a confirmation for an enquiry nothing received',
    ).toBeHidden();
    await expect(page.locator('[data-error-for="message"]')).toHaveText(notice);
  });

  test('chips are operable by keyboard', async ({ page }) => {
    const chip = page.getByRole('button', { name: 'Gartenpflege' });
    await chip.focus();
    await page.keyboard.press('Enter');
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  });
});

test('no page makes a request to any third-party origin', async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.origin !== new URL(baseURL!).origin && url.protocol !== 'data:') {
      external.push(req.url());
    }
  });

  for (const route of ['/', '/leistungen', '/kontakt', '/datenschutz']) {
    await page.goto(route, { waitUntil: 'networkidle' });
  }

  expect(external, 'third-party requests break the privacy promise').toEqual([]);
});

test('an enquiry link from a service opens the form with that service chosen', async ({ page }) => {
  /* Someone who reads about Gartenpflege and then presses "Angebot anfordern" should
     not have to name it again. The CTA carries ?leistung=<slug>; every page is
     prerendered, so only the client can read it. Without JS the chips just start
     empty, which is what they did before. */
  await page.goto('/leistungen');
  const cta = page
    .locator('#gartenpflege a[href*="/kontakt"]')
    .first();
  await expect(cta, 'the service row carries a service-specific enquiry link').toHaveAttribute(
    'href',
    /leistung=gartenpflege/,
  );

  await cta.click();
  const chosen = page.locator('.co-chip[aria-pressed="true"]');
  await expect(chosen).toHaveText(['Gartenpflege']);
  // And it reaches the payload, not just the pressed state.
  await expect(page.locator('[data-chip-mirror]')).toHaveValue('Gartenpflege');
});

test('an unknown or absent service leaves the chips alone', async ({ page }) => {
  for (const query of ['', '?leistung=', '?leistung=gibtesnicht']) {
    await page.goto(`/kontakt${query}#anfrage`);
    await expect(
      page.locator('.co-chip[aria-pressed="true"]'),
      `"${query}" must not preselect anything`,
    ).toHaveCount(0);
  }
});
