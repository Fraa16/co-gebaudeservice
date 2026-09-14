# CO Gebäudeservice — Website

Marketing site for a building-services company in Nagold (Kreis Calw, Germany).
All user-facing copy is **German, formal Sie**.

## Read first

- `design/tokens.json` — the authoritative measurements, machine-readable. Use these
  instead of re-deriving values from the HTML. `src/styles/tokens.css` mirrors it and
  `npm run lint:tokens` keeps the two from drifting.
- `src/data/content.json` — the original design copy, with the structure for services,
  process steps and form fields.
- `design/screenshots/` — rendered reference of the design and the CI sheet. Note these
  are JPEGs at 924×540 despite the `.png` extension, so they are for reading by eye,
  not for pixel-diffing.
- `design/prototypes/website-rounded.dc.html` — the design prototype. Open it in a
  browser to see it live; its editor runtime sits beside it.
- `design/website-rounded.pdf` — the full page in one image.
- `README.md` — how to run, edit and deploy the production site.
- `CONTENT-REVIEW.md` — every string written for this build, awaiting client sign-off.

## What this is

The `.dc.html` files in `design/prototypes/` are **design references, not production
code.** They are single-file prototypes with inline styles and an editor-specific
runtime (`support.js`, `image-slot.js`, `doc-page.js`). Do not port those helpers, do
not copy the inline-style approach, and do not ship the tweak layer (`rundung` /
`grundflaeche` / `schriftband`).

