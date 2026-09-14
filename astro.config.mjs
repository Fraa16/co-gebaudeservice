// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * The canonical origin. Baked into canonical URLs, the sitemap and OG tags.
 * TODO(client): confirm the registered domain before launch.
 */
const SITE = process.env.PUBLIC_SITE_URL ?? 'https://www.co-gebaeudeservice.de';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  compressHTML: true,
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
