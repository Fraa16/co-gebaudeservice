import type { APIRoute } from 'astro';
import { execSync } from 'node:child_process';
import { site } from '../data/site';

/** The sitemap: one file at /sitemap.xml, with priority and change frequency.
 *
 *  This was @astrojs/sitemap, which always writes an index (sitemap-index.xml) that
 *  points at numbered chunks (sitemap-0.xml) — built for sites with tens of thousands
 *  of URLs, and not the format the client's other sites use. It also listed every
 *  built page, Impressum and Datenschutz included, which are noindex by design: Search
 *  Console reports that as "Submitted URL marked noindex". The list below is the four
 *  pages that ask to be indexed, and tests/seo.spec.ts checks it against every page's
 *  own robots tag, so a new page or a changed tag cannot drift past it.
 *
 *  Google ignores <priority> and <changefreq>; they are here because the format the
 *  client knows carries them, and they cost nothing. <lastmod> is the one field Google
 *  reads, and only while it is believable, which is why it is the date of the last
 *  commit, not the build: a build date would claim every page changed on every deploy,
 *  including deploys that changed nothing. */
const PAGES = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/leistungen', priority: '0.9', changefreq: 'monthly' },
  { path: '/kontakt', priority: '0.8', changefreq: 'monthly' },
  { path: '/ueber-uns', priority: '0.7', changefreq: 'monthly' },
] as const;

/** Falls back to the build date only where git is unavailable; on Vercel it is not. */
const lastmod = (() => {
  try {
    return execSync('git log -1 --format=%cI', { encoding: 'utf8' }).trim().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
})();

export const GET: APIRoute = () => {
  // With the launch gate shut every page is noindex, so the list is empty too.
  const pages = site.indexable ? PAGES : [];
  const urls = pages
    .map(
      (page) => `  <url>
    <loc>${new URL(page.path, site.url).href}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
