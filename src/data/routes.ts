/** content.json's CTA hrefs are one-pager anchors. They resolve through this map so the
 *  labels stay verbatim while the destinations follow the real IA. An anchor that isn't
 *  mapped throws at build time rather than shipping a dead link. */

const ANCHOR_ROUTES: Record<string, string> = {
  '#hero': '/',
  '#leistungen': '/leistungen',
  '#treppenhaus': '/leistungen/treppenhausreinigung',
  '#ablauf': '/#ablauf',
  /* Every CTA using this anchor is labelled with an action — "Angebot anfordern",
     "Termin vereinbaren", "Anfrage starten" — so it lands on the enquiry form itself,
     not at the top of the contact page. The nav's plain "Kontakt" link goes to the
     page; otherwise the two would be the same destination under two names, which is
     what made the CTA read as a contradiction. */
  '#kontakt': '/kontakt#anfrage',
};

/** Sections that exist on the home page, so an in-page anchor stays in-page there. */
const HOME_ANCHORS = new Set(['#kontakt', '#ablauf', '#leistungen']);

export function resolveHref(href: string, currentPath = ''): string {
  if (!href.startsWith('#')) return href;

  const mapped = ANCHOR_ROUTES[href];
  if (!mapped) {
    throw new Error(
      `Unmapped anchor in content.json: "${href}". Add it to src/data/routes.ts.`,
    );
  }
  if (currentPath === '/' && HOME_ANCHORS.has(href)) return href;
  return mapped;
}

/** Build-time guard: every anchor the content uses must be mapped. */
export function assertAnchorsResolve(hrefs: string[]): void {
  for (const href of hrefs) resolveHref(href);
}
