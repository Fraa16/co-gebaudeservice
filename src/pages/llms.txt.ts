import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { company, contactRoutes } from '../data/company';
import { content } from '../data/content';
import { allServices } from '../data/services';
import { llms, pageSeo } from '../data/seo';
import { faq } from '../data/faq';

/** /llms.txt: the site in one Markdown file, in the format proposed at llmstxt.org, for
 *  assistants that answer "wer macht Treppenhausreinigung in Nagold" from a fetched
 *  page rather than from a search index.
 *
 *  Built from the same data as the pages, never written by hand: a second copy of the
 *  phone number is how the Kontakt page once showed the placeholder while linking the
 *  real one. Contact lines come from contactRoutes and follow the same per-field gates
 *  as tel:, mailto: and the structured data, and with the launch gate shut the file
 *  says no more than robots.txt. tests/seo.spec.ts checks that it names every service
 *  and every FAQ question, and that each link in it resolves. */

const url = (path: string) => new URL(path, site.url).href;

const PATHS = { home: '/', leistungen: '/leistungen', ueberUns: '/ueber-uns', kontakt: '/kontakt' } as const;

/** A route without a link is unverified, except the address, which has its own flag. */
const shown = (route: (typeof contactRoutes)[number]) =>
  route.label === 'Anschrift' ? company.address.verified : Boolean(route.href);

const contact = [
  `- ${llms.owner}: ${company.owner}`,
  ...contactRoutes
    .filter(shown)
    .map((r) => `- ${r.label}: ${r.value}${r.note ? ` (${r.note})` : ''}`),
  company.whatsapp.verified && `- ${llms.whatsapp}: https://wa.me/${company.whatsapp.waMe}`,
  `- ${llms.form}: ${url('/kontakt')}`,
].filter(Boolean);

const body = () => `# ${company.name}

> ${content.footer.blurb}

${llms.intro}

## ${llms.headings.contact}

${contact.join('\n')}

## ${llms.headings.area}

${company.areaServed.join(', ')}

## ${llms.headings.services}

${allServices
  .map((s) => `- [${s.title}](${url(`/leistungen#${s.slug}`)}): ${s.text} ${llms.turnus}: ${s.turnus}.`)
  .join('\n')}

## ${llms.headings.pages}

${(Object.keys(PATHS) as (keyof typeof PATHS)[])
  .map((k) => `- [${llms.pages[k]}](${url(PATHS[k])}): ${pageSeo[k].description}`)
  .join('\n')}

## ${llms.headings.faq}

${faq.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}
`;

export const GET: APIRoute = () =>
  new Response(site.indexable ? body() : `# ${company.name}\n\n${llms.closed}\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
