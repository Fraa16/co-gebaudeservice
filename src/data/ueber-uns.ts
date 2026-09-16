import { detail } from './content';

/** The Über-uns page has no design and no copy in content.json.
 *  One paragraph is reused verbatim; the rest is draft. See CONTENT-REVIEW.md. */

export const ueberUns = {
  pill: 'Über uns',
  h1: 'Eigenes Personal, feste Objektbetreuer in Nagold.', // draft
  lead: 'CO Gebäudeservice betreut Wohn- und Gewerbeobjekte in Nagold und im Kreis Calw.', // draft

  paragraphs: [
    // verbatim — content.json detail.paragraphs[2] reads as an about-us paragraph
    { text: detail.paragraphs[2]!, draft: false },
    {
      text: 'Inhaber ist Oguz Cakir. Anfragen, Angebote und die Abstimmung mit der Verwaltung laufen über eine Ansprechperson, nicht über ein Callcenter. Für jedes Objekt halten wir schriftlich fest, was in welchem Intervall geleistet wird, und hängen den Plan im Haus aus.',
      draft: true,
    },
    {
      text: 'Wir arbeiten im Umkreis von Nagold — unter anderem in Altensteig, Wildberg, Haiterbach, Rohrdorf und Ebhausen. Kurze Wege bedeuten, dass wir auch bei Winterdienst und kurzfristigen Einsätzen zuverlässig vor Ort sind.',
      draft: true,
    },
  ],

  /** Design-sourced: the stat strip from design/prototypes/website-prototyp.dc.html.
   *  The first value was 5 there and is 8 here, since the service list grew. */
  stats: [
    { value: '8', label: 'Leistungsbereiche' },
    { value: 'Fester Turnus', label: 'Nach Reinigungsplan' },
    { value: 'Kreis Calw', label: 'Einsatzgebiet' },
    { value: 'Winterdienst', label: 'Mit Bereitschaft' },
  ],

  photoBand: ['r-l1', 'r-l2', 'r-l4', 'r-l5'],
} as const;
