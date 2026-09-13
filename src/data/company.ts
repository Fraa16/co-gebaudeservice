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
    verified: false, // TODO(client): real number
    display: content.company.phone,
    /** E.164, for tel: and JSON-LD. Only emitted once verified. */
    e164: '',
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

export type Company = typeof company;
