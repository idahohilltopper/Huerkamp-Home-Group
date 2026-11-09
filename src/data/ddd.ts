// Twin Cities restaurants featured on Food Network's "Diners, Drive-Ins and Dives" (src/data/ddd.json, built and
// sourced by scripts/build-ddd.py): the guide page (/diners-drive-ins-and-dives-minnesota), the nearest open spot on
// listing pages and community pages. A plain fact about each place; no show logos or likenesses.
import data from './ddd.json';
import { miles } from '../lib/nearby.mjs';
import { OWN, SEARCH_PATH, homeSearchHref } from './search';

export type Spot = (typeof data.spots)[number];
export const DDD_PATH = '/diners-drive-ins-and-dives-minnesota';
export const dddChecked = data.checked;
export const spots: Spot[] = data.spots;
export const openSpots = spots.filter((s) => s.status === 'open');

/** The closest open spot to a point, with straight-line miles, or null past `maxMi`. */
export function nearestSpot(lat: number, lng: number, maxMi = 25): { s: Spot; mi: number } | null {
  let best: { s: Spot; mi: number } | null = null;
  for (const s of openSpots) { const mi = miles(lat, lng, s.lat, s.lng); if (!best || mi < best.mi) best = { s, mi }; }
  return best && best.mi <= maxMi ? best : null;
}

/** Homes for sale on the map within about a mile of a spot. */
export function homesNear(s: Spot): string {
  if (!OWN) return homeSearchHref;
  const dLat = 1 / 69, dLng = 1 / (69 * Math.cos((s.lat * Math.PI) / 180));
  const f = (n: number) => n.toFixed(4);
  return `${SEARCH_PATH}?bbox=${f(s.lng - dLng)},${f(s.lat - dLat)},${f(s.lng + dLng)},${f(s.lat + dLat)}&view=map`;
}
