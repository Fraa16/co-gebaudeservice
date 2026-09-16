// @ts-check
import { execSync } from 'node:child_process';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

/**
 * lastmod for the sitemap: the date of the last commit, not the build time.
 *
 * Build time would claim every page changed on every deploy, including deploys that
 * changed nothing — which teaches Google to ignore the field. The commit date is the
 * date the content actually last moved. Falls back to the build date only where git is
 * unavailable, which on Vercel it is not.
 */
const LAST_MODIFIED = (() => {
  try {
    return new Date(execSync('git log -1 --format=%cI', { encoding: 'utf8' }).trim());
  } catch {
    return new Date();
  }
})();

/**
 * The canonical origin. Baked into canonical URLs, the sitemap and OG tags.
 * Confirmed by the client: co-gebaeudeservice.de, without www. Vercel must redirect
 * www -> apex so only one of the two is ever canonical.
 */
const SITE = process.env.PUBLIC_SITE_URL ?? 'https://co-gebaeudeservice.de';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  compressHTML: true,

  /* Static stays the default: every page is prerendered at build time exactly as
     before. The adapter exists only so `src/pages/api/kontakt.ts` — which opts out with
     `export const prerender = false` — can run as a serverless function. Nothing else
     on the site becomes server-rendered, and `astro build` still emits the same static
     HTML for all nine pages. */
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      // The OG source route and the 404 are real pages but must not be indexed.
      filter: (page) => !page.includes('/og/') && !page.includes('/404'),
      i18n: undefined,
      lastmod: LAST_MODIFIED,
    }),
  ],
  image: { responsiveStyles: true },

  build: {
    // Astro's own stylesheet inlining, independent of vite's assetsInlineLimit below.
    // The CSP allows style-src 'unsafe-inline', so small stylesheets can be inlined —
    // without this the homepage made six render-blocking CSS requests, five of them
    // under 6 kB.
    inlineStylesheets: 'always',
  },

  vite: {
    build: {
      // Astro inlines small hoisted scripts into the HTML. vercel.json sets
      // script-src 'self' with no 'unsafe-inline', so an inlined script is blocked
      // in production while working fine under `astro preview`, which applies no
      // headers. Keep every script external so the strict CSP holds.
      assetsInlineLimit: 0,
    },
  },
});
