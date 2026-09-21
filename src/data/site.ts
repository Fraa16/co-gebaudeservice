/** Deployment-level switches. */

const env = import.meta.env;

export const site = {
  url: env.PUBLIC_SITE_URL ?? 'https://co-gebaeudeservice.de',
  locale: 'de-DE',
  lang: 'de',

  /** The launch gate, open since the domain went live in September 2026. The default is
   *  "index"; set PUBLIC_SITE_INDEXABLE="false" to shut it again, which puts every page
   *  back to noindex and robots.txt back to Disallow.
   *
   *  It read `=== 'true'` while the site was unreleased, because the unsafe default
   *  then was to be indexed by accident. Now the unsafe default is the opposite: a live
   *  site that silently de-indexes itself because one deploy lost a variable drops out
   *  of search with nothing on the page to show that it happened.
   *
   *  Preview deploys stay out of the index through the canonical tag rather than this
   *  switch: every page names site.url as canonical, so a preview host serves pages
   *  that point at the production origin. Set the variable to "false" on a preview
   *  environment if a hard block is wanted. */
  indexable: (env.PUBLIC_SITE_INDEXABLE ?? 'true') === 'true',

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
