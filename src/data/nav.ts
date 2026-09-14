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
  { label: 'Über uns', href: '/ueber-uns' }, // draft — client review
  { label: 'Kontakt', href: '/kontakt' }, // verbatim, content.json contact.pill
  /* The page for "Kontakt", the form for "Angebot anfordern". Both pointed at
     /kontakt, so the nav offered one destination under two names and the CTA promised
     an action while delivering a page. */
  { label: 'Angebot anfordern', href: '/kontakt#anfrage', primary: true }, // verbatim, content.json nav[3]
];

export const legalNav: NavItem[] = [
  { label: 'Impressum', href: '/impressum' }, // verbatim, content.json footer.links
  { label: 'Datenschutz', href: '/datenschutz' }, // verbatim
];
