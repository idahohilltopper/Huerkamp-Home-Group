// "Homes for sale" pages built from the MLS feed (src/lib/mls-feed.mjs): one page per community, Minneapolis/Saint Paul
// neighborhood and ZIP code, plus narrower pages per community by price, home type, bedrooms, new construction,
// lakefront, acreage and luxury. Rules that keep the pages worth indexing:
//   - a page exists only if it has at least one home;
//   - search engines see it only if it has at least MIN_INDEX homes and is narrower than its parent page;
//   - every page adds local facts the portals don't have (market report, guide, lakes, quick answers).
import { loadFeed, mlsMode } from '../lib/mls-feed.mjs';
import { communities } from './areas';
import { hoods, hoodKey, hoodHref, CITY_NAME } from './neighborhoods';
import { lakes, lakeHref } from './lakes';

export type Listing = {
  mls: string; slug: string; street: string; city: string; zip: string; price: number;
  beds: number | null; baths: number | null; sqft: number | null; type: string; style: string;
  yearBuilt: number | null; newConstruction: boolean; lotAcres: number | null; garage: number | null;
  description: string; photos: string[]; listed: string | null; updated: string | null;
  brokerage: string; agent: string; lat: number; lng: number; lakefront: boolean;
  taxes: number | null; hoa: number | null; heating: string; cooling: string; basement: string;
  community: string; hood: string | null; lakes: string[];
};

export const MIN_INDEX = 5;
export const SHOW = 60; // homes listed on a page; the rest are a click away in the full search

export interface Facet { slug: string; label: string; title: (place: string) => string; test: (l: Listing) => boolean; group: string }
const money = (n: number) => (n >= 1e6 ? `$${(n / 1e6).toString().replace(/\.0+$/, '')} million` : `$${n.toLocaleString('en-US')}`);
const BANDS = [200000, 250000, 300000, 350000, 400000, 450000, 500000, 600000, 700000, 800000, 1000000, 1500000, 2000000];
const TYPES: [string, string, string][] = [
  ['single-family', 'single-family-homes', 'Single-family homes'], ['townhome', 'townhomes', 'Townhomes'], ['condo', 'condos', 'Condos'],
  ['multi-family', 'multi-family-homes', 'Multi-family homes'], ['land', 'land', 'Land and lots'], ['manufactured', 'manufactured-homes', 'Manufactured homes'],
];
export const FACETS: Facet[] = [
  ...BANDS.map((b): Facet => ({ slug: `under-${b}`, label: `Under ${money(b)}`, group: 'Price', title: (p) => `Homes for sale in ${p} under ${money(b)}`, test: (l) => l.price <= b })),
  { slug: 'luxury-homes', label: '$1 million and up', group: 'Price', title: (p) => `Luxury homes for sale in ${p} ($1 million and up)`, test: (l) => l.price >= 1e6 },
  ...TYPES.map(([t, slug, label]): Facet => ({ slug, label, group: 'Home type', title: (p) => `${label} for sale in ${p}`, test: (l) => l.type === t })),
  ...[3, 4, 5].map((n): Facet => ({ slug: `${n}-bedroom-homes`, label: `${n}+ bedrooms`, group: 'Bedrooms', title: (p) => `${n}-bedroom homes for sale in ${p}`, test: (l) => (l.beds ?? 0) >= n })),
  { slug: 'new-construction', label: 'New construction', group: 'More', title: (p) => `New construction homes for sale in ${p}`, test: (l) => l.newConstruction },
  { slug: 'lakefront-homes', label: 'Lakefront', group: 'More', title: (p) => `Lakefront homes for sale in ${p}`, test: (l) => l.lakefront },
  { slug: 'one-level-homes', label: 'One-level', group: 'More', title: (p) => `One-level homes for sale in ${p}`, test: (l) => l.type !== 'land' && /one stor|1 stor|rambler|one level|single level|ranch/i.test(l.style) },
  { slug: 'homes-with-acreage', label: '1+ acre', group: 'More', title: (p) => `Homes for sale in ${p} with acreage (1+ acre)`, test: (l) => (l.lotAcres ?? 0) >= 1 && l.type !== 'land' },
];

export interface Area { kind: 'community' | 'hood' | 'zip'; key: string; path: string; name: string; place: string; guide?: string; communitySlug?: string }
export interface Collection { path: string; area: Area; facet: Facet | null; listings: Listing[]; total: number; index: boolean }

const newest = (a: Listing, b: Listing) => String(b.listed ?? '').localeCompare(String(a.listed ?? '')) || b.price - a.price;
const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

