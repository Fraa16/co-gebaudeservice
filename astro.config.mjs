// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

/**
 * The canonical origin. Baked into canonical URLs, the sitemap and OG tags.
 * TODO(client): confirm the registered domain before launch.
 */
const SITE = process.env.PUBLIC_SITE_URL ?? 'https://www.co-gebaeudeservice.de';

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
