// Condo buildings with units for sale now (/condo-buildings and /condo-buildings/<building>), from the live MLS feed.
// Jason, Nov 17, 2026: only condos that are for sale, so a building has a page only while at least one of its units is
// listed in NorthstarMLS (rental apartment buildings never appear). Named buildings come from condo-buildings.json (Google
// Business Profiles via Open SEO); any other address with MIN_UNNAMED or more condos listed gets a page under its address.
// Open SEO, Nov 17, 2026: "the legacy condos minneapolis" 1,600 searches a month, "skyscape condos" 1,300, "riverstation
// condos" 1,000, "la rive condos" 880, "cobalt condos" 480, all keyword difficulty 0. Fair housing: listing facts only.
import { listingsData, median, type Listing } from './listings';
import data from './condo-buildings.json';

export interface BuildingInfo { slug: string; name: string; city: string; addresses: string[]; lat: number; lng: number; url: string | null }
export const MIN_UNNAMED = 3;

const ABBR: Record<string, string> = { street: 'st', avenue: 'ave', drive: 'dr', road: 'rd', lane: 'ln', court: 'ct', circle: 'cir', place: 'pl', boulevard: 'blvd', parkway: 'pkwy', terrace: 'ter', trail: 'trl', mall: 'mall', north: 'n', south: 's', east: 'e', west: 'w', northeast: 'ne', northwest: 'nw', southeast: 'se', southwest: 'sw', saint: 'st' };
const DIRS = new Set(['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']);
/** "20 NE 2nd St" and "20 2nd Street NE #1203" both → { num: 20, key: "2nd st|ne" }. */
export function addrKey(street: string) {
  const s = street.toLowerCase().replace(/#.*$/, '').replace(/\b(unit|apt|suite|ste)\b.*$/, '').replace(/[.,]/g, ' ').trim();
  const m = s.match(/^(\d+)(?:-(\d+))?\s+(.+)$/);
  if (!m) return null;
  const words = m[3].split(/\s+/).map((w) => ABBR[w] ?? w);
  const dirs = words.filter((w) => DIRS.has(w)).sort(), rest = words.filter((w) => !DIRS.has(w));
  return { lo: +m[1], hi: m[2] ? +m[2] : +m[1], key: `${rest.join(' ')}|${dirs.join(' ')}` };
}
const slugify = (s: string) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const title = (street: string) => street.replace(/#.*$/, '').trim();

export interface Building extends BuildingInfo { units: Listing[]; median: number | null; hoa: number | null; community: string; hood: string | null; named: boolean }

export const buildingsData = (async () => {
  const feed = await listingsData;
  const info = data.buildings as BuildingInfo[];
  const keyed = info.flatMap((b) => b.addresses.map((a) => ({ b, k: addrKey(a)! })));
  const named = new Map<string, Listing[]>(), loose = new Map<string, Listing[]>();
  for (const l of feed.listings) {
    if (l.type !== 'condo' || !(l.price > 1000) || l.addressHidden) continue;
    const k = addrKey(l.street);
    if (!k) continue;
    const hit = keyed.find((x) => x.k.key === k.key && k.lo >= x.k.lo && k.lo <= x.k.hi && ['minneapolis', 'saint-paul', 'edina'].includes(l.community));
    const m = hit ? named : loose, id = hit ? hit.b.slug : `${l.community}|${k.lo} ${k.key}`;
    (m.get(id) ?? m.set(id, []).get(id)!).push(l);
  }
  const make = (b: BuildingInfo, units: Listing[], isNamed: boolean): Building => {
    const fees = units.map((u) => u.hoa).filter((h): h is number => !!h && h > 0 && h < 10000);
    const hoods = new Map<string, number>(); units.forEach((u) => u.hood && hoods.set(u.hood, (hoods.get(u.hood) ?? 0) + 1));
    return { ...b, units: units.slice().sort((a, c) => a.price - c.price), median: median(units.map((u) => u.price)), hoa: fees.length ? median(fees) : null, community: units[0].community, hood: [...hoods].sort((a, c) => c[1] - a[1])[0]?.[0] ?? null, named: isNamed };
  };
  const list: Building[] = info.filter((b) => named.has(b.slug)).map((b) => make(b, named.get(b.slug)!, true));
  const used = new Set(list.map((b) => b.slug));
  for (const units of loose.values()) {
    if (units.length < MIN_UNNAMED) continue;
    const u = units[0], street = title(u.street), slug = slugify(`${street} ${u.city}`);
    if (used.has(slug)) continue;
    used.add(slug);
    list.push(make({ slug, name: street, city: u.city, addresses: [street], lat: u.lat, lng: u.lng, url: null }, units, false));
  }
  list.sort((a, b) => b.units.length - a.units.length);
  return { at: feed.at, preview: feed.preview, mode: feed.mode, list };
})();
