import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** CLAUDE.md: "Fully fluid: no media queries, no max-width container."
 *  User-preference queries are not breakpoints and stay allowed. */
const ALLOWED = /prefers-reduced-motion|prefers-color-scheme|forced-colors|print/;

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? cssFiles(join(dir, e.name)) : e.name.endsWith('.css') ? [join(dir, e.name)] : [],
  );
}

test('the built CSS contains no breakpoints', () => {
  const offenders: string[] = [];

  for (const file of cssFiles('dist')) {
    const css = readFileSync(file, 'utf8');
    for (const m of css.matchAll(/@media([^{]+)\{/g)) {
      if (!ALLOWED.test(m[1])) offenders.push(`${file}: @media${m[1].trim()}`);
    }
  }

  expect(offenders).toEqual([]);
});

test('the built output never references a third-party origin', () => {
  const html = readdirSync('dist', { recursive: true, encoding: 'utf8' })
    .filter((f) => typeof f === 'string' && f.endsWith('.html'))
    .map((f) => readFileSync(join('dist', f as string), 'utf8'))
    .join('\n');

  expect(html).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
});
