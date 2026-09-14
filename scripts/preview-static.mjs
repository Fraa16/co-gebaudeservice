import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

/**
 * Serves the built static site the way Vercel will.
 *
 * `astro preview` stopped working the moment the Vercel adapter was added — adapters
 * own preview, and this one does not implement it. The test suite still needs the built
 * output served with production routing, so this stands in: it serves
 * `.vercel/output/static` with `trailingSlash: 'never'`, extensionless URLs resolving to
 * `<route>/index.html`, and a real 404 page.
 *
 * It deliberately does NOT apply the security headers. `tests/csp.spec.ts` reads those
 * from the build output and applies the CSP itself, exactly as it did under
 * `astro preview` — the whole point of that file is that the local server is not the
 * source of truth for headers.
 */

const ROOT = '.vercel/output/static';
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const readIfFile = async (path) => {
  try {
    if (!(await stat(path)).isFile()) return null;
    return await readFile(path);
  } catch {
    return null;
  }
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);

  // trailingSlash: 'never' — the same 308 the deploy issues.
  if (pathname.length > 1 && pathname.endsWith('/')) {
    res.writeHead(308, { location: pathname.slice(0, -1) + url.search });
    return res.end();
  }

  // normalize() collapses any ../ before it can escape the served directory.
  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');

  const candidates = [
    join(ROOT, safe),
    join(ROOT, safe, 'index.html'),
    join(ROOT, `${safe}.html`),
  ];

  for (const candidate of candidates) {
    const body = await readIfFile(candidate);
    if (!body) continue;
    res.writeHead(200, { 'content-type': TYPES[extname(candidate)] ?? 'application/octet-stream' });
    return res.end(body);
  }

  const notFound = await readIfFile(join(ROOT, '404.html'));
  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
  res.end(notFound ?? 'Not found');
});

server.listen(PORT, () => console.log(`preview-static: ${ROOT} on http://localhost:${PORT}`));
