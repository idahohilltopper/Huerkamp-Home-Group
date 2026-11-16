// Structured data (schema.org) describing the business. Base.astro puts this on every page,
// so search engines and AI assistants always see the same name, address, phone and logo.
import { site } from './site';
import reviewData from './reviews.json';
import communityData from './communities.json';

export const origin = 'https://www.huerkamphomes.com';

export const business = {
  '@type': 'RealEstateAgent',
  '@id': `${origin}/#business`,
  name: site.name,
  url: `${origin}/`,
  logo: `${origin}/brand/hhg-logo.png`,
  image: `${origin}/brand/og-default.jpg`,
  telephone: '+1-612-502-7653',
  email: site.email,
  address: { '@type': 'PostalAddress', streetAddress: site.street, addressLocality: 'Burnsville', addressRegion: 'MN', postalCode: '55306', addressCountry: 'US' },
  hasMap: site.mapsUrl,
  // The office's map point and hours exactly as the Google Business Profile shows them (Open SEO, Nov 16, 2026: open 24 hours,
  // pin at 44.74408, -93.28182), so Google sees the website and the profile as the same place.
  geo: { '@type': 'GeoCoordinates', latitude: 44.74408, longitude: -93.28182 },
  openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
  // Every city that has a community guide on this site (same list as /communities), then the metro as a whole.
  areaServed: [
    ...communityData.communities.map((c) => ({ '@type': 'City', name: c.name, containedInPlace: { '@type': 'State', name: 'Minnesota' } })),
    { '@type': 'AdministrativeArea', name: 'Twin Cities metropolitan area' },
  ],
  foundingDate: '2002',
  founder: [{ '@type': 'Person', name: 'Jason Huerkamp', sameAs: [site.profiles.jasonFastExpert] }, { '@type': 'Person', name: 'Brooke Huerkamp' }],
  parentOrganization: { '@type': 'Organization', name: site.brokerage },
  award: [site.rankings.realtrends.text, site.rankings.agentPronto.text],
  // What the team is known for, in plain words (AI assistants use this to decide whom to name for a question).
  knowsAbout: ['Twin Cities real estate', 'Western Wisconsin real estate', 'Minnesota cabins and lake homes', 'Buying a home in Minnesota', 'Selling a home in Minnesota', 'Minnesota lake homes',
    'New construction homes in the Twin Cities', 'Minnesota point-of-sale and time-of-sale inspections', 'Twin Cities housing market data'],
  // The team's own profiles elsewhere (site.profiles, from Jason), so search engines and AI tools know they're the same business.
  sameAs: [site.facebookUrl, site.youtubeUrl, reviewData.summary.google.url, site.rankings.realtrends.url,
    site.profiles.zillow, site.profiles.realtor, site.profiles.redfin, site.profiles.instagram, site.profiles.linkedin],
};

export const website = {
  '@type': 'WebSite',
  '@id': `${origin}/#website`,
  url: `${origin}/`,
  name: site.name,
  publisher: { '@id': business['@id'] },
};
