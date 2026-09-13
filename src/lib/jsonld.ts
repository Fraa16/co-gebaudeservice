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
function organization(): Thing {
  const hasAddress = company.address.verified;

  const node: Thing = {
    '@type': hasAddress ? ['Organization', 'LocalBusiness'] : 'Organization',
    '@id': ORG_ID,
    name: company.name,
    url: site.url,
    logo: { '@type': 'ImageObject', url: abs('/logo.svg') },
    image: abs('/og/default.png'),
    areaServed: company.areaServed.map((name) => ({
      '@type': 'AdministrativeArea',
      name,
    })),
    knowsLanguage: 'de',
  };

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
  extra?: Thing[];
}

export function buildGraph({
  path,
  title,
  description,
  pageType = 'WebPage',
  breadcrumbs,
  extra = [],
}: GraphOptions): Thing {
  const url = abs(path);

  const graph: Thing[] = [
    website(),
    organization(),
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

/** A Service node for a service that has its own page. */
export function serviceNode(name: string, path: string, description: string): Thing {
  return {
    '@type': 'Service',
    '@id': `${abs(path)}#service`,
    name,
    description,
    serviceType: name,
    provider: { '@id': ORG_ID },
    areaServed: company.areaServed.map((n) => ({ '@type': 'AdministrativeArea', name: n })),
  };
}
