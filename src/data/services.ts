import { designServices, detail } from './content';

export type IconName =
  | 'treppe' | 'fenster' | 'hausmeister' | 'garten'
  | 'winter' | 'keller' | 'aussen' | 'tonne';

export interface Service {
  slug: string;
  chip: string;
  title: string;
  text: string;
  /** The one paragraph that explains the service. Eight services sharing 210 words of
   *  one-liners was the site's real content problem: for a search like
   *  "Gartenpflege Nagold" a chip plus four bullets is an index entry, not a page. */
  detail: string;
  /** Bullet list shown on /leistungen. */
  scope: string[];
  turnus: string;
  icon: IconName;
  photoSlot: string;
  /** Deep page, if one exists. None do: the site is four pages, and the
   *  Treppenhaus chapter lives on the homepage. Kept because ServiceGrid still
   *  accepts it, so a future page needs no component change. */
  href?: string;
  /** Copy not yet approved by the client — see CONTENT-REVIEW.md. */
  draft: boolean;
  source: 'content.json' | 'draft';
}

const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Per-service detail that content.json has no field for. Scope lists are draft copy
 *  except Treppenhausreinigung's, which comes from content.json detail.infoCard.items. */
const EXTRA: Record<string, Pick<Service, 'detail' | 'scope' | 'turnus' | 'icon'>> = {
  Treppenhausreinigung: {
    detail:
      'Die Unterhaltsreinigung im Treppenhaus entscheidet, wie ein Objekt wahrgenommen wird, und sie ist der häufigste Anlass für Beschwerden. Gereinigt werden Treppen, Podeste und Flure feucht, dazu Handläufe, Geländer, Lichtschalter und der Eingangsbereich mit Fußmatten. Arbeiten wie Treppenhausfenster, Lampen und Sockelleisten fallen ein- bis zweimal im Jahr an und stehen mit im Leistungsverzeichnis.',
    scope: detail.infoCard.items, // verbatim
    turnus: detail.infoCard.facts[0]?.value ?? '',
    icon: 'treppe',
  },
  Fensterreinigung: {
    detail:
      'Glasflächen an Treppenhausfenstern, Eingangstüren und Fassaden im Erdgeschoss. Zum Turnus gehören immer Rahmen, Falze und Fensterbänke: Glas allein sieht nach kurzer Zeit wieder schmutzig aus, wenn der Schmutz im Rahmen bleibt. Zweimal im Jahr ist der übliche Rhythmus. An Eingangstüren und stark genutzten Durchgängen ist ein kürzeres Intervall sinnvoll.',
    scope: [
      'Glasflächen innen und außen',
      'Rahmen, Falze und Fensterbänke',
      'Rollladenkästen und Jalousien',
      'Treppenhausfenster und Lichtschächte',
    ],
    turnus: 'Zweimal im Jahr oder nach Vereinbarung',
    icon: 'fenster',
  },
  Hausmeisterdienst: {
    detail:
      'Der Hausmeisterdienst hält das Objekt zwischen den Reinigungsterminen im Blick. Dazu gehören Kontrollgänge durch Keller, Technikräume und Außenbereich, Kleinreparaturen wie der Lampenwechsel, das Stellen und Zurückführen der Tonnen sowie Ablesungen und die Begleitung von Handwerkern. Was auffällt, wird gemeldet, bevor daraus ein Schaden wird.',
    scope: [
      'Regelmäßige Kontrollgänge im Objekt',
      'Kleinreparaturen und Lampenwechsel',
      'Müllmanagement und Tonnenwechsel',
      'Ablesungen und Handwerkerbegleitung',
    ],
    turnus: 'Fester Objektbetreuer, Turnus nach Objektgröße',
    icon: 'hausmeister',
  },
  Gartenpflege: {
    detail:
      'Grünpflege an Wohnanlagen von März bis November: Rasen mähen, Hecken und Sträucher schneiden, Beete von Unkraut freihalten, im Herbst Laub räumen. Der Grünschnitt wird abgefahren und entsorgt. Der Turnus richtet sich nach Fläche und Jahreszeit, im Mai wird häufiger gemäht als im September.',
    scope: [
      'Rasen mähen, vertikutieren und düngen',
      'Hecken und Sträucher schneiden',
      'Beete pflegen und Unkraut entfernen',
      'Laubbeseitigung und Grünschnittentsorgung',
    ],
    turnus: 'März bis November, im vereinbarten Intervall',
    icon: 'garten',
  },
  Winterdienst: {
    detail:
      'Räumen und Streuen auf Gehwegen, Zufahrten und Eingängen. Wann geräumt werden muss, regelt die Satzung der jeweiligen Gemeinde, und sie unterscheidet sich von Ort zu Ort. Die Saison läuft von November bis März, mit Bereitschaft an Werk- und Feiertagen. Jeder Einsatz wird mit Datum und Uhrzeit dokumentiert, damit die Verwaltung einen Nachweis hat.',
    scope: [
      'Räumen und Streuen nach Gemeindesatzung',
      'Gehwege, Zufahrten und Eingänge',
      'Bereitschaft an Werk- und Feiertagen',
      'Dokumentation jedes Einsatzes',
    ],
    turnus: 'Saison November bis März, mit Bereitschaft',
    icon: 'winter',
  },
};

