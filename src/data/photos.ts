import type { ImageMetadata } from 'astro';
import heroFensterreinigung from '../assets/photos/hero-fensterreinigung.jpg';

/** Slot → photograph. A null slot renders a branded BrandPanel instead, so the six
 *  outstanding shots drop in here with no component change. Briefs in PHOTOS.md. */
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
    alt: 'Mitarbeiter reinigt eine Glasfassade mit Sprühflasche und Mikrofasertuch',
    tone: 'ice',
  },
  'r-l1': { image: null, alt: 'Gereinigtes Treppenhaus', tone: 'blue' },
  'r-l2': { image: null, alt: 'Gereinigte Fensterfront', tone: 'blue' },
  'r-l3': { image: null, alt: 'Hausmeister bei einem Kontrollgang', tone: 'blue' },
  'r-l4': { image: null, alt: 'Gepflegte Außenanlage', tone: 'blue' },
  'r-l5': { image: null, alt: 'Geräumter Gehweg im Winter', tone: 'blue' },
  'r-l6': { image: null, alt: 'Gereinigter Kellergang', tone: 'blue' },
  'r-l7': { image: null, alt: 'Gekehrter Gehweg vor einem Wohnobjekt', tone: 'blue' },
  'r-l8': { image: null, alt: 'Müllstandsplatz mit Tonnen', tone: 'blue' },
  'r-detail': { image: null, alt: 'Treppenhaus nach der Reinigung', tone: 'pale' },
};

export function getPhoto(slot: string): PhotoEntry {
  return photos[slot] ?? { image: null, alt: '', tone: 'pale' };
}
