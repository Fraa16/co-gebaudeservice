# Design record

The original handoff. **Nothing here is imported by the build** — it is the reference
the production site in `src/` was built from.

| | |
|---|---|
| `prototypes/website-rounded.dc.html` | The shipping design. The one that was ported. |
| `prototypes/website-rounded-print.dc.html` | Its print export. |
| `prototypes/website-prototyp.dc.html` | An earlier variant — different type system, not the shipping direction. Still useful: it holds copy that never reached `content.json` (the Leistungen page header, the stat strip, a better consent line). |
| `prototypes/ci-sheet.dc.html` | The CI sheet: logo construction, palette roles, type scale, tonality. |
| `prototypes/support.js`, `image-slot.js`, `doc-page.js` | The editor runtime. Kept beside the prototypes so they still open in a browser. Never ported. |
| `screenshots/` | Ten rendered references. See the note below. |
| `tokens.json` | The authoritative measurements. `scripts/check-tokens.mjs` diffs `src/styles/tokens.css` against it. |
| `website-rounded.pdf` | The whole page as one image, and the source of the hero photograph. |

Original filenames, before they were renamed to ASCII kebab-case: `CO Website
Rounded.dc.html`, `CO Website Rounded-print.dc.html`, `CO Website Prototyp.dc.html`,
`CO Gebäudeservice CI.dc.html` (whose umlaut was NFD-decomposed and broke naive globs),
`CO Website Rounded.pdf`.

## About the screenshots

They are **JPEGs at 924×540 with a `.png` extension**, cropped to one viewport, and
they contain stock photography the project mostly does not have. Read them by eye;
pixel-diffing against them is meaningless — JPEG ringing alone exceeds any sensible
threshold.

| File | Section |
|---|---|
| `web-01-hero.png` | Header bar + hero card |
| `web-02-leistungen.png` | Marquee strip + five service cards + CTA card |
| `web-03-treppenhaus.png` | Detail chapter: long-form text, photo card, info card |
| `web-04-ablauf.png` | Process card with four step cards |
| `web-05-kontakt.png` | Contact card: details rows + enquiry form with service chips |
| `web-06-footer.png` | Footer card |
| `ci-01-logo.png` | Logo: horizontal, inverted stacked, mark-only |
| `ci-02-farbwelt.png` | Palette with role notes + neutral tones |
| `ci-03-typografie.png` | Archivo / Source Sans 3 specimens + type scale |
| `ci-04-anwendung.png` | Applied: website header/hero, business card, tonality |

## Deliberate differences between the built site and these renders

Do not "fix" these — each is a decision with a reason.

1. **Radii follow `tokens.json`, not the rendered prototype.** The prototype's tweak
   layer (`{{ radL }}` / `{{ radM }}`) overrode several literal values at render time,
   and that layer does not ship. So the detail photo is 24px and the info card 26px per
   the tokens, contact rows 18px, step cards 22px, and the header 26px rather than the
   prototype's stray 28px. Differences of ~2px on four elements.
2. **Placeholder panels** stand in for the six missing photographs.
3. **The nav is multi-page** — Leistungen, Über uns, Kontakt — not the one-pager's
   anchors. The CI sheet's applied-design panel already shows this direction.
4. **The home page's Treppenhaus chapter is condensed** to one paragraph with no info
   card; the full chapter lives at `/leistungen/treppenhausreinigung`.
5. **Service cards carry one stretched link** over the whole tile instead of the
   prototype's five identical 38px "Anfragen" arrows.
6. **Focus rings are ink on light grounds**, not cyan: cyan measures 2.46:1 on white,
   below the 3:1 WCAG 1.4.11 requires for non-text UI.
7. **Small labels on the pale ground use `--co-deep-text`**, not `--co-blue`, which
   measures 4.02:1 there — under AA.
8. **The consent line has a checkbox.** A notice sentence is not consent under
   Art. 4 Nr. 11 DSGVO.

## Art direction, September 2026

The first production build was faithful to the original tokens and read as a bought
template: eleven sections, one archetype (`.co-card` with three fills), a 3.2:1 type
ratio, perfect `1fr 1fr` symmetry, no depth, no motion. The client's references
(Hirael "RIVR" and "USD Halo") share a skeleton this design already had — rounded
containers inset from the viewport edge on a light ground — but fill it with varied
section archetypes rather than one repeated card.

What changed, and the original values:

| | was | now |
|---|---|---|
| display tier | none | `clamp(38px, 5.4vw, 80px)` |
| `h1` | `clamp(32px, 4.6vw, 54px)` | `clamp(34px, 4.6vw, 62px)` |
| `h2` | `clamp(27px, 3.4vw, 38px)` | `clamp(28px, 3.6vw, 46px)` |
| shadows / gradients | forbidden (rule 2) | tokenised depth, ink and pale gradients, film grain |
| sections | one card archetype | hero, stat band, bento mosaic, editorial splits, ghost-numeral steps |
| motion | none | scroll reveals, sticky glass header, ~1 kB |

Devices taken from the references: full-bleed photography inside the container, panels
floating over the hero's bottom corners, a stat band with hairline dividers, a bento
mosaic mixing light and dark tiles at different sizes, pill CTAs with a circular arrow,
card content pushed apart (heading top, body bottom), and heading-left / CTA-right on a
shared baseline.

Two layout rules came out of this pass and are now in CLAUDE.md rule 5, because both
broke the page at 320px before they were understood: flex-basis must be `min(<px>, 100%)`
rather than a percentage, and every text-bearing `display: grid` needs
`grid-template-columns: minmax(0, 1fr)`.

**Still outstanding:** six of the seven photographs. The bento's feature tile is built to
carry one and currently falls back to a brand panel, so the mosaic's centrepiece is empty.
