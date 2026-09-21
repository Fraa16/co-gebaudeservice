import { z } from 'zod';

/** Shapes for content.json. Validated at build — a dropped or renamed field fails
 *  `astro build` with a readable error instead of rendering `undefined`. */

const link = z.object({ label: z.string(), href: z.string() });

const photo = z.object({
  slot: z.string(),
  subject: z.string(),
  orientation: z.string(),
});

export const contentSchema = z.object({
  company: z.object({
    name: z.string(),
    logoLabel: z.string(),
    area: z.string(),
    areaLong: z.string(),
    address: z.string(),
    phone: z.string(),
    email: z.string(),
  }),
  nav: z.array(link.extend({ primary: z.boolean().optional() })),
  hero: z.object({
    locationPill: z.string(),
    h1: z.string(),
    sub: z.string(),
    primaryCta: link,
    secondaryCta: link,
    photo,
  }),
  marquee: z.string(),
  services: z.array(
    z.object({
      slot: z.string(),
      chip: z.string(),
      title: z.string(),
      text: z.string(),
      photo: z.string(),
    }),
  ),
  servicesCta: z.object({
    pill: z.string(),
    title: z.string(),
    text: z.string(),
    cta: link,
  }),
  detail: z.object({
    pill: z.string(),
    h2: z.string(),
    paragraphs: z.array(z.string()),
    ctas: z.array(link.extend({ style: z.enum(['primary', 'quiet']) })),
    photo,
    infoCard: z.object({
      label: z.string(),
      items: z.array(z.string()),
      facts: z.array(z.object({ label: z.string(), value: z.string() })),
    }),
  }),
  process: z.object({
    pill: z.string(),
    h2: z.string(),
    lead: z.string(),
    cta: link,
    steps: z.array(z.object({ num: z.string(), title: z.string(), text: z.string() })),
  }),
  contact: z.object({
    pill: z.string(),
    h2: z.string(),
    text: z.string(),
    rows: z.array(z.object({ label: z.string(), value: z.string() })),
    form: z.object({
      fields: z.array(
        z.object({
          name: z.string(),
          label: z.string(),
          type: z.enum(['text', 'email', 'tel', 'chips-multi', 'textarea']),
          placeholder: z.string().optional(),
          options: z.array(z.string()).optional(),
          rows: z.number().optional(),
          required: z.boolean(),
        }),
      ),
      consentNote: z.string(),
      submitLabel: z.string(),
      successMessage: z.string(),
    }),
  }),
  footer: z.object({
    meta: z.string(),
    blurb: z.string(),
    links: z.array(z.string()),
  }),
  tone: z.array(z.string()),
});

export type Content = z.infer<typeof contentSchema>;
export type ContentField = Content['contact']['form']['fields'][number];
