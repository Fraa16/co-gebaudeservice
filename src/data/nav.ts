/** The live multi-page nav.
 *
 *  content.json's `nav` is anchor-based and belongs to the one-pager prototype; it stays
 *  there as a design record. Labels are reused verbatim where they still apply. */

export interface NavItem {
  label: string;
  href: string;
  primary?: boolean;
}

export const primaryNav: NavItem[] = [
  { label: 'Leistungen', href: '/leistungen' }, // verbatim, content.json nav[0]
  { label: 'Über uns', href: '/ueber-uns' }, // written for this build, approved 30 Sep 2026
  { label: 'Kontakt', href: '/kontakt' }, // verbatim, content.json contact.pill
  /* The page for "Kontakt", the form for "Angebot anfordern". Both pointed at
     /kontakt, so the nav offered one destination under two names and the CTA promised
     an action while delivering a page. */
  { label: 'Angebot anfordern', href: '/kontakt#anfrage', primary: true }, // verbatim, content.json nav[3]
];

/** The phone button beside the menu on a phone (SiteHeader.astro): an icon, so this is
 *  its accessible name, followed by the number. Written for this build on 6 Oct 2026,
 *  awaits sign-off in CONTENT-REVIEW.md section 16. */
export const callLabel = 'Anrufen';

export const legalNav: NavItem[] = [
  { label: 'Impressum', href: '/impressum' }, // verbatim, content.json footer.links
  { label: 'Datenschutz', href: '/datenschutz' }, // verbatim
];
