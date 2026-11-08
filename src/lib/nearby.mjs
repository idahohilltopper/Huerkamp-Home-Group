// "What's nearby" for one spot (listing pages): the closest everyday places from src/data/places.json
// (scripts/build-nearby-places.py: Overture Maps places + Metro Transit stops) and an "everyday walkability" score.
// Distances are straight-line ("as the crow flies"); a 15-minute walk is taken as 0.6 miles straight-line, about
// 0.75 miles on streets. Places only: no schools, places of worship, demographics or crime (fair housing).
import places from '../data/places.json' with { type: 'json' };

export const WALK_MI = 0.6;
const CELL = 0.02; // degrees, about 1.4 miles north-south
const R = 3958.8;
const toRad = (d) => (d * Math.PI) / 180;
export const miles = (a, b, c, d) => {
  const x = Math.sin(toRad(c - a) / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(toRad(d - b) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const grids = {};
for (const [key, list] of Object.entries(places.cats)) {
  const g = new Map();
  for (const p of list) {
    const k = `${Math.floor(p[0] / CELL)}:${Math.floor(p[1] / CELL)}`;
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(p);
  }
  grids[key] = g;
}

/** Places of one kind within `maxMi`, nearest first, as { p, mi }. */
function within(key, lat, lng, maxMi) {
  const g = grids[key]; if (!g) return [];
  const rLat = Math.ceil(maxMi / 69 / CELL), rLng = Math.ceil(maxMi / (69 * Math.cos(toRad(lat))) / CELL);
  const cy = Math.floor(lat / CELL), cx = Math.floor(lng / CELL), out = [];
  for (let y = cy - rLat; y <= cy + rLat; y++) for (let x = cx - rLng; x <= cx + rLng; x++) {
    for (const p of g.get(`${y}:${x}`) ?? []) { const mi = miles(lat, lng, p[0], p[1]); if (mi <= maxMi) out.push({ p, mi }); }
  }
  return out.sort((a, b) => a.mi - b.mi);
}

export const KINDS = [
  { key: 'grocery', label: 'Grocery store', plural: 'grocery stores', pts: 25 },
  { key: 'restaurant', label: 'Restaurants', plural: 'restaurants', pts: 15, many: true },
  { key: 'coffee', label: 'Coffee shop', plural: 'coffee shops', pts: 10 },
  { key: 'pharmacy', label: 'Pharmacy', plural: 'pharmacies', pts: 10 },
  { key: 'park', label: 'Park, trail or beach', plural: 'parks, trails and beaches', pts: 15 },
  { key: 'transit', label: 'Bus or train stop', plural: 'transit stops', pts: 15 },
  { key: 'library', label: 'Library', plural: 'libraries', pts: 5 },
  { key: 'gym', label: 'Gym or rec center', plural: 'gyms and rec centers', pts: 5 },
];
const SEARCH_MI = 10;

export const fmtMi = (mi) => (mi < 0.1 ? 'under 0.1 mi' : `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} mi`);
export const walkLabel = (s) => (s >= 70 ? 'Very walkable' : s >= 50 ? 'Walkable' : s >= 25 ? 'Some errands on foot' : 'Car-dependent');

/**
 * { rows: [{ key, label, name, mi, walkCount, detail }], score, label, rail } or null outside the data's area.
 * score: points for each kind of place within a 15-minute walk (restaurants: full points at 5 or more).
 */
export function nearby(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  let score = 0;
  const rows = [];
  for (const k of KINDS) {
    const near = within(k.key, lat, lng, SEARCH_MI);
    if (!near.length || (k.key === 'transit' && near[0].mi > 3)) continue;
    const walk = near.filter((n) => n.mi <= WALK_MI);
    if (walk.length) score += k.many ? (walk.length >= 5 ? k.pts : Math.round((k.pts * 2) / 3)) : k.pts;
    const n = near[0];
    rows.push({ key: k.key, label: k.label, plural: k.plural, name: n.p[2], mi: n.mi, walkCount: walk.length, detail: k.key === 'transit' ? n.p[3] : '' });
  }
  if (!rows.length) return null;
  const railNear = within('transit', lat, lng, 3).find((n) => n.p[4] === 1);
  return { rows, score, label: walkLabel(score), rail: railNear ? { name: railNear.p[2], routes: railNear.p[3], mi: railNear.mi } : null };
}

export const nearbySources = places.sources;
export const nearbyBuilt = places.built;
