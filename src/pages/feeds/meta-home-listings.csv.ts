// /feeds/meta-home-listings.csv: a Meta (Facebook/Instagram) "Home listings" catalog feed, for ads that show people the
// homes they looked at on this site (the pixel's ViewContent uses the same MLS number as home_listing_id). In Commerce
// Manager: Catalogs > Create catalog > Home listings > Data feed > scheduled, this address, daily.
// The team's OWN listings only (Keller Williams Preferred Realty, listed by a team member, the same test as the map
// search's "our team's listings"): advertising another brokerage's listing on Facebook needs NorthstarMLS's written OK
// first. Rebuilt with every build; kept out of Google by public/_headers (X-Robots-Tag).
import { teamListings } from '../../data/team-listings';

const TYPE: Record<string, string> = { 'single-family': 'house', townhome: 'townhouse', condo: 'apartment', 'multi-family': 'other', land: 'land', manufactured: 'manufactured' };
const COLS = ['home_listing_id', 'name', 'availability', 'address.addr1', 'address.city', 'address.region', 'address.postal_code', 'address.country',
  'latitude', 'longitude', 'neighborhood[0]', 'price', 'image[0].url', 'image[1].url', 'image[2].url', 'url', 'num_beds', 'num_baths', 'area_size', 'area_unit',
  'property_type', 'listing_type', 'year_built', 'description'];
const cell = (v: unknown) => { const s = String(v ?? '').replace(/\s+/g, ' ').trim(); return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export async function GET() {
  const homes = await teamListings();
  const rows = homes.map((l) => [
    l.mls, `${l.street}, ${l.city}`, 'for_sale', l.street, l.city, l.state === 'WI' ? 'Wisconsin' : 'Minnesota', l.zip, 'United States',
    l.lat, l.lng, l.hood ?? l.city, `${l.price} USD`, ...[0, 1, 2].map((i) => (l.photos[i] ? `${l.photos[i]}?class=large` : '')),
    `https://www.huerkamphomes.com/homes/${l.slug}`, l.beds ?? '', l.baths ?? '', l.sqft ?? '', l.sqft ? 'sq_ft' : '',
    TYPE[l.type] ?? 'other', 'for_sale_by_agent', l.yearBuilt ?? '', (l.description || `${l.street}, ${l.city}`).slice(0, 4900),
  ].map(cell).join(','));
  return new Response([COLS.join(','), ...rows].join('\n') + '\n', { headers: { 'content-type': 'text/csv; charset=utf-8' } });
}
