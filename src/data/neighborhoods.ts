// Minneapolis neighborhoods and Saint Paul planning districts (src/data/neighborhoods.json, from
// scripts/build-neighborhoods.py), with their Ylopo searches and map outlines.
import data from './neighborhoods.json';
import ylopoHoods from './ylopo-neighborhoods.json';
import shapesUrl from './geo/neighborhoods.geojson?url';
import { site } from './site';

export type Hood = (typeof data.neighborhoods)[number] & { community?: string; district?: number; councilName?: string };
export const hoods: Hood[] = data.neighborhoods as Hood[];
export const hoodSources = data.sources;
export const hoodGeoUrl: string = shapesUrl;
export const CITY_NAME: Record<string, string> = { minneapolis: 'Minneapolis', 'saint-paul': 'Saint Paul' };

export const hoodKey = (h: Hood) => `${h.city}/${h.slug}`;
export const hoodHref = (h: Hood) => `/communities/${h.city}/${h.slug}`;
export const hoodByKey = (key: string) => hoods.find((h) => hoodKey(h) === key);
export const hoodsIn = (city: string) => hoods.filter((h) => h.city === city);
/** "Southwest community" (Minneapolis) or "Planning District 15" (Saint Paul). */
export const hoodGroup = (h: Hood) => (h.community ? `${h.community} community` : `Planning District ${h.district}`);

/** Homes for sale: Ylopo's own neighborhood when it has one, otherwise the map around the neighborhood. */
export function hoodSearchUrl(h: Hood) {
  const city = CITY_NAME[h.city];
  const base = `${site.searchUrl}/search`;
  const name = (ylopoHoods as Record<string, string>)[hoodKey(h)];
  if (name) {
    return `${base}?s[orderBy]=sourceCreationDate%2Cdesc&s[page]=1&s[locations][0][neighborhood]=${encodeURIComponent(name)}&s[locations][0][city]=${encodeURIComponent(city)}&s[locations][0][state]=MN`;
  }
  const [w, s, e, n] = h.bbox;
  return `${base}/map?s[orderBy]=sourceCreationDate%2Cdesc&s[page]=1&s[locations][0][city]=${encodeURIComponent(city)}&s[locations][0][state]=MN&s[bbox]=${n},${e},${s},${w}`;
}
/** The Ylopo results widget's search: by neighborhood when Ylopo has it, else the whole city. */
export function hoodWidgetSearch(h: Hood) {
  const name = (ylopoHoods as Record<string, string>)[hoodKey(h)];
  const loc: Record<string, string> = { city: CITY_NAME[h.city], state: 'MN' };
  if (name) loc.neighborhood = name;
  return { locations: [loc] };
}
export const hasYlopoHood = (h: Hood) => !!(ylopoHoods as Record<string, string>)[hoodKey(h)];

/** Map hover/click info for every neighborhood in a city. */
export function hoodInfo(city?: string) {
  return Object.fromEntries((city ? hoodsIn(city) : hoods).map((h) => [hoodKey(h), {
    name: h.name,
    detail: h.census?.medianHomeValue ? `${hoodGroup(h)} · Census median home value $${Math.round(h.census.medianHomeValue / 1000)}K` : hoodGroup(h),
    href: hoodHref(h),
  }]));
}

/** Names that are also ordinary words or other places; only matched with the city name next to them. */
const COMMON = new Set(['Central', 'Field', 'Page', 'Regina', 'Victory', 'Howe', 'Hale', 'Bryant', 'Fulton', 'Cooper', 'Holland', 'Harrison',
  'Downtown', 'Longfellow', 'Jordan', 'Corcoran', 'Cleveland', 'Kenny', 'Windom', 'Sheridan', 'Hawthorne', 'Diamond Lake', 'Minnehaha',
  'Hiawatha', 'Beltrami', 'Bottineau', 'Lyndale', 'Kenwood', 'Whittier', 'Seward', 'North End', 'West Side', 'Downtown East',
  'Downtown West', 'Union Park', 'Highland Park', 'Como Park', 'Ericsson', 'Morris Park', 'Logan Park', 'Columbia Park', 'Waite Park']);
/** Text pattern for a neighborhood's name ("Linden Hills", or "Seward, Minneapolis" for common words). */
export function hoodPattern(h: Hood) {
  const esc = h.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/-/g, '[- ]').replace(/St\\\./, '(St\\.?|Saint)');
  const city = h.city === 'minneapolis' ? 'Minneapolis' : '(Saint|St\\.?) Paul';
  return COMMON.has(h.name) ? new RegExp(`\\b${esc}(,| in| neighborhood of)? ${city}\\b`, 'i') : new RegExp(`\\b${esc}\\b`, 'i');
}
