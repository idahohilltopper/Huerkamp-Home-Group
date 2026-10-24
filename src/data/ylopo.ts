// Links into the team's Ylopo home search (search.huerkamphomegroup.com), the IDX for now.
// Parameter names were read from the search site's own URLs (2026-10-24); if Ylopo changes them,
// this is the only file to update.
import { site } from './site';
import data from './ylopo-cities.json';

type Where = { city?: string; zips?: string[] };
export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  beds?: number;                                   // minimum bedrooms
  type?: 'house' | 'townhouse' | 'condo';
}

const places = data.communities as Record<string, Where>;

/** How a community is searched on Ylopo: by city name, by ZIP codes, or not at all ({}). */
export const ylopoPlace = (slug: string): Where => places[slug] ?? {};

/** Search URL for one or more places, newest listings first. */
export function searchUrl(where: Where | Where[], f: SearchFilters = {}) {
  const all = (Array.isArray(where) ? where : [where]).flatMap((w): Record<string, string>[] =>
    w.city ? [{ city: w.city, state: 'MN' }] : (w.zips ?? []).map((z) => ({ postalCode: z })));
  const locs = all.filter((l, i) => all.findIndex((m) => JSON.stringify(m) === JSON.stringify(l)) === i);
  if (!locs.length && !Object.keys(f).length) return site.searchUrl;
  const q: [string, string][] = [['s[orderBy]', 'sourceCreationDate,desc'], ['s[page]', '1']];
  locs.forEach((l, i) => Object.entries(l).forEach(([k, v]) => q.push([`s[locations][${i}][${k}]`, v])));
  if (f.minPrice) q.push(['s[minPrice]', String(f.minPrice)]);
  if (f.maxPrice) q.push(['s[maxPrice]', String(f.maxPrice)]);
  if (f.beds) q.push(['s[beds]', String(f.beds)]);
  if (f.type) q.push(['s[propertyTypes][0]', f.type]);
  return `${site.searchUrl}/search?${q.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
}

/** Shortcut: search one community by slug. */
export const communitySearch = (slug: string, f: SearchFilters = {}) => searchUrl(ylopoPlace(slug), f);
