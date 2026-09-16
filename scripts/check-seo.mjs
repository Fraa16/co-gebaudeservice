import { readFileSync } from 'node:fs';

/**
 * Keeps every title and meta description inside the budget Google renders and
 * tests/smoke.spec.ts enforces.
 *
 * The suite already checks this, but only on the seven routes it visits — `notFound`
 * had a 38-character description nothing was looking at. This checks every entry in
 * src/data/seo.ts, at build time, before a page is ever rendered.
 *
 * Limits come from seo.ts itself (SEO_LIMITS) so the numbers live in one place.
 */

const src = readFileSync('src/data/seo.ts', 'utf8');

/* SEO_LIMITS declares suffixLength as SUFFIX.length, not a literal, so measure the
   actual string — that way the suffix can be reworded without touching this file. */
const suffix = /^const SUFFIX = '((?:[^'\\]|\\.)*)';/m.exec(src);
if (!suffix) throw new Error('check-seo: SUFFIX not found in src/data/seo.ts');
const suffixLength = suffix[1].length;

const pairs = [...src.matchAll(/min:\s*(\d+),\s*max:\s*(\d+)/g)];
if (pairs.length < 2) throw new Error('check-seo: could not read both SEO_LIMITS pairs');
const [tMin, tMax] = [Number(pairs[0][1]), Number(pairs[0][2])];
const [dMin, dMax] = [Number(pairs[1][1]), Number(pairs[1][2])];

const body = src.slice(src.indexOf('export const pageSeo'), src.indexOf('} as const satisfies'));
const entries = [
  ...body.matchAll(
    /(\w+): \{[\s\S]*?title:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?description:\s*\n?\s*'((?:[^'\\]|\\.)*)'/g,
  ),
];

if (entries.length === 0) throw new Error('check-seo: parsed no entries — did seo.ts change shape?');

const problems = [];
for (const [, key, title, description] of entries) {
  const t = title.length + suffixLength;
  const d = description.length;
  if (t < tMin || t > tMax) problems.push(`${key}: title ${t} chars, want ${tMin}–${tMax}`);
  if (d < dMin || d > dMax) problems.push(`${key}: description ${d} chars, want ${dMin}–${dMax}`);
}

if (problems.length) {
  console.error('check-seo: ' + problems.length + ' problem(s):');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}

console.log(`check-seo: ${entries.length} pages within the title and description budget.`);
