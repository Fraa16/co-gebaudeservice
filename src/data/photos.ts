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
 *  outstanding shot drops in here with no component change. Every slot is shown:
 *  r-hero on the home page, the eight service photos in the home tiles (the first
 *  five), in each row on /leistungen and in the /ueber-uns band, and r-detail in the
 *  home page's Treppenhaus chapter. Briefs, measured frame sizes and the reason every
 *  shot should be landscape with its subject centred are in PHOTOS.md.
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
  // Recovered at 1200×900 from design/website-rounded.pdf. Licence for web use
  // confirmed by the client, September 2026.
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
  /* Still open; the client is supplying a separate shot. This is the
     Treppenhausreinigung chapter on the home page, directly below the service grid
     whose feature tile is r-l1 — the Treppenhaus photo again here would stand twice in
     two adjacent sections. Until the second stairwell shot arrives the BrandPanel
     stands in, which reads as intended. */
  'r-detail': { image: null, alt: 'Treppenhaus nach der Reinigung', tone: 'pale' },
};

export function getPhoto(slot: string): PhotoEntry {
  return photos[slot] ?? { image: null, alt: '', tone: 'pale' };
}
