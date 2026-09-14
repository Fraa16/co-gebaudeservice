import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROUTES } from './routes';

/** The production CSP lives in vercel.json and is never applied by `astro preview`,
 *  so a page can pass every local test and still render blank once deployed. That is
 *  exactly what happened: Astro inlined the reveal script, `script-src 'self'` blocked
 *  it, and every .co-reveal section stayed at opacity 0.
 *
 *  These tests reproduce the deployed configuration locally. */

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const csp: string = vercel.headers
  .flatMap((h: { headers: { key: string; value: string }[] }) => h.headers)
  .find((h: { key: string }) => h.key === 'Content-Security-Policy')?.value;

test('vercel.json defines a Content-Security-Policy', () => {
  expect(csp, 'no CSP found in vercel.json').toBeTruthy();
});

test('the built HTML contains no inline executable script', () => {
  const offenders: string[] = [];

  for (const file of readdirSync('dist', { recursive: true, encoding: 'utf8' })) {
    if (typeof file !== 'string' || !file.endsWith('.html')) continue;
    const html = readFileSync(join('dist', file), 'utf8');

    for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      const attrs = m[1];
      const body = m[2].trim();
      if (!body) continue; // external script, fine
      // JSON-LD and other data blocks are not executed, so CSP does not apply.
      if (/type=["'](application\/ld\+json|application\/json)["']/.test(attrs)) continue;
      offenders.push(`${file}: <script${attrs}> ${body.slice(0, 60)}…`);
    }
  }

  expect(
    offenders,
    "inline scripts are blocked by script-src 'self' in production",
  ).toEqual([]);
});

for (const route of ROUTES) {
  test(`${route} renders its content under the production CSP`, async ({ page }) => {
    const violations: string[] = [];
    page.on('console', (m) => {
      const t = m.text();
      if (/Content Security Policy|Refused to (execute|load|apply)/i.test(t)) violations.push(t);
    });

    // Apply the deployed CSP to the document response.
    await page.route('**/*', async (routeCtx) => {
      const res = await routeCtx.fetch();
      const headers = { ...res.headers() };
      if ((headers['content-type'] ?? '').includes('text/html')) {
        headers['content-security-policy'] = csp;
      }
      await routeCtx.fulfill({ response: res, headers });
    });

    await page.goto(route, { waitUntil: 'networkidle' });

    expect(violations, `${route} CSP violations`).toEqual([]);

    // Content must actually be painted, not merely present in the DOM.
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    expect(
      await h1.evaluate((el) => Number(getComputedStyle(el).opacity)),
      `${route} h1 opacity`,
    ).toBeGreaterThan(0.9);
  });
}

test('every revealed section is visible without JavaScript', async ({ browser }) => {
  // The decisive check: with scripting off, nothing may be hidden.
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'load' });

  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('.co-reveal')]
      .filter((el) => Number(getComputedStyle(el).opacity) < 0.9)
      .map((el) => el.className.split(' ').slice(0, 2).join('.')),
  );

  expect(hidden, 'sections hidden with JS disabled').toEqual([]);
  await context.close();
});

test('the deployed Build Output config carries the security headers', () => {
  /* Adding the Vercel adapter for /api/kontakt moved the deploy onto the Build Output
     API, where Vercel reads .vercel/output/config.json — which the adapter writes with
     no headers of its own. If vercel.json alone were relied on, the CSP, HSTS and the
     rest would quietly stop being sent in production while every local test still
     passed. scripts/inject-vercel-headers.mjs copies them across at build time; this
     asserts they actually arrived, and that they are matched before the filesystem is
     consulted (a header route after `handle: filesystem` never sees a static page). */
  const config = JSON.parse(readFileSync('.vercel/output/config.json', 'utf8')) as {
    routes: { src?: string; handle?: string; headers?: Record<string, string>; continue?: boolean }[];
  };

  const filesystemAt = config.routes.findIndex((r) => r.handle === 'filesystem');
  expect(filesystemAt, 'no filesystem handle in the Build Output config').toBeGreaterThan(-1);

  const cspRouteAt = config.routes.findIndex((r) => r.headers?.['Content-Security-Policy']);
  expect(cspRouteAt, 'no CSP route in the Build Output config').toBeGreaterThan(-1);
  expect(cspRouteAt, 'the CSP route must come before the filesystem handle').toBeLessThan(filesystemAt);

  const route = config.routes[cspRouteAt]!;
  expect(route.continue, 'a header route must continue matching').toBe(true);
  expect(route.headers!['Content-Security-Policy']).toBe(csp);

  for (const key of [
    'Strict-Transport-Security',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy',
  ]) {
    expect(route.headers, `${key} missing from the Build Output config`).toHaveProperty(key);
  }
});
