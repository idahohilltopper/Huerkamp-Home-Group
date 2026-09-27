// Community and lake data plus the hover text the maps show.
import communityData from './communities.json';
import lakeData from './lakes.json';
import communityShapesUrl from './geo/communities.geojson?url';
import lakeShapes from './geo/lakes.geojson?raw';

export type Community = (typeof communityData.communities)[number];
export type Lake = (typeof lakeData.lakes)[number];

export const communities: Community[] = communityData.communities;
export const lakes: Lake[] = lakeData.lakes;
// 149 outlines: served as one cached file rather than inlined into every page.
export const communityGeoUrl: string = communityShapesUrl;
export const lakeGeo = JSON.parse(lakeShapes);

export const regions = ['Minneapolis & Saint Paul', 'North Metro', 'East Metro', 'South Metro', 'West Metro', 'Southern Minnesota'];

const num = new Intl.NumberFormat('en-US');
export const fmt = (n: number) => num.format(n);

export const communityInfo = Object.fromEntries(
  communities.map((c) => [c.slug, {
    name: c.name,
    detail: `${fmt(c.population2024)} residents · ${c.counties.join(' & ')} County`,
    href: `/communities/${c.slug}`,
  }]),
);

export const lakeInfo = Object.fromEntries(
  lakes.map((l) => [l.slug, {
    name: l.name,
    detail: `About ${fmt(l.acres)} acres · ${l.shorelineCities.length ? l.shorelineCities.slice(0, 3).join(', ') + (l.shorelineCities.length > 3 ? ' and more' : '') : l.areaNote}`,
    href: `/lake-homes#${l.slug}`,
  }]),
);

// Straight-line miles between two [lon, lat] points.
export function milesBetween(a: number[], b: number[]) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b[1] - a[1]) / 2) ** 2 + Math.cos(r(a[1])) * Math.cos(r(b[1])) * Math.sin(r(b[0] - a[0]) / 2) ** 2;
  return 2 * 3958.8 * Math.asin(Math.sqrt(h));
}

export function nearby(c: Community, count = 4) {
  return communities
    .filter((o) => o.slug !== c.slug)
    .map((o) => ({ ...o, miles: milesBetween(c.center, o.center) }))
    .sort((a, b) => a.miles - b.miles)
    .slice(0, count);
}
