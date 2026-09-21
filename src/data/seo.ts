/** Every title and meta description on the site, in one place.
 *  All of it is new copy — content.json has no <title> field — so all of it is draft
 *  pending client review. See CONTENT-REVIEW.md.
 *
 *  Written for local search. The business sells to Hausverwaltungen and
 *  Eigentümergemeinschaften inside one Landkreis, so the place name earns its space in
 *  almost every title: nobody searches "Gebäudereinigung" without a town attached.
 *  Titles carry the town, descriptions carry the town plus the service nouns someone
 *  would actually type.
 *
 *  Budget: tests/smoke.spec.ts requires 15 < title.length < 75 *including* the 20-char
 *  SUFFIX below, and 70 < description.length < 200. `npm run lint:seo` checks both. */

export interface PageSeo {
  title: string;
  description: string;
}

const SUFFIX = ' | CO Gebäudeservice';

export const pageSeo = {
  home: {
    title: 'Gebäudereinigung und Hausmeisterservice in Nagold',
    description:
      'Treppenhausreinigung, Fensterreinigung, Hausmeisterdienst, Gartenpflege und Winterdienst für Wohn- und Gewerbeobjekte in Nagold und im Kreis Calw. Fester Turnus, ein Ansprechpartner.',
  },
  leistungen: {
    title: 'Reinigung und Hausmeisterservice in Nagold',
    description:
      'Acht Leistungen für Hausverwaltungen und Eigentümergemeinschaften in Nagold und im Kreis Calw: von der Treppenhausreinigung über den Hausmeisterdienst bis zum Winterdienst.',
  },
  ueberUns: {
    /* Was the bare word "Über uns" — 28 of the 75 characters, and no place name on the
       one page whose whole subject is where the work happens. */
    title: 'Über uns: Gebäudeservice aus Nagold',
    description:
      'CO Gebäudeservice betreut Wohn- und Gewerbeobjekte in Nagold, Altensteig, Wildberg, Haiterbach und im Gäu bis Herrenberg. Inhabergeführt, mit fester Objektbetreuung und einem Ansprechpartner.',
  },
  kontakt: {
    title: 'Angebot anfordern: Gebäudeservice Nagold',
    description:
      'Objektbesichtigung in Nagold oder im Kreis Calw vereinbaren und ein Angebot zum Festpreis erhalten. Wir melden uns innerhalb von zwei Werktagen mit einem Terminvorschlag.',
  },
  impressum: {
    title: 'Impressum',
    description:
      'Anbieterkennzeichnung nach § 5 DDG für CO Gebäudeservice, Oguz Cakir, Schietinger Str. 28 in 72202 Nagold. Kontaktdaten und rechtliche Hinweise.',
  },
  datenschutz: {
    title: 'Datenschutzerklärung',
    description:
      'Informationen zur Verarbeitung personenbezogener Daten nach Art. 13 DSGVO auf der Website von CO Gebäudeservice in Nagold.',
  },
  notFound: {
    title: 'Seite nicht gefunden',
    description:
      'Die aufgerufene Seite existiert nicht. Zurück zur Startseite von CO Gebäudeservice, Gebäudereinigung und Hausmeisterservice in Nagold.',
  },
} as const satisfies Record<string, PageSeo>;

export const withSuffix = (title: string) =>
  title.endsWith(SUFFIX) ? title : `${title}${SUFFIX}`;

/** The exact budget tests/smoke.spec.ts enforces, exported so a lint script can check
 *  every entry at build time instead of only the seven routes the suite visits. */
export const SEO_LIMITS = {
  suffixLength: SUFFIX.length,
  title: { min: 16, max: 74 },
  description: { min: 71, max: 199 },
} as const;
