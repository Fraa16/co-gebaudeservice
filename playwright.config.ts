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
        command: 'npx astro preview --port 4321',
        url: 'http://localhost:4321',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
  projects: [
    { name: 'ref-924', use: { ...devices['Desktop Chrome'], viewport: { width: 924, height: 540 } } },
    { name: 'desk-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mob-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'narrow-320', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 568 } } },
  ],
});
