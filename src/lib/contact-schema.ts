import { z } from 'zod';

/** Shared by the client-side validation and, later, the server endpoint — so the two
 *  can never disagree about what a valid enquiry is. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Bitte geben Sie Ihren Namen an.'),
  company: z.string().trim().optional(),
  email: z.email('Bitte geben Sie eine gültige E-Mail-Adresse an.').trim(),
  phone: z.string().trim().optional(),
  services: z.array(z.string()).default([]),
  message: z.string().trim().min(10, 'Bitte beschreiben Sie das Objekt kurz.'),
  consent: z.literal(true, {
    message: 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.',
  }),
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
