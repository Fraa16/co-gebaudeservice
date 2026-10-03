import type { ImageMetadata } from 'astro';
import treppenhausreinigung from '../assets/photos/treppenhausreinigung.png';
import fensterreinigung from '../assets/photos/fensterreinigung.png';
import hausmeisterdienst from '../assets/photos/hausmeisterdienst.png';
import gartenpflege from '../assets/photos/gartenpflege.png';
import winterdienst from '../assets/photos/winterdienst.png';
import kellerreinigung from '../assets/photos/kellerreinigung.png';
import aussenreinigung from '../assets/photos/aussenreinigung.png';
import muelltonnendienst from '../assets/photos/muelltonnendienst.png';
import treppenhausreinigungDetail from '../assets/photos/treppenhausreinigung-detail.png';

/** Slot → photograph. A null slot renders a branded BrandPanel instead, so an
 *  outstanding shot drops in here with no component change. All ten are filled since
 *  October 2026. Every slot is shown:
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
  /** Where the crop centres, as an object-position. Omitted means the middle, which
   *  suits every photo framed with its subject centred. Set it for a photo whose
   *  frame is much flatter than the shot, so the crop keeps what matters. */
  focus?: string;
}

export const photos: Record<string, PhotoEntry> = {
  /* The Hausmeisterdienst photo, at the client's request (September 2026). It
     replaced the stock Glasreinigung shot recovered from the design PDF, which stays
     in src/assets/photos/hero-fensterreinigung.jpg, licensed, should it come back. The
     same file is r-l3 below; see PHOTOS.md for what that means on the home page. */
  'r-hero': {
    image: hausmeisterdienst,
    alt: 'Hausmeister mit Reinigungswagen im Eingangsbereich eines Gebäudes',
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
  /* The Treppenhausreinigung chapter on the home page, directly below the service grid
     whose feature tile is r-l1, so it needed a different shot: r-l1 again would stand
     twice in adjacent sections. The client supplied this second stairwell photo in
     October 2026 (uploaded as "Mitarbeiter-im-Treppenhaus"), same 1672 × 941 set.
     He stands tall in the frame, cap at 13% of its height, basket down to 80%. The
     chapter's frame reaches 2.2:1 on a laptop (DetailChapter.astro), where a centred
     crop keeps the middle 82% and his cap sat about 20px under the top edge; the
     focus moves the crop up to give him twice that, and the basket stays in. */
  'r-detail': {
    image: treppenhausreinigungDetail,
    alt: 'Mann in dunkelblauer Arbeitskleidung trägt einen Korb mit Reinigungsmitteln eine helle Steintreppe hinauf',
    tone: 'pale',
    focus: '50% 30%',
  },
};

export function getPhoto(slot: string): PhotoEntry {
  return photos[slot] ?? { image: null, alt: '', tone: 'pale' };
}
