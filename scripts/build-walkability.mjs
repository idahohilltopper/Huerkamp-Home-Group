// Walkability for every community and Minneapolis/Saint Paul neighborhood (src/data/walkability.json), from the same
// places as the listing pages' "What's nearby" (src/data/places.json, src/lib/nearby.mjs):
//   - a grid of points every quarter mile across the area's boundary (parks, lakes and industrial land included);
//   - at each point, the everyday walkability score and which places are within a 15-minute walk (0.6 mi straight-line);
//   - per area: the average score, the share of the area within that walk of a grocery store, a park, and a transit stop,
//     and how many of each kind of place are inside the boundary.
// Places only (fair housing): nothing about who lives anywhere. Re-run after scripts/build-nearby-places.py:
//   node scripts/build-walkability.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { inPolys } from '../src/lib/mls-feed.mjs';
import { walkAt, placesOf, walkLabel, KINDS } from '../src/lib/nearby.mjs';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const places = read('src/data/places.json');
const STEP_MI = 0.25;
const COUNT = ['grocery', 'coffee', 'restaurant', 'pharmacy', 'park', 'library', 'gym', 'transit'];

function profile(geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const pts = polys.flatMap((p) => p[0]);
  const [w, s, e, n] = [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
  const dLat = STEP_MI / 69, dLng = STEP_MI / (69 * Math.cos(((s + n) / 2) * Math.PI / 180));
  const grid = [];
  for (let y = s + dLat / 2; y < n; y += dLat) for (let x = w + dLng / 2; x < e; x += dLng) if (inPolys(x, y, polys)) grid.push([x, y]);
  if (grid.length < 3) { // a tiny area: its center points
    for (let y = s; y <= n; y += (n - s) / 4 || 1) for (let x = w; x <= e; x += (e - w) / 4 || 1) if (inPolys(x, y, polys)) grid.push([x, y]);
  }
  if (!grid.length) return null;
  let total = 0;
  const walk = { grocery: 0, park: 0, transit: 0 };
  for (const [x, y] of grid) {
    const r = walkAt(y, x);
    total += r.score;
    for (const k of Object.keys(walk)) if (r.has[k]) walk[k]++;
  }
  const inside = Object.fromEntries(COUNT.map((k) => [k, placesOf(k).filter(([lat, lng]) => lng >= w && lng <= e && lat >= s && lat <= n && inPolys(lng, lat, polys)).length]));
  const pct = (v) => Math.round((v / grid.length) * 100);
  const score = Math.round(total / grid.length);
  return { score, label: walkLabel(score), points: grid.length, sqMi: Math.round(grid.length * STEP_MI * STEP_MI * 10) / 10,
    walk: { grocery: pct(walk.grocery), park: pct(walk.park), transit: pct(walk.transit) }, inside };
}

const out = { built: new Date().toISOString().slice(0, 10), places: places.sources, method: { stepMi: STEP_MI, walkMi: 0.6, points: KINDS.map((k) => `${k.key} ${k.pts}`) }, communities: {}, hoods: {} };
for (const f of read('src/data/geo/communities.geojson').features) { const p = profile(f.geometry); if (p) out.communities[f.properties.slug] = p; }
for (const f of read('src/data/geo/neighborhoods.geojson').features) { const p = profile(f.geometry); if (p) out.hoods[f.properties.slug] = p; }
writeFileSync('src/data/walkability.json', JSON.stringify(out, null, 1));
const top = (o) => Object.entries(o).sort((a, b) => b[1].score - a[1].score).slice(0, 6).map(([k, v]) => `${k} ${v.score}`).join(', ');
console.log(`${Object.keys(out.communities).length} communities, ${Object.keys(out.hoods).length} neighborhoods`);
console.log('Top communities:', top(out.communities));
console.log('Top neighborhoods:', top(out.hoods));
