# CO Gebäudeservice — Website

Marketing site for a building-services company in Nagold (Kreis Calw). Static Astro
site, deployed from GitHub to Vercel. All user-facing copy is **German, formal Sie**.

```bash
npm install
npm run dev        # http://localhost:4321
npm run verify     # typecheck + both design-rule gates + build
npm test           # Playwright, four viewports
```

Node ≥ 22.12 (see `.nvmrc`).

## Layout

```
src/
  data/           content.json + every typed wrapper; the only place copy lives
  lib/            JSON-LD graph, shared contact schema
  styles/         tokens.css (the design system) + global.css
  layouts/        BaseLayout, LegalLayout
  components/     ui/ (reusable) · sections/ (page sections) · seo/ · scripts/
  pages/          the seven routes + robots.txt endpoint + the OG source
  assets/photos/  photographs (one of seven so far — see PHOTOS.md)
design/           the original handoff: prototypes, screenshots, tokens.json, the PDF
scripts/          the two design-rule gates + the brand-asset generator
tests/            Playwright specs
```

`design/` is the design record and is never imported by the build.

## Routes

| Route | |
|---|---|
| `/` | Hero, Schriftband, five service cards, Treppenhaus chapter, Ablauf, Kontakt |
| `/leistungen` | All eight services with scope lists |
| `/leistungen/treppenhausreinigung` | The one service with established long-form copy |
| `/ueber-uns` · `/kontakt` | |
| `/impressum` · `/datenschutz` | Drafts — see *Before launch* |

Adding a second deep service page: give the service real copy, then create
`src/content.config.ts` with a `glob()` loader over `src/content/leistungen/*.md` and
swap the static route for `[...slug].astro`. Component props do not change.

## Editing copy

Every string flows from `src/data/`, so a copy change is a data edit, never a hunt
through components.

- **`src/data/content.json`** — the original design copy. Treated as the baseline draft
  with the best provenance, not as fixed text.
- **`CONTENT-REVIEW.md`** — every string written for this build (three services, Über
  uns, all page titles, the legal pages), listed next to its file, for client sign-off.
- `src/data/services.ts` · `seo.ts` · `ueber-uns.ts` · `nav.ts` — the rest.

The schema in `src/data/schema.ts` validates `content.json` at build time, so a dropped
or renamed field fails the build with a readable error instead of rendering `undefined`.

## The design rules are build gates

`CLAUDE.md` is binding. Two of its rules are enforced mechanically rather than by
review:

- `npm run lint:styles` rejects any hex colour, `rgb()` literal or numeric
  `border-radius` inside a component style block. Colour and radius live in tokens.
- `npm run lint:tokens` diffs `src/styles/tokens.css` against `design/tokens.json`.
  Deliberate differences are listed with their reason in `scripts/check-tokens.mjs`.

The test suite covers the rest: no breakpoints in the built CSS, no third-party
requests, no placeholder contact details in structured data, zero axe violations, and a
visible focus ring on every interactive element.

## Contact form

Frontend-only today: it validates, shows German field errors, and confirms with the
success message from `content.json`. It sends nothing.

To wire up Resend:

1. `npx astro add vercel` and keep `output: 'static'`.
2. Add `src/pages/api/kontakt.ts` with `export const prerender = false`, re-parsing with
   the same `src/lib/contact-schema.ts` server-side.
3. Set `PUBLIC_FORM_ENDPOINT="/api/kontakt"`.

Nothing else changes; every other page stays static.

## Deployment

Push to GitHub; Vercel builds it with zero configuration (`vercel.json` only adds
security headers and cache control, which does not disturb framework detection). Pull
requests get preview deployments. Environment variables are in `.env.example`.

## Before launch

`PUBLIC_SITE_INDEXABLE` stays `false` — every page `noindex`, `robots.txt` disallowing
everything — until all of these are true:

1. **Real phone number and e-mail** in `src/data/company.ts`, with `verified: true`.
   Until then they render visibly but are not linked and never reach structured data:
   publishing a placeholder NAP is worse than publishing none, because the entity gets
   cross-referenced against every other citation of the business.
2. **Impressum and Datenschutzerklärung reviewed** by a lawyer or the client's
   Steuerberater, and every `TODO(client)` filled in.
3. **The contact form actually sends**, or is hidden. A public page that says
   *"wir melden uns innerhalb von zwei Werktagen"* while dropping the enquiry costs a
   customer who would otherwise have phoned.
4. **The six outstanding photographs** — `PHOTOS.md`. The hero photo's stock licence
   needs confirming too.
5. **The domain confirmed** and set as `PUBLIC_SITE_URL`.

Then flip the flag and submit the sitemap in Search Console.
