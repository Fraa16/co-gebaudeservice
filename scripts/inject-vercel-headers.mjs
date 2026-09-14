import { readFile, writeFile } from 'node:fs/promises';

/**
 * Copies the security headers from vercel.json into the Build Output API config.
 *
 * Why this exists: adding the Vercel adapter (so `/api/kontakt` can run) switched the
 * deploy from zero-config static to the Build Output API. Vercel then reads
 * `.vercel/output/config.json`, and the adapter writes that file itself — with no
 * headers in it. The CSP, HSTS, X-Frame-Options and the rest live in vercel.json, whose
 * standing under the Build Output API is at best undocumented and at worst ignored.
 *
 * Rather than depend on that precedence, the build makes its output self-sufficient:
 * vercel.json stays the single place the headers are written, and this copies them into
 * the generated config so they apply either way. `tests/csp.spec.ts` asserts the built
 * config actually carries the CSP, so a silent loss fails the suite rather than the
 * production site — this project has already shipped one CSP fault that only appeared
 * once deployed.
 */

const CONFIG = '.vercel/output/config.json';

const vercelJson = JSON.parse(await readFile('vercel.json', 'utf8'));

let config;
try {
  config = JSON.parse(await readFile(CONFIG, 'utf8'));
} catch {
  // A plain `astro build` without the adapter writes no such file. Nothing to do.
  console.log('inject-vercel-headers: no Build Output config, skipped.');
  process.exit(0);
}

/* Header-only routes must be matched before the filesystem is consulted, or the static
   HTML is served without ever reaching them. */
const filesystemAt = config.routes.findIndex((r) => r.handle === 'filesystem');
const insertAt = filesystemAt === -1 ? config.routes.length : filesystemAt;

const injected = (vercelJson.headers ?? []).map((entry) => ({
  src: entry.source === '/(.*)' ? '^/.*$' : entry.source,
  headers: Object.fromEntries(entry.headers.map((h) => [h.key, h.value])),
  continue: true,
}));

config.routes.splice(insertAt, 0, ...injected);
await writeFile(CONFIG, JSON.stringify(config, null, 2));

const names = injected.flatMap((r) => Object.keys(r.headers));
console.log(`inject-vercel-headers: ${injected.length} route(s), ${names.length} headers.`);