/** Everything the pages need: the mode, when the data was pulled, and every collection page. */
export const listingsData = (async () => {
  const feed = await loadFeed();
  const listings = (feed.listings as Listing[]).slice().sort(newest);
  const preview = feed.mode !== 'live';
  const byCommunity = new Map<string, Listing[]>(), byHood = new Map<string, Listing[]>(), byZip = new Map<string, Listing[]>();
  const push = (m: Map<string, Listing[]>, k: string | null, l: Listing) => { if (k) (m.get(k) ?? m.set(k, []).get(k)!).push(l); };
  for (const l of listings) { push(byCommunity, l.community, l); push(byHood, l.hood, l); if (/^5[56]\d{3}$/.test(l.zip)) push(byZip, l.zip, l); }

  const collections: Collection[] = [];
  const add = (area: Area, list: Listing[], facets: Facet[]) => {
    if (!list.length) return;
    collections.push({ path: area.path, area, facet: null, listings: list, total: list.length, index: !preview && list.length >= MIN_INDEX });
    for (const f of facets) {
      const sub = list.filter(f.test);
      if (!sub.length) continue;
      collections.push({ path: `${area.path}/${f.slug}`, area, facet: f, listings: sub, total: list.length, index: !preview && sub.length >= MIN_INDEX && sub.length < list.length });
    }
  };
  for (const c of communities) {
    add({ kind: 'community', key: c.slug, path: c.slug, name: c.name, place: `${c.name}, MN`, guide: `/communities/${c.slug}`, communitySlug: c.slug }, byCommunity.get(c.slug) ?? [], FACETS);
  }
  for (const h of hoods) {
    const city = CITY_NAME[h.city];
    // Neighborhood pages get the price and home-type pages (bedroom and other pages would be too thin).
    add({ kind: 'hood', key: hoodKey(h), path: hoodKey(h), name: h.name, place: `${h.name}, ${city}`, guide: hoodHref(h), communitySlug: h.city },
      byHood.get(hoodKey(h)) ?? [], FACETS.filter((f) => f.group === 'Price' || f.group === 'Home type'));
  }
  for (const [zip, list] of [...byZip].sort()) {
    add({ kind: 'zip', key: zip, path: `zip/${zip}`, name: `ZIP ${zip}`, place: `ZIP code ${zip}` }, list, []);
  }
  // A neighborhood's address must never collide with a city's narrower page.
  const seen = new Set<string>();
  for (const c of collections) { if (seen.has(c.path)) throw new Error(`Two homes-for-sale pages share ${c.path}`); seen.add(c.path); }

  const bySlug = new Map(listings.map((l) => [l.slug, l]));
  return { mode: feed.mode as 'off' | 'preview' | 'live', at: feed.at as string | null, preview, listings, bySlug, collections, fixture: !!feed.fixture };
})();

export const homesHref = (path = '') => `/homes-for-sale${path ? `/${path}` : ''}`;
export const listingHref = (l: Listing) => `/homes/${l.slug}`;
export const facetsFor = (area: Area) => (area.kind === 'community' ? FACETS : area.kind === 'hood' ? FACETS.filter((f) => f.group === 'Price' || f.group === 'Home type') : []);

// ---------- numbers for the summaries and quick answers ----------
export const median = (xs: number[]) => { const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b); if (!s.length) return null; const m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };
export function stats(list: Listing[]) {
  const priced = list.map((l) => l.price);
  const ppsf = list.filter((l) => l.sqft && l.type !== 'land').map((l) => l.price / l.sqft!);
  const types = new Map<string, number>(); list.forEach((l) => types.set(l.type, (types.get(l.type) ?? 0) + 1));
  return {
    count: list.length, median: median(priced), min: Math.min(...priced), max: Math.max(...priced),
    medianSqft: median(list.filter((l) => l.sqft).map((l) => l.sqft!)), medianPpsf: median(ppsf),
    medianBeds: median(list.filter((l) => l.beds).map((l) => l.beds!)),
    newest: list.map((l) => l.listed).filter(Boolean).sort().at(-1) ?? null,
    types: [...types].sort((a, b) => b[1] - a[1]),
    cheapest: list.reduce((a, b) => (b.price < a.price ? b : a)),
  };
}
export const TYPE_LABEL: Record<string, string> = Object.fromEntries(TYPES.map(([t, , label]) => [t, label.toLowerCase()]));
export const lakeName = (slug: string) => lakes.find((l) => l.slug === slug)?.name ?? slug;
export const lakeLink = (slug: string) => { const l = lakes.find((x) => x.slug === slug); return l ? lakeHref(l) : null; };
export const mlsMode_ = mlsMode;
export { money, byName };
