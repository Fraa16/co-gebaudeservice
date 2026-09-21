/** The Über-uns page has no design and no copy in content.json. All of it is draft.
 *  See CONTENT-REVIEW.md.
 *
 *  Rewritten on 21 Sep 2026 once the client confirmed the shape of the business: new,
 *  no customers yet, no completed projects, one person. The previous copy claimed
 *  "eigenes Personal", "feste Objektbetreuer" in the plural and a "Vertretungsregelung
 *  bei Urlaub und Krankheit". None of that was true, and it had been carried over from
 *  the design draft rather than invented here, which is exactly how an untrue claim
 *  survives a copy review.
 *
 *  The replacement does not hide the size, because the size is the argument: a
 *  Hausverwaltung dealing with a sole trader knows who walks into the building. What it
 *  does not do is claim a track record. Everything below is either a fact from
 *  company.ts or a commitment about method that can be checked on the first visit.
 *
 *  Still missing, and the one fact worth asking for: what happens during holiday or
 *  illness. It is the first thing a Hausverwaltung asks a sole trader, and there is no
 *  honest answer to write until the client has one. */

export const ueberUns = {
  pill: 'Über uns',
  h1: 'Ein fester Ansprechpartner für Objekte in Nagold.',
  lead: 'CO Gebäudeservice ist das Einzelunternehmen von Oguz Cakir. Reinigung, Hausmeisterdienst und Außenanlagen für Wohn- und Gewerbeobjekte in Nagold und im Kreis Calw.',

  paragraphs: [
    {
      text: 'Wer den Auftrag vergibt, spricht mit der Person, die auch im Haus arbeitet. CO Gebäudeservice ist ein Einzelunternehmen, und Oguz Cakir übernimmt die Objekte selbst. Eine Rückfrage zum Treppenhaus geht damit nicht durch eine Zentrale, und im Objekt steht nicht jede Woche jemand anderes.',
      draft: true,
    },
    {
      text: 'Die Zahl der betreuten Objekte ist bewusst begrenzt. Jedes Objekt bekommt einen festen Wochentag und einen Turnus, der vorab schriftlich steht. Für die Verwaltung ist damit planbar, wann gearbeitet wird, und für die Mieter nachvollziehbar, was geleistet wurde.',
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
