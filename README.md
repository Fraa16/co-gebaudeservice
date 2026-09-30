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
brand/            the delivered logo vectors — source for everything in public/
brand/visitenkarte/  the business card; druck/ holds the print-ready CMYK PDFs
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
| `/impressum` · `/datenschutz` | Drafts — see *Launched, and what is still open* |

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
- `npm run lint:copy` holds `src/data/` to the tonality rule: no parenthetical dash, no
  empty marketing phrases, no superlatives, no unverifiable claims.

The test suite covers the rest: no breakpoints in the built CSS, no third-party
requests, no placeholder contact details in structured data, zero axe violations, and a
visible focus ring on every interactive element.

## Contact form

The endpoint is built. `src/pages/api/kontakt.ts` is the only server-rendered route on
the site: it re-parses the body with the same `src/lib/contact-schema.ts` the browser
uses, re-checks the spam traps, refuses cross-origin posts, rate-limits per address, and
sends through Resend. `tests/contact-endpoint.spec.ts` covers it without a server.

It stays dormant until four environment variables are set — three of them server-side
only, so set them in the Vercel project settings, not in a committed file:

| Variable | Value |
| --- | --- |
| `PUBLIC_FORM_ENDPOINT` | `/api/kontakt` |
| `RESEND_API_KEY` | from <https://resend.com/api-keys> |
| `CONTACT_TO` | the inbox enquiries should reach |
| `CONTACT_FROM` | e.g. `Website <noreply@co-gebaeudeservice.de>` — the domain must be verified in Resend first |

With any of them missing the endpoint answers 503 and the form tells the visitor it
could not send. That is deliberate: the one thing it must never do is confirm
*"wir melden uns innerhalb von zwei Werktagen"* while dropping the enquiry.

Before switching it on, settle the two things the Datenschutzerklärung's Resend
paragraph relies on: the Art. 28 DSGVO contract with Resend, and the basis for the
transfer to the USA (Art. 44 ff. DSGVO). The paragraph itself is already on the page;
the note that said so used to be on the page too, which is how the next section's
first item came about.

Nothing else changes; every other page stays static.

## Deployment

Push to GitHub; Vercel builds it with zero configuration (`vercel.json` only adds
security headers and cache control, which does not disturb framework detection). Pull
requests get preview deployments. Environment variables are in `.env.example`.

## Launched, and what is still open

The site went live on `co-gebaeudeservice.de` in September 2026 and
`PUBLIC_SITE_INDEXABLE` now defaults to `true`: every page is `index, follow` and
`robots.txt` allows everything and names the sitemap. `tests/seo.spec.ts` asserts the
meta tag and `robots.txt` agree, because they are written in two different files from
one flag and a site that says `index` in the head while `robots.txt` says `Disallow`
is invisible in a way nobody notices for weeks.

Still open, in the order it costs something:

1. **The contact form does not send yet.** `PUBLIC_FORM_ENDPOINT` is unset, so a valid
   submit is *refused* with `contact.form.offlineNotice` and the form points at Telefon
   and WhatsApp. That refusal is deliberate: until the four variables above are set,
   the one thing the form must never do is answer *"wir melden uns innerhalb von zwei
   Werktagen"* for an enquiry nothing received. Set the endpoint plus the three
   server-side variables, verify the Resend domain, and the notice disappears on its
   own — no other change needed.
2. **Impressum and Datenschutzerklärung reviewed** by a lawyer or the client's
   Steuerberater. The Impressum's facts are settled — no USt-IdNr., no
   Handwerkskammer entry, both confirmed and recorded in `company.ts`. What the review
   still has to answer: the Resend contract and transfer basis (above), whether the
   business use of WhatsApp is described sufficiently, and whether the AI-generated
   photographs need labelling under Art. 50 KI-VO. None of these is written on the
   pages any more: **working notes belong here, not in page copy**. The Impressum went
   live reading "USt-IdNr.: TODO(client)"; `tests/smoke.spec.ts` now fails on any
   TODO, FIXME or lorem ipsum a visitor could read.
3. **Submit the sitemap in Search Console** — `https://co-gebaeudeservice.de/sitemap-index.xml`.
   Indexing does not start on its own just because `robots.txt` now allows it.
4. **One photograph** — `PHOTOS.md`. The eight service photos are in and shown on the
   home page, `/leistungen` and `/ueber-uns`, and the hero shows the Hausmeisterdienst
   photo. `r-detail` still needs a second, different stairwell shot, which the client
   is supplying. The empty slot renders a branded `BrandPanel`, so nothing looks
   broken meanwhile.
5. **The remaining `TODO(client)` fields** in `src/data/company.ts`: exact coordinates
   and, if wanted, `priceRange`. Each is gated, so the graph stays silent rather than
   guessing.

Settled:

- `info@co-gebaeudeservice.de` exists (confirmed 28 Sep 2026), so
  `company.email.verified` stays `true` and the address on the business card is live.
- Hours: Mo–Fr 8–12 (confirmed 30 Sep 2026). In the graph as
  `openingHoursSpecification`, and shown as "erreichbar Mo–Fr, 8–12 Uhr" under the
  phone number wherever it appears — `tests/seo.spec.ts` holds the two together.
- All copy in `CONTENT-REVIEW.md` approved (30 Sep 2026), including the ten towns.
- `www` redirects to the apex (confirmed 30 Sep 2026). It must stay that way round:
  the canonical URLs, the sitemap, the OG tags and the printed QR code on the business
  card all name `co-gebaeudeservice.de` without `www`.
