import type { APIRoute } from 'astro';
import { site } from '../data/site';

/** An endpoint rather than a static file, so one env var closes both this and the
 *  per-page robots meta tag. Stays shut until the launch gate clears. */
export const GET: APIRoute = () => {
  const body = site.indexable
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site.url).href}\n`
    : `# Die Website ist noch nicht freigegeben.\nUser-agent: *\nDisallow: /\n`;

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