Where the prototype's literal value and `design/tokens.json` disagree, **tokens.json
wins** — several literals in the prototype (the header's 28px radius among them) are
dead CSS, overridden by the tweak layer that does not ship.

The production site is **Astro 7, static output, TypeScript, deployed on Vercel.** It
lives in `src/`. Client JS is deliberately tiny: a header scroll state, and the chip
toggle plus form handling in `src/components/scripts/contact-form.ts`. The zod validator
is loaded on first interaction with the form, not with the page — it is 19 kB and most
visitors never touch the form.

Every page is prerendered. The one exception is `src/pages/api/kontakt.ts`, which opts
out with `prerender = false` and runs as a Vercel function so the contact form can send.
That is also why `@astrojs/vercel` is installed — and why the build runs
`scripts/inject-vercel-headers.mjs`: the adapter switches the deploy to the Build Output
API, where Vercel reads its own generated `config.json` and `vercel.json`'s headers no
longer reliably apply. The script copies them across so the CSP survives; `tests/csp.spec.ts`
asserts it. **`astro preview` no longer works** (adapters own preview and this one has
none) — use `npm run preview`, which serves the built output with production routing.

## The identity in one paragraph

Everything is a large, heavily-rounded card floating on a light neutral ground (`#E7EDF3`),
separated by one consistent small gutter. Radii: 32px for section cards, 26px for smaller
cards, 999px for every interactive element (nav links, buttons, chips, labels). No shadows —
flat fills with 1px `#DCE6EF` borders. Deep navy `#03045E` and blue `#0077B6` carry the
weight, cyan `#00B4D8` is the accent, pale `#CAF0F8` is the light ground. Archivo for
headings with tight negative tracking, Source Sans 3 for everything else. Fully fluid: no
media queries, no max-width container — `auto-fit` grids and `clamp()` do the work.

Sections are **not** one repeated card. The page alternates archetypes: a full-bleed
photographic hero with panels floating over its corners, a stat band divided by
hairlines, a bento mosaic of differently-sized tiles, editorial splits with the heading
in one column and running text in the other, and an ink section with oversized ghost
numerals. Scale contrast carries the voice — display type runs to 80px against 11px
kickers, roughly 8:1.

## Rules

1. **Radii are the identity.** Use the token tiers. Never mix in a stray 8px or 4px radius.
2. **Depth is tokenised, never literal.** Shadows and gradients were originally
   forbidden outright; that flatness was a large part of why the site read as a
   template, so the rule was relaxed in September 2026. Use only
   `--co-shadow-card` / `--co-shadow-lift`, `--co-ink-gradient` / `--co-pale-gradient`,
   `--co-grain` and the photo overlays. Never a literal shadow or gradient in a
   component — `npm run lint:styles` fails the build on one.
3. **Full-opacity type only.** Body copy is `#4C6B85` on light, `#CAF0F8`/`#FFFFFF` on dark,
   `#0B4A6F` on the pale hero ground. Never alpha-fade text to make it "softer".
4. **Copy flows from data, never from markup.** `src/data/content.json` is the baseline
   draft — the client has said the copy is not final, so it may change, but it changes
   *there*, not in a component. Strings written for this build are marked `draft` and
   listed in `CONTENT-REVIEW.md` for sign-off. The tonality rule holds regardless: no
   added marketing language, no superlatives, no exclamation marks, no emoji.
5. **Flex/grid with `gap`** for every group of siblings — never margin-spaced inline elements.
   Three rules that keep this fluid without breakpoints, all learned the hard way:
   a flex-basis must be `min(<px>, 100%)`, never a percentage (a percentage collapses
   on narrow screens and children punch out of the page); every `display: grid` holding
   text needs `grid-template-columns: minmax(0, 1fr)`, because an `auto` track floors at
   min-content and one German compound then widens the whole page; and **a row of four
   uses `.co-row-4`**, never wrapping flex — a wrapping row always passes through a
   width band where exactly three fit, stranding the fourth with its divider still
   attached. `.co-row-4` steps 1 → 2 → 4 via **container queries**, which respond to the
   content column rather than the device, so "no media queries" still holds.
6. **Type scales need an intercept, not a bare `vw`.** `clamp(38px, 5.4vw, 80px)` does
   not overtake its own floor until a 704px viewport, so every phone and small tablet
   got identical, desktop-tuned type. Interpolate between two viewports instead —
   `clamp(30px, 16px + 4.444vw, 80px)`. `tests/responsive.spec.ts` asserts the display
   size actually grows from 360px to 768px.
7. **Keep `text-wrap: pretty`** on headings and paragraphs.
8. **Form inputs stay at 16px** font-size (prevents iOS zoom-on-focus).
9. Visible `:focus-visible` ring on every interactive element (the prototype sets
   `outline: none` — that is a prototype shortcut, not the design). The ring is
   **ink on light grounds and cyan on dark**: the token's cyan measures 2.46:1 on white,
   below the 3:1 WCAG 1.4.11 requires. For the same reason small labels on the pale
   ground use `--co-deep-text`, not `--co-blue` (4.02:1, under AA).
10. **Content must never depend on JavaScript to be visible.** Scroll reveals are
   CSS-only (`animation-timeline: view()` behind an `@supports` guard) precisely
   because the earlier JS version blanked the whole site in production: Astro inlined
   the script and `vercel.json`'s `script-src 'self'` blocked it. `astro preview`
   applies no headers, so nothing local caught it — `tests/csp.spec.ts` now
   reproduces the deployed CSP and asserts the page still paints with JS disabled.
   Keep `assetsInlineLimit: 0` so Astro never inlines a script back into the HTML.
11. **Colour and radius live in tokens, never as literals in a component style block.**
   `npm run lint:styles` fails the build on a hex colour, an `rgb()` literal or a
   numeric `border-radius` anywhere in `src/`.
12. **No `LocalBusiness` markup and no linked `tel:`/`mailto:` while contact details are
   placeholders.** `src/data/company.ts` gates each field; a fake NAP in structured data
   is worse than none.

## Known placeholders

- **Photography**: `PHOTOS.md` has the brief. One of seven is in place (recovered from
  the design PDF); the rest render a branded `BrandPanel` until they land, so nothing
  looks broken. `src/data/photos.ts` is the only file that changes when they arrive.
- **Contact details**: the address and the phone number are real — Oguz Cakir,
  Schietinger Str. 28, 72202 Nagold, 0172 3001489. The e-mail is still a dummy value and
  is gated (see rule 12). Values are read from `contactRoutes` in `src/data/company.ts`,
  never from `content.json`'s `contact.rows` — that second copy is how the Kontakt page
  once displayed the placeholder number while linking the real one.
- **Logo**: done. `public/logo.svg`, the inverted lockup, the mark and the full favicon
  set are generated by `scripts/build-brand-assets.mjs` with the text as outlines.

## Before launch

See the checklist at the end of `README.md`. `PUBLIC_SITE_INDEXABLE` stays `false` —
every page `noindex` — until real contact details, legal sign-off, a working form
endpoint, the photographs and the confirmed domain are all in place.

Done already: self-hosted fonts (Google's CDN is a German privacy-law problem), SVG
logo and favicons, per-page titles and meta descriptions, OG image, sitemap, and the
structured-data graph with `areaServed` = Nagold / Kreis Calw.
