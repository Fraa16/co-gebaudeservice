import type { ImageMetadata } from 'astro';
import heroFensterreinigung from '../assets/photos/hero-fensterreinigung.jpg';
import treppenhausreinigung from '../assets/photos/treppenhausreinigung.png';
import fensterreinigung from '../assets/photos/fensterreinigung.png';
import hausmeisterdienst from '../assets/photos/hausmeisterdienst.png';
import gartenpflege from '../assets/photos/gartenpflege.png';
import winterdienst from '../assets/photos/winterdienst.png';
import kellerreinigung from '../assets/photos/kellerreinigung.png';
import aussenreinigung from '../assets/photos/aussenreinigung.png';
import muelltonnendienst from '../assets/photos/muelltonnendienst.png';

/** Slot → photograph. A null slot renders a branded BrandPanel instead, so an
 *  outstanding shot drops in here with no component change. Six slots are shown on
 *  the site today (r-hero, r-l1, r-l2, r-l4, r-l5, r-detail); r-l3 and r-l6 to r-l8
 *  hold their service's photo but no page renders them yet. Briefs, measured frame
 *  sizes and the reason every shot should be landscape are in PHOTOS.md.
 *
 *  The eight service photos arrived as one set in September 2026, 1672 × 941 each,
 *  one per service. The alt text describes what is in the frame, not the service and
 *  not who the person is: the site says nowhere that the business has staff, and an
 *  alt text is not the place to start. */
export interface PhotoEntry {
  image: ImageMetadata | null;
  /** German alt text. Only meaningful when `image` is set — a BrandPanel is presentational. */
  alt: string;
  tone: 'ice' | 'pale' | 'blue';
}

export const photos: Record<string, PhotoEntry> = {
  // Recovered at 1200×900 from design/website-rounded.pdf.
  // TODO(client): confirm the stock licence covers web use.
  'r-hero': {
    image: heroFensterreinigung,
    alt: 'Glasfassade wird mit Sprühflasche und Mikrofasertuch gereinigt',
    tone: 'ice',
  },
  'r-l1': {
    image: treppenhausreinigung,
    alt: 'Mann in dunkelblauer Arbeitskleidung wischt die Stufen eines hellen Treppenhauses',
    tone: 'blue',
  },
  'r-l2': {
    image: fensterreinigung,
    alt: 'Fensterscheibe wird mit dem Abzieher gereinigt, im Vordergrund ein Rücken mit dem CO-Logo',
    tone: 'blue',
  },
  'r-l3': {
    image: hausmeisterdienst,
    alt: 'Hausmeister mit Reinigungswagen im Eingangsbereich eines Gebäudes',
    tone: 'blue',
  },
  'r-l4': {
    image: gartenpflege,
    alt: 'Hecke vor einem Wohngebäude wird mit der Heckenschere geschnitten',
    tone: 'blue',
  },
  'r-l5': {
    image: winterdienst,
    alt: 'Mann mit Schneeschaufel in einer verschneiten Wohnstraße',
    tone: 'blue',
  },
  'r-l6': {
    image: kellerreinigung,
    alt: 'Kellerboden wird mit dem Wasserschieber abgezogen',
    tone: 'blue',
  },
  'r-l7': {
    image: aussenreinigung,
    alt: 'Sockel einer Hauswand wird mit dem Hochdruckreiniger gereinigt',
    tone: 'blue',
  },
  'r-l8': {
    image: muelltonnendienst,
    alt: 'Mülltonne wird über eine gepflasterte Einfahrt gezogen',
    tone: 'blue',
  },
  /* Still open. This is the Treppenhausreinigung chapter on the home page, directly
     below the service grid whose feature tile is r-l1 — the Treppenhaus photo again
     here would stand twice in two adjacent sections. It needs a second, different
     stairwell shot; until then the BrandPanel stands in, which reads as intended. */
  'r-detail': { image: null, alt: 'Treppenhaus nach der Reinigung', tone: 'pale' },
};

export function getPhoto(slot: string): PhotoEntry {
  return photos[slot] ?? { image: null, alt: '', tone: 'pale' };
}
