/**
 * Enforces the CSS contract from CLAUDE.md rules 1–2:
 * colour and radius live in tokens, never as literals in component styles.
 *
 * Scans every <style> block in src/**\/*.astro and every .css under src/styles that is
 * not tokens.css, and fails on a raw hex colour, an rgb()/rgba() literal, or a numeric
 * border-radius. Tokens themselves are exempt — that is where the values belong.
 */
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const EXEMPT = new Set(['src/styles/tokens.css']);

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const RGB = /\brgba?\(/;
const RADIUS = /border-radius:\s*[0-9.]+(px|rem|em|%)/;

/** Inline styles that are unavoidable brand values passed as CSS custom properties
 *  from component props are allowed only when they reference a var(). */
const ALLOW_LINE = /var\(--co-/;

const files = globSync('src/**/*.{astro,css}', { cwd: process.cwd() });
const problems = [];

for (const file of files) {
  if (EXEMPT.has(file)) continue;
  const source = readFileSync(file, 'utf8');

  // Only look inside <style> blocks for .astro; a whole .css file is style.
  const blocks = file.endsWith('.astro')
    ? [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => ({
        text: m[1],
        offset: source.slice(0, m.index).split('\n').length,
      }))
    : [{ text: source, offset: 0 }];

  for (const block of blocks) {
    block.text.split('\n').forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
      if (ALLOW_LINE.test(trimmed)) return;

      if (HEX.test(trimmed)) problems.push([file, block.offset + i, 'hex colour', trimmed]);
      else if (RGB.test(trimmed)) problems.push([file, block.offset + i, 'rgb() literal', trimmed]);
      else if (RADIUS.test(trimmed))
        problems.push([file, block.offset + i, 'literal border-radius', trimmed]);
    });
  }
}

if (problems.length) {
  console.error('\nCSS contract violations (CLAUDE.md rules 1–2):\n');
  for (const [file, line, kind, text] of problems) {
    console.error(`  ${file}:${line}  ${kind}\n      ${text}`);
  }
  console.error(`\n${problems.length} problem(s). Use a --co-* token instead.\n`);
  process.exit(1);
}

console.log(`check-styles: ${files.length} files clean.`);
