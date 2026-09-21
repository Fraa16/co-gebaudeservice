/** Deployment-level switches. */

const env = import.meta.env;

export const site = {
  url: env.PUBLIC_SITE_URL ?? 'https://co-gebaeudeservice.de',
  locale: 'de-DE',
  lang: 'de',

  /** The launch gate. Stays false until: real phone + email, legal sign-off, and a live
   *  form endpoint. While false every page is noindex and robots.txt disallows all. */
  indexable: env.PUBLIC_SITE_INDEXABLE === 'true',

  /** Preview-only banners marking copy that has not been approved.
   *
   *  Opt-in, like `indexable` above, and for the same reason: the default has to be the
   *  safe one. This read `!== 'false'`, so any deploy that simply did not set the
   *  variable showed "Entwurf" chips to whoever opened the link, including the client.
   *  A missing banner during an internal read is a small loss; a visible one in front
   *  of a customer is not. Set PUBLIC_SHOW_DRAFT_NOTES="true" to get them back. */
  showDraftNotes: env.PUBLIC_SHOW_DRAFT_NOTES === 'true',

  /** Empty = the contact form resolves locally without sending. Set to '/api/kontakt'
   *  when the Resend endpoint lands; nothing else changes. */
  formEndpoint: env.PUBLIC_FORM_ENDPOINT ?? '',
} as const;