/** The five from content.json — chip, title and text stay verbatim. */
const verbatim: Service[] = designServices.map((s) => {
  const extra = EXTRA[s.title];
  if (!extra) throw new Error(`No scope defined for service "${s.title}"`);
  return {
    slug: slugify(s.title),
    chip: s.chip,
    title: s.title,
    text: s.text,
    ...extra,
    photoSlot: s.slot,
    draft: false,
    source: 'content.json',
  };
});

if (verbatim.length !== 5) {
  throw new Error('content.json services drifted from 5 — update src/data/services.ts.');
}

/** The three the client named that the design never covered. All copy is draft. */
const drafted: Service[] = [
  {
    slug: 'kellerreinigung',
    chip: 'Nach Bedarf',
    title: 'Kellerreinigung',
    detail:
      'Kellergänge, Vorräume, Waschküche und Trockenraum werden gekehrt und feucht gewischt, dazu Lichtschalter, Geländer und Türen. In vielen Objekten reicht ein größerer Durchgang zweimal im Jahr. Wo Fahrräder, Kinderwagen und Lagerflächen für Betrieb sorgen, ist ein festes Intervall sinnvoll.',
    text: 'Kellergänge, Abstellbereiche und Trockenräume kehren und feucht wischen.',
    scope: [
      'Kellergänge und Vorräume kehren',
      'Böden feucht wischen',
      'Waschküche und Trockenraum',
      'Lichtschalter, Geländer und Türen',
    ],
    turnus: 'Nach Bedarf oder im festen Intervall',
    icon: 'keller',
    photoSlot: 'r-l6',
    draft: true,
    source: 'draft',
  },
  {
    slug: 'aussenreinigung',
    chip: 'Nach Turnus',
    title: 'Außenreinigung',
    detail:
      'Gehwege, Zuwegungen, Hofflächen und Stellplätze kehren, Laub und Unkraut aus den Fugen entfernen, Außentreppen und Eingangsbereiche mitnehmen. Die Außenflächen sind das, was ein Besucher zuerst sieht, und im Herbst der Bereich mit dem größten Aufwand. Üblich ist wöchentlich oder 14-tägig, im Herbst dichter.',
    text: 'Gehwege, Hofflächen und Stellplätze kehren, Laub und Unkraut entfernen.',
    scope: [
      'Gehwege und Zuwegungen kehren',
      'Hofflächen und Stellplätze',
      'Laub und Unkraut entfernen',
      'Außentreppen und Eingangsbereiche',
    ],
    turnus: 'Wöchentlich oder 14-tägig',
    icon: 'aussen',
    photoSlot: 'r-l7',
    draft: true,
    source: 'draft',
  },
  {
    slug: 'muelltonnendienst',
    chip: 'Zum Abfuhrtermin',
    title: 'Mülltonnendienst',
    detail:
      'Tonnen zum Abfuhrtermin herausstellen und danach zurückführen, den Müllstandsplatz kehren und die Tonnen bei Bedarf reinigen. Der Turnus folgt dem Abfuhrkalender der Gemeinde. Für Objekte ohne Hausmeister vor Ort ist das die Leistung, die im Alltag am häufigsten fehlt.',
    text: 'Tonnen herausstellen und zurückführen, Müllstandsplatz sauber halten.',
    scope: [
      'Tonnen zum Abfuhrtermin herausstellen',
      'Tonnen zurückführen',
      'Müllstandsplatz kehren',
      'Tonnen bei Bedarf reinigen',
    ],
    turnus: 'Zum Abfuhrkalender der Gemeinde',
    icon: 'tonne',
    photoSlot: 'r-l8',
    draft: true,
    source: 'draft',
  },
];

export const allServices: Service[] = [...verbatim, ...drafted];

/** The home page shows only approved services. */
export const homeServices: Service[] = verbatim;
