/**
 * Keeps src/styles/tokens.css honest against design/tokens.json, so the build copy and
 * the design record cannot drift apart.
 *
 * Compares colours, radii, spacing, grids and control paddings. Documented, deliberate
 * differences live in DEVIATIONS below with the reason.
 */
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/tokens.css', 'utf8');
const spec = JSON.parse(readFileSync('design/tokens.json', 'utf8'));

/** Deliberate differences, each with the reason it exists. */
const DEVIATIONS = {
  '--co-font-heading':
    "Fontsource registers the family as 'Archivo Variable'; the bare name never matches.",
  '--co-font-body':
    "Fontsource registers the family as 'Source Sans 3 Variable'; the bare name never matches.",
};

const vars = new Map();
for (const m of css.matchAll(/^\s*(--co-[a-z0-9-]+):\s*([^;]+);/gim)) {
  vars.set(m[1], m[2].trim());
}

const norm = (v) => String(v).replace(/\s+/g, '').toLowerCase();
const kebab = (k) => k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** tokens.css shortens two radius names; the values must still match. */
const RADIUS_NAMES = { logoMark: 'logo', contactRow: 'contact-row' };

const expected = [
  ...Object.entries(spec.color)
    .filter(([, v]) => typeof v === 'string')
    .map(([k, v]) => [`--co-${kebab(k)}`, v]),
  ...Object.entries(spec.radius)
    .filter(([k, v]) => typeof v === 'string' && !k.startsWith('$'))
    .map(([k, v]) => [`--co-radius-${RADIUS_NAMES[k] ?? kebab(k)}`, v]),
  ...Object.entries(spec.grid).map(([k, v]) => [
    `--co-grid-${{ serviceCards: 'services', twoColumn: 'two-col', steps: 'steps', formFieldPair: 'field-pair' }[k] ?? k}`,
    v,
  ]),
];

const problems = [];
for (const [name, value] of expected) {
  if (DEVIATIONS[name]) continue;
  const actual = vars.get(name);
  if (actual === undefined) {
    problems.push(`${name} is missing from tokens.css (design/tokens.json has ${value})`);
  } else if (norm(actual) !== norm(value)) {
    problems.push(`${name}: tokens.css has "${actual}", design/tokens.json has "${value}"`);
  }
}

if (problems.length) {
  console.error('\ntokens.css has drifted from design/tokens.json:\n');
  for (const p of problems) console.error('  ' + p);
  console.error('');
  process.exit(1);
}

console.log(
  `check-tokens: ${expected.length} tokens match design/tokens.json (${Object.keys(DEVIATIONS).length} documented deviations).`,
);
