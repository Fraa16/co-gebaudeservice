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
});
