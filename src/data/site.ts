/** Deployment-level switches. */

const env = import.meta.env;

export const site = {
  url: env.PUBLIC_SITE_URL ?? 'https://www.co-gebaeudeservice.de',
  locale: 'de-DE',
  lang: 'de',

  /** The launch gate. Stays false until: real phone + email, legal sign-off, and a live
   *  form endpoint. While false every page is noindex and robots.txt disallows all. */
  indexable: env.PUBLIC_SITE_INDEXABLE === 'true',

  /** Preview-only banners marking copy that has not been approved. */
  showDraftNotes: env.PUBLIC_SHOW_DRAFT_NOTES !== 'false',

  /** Empty = the contact form resolves locally without sending. Set to '/api/kontakt'
   *  when the Resend endpoint lands; nothing else changes. */
  formEndpoint: env.PUBLIC_FORM_ENDPOINT ?? '',
} as const;
