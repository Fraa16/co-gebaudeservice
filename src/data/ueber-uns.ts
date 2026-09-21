/** The Über-uns page has no design and no copy in content.json. All of it is draft.
 *  See CONTENT-REVIEW.md.
 *
 *  Rewritten on 21 Sep 2026, in two passes, and the second pass is the instructive one.
 *
 *  The first pass fixed a truth problem: with one person, "eigenes Personal", "feste
 *  Objektbetreuer" in the plural and a "Vertretungsregelung bei Urlaub und Krankheit"
 *  were simply false. They had been carried over from the design draft rather than
 *  invented here, which is exactly how an untrue claim survives a copy review.
 *
 *  But the replacement over-corrected into "Einzelunternehmen" and "Oguz Cakir
 *  übernimmt die Objekte selbst", which is accurate and reads as a disclosure. Company
 *  size is not what a Hausverwaltung is buying, and naming it invites the question
 *  rather than answering one. The legal form belongs in the Impressum, which is where
 *  it now lives and nowhere else.
 *
 *  So the page talks about what the customer actually receives: one contact from the
 *  survey through to the running work, and the same person in the building. Both are
 *  true at any headcount, both are checkable on the first visit, and neither claims a
 *  track record the business does not have.
 *
 *  Still missing, and the one fact worth asking for: what happens during holiday or
 *  illness. It is the first thing a Hausverwaltung asks, and there is no honest answer
 *  to write until the client has one. */

export const ueberUns = {
  pill: 'Über uns',
  h1: 'Ein fester Ansprechpartner für Objekte in Nagold.',
  lead: 'Inhabergeführter Gebäudeservice aus Nagold. Reinigung, Hausmeisterdienst und Außenanlagen für Wohn- und Gewerbeobjekte in Nagold und im Kreis Calw.',

  paragraphs: [
    {
      text: 'Jedes Objekt wird fest betreut, und die Betreuung wechselt nicht. Wer den Auftrag vergibt, hat denselben Ansprechpartner bei der Besichtigung, beim Turnusplan und bei einer Rückfrage zum Treppenhaus. Im Objekt arbeitet dieselbe Person, Woche für Woche.',
      draft: true,
    },
    {
      text: 'Jedes Objekt bekommt einen festen Wochentag und einen Turnus, der vorab schriftlich steht. Wir nehmen nur so viele Objekte an, wie sich in diesem Rhythmus zuverlässig bedienen lassen. Für die Verwaltung ist damit planbar, wann gearbeitet wird, und für die Mieter nachvollziehbar, was geleistet wurde.',
      draft: true,
    },
    {
      text: 'Vor jedem Vertrag steht eine Objektbesichtigung. Dabei werden Flächen, Zugänge, Müllstandsplatz und Besonderheiten aufgenommen. Daraus entsteht das Leistungsverzeichnis mit Umfang, Turnus und Festpreis pro Monat, und daraus der Reinigungsplan, der anschließend im Objekt aushängt. Beim Winterdienst wird jeder Einsatz mit Datum und Uhrzeit dokumentiert.',
      draft: true,
    },
    {
      text: 'Wir arbeiten im Umkreis von Nagold, unter anderem in Altensteig, Wildberg, Haiterbach, Rohrdorf und Ebhausen, dazu im Gäu rund um Mötzingen, Jettingen und Herrenberg. Kurze Wege heißen: beim Winterdienst und bei kurzfristigen Einsätzen sind wir schnell vor Ort.',
      draft: true,
    },
  ],

  /** Design-sourced: the stat strip from design/prototypes/website-prototyp.dc.html.
   *  The first value was 5 there and is 8 here, since the service list grew. Nothing in
   *  this strip claims a track record, so none of it had to change with the rewrite. */
  stats: [
    { value: '8', label: 'Leistungsbereiche' },
    { value: 'Fester Turnus', label: 'Nach Reinigungsplan' },
    { value: 'Kreis Calw', label: 'Einsatzgebiet' },
    { value: 'Winterdienst', label: 'Mit Bereitschaft' },
  ],

  photoBand: ['r-l1', 'r-l2', 'r-l4', 'r-l5'],
} as const;
