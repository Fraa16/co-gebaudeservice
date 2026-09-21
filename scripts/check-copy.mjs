/**
 * Enforces the tonality rules on everything in src/data/.
 *
 * CLAUDE.md rule 4 already says no superlatives, no exclamation marks, no emoji. Those
 * were review rules, which means they held until someone was in a hurry. These are the
 * ones that can be decided by a machine, so they are decided by a machine:
 *
 *  1. **No parenthetical dash.** An em or en dash with spaces around it is the single
 *     most reliable tell of generated German. Ranges keep theirs, because "Mo–Fr" and
 *     "14-tägig" are a different punctuation mark doing a different job: the rule fires
 *     only when the dash is surrounded by whitespace.
 *  2. **No empty phrases.** A list of German marketing filler that says nothing. Every
 *     entry is a claim the reader cannot check and the business cannot keep.
 *  3. **No superlatives** and no unverifiable seniority or volume claims.
 *  4. **No exclamation marks, no emoji.**
 *
 * Scope is src/data/ because rule 4 puts all copy there. Comments are stripped first,
 * so notes to other developers can use whatever punctuation they like.
 */
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

/** A dash with space on at least one side. "Mo–Fr", "14-tägig" and "2×" are untouched. */
const DASH = /(^|\s)[—–](\s|$)|(\s)[—–]($|\s)/;

const EMPTY_PHRASES = [
  'maßgeschneidert', 'rundum sorglos', 'rundum-sorglos', 'zuverlässiger partner',
  'kompetent und zuverlässig', 'professionell und zuverlässig', 'vertrauenssache',
  'legen wir großen wert', 'legen großen wert', 'zufriedenheit unserer kunden',
  'ihr partner für', 'wir sorgen dafür, dass', 'qualität, die überzeugt',
  'individuell abgestimmt', 'auf höchstem niveau', 'mit herz und verstand',
  'sauberkeit ist', 'wir freuen uns auf ihre anfrage',
];

const SUPERLATIVES =
  /\b(beste[nrs]?|günstigste[nrs]?|höchste[nrs]?|optimale[nrs]?|perfekte[nrs]?|erstklassig\w*|führend\w*|einzigartig\w*|unschlagbar\w*)\b/i;

/** Claims about tenure or volume that nobody has verified. If one becomes true, it
 *  belongs in company.ts behind a `verified` flag like every other fact. */
const UNVERIFIED = /\b(seit über \d+|seit mehr als \d+|über \d+\s*(zufriedene|kunden|objekte)|langjährige erfahrung)\b/i;

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

/** Comments are for developers; only shipped strings are held to the tone rules. */
function stripComments(source, file) {
  if (file.endsWith('.json')) {
    // Keys beginning with $ are notes to the build, never rendered.
    return source
      .split('\n')
      .filter((line) => !/^\s*"\$/.test(line))
      .join('\n');
  }
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !/^\s*(\/\/|\*)/.test(line))
    // Trailing comments too. Requiring whitespace before the slashes leaves "https://"
    // alone, which otherwise loses the rest of every URL in the file.
    .map((line) => line.replace(/\s\/\/(?![/*]).*$/, ''))
    // Thrown errors are read by whoever broke the build, not by a visitor.
    .filter((line) => !/throw new Error\(/.test(line))
    .join('\n');
}

const RULES = [
  ['Gedankenstrich', (line) => DASH.test(line)],
  ['Floskel', (line) => EMPTY_PHRASES.find((p) => line.toLowerCase().includes(p))],
  ['Superlativ', (line) => SUPERLATIVES.test(line)],
  ['unbelegte Behauptung', (line) => UNVERIFIED.test(line)],
  ['Ausrufezeichen', (line) => /!["']/.test(line) || /!\s*$/.test(line.trim())],
  ['Emoji', (line) => EMOJI.test(line)],
];

const files = globSync('src/data/**/*.{ts,json}', { cwd: process.cwd() });
const problems = [];

for (const file of files) {
  const source = stripComments(readFileSync(file, 'utf8'), file);
  source.split('\n').forEach((line, i) => {
    if (!line.trim()) return;
    for (const [name, test] of RULES) {
      const hit = test(line);
      if (hit) problems.push([file, i + 1, name, line.trim(), typeof hit === 'string' ? hit : null]);
    }
  });
}

/* CONTENT-REVIEW.md is what the client signs off. It held a hand-typed copy of every
 * title and description, and it had silently gone stale: section 6 listed strings that
 * no longer existed in seo.ts, so a sign-off would have approved text the site does not
 * show. Rather than generate the document and lose the commentary around it, hold the
 * quoted strings to the code. */
const review = readFileSync('CONTENT-REVIEW.md', 'utf8');
const quoted = (file, pattern) =>
  [...readFileSync(file, 'utf8').matchAll(pattern)].map((m) => m[1]);

const mustAppear = [
  ...quoted('src/data/seo.ts', /^\s{4}title: '([^']+)'/gm).map((t) => ['Seitentitel', t]),
  ...quoted('src/data/seo.ts', /^\s{6}'([^']{40,})',$/gm).map((t) => ['Beschreibung', t]),
  ...quoted('src/data/faq.ts', /^\s{4}q: '([^']+)'/gm).map((t) => ['FAQ-Frage', t]),
];

for (const [kind, text] of mustAppear) {
  if (!review.includes(text)) {
    problems.push([
      'CONTENT-REVIEW.md',
      0,
      `${kind} fehlt in der Freigabeliste`,
      text,
      null,
    ]);
  }
}

if (problems.length) {
  console.error('\nTonalität (CLAUDE.md Regel 4):\n');
  for (const [file, line, kind, text, hit] of problems) {
    console.error(`  ${file}:${line}  ${kind}${hit ? ` „${hit}“` : ''}`);
    console.error(`      ${text.length > 110 ? text.slice(0, 110) + '…' : text}`);
  }
  console.error(`\n${problems.length} Fundstelle(n).\n`);
  process.exit(1);
}

console.log(`check-copy: ${files.length} Dateien sauber.`);
