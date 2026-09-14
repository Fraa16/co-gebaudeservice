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

  area: content.company.area,
  areaLong: content.company.areaLong,
  areaServed: ['Nagold', 'Kreis Calw'],

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
    verified: false, // TODO(client): real address
    display: content.company.email,
  },

  /** TODO(client): Rechtsform, USt-IdNr. oder Steuernummer, Handwerkskammer-Eintrag. */
  legal: {
    rechtsform: '',
    ustId: '',
    steuernummer: '',
    kammer: '',
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
