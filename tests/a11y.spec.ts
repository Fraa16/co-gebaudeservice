import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES } from './routes';

for (const route of ROUTES) {
  test(`${route} has no accessibility violations`, async ({ page }) => {
    await page.goto(route);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(
      violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`),
    ).toEqual([]);
  });
}

test('every interactive element shows a visible focus ring', async ({ page }) => {
  await page.goto('/kontakt');

  const targets = page.locator(
    'a[href], button, input:not([type="hidden"]), textarea, select, [tabindex]:not([tabindex="-1"])',
  );

  const count = await targets.count();
  expect(count).toBeGreaterThan(5);

  for (let i = 0; i < count; i++) {
    const el = targets.nth(i);
    if (!(await el.isVisible())) continue;
    await el.focus();
    const ring = await el.evaluate((node) => {
      const s = getComputedStyle(node as Element);
      return { width: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
    });
    expect(ring.style, `element ${i} outline-style`).not.toBe('none');
    expect(parseFloat(ring.width), `element ${i} outline-width`).toBeGreaterThan(0);
  }
});

test('the skip link is the first focusable element', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveClass(/co-skip-link/);
});

test('the active nav pill is marked aria-current', async ({ page }) => {
  await page.goto('/leistungen');
  await expect(page.locator('nav a[aria-current="page"]')).toHaveText('Leistungen');
});
