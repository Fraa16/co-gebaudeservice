# CO Gebäudeservice — Website

Marketing site for a building-services company in Nagold (Kreis Calw, Germany).
All user-facing copy is **German, formal Sie**.

## Read first

- `README.md` — the full design spec: every section, measurement, color, hover state and copy string. Authoritative.
- `tokens.json` / `tokens.css` — the design tokens, machine-readable. Use these instead of re-deriving values from the HTML.
- `content.json` — all copy and structured content (services, process steps, form fields), verbatim.
- `screenshots/` — rendered reference of the design and the CI sheet.
- `CO Website Rounded.dc.html` — the design prototype. Open in a browser to see it live.

## What this is

The `.dc.html` files are **design references, not production code.** They are single-file
prototypes with inline styles and an editor-specific runtime (`support.js`, `image-slot.js`,
`doc-page.js`). Do not port those helpers, do not copy the inline-style approach, and do not
ship the tweak layer (`rundung` / `grundflaeche` / `schriftband`).

Your job: **recreate the design in a real stack.** If the repo already has a framework and a
styling approach, follow it. If this is a greenfield project, a static-first stack suits a
small marketing site (Astro, Next.js static export, or plain HTML + CSS); the design needs
almost no client JS — a chip toggle and a form submit.

## The identity in one paragraph

Everything is a large, heavily-rounded card floating on a light neutral ground (`#E7EDF3`),
separated by one consistent small gutter. Radii: 32px for section cards, 26px for smaller
cards, 999px for every interactive element (nav links, buttons, chips, labels). No shadows —
flat fills with 1px `#DCE6EF` borders. Deep navy `#03045E` and blue `#0077B6` carry the
weight, cyan `#00B4D8` is the accent, pale `#CAF0F8` is the light ground. Archivo for
headings with tight negative tracking, Source Sans 3 for everything else. Fully fluid: no
media queries, no max-width container — `auto-fit` grids and `clamp()` do the work.

## Rules

1. **Radii are the identity.** Use the token tiers. Never mix in a stray 8px or 4px radius.
2. **No shadows, no gradients** except the two photo overlays defined in `tokens.css`.
3. **Full-opacity type only.** Body copy is `#4C6B85` on light, `#CAF0F8`/`#FFFFFF` on dark,
   `#0B4A6F` on the pale hero ground. Never alpha-fade text to make it "softer".
4. **Copy is verbatim.** Take strings from `content.json`. No rewriting, no added marketing
   language, no exclamation marks, no emoji.
5. **Flex/grid with `gap`** for every group of siblings — never margin-spaced inline elements.
6. **Keep `text-wrap: pretty`** on headings and paragraphs.
7. **Form inputs stay at 16px** font-size (prevents iOS zoom-on-focus).
8. Visible `:focus-visible` ring on every interactive element (the prototype sets
   `outline: none` — that is a prototype shortcut, not the design).

## Known placeholders

- **Photography**: seven images, all empty in the prototype. See the Assets table in
  `README.md` for placement, subject and orientation. Use `object-fit: cover`, German `alt`
  text, `loading="lazy"` everywhere except the hero.
- **Contact details**: address, phone and email are dummy values.
- **Logo**: drawn in markup (rounded square + SVG swoosh + "CO" in Archivo 700). No file yet —
  produce a proper SVG and favicon set.

## Before launch

Impressum + Datenschutzerklärung pages (legally required in Germany) · real form endpoint with
GDPR-compliant consent and server-side validation · the seven photographs · self-hosted fonts
(Google's CDN is a German privacy-law problem) · SVG logo and favicons · page title, meta
description, OG image and `LocalBusiness` structured data with `areaServed` = Nagold / Kreis Calw.
