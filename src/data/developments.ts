// New-construction developments: the MLS subdivisions in our communities where builders are selling now, from the
// live feed (src/data/listings.ts). A development gets a page (/new-construction/<city>/<development>) when it has at
// least MIN_HOMES homes for sale (lots and land not counted) and at least half of them are new construction (built this year or last). Plat
// phases ("3rd Addition", "Phase 2") are folded into one development name, so a builder's whole neighborhood is one page.
import { listingsData, median, type Listing } from './listings';
import { communities } from './areas';

export const MIN_HOMES = 3;

const ORD = '(\\d+(st|nd|rd|th)|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)';
const SMALL = new Set(['at', 'of', 'the', 'on', 'in', 'and', 'by']);

/** A subdivision name as people say it: no plat phase, normal capitals. Null for names that aren't a place. */
export function devName(raw: string | null | undefined): string | null {
  let s = String(raw ?? '').replace(/\s+/g, ' ').trim();
  if (!s || /^(none|n\/?a|unknown|other|no subdivision|unplatted|metes|cic\b|condo(minium)?\b|\d+$)/i.test(s)) return null;
  s = s.replace(new RegExp(`\\s*\\b${ORD}\\s+(add(ition|itn|n)?|addn|replat)\\b.*$`, 'i'), '')
    .replace(/\s*\b(add(ition)?|addn|replat|plat|phase\s*\w+|ph\.?\s*\d+)\b.*$/i, '')
    .replace(/[\s,#-]+\d*$/, '').trim();
  if (s.length < 3) return null;
  if (s === s.toUpperCase()) {
    s = s.toLowerCase().split(' ').map((w, i) => (i && SMALL.has(w) ? w : w.replace(/^[a-z]/, (c) => c.toUpperCase()))).join(' ');
  }
  return s;
}
const slugify = (s: string) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export interface Development {
  name: string; slug: string; community: string; city: string; path: string;
  listings: Listing[]; newCount: number; median: number | null; min: number; max: number;
  types: [string, number][]; beds: [number, number] | null; sqft: [number, number] | null; brokerages: string[];
}

export const developmentsData = (async () => {
  const data = await listingsData;
  const groups = new Map<string, { name: string; community: string; list: Listing[] }>();
  for (const l of data.listings) {
    const name = devName(l.subdivision);
    if (!name || !l.community || l.type === 'land') continue;
    const k = `${l.community}|${name.toLowerCase()}`;
    (groups.get(k) ?? groups.set(k, { name, community: l.community, list: [] }).get(k)!).list.push(l);
  }
  const range = (xs: (number | null)[]): [number, number] | null => { const v = xs.filter((x): x is number => !!x); return v.length ? [Math.min(...v), Math.max(...v)] : null; };
  const out: Development[] = [];
  for (const g of groups.values()) {
    const newCount = g.list.filter((l) => l.newConstruction).length;
    if (g.list.length < MIN_HOMES || newCount * 2 < g.list.length) continue;
    const c = communities.find((x) => x.slug === g.community);
    if (!c) continue;
    const slug = slugify(g.name);
    const types = new Map<string, number>(); g.list.forEach((l) => types.set(l.type, (types.get(l.type) ?? 0) + 1));
    const brokerages = [...new Set(g.list.map((l) => l.brokerage).filter(Boolean))];
    const prices = g.list.map((l) => l.price);
    out.push({
      name: g.name, slug, community: g.community, city: c.name, path: `${g.community}/${slug}`,
      listings: g.list.slice().sort((a, b) => a.price - b.price), newCount,
      median: median(prices), min: Math.min(...prices), max: Math.max(...prices),
      types: [...types].sort((a, b) => b[1] - a[1]), beds: range(g.list.map((l) => l.beds)), sqft: range(g.list.map((l) => l.sqft)), brokerages,
    });
  }
  // Two names that slug the same in one city: keep the bigger one.
  const seen = new Map<string, Development>();
  for (const d of out.sort((a, b) => b.listings.length - a.listings.length)) if (!seen.has(d.path)) seen.set(d.path, d);
  const list = [...seen.values()].sort((a, b) => a.city.localeCompare(b.city) || b.listings.length - a.listings.length);
  return { at: data.at, preview: data.preview, mode: data.mode, list };
})();
