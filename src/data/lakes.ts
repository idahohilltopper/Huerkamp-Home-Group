// Every named lake of 10 acres or more touching one of our community guides (src/data/lake-list.json, from
// scripts/build-lake-list.py), and how to search the homes on each one in Ylopo.
import data from './lake-list.json';
import shapesUrl from './geo/lake-list.geojson?url';
import { communities } from './areas';
import { ylopoPlace } from './ylopo';
import { site } from './site';
import { OWN, ownSearchHref } from './search';

export type Lake = (typeof data.lakes)[number];
export const lakes: Lake[] = data.lakes;
export const lakeSources = data.sources;
export const lakeGeoUrl: string = shapesUrl;
export const lakeHref = (l: Lake) => `/lake-homes/${l.slug}`;
export const lakeBySlug = (slug: string) => lakes.find((l) => l.slug === slug);
const bySlug = Object.fromEntries(communities.map((c) => [c.slug, c]));
export const lakeCommunities = (l: Lake) => l.communities.map((s) => bySlug[s]).filter(Boolean);
export const lakesTouching = (communitySlug: string) => lakes.filter((l) => l.communities.includes(communitySlug));

/** Ylopo's "Lakefront" filter (MLS waterfront type: lake). */
export const LAKEFRONT = 'sa_has_waterfront_lake';
const base = `${site.searchUrl}/search/map?s[orderBy]=sourceCreationDate%2Cdesc&s[page]=1`;

/** Lakefront homes for sale on the map around one lake (about 400 m of margin). Ylopo needs a city as well as
 *  the map box (phones get stuck without one), so the lake's main shoreline city is named too. */
export function lakeSearchUrl(l: Lake) {
  if (OWN) return ownSearchHref({ places: [`lake:${l.slug}`] });
  const city = lakeCommunities(l).map((c) => ylopoPlace(c.slug).city).find(Boolean) ?? 'Minneapolis';
  const pad = 0.004;
  const [w, s, e, n] = l.bbox;
  const box = [n + pad, e + pad, s - pad, w - pad].map((v) => v.toFixed(5)).join(',');
  return `${base}&s[locations][0][city]=${encodeURIComponent(city)}&s[locations][0][state]=MN&s[bbox]=${box}&s[amenities][0]=${LAKEFRONT}`;
}

/** Lake communities, the ones with the most lake acreage first. */
export const lakeCommunitySlugs: string[] = (() => {
  const acres = new Map<string, number>();
  lakes.forEach((l) => l.communities.forEach((c) => acres.set(c, (acres.get(c) ?? 0) + l.acres)));
  return [...acres].sort((a, b) => b[1] - a[1]).map(([c]) => c);
})();

/** Every lakefront home for sale in every lake community (a list search: a map this large stalls on phones). */
export function allLakefrontUrl() {
  if (OWN) return ownSearchHref({ lakefront: true });
  const cities = [...new Set(lakeCommunitySlugs.map((s) => ylopoPlace(s).city).filter(Boolean))] as string[];
  const locs = cities.map((c, i) => `s[locations][${i}][city]=${encodeURIComponent(c)}&s[locations][${i}][state]=MN`).join('&');
  return `${site.searchUrl}/search?s[orderBy]=sourceCreationDate%2Cdesc&s[page]=1&${locs}&s[amenities][0]=${LAKEFRONT}`;
}

/** The listings widget's search: lakefront homes in the given communities (the widget can't take a map box). */
export function lakefrontWidgetSearch(communitySlugs: string[], limit = 12) {
  const locations = [...new Set(communitySlugs.map((s) => ylopoPlace(s).city).filter(Boolean))].map((city) => ({ city, state: 'MN' }));
  return { locations, amenities: [LAKEFRONT], limit };
}

/** Map hover/click info for the lake map. */
export const lakeInfo = Object.fromEntries(lakes.map((l) => [l.slug, {
  name: l.name,
  detail: `${l.acres.toLocaleString('en-US')} acres · ${lakeCommunities(l).map((c) => c.name).slice(0, 3).join(', ')}`,
  href: lakeHref(l),
}]));

/** Small lakes get a page and a listing, but stay out of search results unless they're 50+ acres. */
export const INDEX_MIN_ACRES = 50;
