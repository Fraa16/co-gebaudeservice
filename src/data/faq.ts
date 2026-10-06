import { company } from './company';

/**
 * Häufige Fragen, shown on /leistungen and emitted as FAQPage structured data.
 *
 * Every answer restates something the site already says: Einsatzgebiet, Turnus,
 * Festpreis nach Besichtigung, Rückmeldung in zwei Werktagen, Winterdienst nach
 * Gemeindesatzung, eigenes Personal, Leistungen einzeln beauftragbar. Nothing here
 * invents a fact about the business:
 * no contract length, no price, no guarantee, no insurance claim. If an answer cannot
 * be traced to copy that already exists, it does not belong here until the client
 * confirms it.
 *
 * Two answers added in October 2026 go beyond the site's own copy, and on purpose only
 * as far as the general legal position: what § 2 BetrKV counts as umlagefähig, and
 * that Gemeinden in Baden-Württemberg pass the Räum- und Streupflicht to the Anlieger
 * by Satzung. Neither says anything about this business's invoices or its liability,
 * and neither names a time of day, since those differ from Satzung to Satzung.
 *
 * The first eight were approved by the client on 30 Sep 2026; the four added after the
 * search audit of 5 Oct 2026 (Kehrwoche, Hausmeisterservice, Umlage, Streupflicht)
 * await sign-off in CONTENT-REVIEW.md section 16. The rendered text and the structured
 * data are generated from this one list, so Google can never be shown an answer the
 * page does not display.
 */

export interface FaqEntry {
  q: string;
  a: string;
}

const orte = company.areaServed.filter((a) => !a.startsWith('Kreis')).join(', ');

export const faq: readonly FaqEntry[] = [
  {
    q: 'In welchen Orten arbeiten Sie?',
    a: `In ${orte} sowie im übrigen Kreis Calw und im angrenzenden Gäu. Kurze Wege sind der Grund, warum wir beim Winterdienst und bei kurzfristigen Einsätzen schnell vor Ort sind.`,
  },
  {
    q: 'In welchem Turnus wird gereinigt?',
    a: 'Üblich sind wöchentlich oder 14-tägig. Den Turnus halten wir vorab im Leistungsverzeichnis fest, der Reinigungsplan hängt im Objekt aus. So können Mieter und Verwaltung nachvollziehen, was geleistet wurde.',
  },
  {
    q: 'Können Sie die Kehrwoche übernehmen?',
    a: 'Ja. Was in der Kehrwoche reihum anfällt, übernehmen wir im festen Turnus: die kleine Kehrwoche mit Treppen, Podesten und Fluren über die Treppenhausreinigung, die große Kehrwoche mit Gehweg, Hof und Keller über Außenreinigung und Kellerreinigung, die Tonnen über den Mülltonnendienst. Die Mieter müssen sich dann nicht mehr abwechseln.',
  },
  {
    q: 'Was kostet die Treppenhausreinigung?',
    a: 'Wir kalkulieren einen Festpreis pro Monat. Grundlage ist eine Objektbesichtigung: ohne sie gibt es weder ein Angebot noch einen Vertrag. In die Kalkulation gehen die Flächen, die Zahl der Wohneinheiten und der gewünschte Turnus ein.',
  },
  {
    q: 'Was kostet ein Hausmeisterservice?',
    a: 'Auch den Hausmeisterservice bieten wir zum Festpreis pro Monat an, kalkuliert nach der Besichtigung. Der Aufwand hängt davon ab, was im Leistungsverzeichnis steht: wie oft Kontrollgänge anfallen, ob Tonnen, Außenanlagen und Winterdienst dazugehören und wie groß das Objekt ist. Die Besichtigung dauert etwa eine halbe Stunde, das Angebot folgt danach.',
  },
  {
    q: 'Können die Kosten auf die Mieter umgelegt werden?',
    a: 'In der Regel ja, sofern der Mietvertrag es vorsieht. Die Betriebskostenverordnung (§\u00a02 BetrKV) zählt Gebäudereinigung, Gartenpflege, Straßenreinigung und Müllbeseitigung sowie den Hauswart zu den umlagefähigen Betriebskosten. Beim Hauswart sind Reparaturen, Instandhaltung und Verwaltungsaufgaben ausgenommen. Im Leistungsverzeichnis steht jede Leistung einzeln mit Umfang und Turnus.',
  },
  {
    q: 'Wie schnell bekomme ich ein Angebot?',
    a: 'Wir melden uns innerhalb von zwei Werktagen mit einem Terminvorschlag für die Besichtigung. Das Angebot mit Leistungsverzeichnis und Festpreis folgt nach dem Termin.',
  },
  {
    q: 'Kann ich einzelne Leistungen beauftragen?',
    a: 'Ja. Jede der acht Leistungen ist einzeln beauftragbar oder als Paket im Dauerauftrag. Was in welchem Intervall geleistet wird, steht im Leistungsverzeichnis.',
  },
  {
    q: 'Übernehmen Sie auch den Winterdienst?',
    a: 'Ja, in der Saison von November bis März, mit Bereitschaft an Werk- und Feiertagen. Geräumt und gestreut wird nach der Satzung der jeweiligen Gemeinde. Jeder Einsatz wird dokumentiert, die Dokumentation dient der Verwaltung als Nachweis.',
  },
  {
    q: 'Wer muss im Winter räumen und streuen?',
    a: 'In Baden-Württemberg übertragen die Gemeinden die Räum- und Streupflicht auf Gehwegen in aller Regel per Satzung auf die Anlieger, das sind meist die Eigentümer. Zu welchen Zeiten und in welcher Breite geräumt werden muss, steht in der Satzung der jeweiligen Gemeinde. Die Arbeit selbst können Eigentümer oder Verwaltung an einen Winterdienst vergeben. Wir räumen nach dieser Satzung und dokumentieren jeden Einsatz.',
  },
  {
    q: 'Wer kommt in mein Objekt?',
    a: 'Jedes Objekt wird fest zugeordnet, es arbeitet dort dieselbe Person. Das ist so gewollt: Wer ein Haus kennt, sieht früher, was zusätzlich ansteht, und wird von Mietern auch angesprochen. Für die Verwaltung gibt es einen Ansprechpartner, kein Callcenter.',
  },
  {
    q: 'Für welche Objekte arbeiten Sie?',
    a: 'Für Hausverwaltungen, Eigentümergemeinschaften und Gewerbeobjekte, von der Wohnanlage bis zur einzelnen Gewerbeeinheit.',
  },
] as const;

/** Sits under the heading and rides along beside the list (Faq.astro). An FAQ that
 *  answers a dozen questions should say what to do with the thirteenth, wherever in the
 *  list the reader has got to. */
export const faqFooter = {
  text: 'Ihre Frage ist nicht dabei?',
  link: { label: 'Fragen Sie uns direkt', href: '/kontakt' },
} as const;
