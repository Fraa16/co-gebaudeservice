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
        // `astro preview` serves dist/ with the same routing as production.
        //
        // In an agent sandbox Astro auto-detects the environment and daemonises the
        // preview server, so the foreground process exits at once and Playwright
        // reports "webServer exited early". reuseExistingServer is therefore always
        // on: start the server yourself there
        // (`npx astro preview --port 4321 --background`) and this picks it up. A CI
        // runner has nothing to reuse, so it still starts its own.
        command: 'npx astro preview --port 4321',
        url: 'http://localhost:4321',
        reuseExistingServer: true,
        timeout: 60_000,
      },
  // The responsiveness sweep drives the viewport itself, so run it once.
  projects: [
    { name: 'ref-924', use: { ...devices['Desktop Chrome'], viewport: { width: 924, height: 540 } } },
    { name: 'desk-1440', testIgnore: /responsive\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mob-390', testIgnore: /responsive\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'narrow-320', testIgnore: /responsive\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 568 } } },
  ],
});
