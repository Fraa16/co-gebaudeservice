import { test, expect } from '@playwright/test';

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

  test('a valid submit shows the success message from content.json', async ({ page }) => {
    await page.fill('[name="name"]', 'Maria Muster');
    await page.fill('[name="email"]', 'maria@example.de');
    await page.fill('[name="message"]', 'Wohnobjekt mit 12 Einheiten, Turnus wöchentlich.');
    await page.check('[name="consent"]');
    await page.getByRole('button', { name: 'Treppenhausreinigung' }).click();

    // The honeypot's timing check rejects submissions faster than a human.
    await page.waitForTimeout(3200);
    await page.getByRole('button', { name: 'Anfrage senden' }).click();

    await expect(page.locator('[data-form-success]')).toBeVisible();
    await expect(page.locator('[data-form-success]')).toHaveText(
      'Danke — wir melden uns innerhalb von zwei Werktagen.',
    );
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
