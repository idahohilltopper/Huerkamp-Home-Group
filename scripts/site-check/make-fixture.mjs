// Made-up sample homes for building the site locally (MLS_FIXTURE), used by the pre-push check (preflight.sh).
// Every home is fake: "Sample listing for local testing", no photos, invented addresses, spread over our communities
// (a point inside each community's outline). Netlify refuses MLS_FIXTURE, so these can never reach the live site.
// Usage: node scripts/site-check/make-fixture.mjs [out-file]   (default .cache/sample-listings.json)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { inPolys } from '../../src/lib/mls-feed.mjs';

const out = process.argv[2] ?? '.cache/sample-listings.json';
const comm = JSON.parse(readFileSync('src/data/geo/communities.geojson', 'utf8')).features;
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const STREETS = ['Maple Dr', 'Oak Ave', 'Lakeview Ln', 'Pine St', 'Cedar Ct', 'Birch Way', 'Elm St', 'Prairie Rd'];
const TYPES = ['single-family', 'single-family', 'single-family', 'townhome', 'condo', 'multi-family', 'land'];
const BROKERS = ['Keller Williams Preferred Rlty', 'Sample Realty', 'Example Homes, LLC', 'Lennar Sales Corp'];
const homes = [];
let n = 0;
for (const f of comm) {
  const g = f.geometry, polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  const pts = polys.flatMap((p) => p[0]);
  const box = [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
  for (let i = 0, tries = 0; i < 6 && tries < 200; tries++) {
    const lng = box[0] + rnd() * (box[2] - box[0]), lat = box[1] + rnd() * (box[3] - box[1]);
    if (!inPolys(lng, lat, polys)) continue;
    i++; n++;
    const type = pick(TYPES), mls = String(6500000 + n), street = `${100 + Math.floor(rnd() * 19800)} ${pick(STREETS)}`;
    const city = f.properties.slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '), zip = '55' + String(100 + Math.floor(rnd() * 800));
    const price = type === 'land' ? 50000 + Math.round(rnd() * 400) * 1000 : 180000 + Math.round(rnd() * 1400) * 1000;
    homes.push({
      mls, slug: `${street}-${city}-mn-${zip}-${mls}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'), street, city, zip, price,
      beds: type === 'land' ? null : 1 + Math.floor(rnd() * 5), baths: type === 'land' ? null : 1 + Math.floor(rnd() * 3),
      sqft: type === 'land' ? null : 800 + Math.floor(rnd() * 3600), type, style: '', yearBuilt: type === 'land' ? null : 1900 + Math.floor(rnd() * 126),
      newConstruction: rnd() < 0.15, lotAcres: Math.round(rnd() * 600) / 100, garage: type === 'land' ? null : Math.floor(rnd() * 4),
      description: 'Sample listing for local testing.', photos: [], listed: '2026-10-01', updated: '2026-10-27', ...(n % 12 === 0 && pick(BROKERS) ? { brokerage: 'Keller Williams Preferred Rlty', agent: 'The Huerkamp Home Group' } : { brokerage: pick(BROKERS), agent: 'Sample Agent' }), // every 12th: a team listing (open house pages)
      lat, lng, lakefront: false, taxes: Math.round(price * 0.012), hoa: type === 'townhome' || type === 'condo' ? 250 : null,
      heating: '', cooling: '', basement: '', community: f.properties.slug, hood: null, lakes: [], openHouses: [],
    });
  }
}
mkdirSync(out.replace(/\/[^/]+$/, ''), { recursive: true });
writeFileSync(out, JSON.stringify(homes));
console.log(`${homes.length} sample homes in ${out}`);
