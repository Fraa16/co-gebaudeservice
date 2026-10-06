/** Every title and meta description on the site, in one place.
 *  All of it is new copy — content.json has no <title> field — and all of it was
 *  approved by the client on 30 Sep 2026 (CONTENT-REVIEW.md).
 *
 *  Written for local search. The business sells to Hausverwaltungen and
 *  Eigentümergemeinschaften inside one Landkreis, so the place name earns its space in
 *  almost every title: nobody searches "Gebäudereinigung" without a town attached.
 *  Titles carry the town, descriptions carry the town plus the service nouns someone
 *  would actually type.
 *
 *  Budget: tests/smoke.spec.ts requires 15 < title.length < 75 *including* the 20-char
 *  SUFFIX below, and 70 < description.length < 161. `npm run lint:seo` checks both.
 *  The description ceiling was 199 until the audit of 5 Oct 2026: Google cuts a snippet
 *  at roughly 155 to 160 characters, so the four indexable pages lost their last
 *  sentence in every result. They were rewritten to 155 or fewer, and the ceiling
 *  came down so they stay there. */

export interface PageSeo {
  title: string;
  description: string;
}

const SUFFIX = ' | CO Gebäudeservice';

export const pageSeo = {
  home: {
    title: 'Gebäudereinigung und Hausmeisterservice in Nagold',
    description:
      'Gebäudereinigung, Hausmeisterservice, Gartenpflege und Winterdienst für Wohn- und Gewerbeobjekte in Nagold und im Kreis Calw. Festpreis nach Besichtigung.',
  },
  leistungen: {
    title: 'Reinigung und Hausmeisterservice in Nagold',
    description:
      'Treppenhausreinigung, Hausmeisterservice, Gartenpflege, Winterdienst und vier weitere Leistungen in Nagold und im Kreis Calw. Einzeln oder als Paket.',
  },
  ueberUns: {
    /* Was the bare word "Über uns" — 28 of the 75 characters, and no place name on the
       one page whose whole subject is where the work happens. */
    title: 'Über uns: Gebäudeservice aus Nagold',
    description:
      'Inhabergeführter Gebäudeservice aus Nagold für Altensteig, Wildberg, Haiterbach und das Gäu bis Herrenberg. Feste Objektbetreuung, ein Ansprechpartner.',
  },
  kontakt: {
    title: 'Angebot anfordern: Gebäudeservice Nagold',
    description:
      'Angebot für Gebäudereinigung oder Hausmeisterservice in Nagold und im Kreis Calw anfordern: Besichtigung vor Ort, Festpreis, Rückmeldung in zwei Werktagen.',
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
  description: { min: 71, max: 160 },
} as const;

/** The prose and labels of /llms.txt (src/pages/llms.txt.ts), the one file written for
 *  assistants rather than for people or search engines. Everything else in it is read
 *  from company.ts, services.ts, faq.ts and pageSeo above. Written on 6 Oct 2026, awaits
 *  sign-off in CONTENT-REVIEW.md section 16. */
export const llms = {
  intro:
    'Inhabergeführter Gebäudeservice aus Nagold für Hausverwaltungen, Eigentümergemeinschaften und Gewerbeobjekte. Jede Leistung ist einzeln beauftragbar oder als Paket im Dauerauftrag. Abgerechnet wird ein Festpreis pro Monat, kalkuliert nach einer Besichtigung vor Ort.',
  headings: {
    contact: 'Kontakt',
    area: 'Einsatzgebiet',
    services: 'Leistungen',
    pages: 'Seiten',
    faq: 'Häufige Fragen',
  },
  owner: 'Inhaber',
  whatsapp: 'WhatsApp',
  form: 'Anfrageformular',
  turnus: 'Turnus',
  pages: {
    home: 'Startseite',
    leistungen: 'Leistungen',
    ueberUns: 'Über uns',
    kontakt: 'Kontakt und Anfrage',
  },
  closed: 'Die Website ist noch nicht freigegeben.',
} as const;
