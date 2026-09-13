import raw from './content.json';
import { contentSchema } from './schema';

/** The single import of content.json. Every string on the site flows from here, so a
 *  copy change is a JSON edit rather than a hunt through components.
 *
 *  content.json is the baseline draft with the best provenance — not fixed text.
 *  New or changed copy is tracked in CONTENT-REVIEW.md for client sign-off. */
export const content = contentSchema.parse(raw);

export const {
  hero,
  marquee,
  services: designServices,
  servicesCta,
  detail,
  process: processContent,
  contact,
  footer,
  tone,
} = content;
