import * as z from 'zod/mini';

/** Shared by the client-side validation and, later, the server endpoint — so the two
 *  can never disagree about what a valid enquiry is.
 *
 *  zod/mini rather than zod: this is the only JavaScript the site ships, and full zod
 *  was 82 kB raw / 23.6 kB gzipped for four field checks. The mini API is 19.5 kB /
 *  6.8 kB and keeps the schema shared. The server endpoint can import either. */
export const contactSchema = z.object({
  name: z.string().check(z.trim(), z.minLength(2, 'Bitte geben Sie Ihren Namen an.')),
  company: z.optional(z.string()),
  email: z.email('Bitte geben Sie eine gültige E-Mail-Adresse an.'),
  phone: z.optional(z.string()),
  services: z._default(z.array(z.string()), []),
  message: z.string().check(z.trim(), z.minLength(10, 'Bitte beschreiben Sie das Objekt kurz.')),
  consent: z.literal(true, 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.'),
});

export type ContactPayload = z.infer<typeof contactSchema>;

/** Spam heuristics. Kept out of the schema so a bot submission fails silently rather
 *  than showing a validation error that tells it what to fix. */
export function looksLikeSpam(form: {
  website: string;
  renderedAt: string;
}): boolean {
  if (form.website.trim() !== '') return true;
  const rendered = Number(form.renderedAt);
  if (!Number.isFinite(rendered)) return false;
  return Date.now() - rendered < 3000;
}
