import { company } from './company';

/**
 * Page-level copy that had been written directly into markup.
 *
 * CLAUDE.md rule 4 says copy flows from data, and these strings were the exceptions:
 * the /leistungen h1 and lead, the Über-uns statement and place list, the Kontakt
 * enquiry heading, and three CtaBand headings all lived in .astro files where no copy
 * pass could reach them. The place list mattered most — six town names, the richest
 * regional signal on the site, invisible to both the data layer and structured data.
 *
 * This is a .ts module rather than a content.json key because content.json is the
 * *design's* copy; none of this was in the design. Same reasoning as ueber-uns.ts and
 * services.ts. Everything here is draft — see CONTENT-REVIEW.md.
 *
 * Heading constraint worth knowing before editing: tests/responsive.spec.ts requires
 * every heading to be wider than its longest word at 380px. At the display clamp's
 * floor that is roughly 312px of box against ~19px per character, so a heading word
 * beyond about 16 characters overflows. "Hausmeisterdienst" (17) does not fit an h1 —
 * it lives in the title tag and the service list instead.
 */

export const pages = {
  home: {
    /** The design's line. It stays here and only here — it used to be repeated verbatim
     *  as the h1 of /leistungen, so two pages competed for the same phrase. */
    servicesHeading: 'Alles rund ums Objekt, aus einer Hand.',
  },

  leistungen: {
    pill: 'Leistungen',
    /** Was "Alles rund ums Objekt, aus einer Hand." — a duplicate of the homepage h2,
     *  and like every other h1 on the site it named no place. */
    h1: 'Acht Leistungen für Objekte in Nagold und im Kreis Calw.',
    lead: 'Einzeln beauftragbar oder als Paket im Dauerauftrag. Turnus, Umfang und Erreichbarkeit halten wir vorab im Leistungsverzeichnis fest.',
    meta: [
      { label: 'Einsatzgebiet', value: company.areaLong },
      { label: 'Abrechnung', value: 'Festpreis pro Monat' },
    ],
    cta: {
      /** Was "Mehrere Objekte oder ein Sonderfall?", which is also the mosaic card on
       *  the homepage. */
      heading: 'Mehrere Objekte im Kreis Calw?',
      text: 'Wir sehen uns das Objekt an und kalkulieren einen Turnus zum Festpreis.',
    },
  },

  ueberUns: {
    statementKicker: 'Arbeitsweise',
    statement: 'Im Haus arbeitet immer dieselbe Person.',
    factsKicker: 'In Zahlen',
    areaKicker: 'Einsatzgebiet',
    areaTitle: 'Kurze Wege, auch beim Winterdienst.',
    /** The Einsatzgebiet chips. Derived from company.areaServed so the page, the FAQ
     *  answer and the structured data can never disagree about where the work happens;
     *  the district itself is not a chip. */
    orte: company.areaServed.filter((a) => !a.startsWith('Kreis')),
    cta: {
      /** Was a fourth copy of "Objekt ansehen, Angebot erhalten." */
      heading: 'Wir sehen uns Ihr Objekt an.',
      text: 'Kein Vertrag ohne Objektbesichtigung. Wir melden uns innerhalb von zwei Werktagen.',
    },
  },

  kontakt: {
    /** The page's own h1. It used to reuse content.json's contact.h2, which is also the
     *  ContactSection heading on / and on the Treppenhaus page — so the contact page's
     *  h1 was a phrase two other pages already carried, and named no place. */
    h1: 'Angebot für Ihr Objekt in Nagold.',
    enquiryKicker: 'Anfrage',
    enquiryHeading: 'Sagen Sie uns kurz, um welches Objekt es geht.',
    facts: {
      rueckmeldung: { label: 'Rückmeldung', value: 'Innerhalb von zwei Werktagen' },
      turnusLabel: 'Turnus',
      gebietLabel: 'Einsatzgebiet',
    },
  },
} as const;
