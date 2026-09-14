import { defineConfig, devices } from '@playwright/test';

/** Pinned to @playwright/test 1.56.1: /opt/pw-browsers holds chromium revision 1194,
 *  which is what this version expects. Never run `playwright install` here. */
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        // Serves the built .vercel/output/static with production routing.
        //
        // This was `astro preview` until the Vercel adapter arrived for /api/kontakt:
        // adapters own preview and this one does not implement it, so
        // scripts/preview-static.mjs stands in and serves the same bytes Vercel will.
        //
        // reuseExistingServer is always on: in an agent sandbox the server is started
        // by hand (`npm run preview &`) and this picks it up. A CI runner has nothing
        // to reuse, so it still starts its own.
        command: 'npm run preview',
        url: 'http://localhost:4321',
        reuseExistingServer: true,
        timeout: 60_000,
      },
  // The responsiveness sweep drives the viewport itself, so run it once.
  projects: [
    { name: 'ref-924', use: { ...devices['Desktop Chrome'], viewport: { width: 924, height: 540 } } },
    { name: 'desk-1440', testIgnore: /(responsive|contact-endpoint)\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mob-390', testIgnore: /(responsive|contact-endpoint)\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'narrow-320', testIgnore: /(responsive|contact-endpoint)\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 568 } } },
  ],
});
