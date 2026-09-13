import { designServices, detail } from './content';

export type IconName =
  | 'treppe' | 'fenster' | 'hausmeister' | 'garten'
  | 'winter' | 'keller' | 'aussen' | 'tonne';

export interface Service {
  slug: string;
  chip: string;
  title: string;
  text: string;
  /** Bullet list shown on /leistungen. */
  scope: string[];
  turnus: string;
  icon: IconName;
  photoSlot: string;
  /** Deep page, when the service has earned one. */
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
const EXTRA: Record<string, Pick<Service, 'scope' | 'turnus' | 'icon'>> = {
  Treppenhausreinigung: {
    scope: detail.infoCard.items, // verbatim
    turnus: detail.infoCard.facts[0]?.value ?? '',
    icon: 'treppe',
  },
  Fensterreinigung: {
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
    href: s.title === 'Treppenhausreinigung' ? '/leistungen/treppenhausreinigung' : undefined,
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
