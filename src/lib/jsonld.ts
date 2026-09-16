import { company } from '../data/company';
import { site } from '../data/site';

type Thing = Record<string, unknown>;

const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;

const abs = (path: string) => new URL(path, site.url).href.replace(/\/$/, '') || site.url;

/** Organization, upgraded to LocalBusiness once there is a verified postal address.
 *
 *  Placeholder NAP is never emitted: an entity built from a fake phone number gets
 *  cross-referenced against every other citation of the business, and inconsistent NAP
 *  is the fastest way to damage local ranking. Each field is gated on its own flag. */
function organization(offerCatalogId?: string): Thing {
  const hasAddress = company.address.verified;

  const node: Thing = {
    '@type': hasAddress ? ['Organization', 'LocalBusiness'] : 'Organization',
    '@id': ORG_ID,
    name: company.name,
    url: site.url,
    logo: { '@type': 'ImageObject', url: abs('/logo.svg') },
    image: abs('/og/default.png'),
    /* A Landkreis is an AdministrativeArea; the towns inside it are Cities. Emitting
       everything as AdministrativeArea would have been wrong the moment the town list
       arrived. */
    areaServed: company.areaServed.map((name) => ({
      '@type': name.startsWith('Kreis') || name.startsWith('Landkreis') ? 'AdministrativeArea' : 'City',
      name,
    })),
    knowsLanguage: 'de',
  };

  /* Only on the page that actually emits the catalog — referencing an @id that is not
     in this page's graph would leave a dangling reference, which tests/seo.spec.ts
     rejects. */
  if (offerCatalogId) node.hasOfferCatalog = { '@id': offerCatalogId };

  if (hasAddress) {
    node.address = {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.locality,
      addressRegion: company.address.region,
      addressCountry: company.address.country,
    };
    node.founder = { '@type': 'Person', name: company.owner };
  }

  if (company.phone.verified && company.phone.e164) node.telephone = company.phone.e164;
  if (company.email.verified) node.email = company.email.display;

  /* Three more local signals, each gated on its own flag for the same reason as the
     NAP: a wrong opening time or a coordinate on the wrong street is worse than a
     missing one. They appear the moment the client confirms them. */
  if (company.hours.verified && company.hours.spec.length) {
    node.openingHoursSpecification = company.hours.spec.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    }));
  }
  if (company.geo.verified) {
    node.geo = {
      '@type': 'GeoCoordinates',
      latitude: company.geo.latitude,
      longitude: company.geo.longitude,
    };
  }
  if (company.priceRange.verified && company.priceRange.value) {
    node.priceRange = company.priceRange.value;
  }

  return node;
}

function website(): Thing {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: company.name,
    url: site.url,
    inLanguage: site.locale,
    publisher: { '@id': ORG_ID },
  };
}

export interface GraphOptions {
  path: string;
  title: string;
  description: string;
  pageType?: 'WebPage' | 'ContactPage' | 'AboutPage' | 'CollectionPage';
  breadcrumbs?: { name: string; path: string }[];
  /** Links Organization to an OfferCatalog emitted in `extra` on this same page. */
  offerCatalogId?: string;
  extra?: Thing[];
}

export function buildGraph({
  path,
  title,
  description,
  pageType = 'WebPage',
  breadcrumbs,
  offerCatalogId,
  extra = [],
}: GraphOptions): Thing {
  const url = abs(path);

  const graph: Thing[] = [
    website(),
    organization(offerCatalogId),
    {
      '@type': pageType,
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { '@id': SITE_ID },
      about: { '@id': ORG_ID },
      inLanguage: site.locale,
    },
  ];

  if (breadcrumbs?.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: abs(b.path),
      })),
    });
  }

  graph.push(...extra);

  return { '@context': 'https://schema.org', '@graph': graph };
}

const areaServedNodes = () =>
  company.areaServed.map((name) => ({
    '@type': name.startsWith('Kreis') || name.startsWith('Landkreis') ? 'AdministrativeArea' : 'City',
    name,
  }));

/** Stable across pages: /leistungen and a service's own page describe the same thing,
 *  so they must not invent two identifiers for it. */
const serviceId = (slug: string) => `${site.url}/#service-${slug}`;

/** A Service node. `url` is set only when the service has a page of its own. */
export function serviceNode(opts: {
  slug: string;
  name: string;
  description: string;
  url?: string;
}): Thing {
  const node: Thing = {
    '@type': 'Service',
    '@id': serviceId(opts.slug),
    name: opts.name,
    description: opts.description,
    serviceType: opts.name,
    provider: { '@id': ORG_ID },
    areaServed: areaServedNodes(),
  };
  if (opts.url) node.url = abs(opts.url);
  return node;
}

/**
 * The whole catalogue: an OfferCatalog plus one Service node per entry.
 *
 * Seven of the eight services have no page of their own, so without this they were
 * invisible to structured data — the graph advertised one service on a site that sells
 * eight. Returns the catalog id alongside the nodes so the caller can pass it to
 * buildGraph and have Organization point at it.
 */
export function serviceCatalog(
  path: string,
  services: readonly { slug: string; title: string; text: string; href?: string }[],
): { id: string; nodes: Thing[] } {
  const id = `${abs(path)}#catalog`;
  const nodes = services.map((s) =>
    serviceNode({ slug: s.slug, name: s.title, description: s.text, url: s.href }),
  );

  return {
    id,
    nodes: [
      {
        '@type': 'OfferCatalog',
        '@id': id,
        name: `Leistungen von ${company.name}`,
        itemListElement: services.map((s, i) => ({
          '@type': 'Offer',
          position: i + 1,
          itemOffered: { '@id': serviceId(s.slug) },
        })),
      },
      ...nodes,
    ],
  };
}

/** FAQPage. Built from the same list the page renders, so the markup can never
 *  advertise an answer the reader cannot see. */
export function faqNode(path: string, entries: readonly { q: string; a: string }[]): Thing {
  return {
    '@type': 'FAQPage',
    '@id': `${abs(path)}#faq`,
    mainEntity: entries.map((e) => ({
      '@type': 'Question',
      name: e.q,
      acceptedAnswer: { '@type': 'Answer', text: e.a },
    })),
  };
}

/**
 * HowTo for the four-step process, built from the same steps the page renders.
 *
 * Worth being straight about what this does and does not buy: Google retired HowTo
 * rich results from search in 2023, so this produces no visual rich result there. It
 * is still valid, machine-readable process data — which is what AI engines synthesise
 * from, and what a voice assistant can read back for "wie läuft das ab". That is the
 * reason it is here, not a rich snippet.
 */
export function howToNode(
  path: string,
  opts: {
    name: string;
    description: string;
    steps: readonly { num: string; title: string; text: string }[];
  },
): Thing {
  const url = abs(path);
  return {
    '@type': 'HowTo',
    '@id': `${url}#howto`,
    name: opts.name,
    description: opts.description,
    inLanguage: site.locale,
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.text,
      url: `${url}#ablauf`,
    })),
  };
}
