// Subdivisions with homes for sale now (/subdivisions/<city>/<subdivision>), from the MLS subdivision name on each
// listing in our communities (src/data/listings.ts). Open SEO, Nov 15, 2026: narrow searches like "townhomes for sale
// burnsville mn under 300k" and "homes for sale on lake marion lakeville" are won by small local brokers' subdivision
// pages (mndreamteam.com, metarealtymn.com, mnhousesforsale.com), not by Zillow or Realtor.com. A subdivision gets a page
// when it has at least MIN_HOMES homes for sale (land not counted). Builders' new-construction neighborhoods already have
// their own page (src/data/developments.ts), so those are linked, not repeated. Plat phases fold together (devName).
import { listingsData, median, type Listing } from './listings';
import { developmentsData, devName } from './developments';
import { communities } from './areas';

export const MIN_HOMES = 3;
const slugify = (s: string) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export interface Subdivision {
  name: string; slug: string; community: string; city: string; path: string; listings: Listing[];
  median: number | null; min: number; max: number; types: [string, number][];
  beds: [number, number] | null; sqft: [number, number] | null; built: [number, number] | null; hoa: number | null;
}

export const subdivisionsData = (async () => {
  const data = await listingsData;
  const devs = await developmentsData;
  const devPaths = new Set(devs.list.map((d) => d.path));
  const groups = new Map<string, { name: string; community: string; list: Listing[] }>();
  for (const l of data.listings) {
    const name = devName(l.subdivision);
    if (!name || !l.community || l.type === 'land') continue;
    const k = `${l.community}|${name.toLowerCase()}`;
    (groups.get(k) ?? groups.set(k, { name, community: l.community, list: [] }).get(k)!).list.push(l);
  }
  const range = (xs: (number | null | undefined)[]): [number, number] | null => { const v = xs.filter((x): x is number => !!x); return v.length ? [Math.min(...v), Math.max(...v)] : null; };
  const seen = new Map<string, Subdivision>();
  for (const g of [...groups.values()].sort((a, b) => b.list.length - a.list.length)) {
    if (g.list.length < MIN_HOMES) continue;
    const c = communities.find((x) => x.slug === g.community);
    const slug = slugify(g.name);
    const path = `${g.community}/${slug}`;
    if (!c || !slug || devPaths.has(path) || seen.has(path)) continue;
    const types = new Map<string, number>(); g.list.forEach((l) => types.set(l.type, (types.get(l.type) ?? 0) + 1));
    const prices = g.list.map((l) => l.price);
    const fees = g.list.map((l) => l.hoa).filter((h): h is number => !!h && h > 0 && h < 5000);
    seen.set(path, {
      name: g.name, slug, community: g.community, city: c.name, path, listings: g.list.slice().sort((a, b) => a.price - b.price),
      median: median(prices), min: Math.min(...prices), max: Math.max(...prices), types: [...types].sort((a, b) => b[1] - a[1]),
      beds: range(g.list.map((l) => l.beds)), sqft: range(g.list.map((l) => l.sqft)), built: range(g.list.map((l) => l.yearBuilt)),
      hoa: fees.length ? median(fees) : null,
    });
  }
  const list = [...seen.values()].sort((a, b) => a.city.localeCompare(b.city) || b.listings.length - a.listings.length);
  return { at: data.at, preview: data.preview, mode: data.mode, list, devs: devs.list };
})();
