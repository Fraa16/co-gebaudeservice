/** Length of the longest word in a heading, for the `.co-fit` cap in global.css.
 *
 *  German compounds ("Datenschutzerklärung", "Treppenhausreinigung", 20 letters each)
 *  are wider than a phone's column at the type scale's floor, and a heading cannot
 *  break inside a word without breaking it mid-syllable. Counting the word at build
 *  time lets CSS shrink just the headings that hold one, on just the screens too
 *  narrow for it, instead of lowering the scale for every heading everywhere.
 *  Punctuation counts: a full stop after the word takes room on the line too. */
export function longestWord(text: string): number {
  return Math.max(1, ...text.trim().split(/\s+/).map((word) => word.length));
}

/** The inline style that hands the count to CSS. */
export function fitStyle(text: string): string {
  return `--co-longest-word:${longestWord(text)}`;
}
