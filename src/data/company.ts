import { content } from './content';

/** Business identity, with per-field verification.
 *
 *  Publishing a placeholder phone number as structured data is worse than publishing
 *  none: Google builds an entity from it and cross-references every other citation of
 *  the business, and NAP consistency is the strongest local-pack factor. So each field
 *  carries whether it is real, and only verified fields reach JSON-LD, tel: and mailto:.
 *  See src/lib/jsonld.ts. */
export const company = {
  name: 'CO Gebäudeservice',
  legalName: 'CO Gebäudeservice',
  owner: 'Oguz Cakir',
  ownerRole: 'Inhaber',

  area: content.company.area,
  areaLong: content.company.areaLong,
  /** Where the work actually happens: the towns, then the district they sit in.
   *  This is the single source for the Einsatzgebiet chips on /ueber-uns, the FAQ
   *  answer, and areaServed in the structured-data graph — the towns used to exist
   *  only as a hard-coded array inside ueber-uns.astro, so the graph claimed two
   *  places while the page named six.
   *  TODO(client): confirm the towns — draft, see CONTENT-REVIEW.md §3. */
  areaServed: [
    'Nagold',
    'Altensteig',
    'Wildberg',
    'Haiterbach',
    'Rohrdorf',
    'Ebhausen',
    'Kreis Calw',
  ],

  address: {
    verified: true,
    street: 'Schietinger Str. 28',
    postalCode: '72202',
    locality: 'Nagold',
    region: 'Baden-Württemberg',
    country: 'DE',
    /** One-line display form, in the design's separator style. */
    display: 'Schietinger Str. 28 · 72202 Nagold',
  },

  phone: {
    verified: true, // confirmed by the client, 14 Sep 2026
    display: content.company.phone,
    /** E.164, for tel: and JSON-LD. Only emitted once verified. */
    e164: '+491723001489',
  },

  /** The same mobile, reachable on WhatsApp — the channel most private customers in
   *  this trade actually use. wa.me wants the E.164 digits with no plus and no
   *  leading zero. Gated like every other contact route: nothing renders while
   *  `verified` is false. */
  whatsapp: {
    verified: true,
    waMe: '491723001489',
  },

  email: {
    /* Confirmed by the client, 14 Sep 2026. The mailbox has to exist on the domain
       before launch — this flag puts the address into mailto: links and the structured
       data graph, and an address that bounces is worse there than none. */
    verified: true,
    display: content.company.email,
  },

  /** Opening hours. "Wann hat ... offen" is one of the most common voice queries and
   *  the graph cannot answer it today. Gated like every other contact detail, for the
   *  same reason: a wrong opening time sends somebody to a locked door, which is worse
   *  than no answer at all.
   *  TODO(client): Erreichbarkeit angeben — z. B. Mo–Fr 07:00–17:00. Bereitschaft für
   *  den Winterdienst ggf. gesondert. */
  hours: {
    verified: false,
    spec: [] as readonly { days: readonly string[]; opens: string; closes: string }[],
  },

  /** Coordinates of the business address, for local and map surfaces. Gated because a
   *  guessed coordinate puts the business on the wrong street, and a town-centre
   *  approximation is a guess.
   *  TODO(client): exakte Koordinaten der Anschrift (z. B. aus Google Maps ablesen). */
  geo: {
    verified: false,
    latitude: 0,
    longitude: 0,
  },

  /** Schema.org priceRange, e.g. "€€". Gated: it is a claim about pricing.
   *  TODO(client): freigeben, falls gewünscht. */
  priceRange: {
    verified: false,
    value: '',
  },

  legal: {
    rechtsform: 'Einzelunternehmen',
    /** TODO(client): USt-IdNr. oder, falls keine vorliegt, die Steuernummer. */
    ustId: '',
    steuernummer: '',
    /** No Handwerkskammer entry, per the client. */
    kammer: null,
  },
} as const;

/** The contact routes as the design orders them, with the label and ordering from the
 *  design copy but every *value* taken from `company` above.
 *
 *  content.json carries a second copy of the phone and e-mail strings under
 *  `contact.rows`, and both renderers used to read the value from there while taking
 *  the link from `company`. The moment the client supplied a real number the Kontakt
 *  page displayed the old placeholder and linked the new number — a page disagreeing
 *  with itself about the NAP, which is the precise failure the per-field gating exists
 *  to prevent. The values never come from the copy file again. */
export const contactRoutes: readonly {
  label: string;
  value: string;
  href?: string;
}[] = content.contact.rows.map((row) => {
  switch (row.label) {
    case 'Telefon':
      return {
        label: row.label,
        value: company.phone.display,
        href: company.phone.verified ? `tel:${company.phone.e164}` : undefined,
      };
    case 'E-Mail':
      return {
        label: row.label,
        value: company.email.display,
        href: company.email.verified ? `mailto:${company.email.display}` : undefined,
      };
    case 'Anschrift':
      return { label: row.label, value: company.address.display };
    default:
      return { label: row.label, value: row.value };
  }
});

export type Company = typeof company;
