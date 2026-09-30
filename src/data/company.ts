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
   *  The ten towns were approved by the client on 30 Sep 2026 with the rest of
   *  CONTENT-REVIEW.md (§3, §12). */
  areaServed: [
    // Kernring um Nagold, Landkreis Calw
    'Nagold',
    'Ebhausen',
    'Rohrdorf',
    'Haiterbach',
    'Egenhausen',
    'Wildberg',
    'Altensteig',
    // Gäu, Landkreis Böblingen — näher als der halbe eigene Landkreis
    'Mötzingen',
    'Jettingen',
    'Herrenberg',
    // Der Landkreis selbst. Böblingen steht bewusst nicht dabei: dort werden drei
    // Gemeinden bedient, nicht der ganze Kreis.
    'Kreis Calw',
  ],

  /** The district, by name. Anything that wants "Kreis Calw" reads this rather than
   *  picking an entry out of areaServed, which is an ordered list of towns that has
   *  already grown once. */
  district: 'Kreis Calw',

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
    /* Address confirmed by the client on 14 Sep 2026, and the mailbox confirmed to
       exist on the domain on 28 Sep 2026. This flag puts the address into mailto:
       links and the structured data graph, where one that bounced would be worse than
       none — it is also printed on the business card. */
    verified: true,
    display: content.company.email,
  },

  /** When the business can be reached: Mo–Fr 8–12, confirmed by the client on
   *  30 Sep 2026. "Wann hat ... offen" is one of the most common voice queries, and
   *  this is what answers it in the graph.
   *
   *  The client called them Öffnungszeiten; the site says "erreichbar", under the phone
   *  number. There is no shop to walk into, and a line reading "Öffnungszeiten" beside
   *  a street address invites exactly that. It is still openingHoursSpecification in
   *  the graph, because that is the property the question is asked of.
   *
   *  `display` is shown wherever the phone number is, because Google expects structured
   *  data to describe what the page shows — hours only in the graph would be a claim
   *  the page does not make. tests/seo.spec.ts holds the two together. */
  hours: {
    verified: true,
    display: 'erreichbar Mo–Fr, 8–12 Uhr',
    spec: [
      {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '12:00',
      },
    ] as readonly { days: readonly string[]; opens: string; closes: string }[],
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

  /** What src/pages/impressum.md states, and why two sections are absent from it.
   *  Both confirmed by the client on 28 Sep 2026: there is no USt-IdNr. and no
   *  Handwerkskammer entry. § 5 DDG asks for either only where it exists, so the
   *  Impressum names neither — it used to carry a "## Umsatzsteuer" section reading
   *  "TODO(client)", live, and a line suggesting the Steuernummer as a fallback, which
   *  does not belong in an Impressum at all. If a USt-IdNr. is issued, it goes into
   *  the Impressum under that heading and here. */
  legal: {
    rechtsform: 'Einzelunternehmen',
    ustId: null,
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
  /** A second, quieter line under the value. The phone carries the hours: they are
   *  when that number is answered, and a fourth route of their own would have made the
   *  Kontakt page's facts row four columns wide, too narrow for the e-mail address. */
  note?: string;
}[] = content.contact.rows.map((row) => {
  switch (row.label) {
    case 'Telefon':
      return {
        label: row.label,
        value: company.phone.display,
        href: company.phone.verified ? `tel:${company.phone.e164}` : undefined,
        note: company.hours.verified ? company.hours.display : undefined,
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
