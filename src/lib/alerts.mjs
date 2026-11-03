// Saved searches and new-listing alert emails, run by Repliers (Professional plan): the visitor saves a search on the
// site, Repliers stores it under a "client" and emails matching new homes (and price changes) from
// alerts.huerkamphomes.com. Links in those emails come back to the site (src/pages/listings/*, search, profile,
// unsubscribe). Kept apart from netlify/functions/alerts.mjs so the translation can be tested without calling Repliers.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import shores from '../data/geo/lake-shores.json' with { type: 'json' };

// Community and neighborhood outlines (bundled with the function through netlify.toml included_files).
const geo = {};
function shapes(name) {
  if (geo[name]) return geo[name];
  const here = new URL('.', import.meta.url).pathname;
  const file = [join(process.cwd(), 'src/data/geo', name), join(here, '../data/geo', name), join(here, '../../src/data/geo', name), join('/var/task/src/data/geo', name)].find((f) => existsSync(f));
  geo[name] = file ? JSON.parse(readFileSync(file, 'utf8')) : { features: [] };
  return geo[name];
}

export const FREQUENCIES = ['instant', 'daily', 'weekly'];
const MAX_POINTS = 150;
const int = (v) => { const n = parseInt(String(v ?? ''), 10); return Number.isFinite(n) && n > 0 ? n : null; };

/** Fewer points for a long outline (Repliers stores the shape with every saved search). */
function thin(ring) {
  if (ring.length <= MAX_POINTS) return ring;
  const step = Math.ceil(ring.length / MAX_POINTS);
  const out = ring.filter((_, i) => i % step === 0);
  out.push(ring[0]);
  return out;
}
/** Outer rings of a Polygon or MultiPolygon, as Repliers' "map" (one ring per shape). */
function rings(geom) {
  if (!geom) return null;
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  return polys.map((p) => thin(p[0].map(([x, y]) => [Math.round(x * 1e5) / 1e5, Math.round(y * 1e5) / 1e5])));
}
const shapeOf = (place) => {
  if (place.startsWith('hood:')) return rings(shapes('neighborhoods.geojson').features.find((f) => f.properties.slug === place.slice(5))?.geometry);
  if (place.startsWith('lake:')) { const s = shores[place.slice(5)]; return s ? rings({ type: 'MultiPolygon', coordinates: s }) : null; }
  return rings(shapes('communities.geojson').features.find((f) => f.properties.slug === place)?.geometry);
};
const box = ([w, s, e, n]) => [[[w, n], [e, n], [e, s], [w, s], [w, n]]];

/**
 * The site's search (the same names as /home-search's address: place, min, max, beds, baths, type, bbox) as a Repliers
 * saved search. Returns { body } or { error } in plain words. The map area wins over the place when both are set,
 * because that's what the visitor was looking at. Filters Repliers alerts can't use (lakefront, new construction,
 * 1+ acre, our team's listings) are left out and listed in `skipped`.
 */
export function toSavedSearch(q, { clientId, agentId, frequency = 'daily', name = '' } = {}) {
  const place = String(q.place ?? '').split(',')[0].trim();
  const bbox = String(q.bbox ?? '').split(',').map(Number);
  let map = null;
  if (bbox.length === 4 && bbox.every(Number.isFinite) && bbox[0] < bbox[2] && bbox[1] < bbox[3]) map = box(bbox);
  else if (place && !place.startsWith('zip:')) map = shapeOf(place);
  if (!map?.length) return { error: place.startsWith('zip:') ? 'To get alerts for a ZIP code, move the map to that area (or pick a city), then save.' : 'Pick a city, neighborhood or lake, or move the map to an area, then save.' };
  const body = {
    clientId, ...(agentId ? { agentId } : {}),
    name: String(name).slice(0, 50) || 'My home search',
    type: 'sale',
    class: q.type === 'condo' ? ['condo'] : ['residential', 'condo'],
    minPrice: int(q.min) ?? 0,
    maxPrice: int(q.max) ?? 100_000_000,
    map,
    notificationFrequency: FREQUENCIES.includes(frequency) ? frequency : 'daily',
    priceChangeNotifications: true,
    soldNotifications: false,
  };
  if (int(q.beds)) body.minBeds = int(q.beds);
  if (int(q.baths)) body.minBaths = int(q.baths);
  if (body.minPrice > body.maxPrice) return { error: 'The minimum price is higher than the maximum.' };
  const skipped = ['lakefront', 'new', 'acres', 'team'].filter((k) => q[k]);
  return { body, skipped };
}

/** A Repliers saved search back as a /home-search address: the area as a map box, plus price and rooms. */
export function toSiteQuery(s) {
  const p = new URLSearchParams();
  const pts = (Array.isArray(s.map) ? s.map : []).flat(3).filter((v) => typeof v === 'number');
  if (pts.length >= 4) {
    const xs = pts.filter((_, i) => i % 2 === 0), ys = pts.filter((_, i) => i % 2 === 1);
    p.set('bbox', [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map((n) => n.toFixed(4)).join(','));
  }
  if (int(s.minPrice)) p.set('min', String(int(s.minPrice)));
  if (int(s.maxPrice) && int(s.maxPrice) < 100_000_000) p.set('max', String(int(s.maxPrice)));
  if (int(s.minBeds)) p.set('beds', String(int(s.minBeds)));
  if (int(s.minBaths)) p.set('baths', String(int(s.minBaths)));
  if (Array.isArray(s.class) && s.class.length === 1 && s.class[0] === 'condo') p.set('type', 'condo');
  return p;
}

/** The saved search's current price and room filters in plain words (its name can be older than an edit). */
export function describeSaved(s) {
  const bits = [];
  const money = (n) => (n >= 1e6 ? `$${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M` : `$${Math.round(n / 1000)}K`);
  if (int(s.minPrice) || (int(s.maxPrice) && int(s.maxPrice) < 100_000_000)) bits.push(`${int(s.minPrice) ? money(s.minPrice) : 'any'} to ${int(s.maxPrice) && int(s.maxPrice) < 100_000_000 ? money(s.maxPrice) : 'any'}`);
  if (int(s.minBeds)) bits.push(`${s.minBeds}+ beds`);
  if (int(s.minBaths)) bits.push(`${s.minBaths}+ baths`);
  if (Array.isArray(s.class) && s.class.length === 1 && s.class[0] === 'condo') bits.push('condos');
  return bits.join(' · ') || 'Any price';
}
