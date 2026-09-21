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
 * All draft — see CONTENT-REVIEW.md. The rendered text and the structured data are
 * generated from this one list, so Google can never be shown an answer the page does
 * not display.
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
    q: 'Was kostet die Treppenhausreinigung?',
    a: 'Wir kalkulieren einen Festpreis pro Monat. Grundlage ist eine Objektbesichtigung: ohne sie gibt es weder ein Angebot noch einen Vertrag. In die Kalkulation gehen die Flächen, die Zahl der Wohneinheiten und der gewünschte Turnus ein.',
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
    q: 'Arbeiten Sie mit eigenem Personal?',
    a: 'Ja. Jedes Objekt hat einen festen Objektbetreuer, dazu eine Vertretungsregelung bei Urlaub und Krankheit. Für die Verwaltung gibt es eine Ansprechperson, kein Callcenter.',
  },
  {
    q: 'Für welche Objekte arbeiten Sie?',
    a: 'Für Hausverwaltungen, Eigentümergemeinschaften und Gewerbeobjekte, von der Wohnanlage bis zur einzelnen Gewerbeeinheit.',
  },
] as const;

/** Sits at the foot of the heading column. An FAQ that answers seven questions should
 *  say what to do with the eighth — and the column would otherwise run out half a metre
 *  above the list beside it. */
export const faqFooter = {
  text: 'Ihre Frage ist nicht dabei?',
  link: { label: 'Fragen Sie uns direkt', href: '/kontakt' },
} as const;
