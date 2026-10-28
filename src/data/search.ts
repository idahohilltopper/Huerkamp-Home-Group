// Which home search the site links to. Once the MLS feed is on (MLS_PUBLIC = "yes" or "preview" in Netlify, with
// REPLIERS_API_KEY), every search link and listings widget uses the site's own search (/home-search, built on Repliers)
// and no Ylopo code loads. Until then they keep using the team's Ylopo search (src/data/ylopo.ts). One switch, here.
// This file must not import src/data/listings.ts (listings → lakes → ylopo → here would be a loop).
import { mlsMode } from '../lib/mls-feed.mjs';
import { toSearch } from '../lib/search-index.mjs';
import { site } from './site';
import cities from './ylopo-cities.json';
import ylopoHoods from './ylopo-neighborhoods.json';

const fixture = !!process.env.MLS_FIXTURE && process.env.NETLIFY !== 'true';
export const OWN: boolean = (mlsMode() !== 'off' || fixture) && (!!(process.env.REPLIERS_API_KEY ?? '').trim() || fixture);

export const SEARCH_PATH = '/home-search';
/** "Search all homes" and "Find a home" buttons. */
export const homeSearchHref = OWN ? SEARCH_PATH : site.searchUrl;
export const mapSearchHref = OWN ? `${SEARCH_PATH}?view=map` : site.mapSearchUrl;

export interface OwnQuery {
  places?: string[];            // community slug, "hood:<city>/<slug>", "zip:<zip>", "lake:<slug>"
  min?: number; max?: number; beds?: number; baths?: number;
  types?: string[]; lakefront?: boolean; newConstruction?: boolean; acres?: boolean; team?: boolean; sort?: string;
}
/** A link into the site's own search. */
export const ownSearchHref = (q: OwnQuery = {}) => { const s = toSearch(q); return s ? `${SEARCH_PATH}?${s}` : SEARCH_PATH; };

// Translating the Ylopo-shaped searches the pages already build into the site's own search.
const cityToSlug = new Map<string, string>();
for (const [slug, w] of Object.entries((cities as { communities: Record<string, { city?: string }> }).communities)) {
  if (w.city && !cityToSlug.has(w.city.toLowerCase())) cityToSlug.set(w.city.toLowerCase(), slug);
}
const hoodNameToKey = new Map(Object.entries(ylopoHoods as Record<string, string>).map(([key, name]) => [name.toLowerCase(), key]));
const TYPE: Record<string, string> = { house: 'single-family', townhouse: 'townhome', condo: 'condo' };

type YLoc = { city?: string; postalCode?: string; neighborhood?: string; state?: string };
export function placesFromYlopo(locs: YLoc[] = []): string[] {
  return [...new Set(locs.map((l) => {
    if (l.neighborhood) { const k = hoodNameToKey.get(l.neighborhood.toLowerCase()); if (k) return `hood:${k}`; }
    if (l.postalCode) return `zip:${l.postalCode}`;
    return l.city ? cityToSlug.get(l.city.toLowerCase()) : undefined;
  }).filter(Boolean) as string[])];
}

/** A Ylopo results-widget search ({ locations, propertyTypes, minPrice, maxPrice, featured, amenities, limit }) as an own query. */
export function ownFromWidget(s: Record<string, any>): OwnQuery & { limit: number } {
  const types = (s.propertyTypes ?? []).map((t: string) => TYPE[t]).filter(Boolean);
  return {
    places: placesFromYlopo(s.locations),
    types: types.length && types.length < 3 ? types : undefined,
    min: s.minPrice || undefined, max: s.maxPrice || undefined, beds: s.beds || undefined,
    lakefront: (s.amenities ?? []).some((a: string) => /waterfront/.test(a)) || undefined,
    team: s.featured === 't' || undefined,
    limit: Number(s.limit) || 12,
  };
}
export const ownTypeFromYlopo = (t?: string) => (t ? TYPE[t] : undefined);
