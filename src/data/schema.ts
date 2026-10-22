// Structured data (schema.org) describing the business. Base.astro puts this on every page,
// so search engines and AI assistants always see the same name, address, phone and logo.
import { site } from './site';
import reviewData from './reviews.json';

export const origin = 'https://www.huerkamphomegroup.com';

export const business = {
  '@type': 'RealEstateAgent',
  '@id': `${origin}/#business`,
  name: site.name,
  url: `${origin}/`,
  logo: `${origin}/brand/hhg-logo.png`,
  image: `${origin}/brand/og-default.jpg`,
  telephone: '+1-612-843-9620',
  email: site.email,
  address: { '@type': 'PostalAddress', streetAddress: site.street, addressLocality: 'Burnsville', addressRegion: 'MN', postalCode: '55306', addressCountry: 'US' },
  hasMap: site.mapsUrl,
  areaServed: [
    { '@type': 'City', name: 'Minneapolis' },
    { '@type': 'City', name: 'Saint Paul' },
    { '@type': 'AdministrativeArea', name: 'Twin Cities metropolitan area' },
  ],
  foundingDate: '2002',
  founder: [{ '@type': 'Person', name: 'Jason Huerkamp' }, { '@type': 'Person', name: 'Brooke Huerkamp' }],
  parentOrganization: { '@type': 'Organization', name: site.brokerage },
  sameAs: [site.facebookUrl, reviewData.summary.google.url],
};

export const website = {
  '@type': 'WebSite',
  '@id': `${origin}/#website`,
  url: `${origin}/`,
  name: site.name,
  publisher: { '@id': business['@id'] },
};
