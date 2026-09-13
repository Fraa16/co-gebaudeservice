/** Every title and meta description on the site, in one place.
 *  All of it is new copy — content.json has no <title> field — so all of it is draft
 *  pending client review. See CONTENT-REVIEW.md. */

export interface PageSeo {
  title: string;
  description: string;
}

const SUFFIX = ' | CO Gebäudeservice';

export const pageSeo = {
  home: {
    title: 'Gebäudereinigung und Hausmeisterdienst in Nagold',
    description:
      'Treppenhausreinigung, Fensterreinigung, Hausmeisterdienst, Gartenpflege und Winterdienst für Objekte in Nagold und Umgebung. Fester Turnus, fester Ansprechpartner.',
  },
  leistungen: {
    title: 'Leistungen — Reinigung und Objektbetreuung',
    description:
      'Acht Leistungen für Hausverwaltungen und Eigentümergemeinschaften im Kreis Calw: von der Treppenhausreinigung über den Hausmeisterdienst bis zum Winterdienst.',
  },
  treppenhausreinigung: {
    title: 'Treppenhausreinigung in Nagold',
    description:
      'Unterhaltsreinigung von Treppen, Fluren und Eingangsbereichen nach festem Reinigungsplan. Wöchentlich oder 14-tägig, mit eigenem Personal und festem Objektbetreuer.',
  },
  ueberUns: {
    title: 'Über uns',
    description:
      'CO Gebäudeservice betreut Wohn- und Gewerbeobjekte in Nagold und im Kreis Calw — mit eigenem Personal, festen Objektbetreuern und schriftlich vereinbartem Turnus.',
  },
  kontakt: {
    title: 'Kontakt und Angebot anfordern',
    description:
      'Objektbesichtigung vereinbaren und ein Angebot zum Festpreis erhalten. Wir melden uns innerhalb von zwei Werktagen mit einem Terminvorschlag.',
  },
  impressum: {
    title: 'Impressum',
    description: 'Anbieterkennzeichnung nach § 5 DDG für CO Gebäudeservice, Nagold.',
  },
  datenschutz: {
    title: 'Datenschutzerklärung',
    description:
      'Informationen zur Verarbeitung personenbezogener Daten nach Art. 13 DSGVO auf der Website von CO Gebäudeservice.',
  },
  notFound: {
    title: 'Seite nicht gefunden',
    description: 'Die aufgerufene Seite existiert nicht.',
  },
} as const satisfies Record<string, PageSeo>;

export const withSuffix = (title: string) =>
  title.endsWith(SUFFIX) ? title : `${title}${SUFFIX}`;
