// A boundary the visitor drew on the search map ("Draw boundary"): poly=lng,lat;lng,lat;... in the address, at most
// 60 points. Used by the home search (src/lib/search-index.mjs), sold homes (src/lib/sold.mjs, sent to Repliers as one
// ring) and the map script. One ring only: Repliers reads extra rings as holes (src/lib/hull.mjs).
export const MAX_POINTS = 60;

/** The drawn shape as [[lng, lat], ...] (not closed), or null if it isn't a usable Twin Cities-sized shape. */
export function parsePoly(text) {
  const pts = String(text ?? '').split(';').map((p) => p.split(',').map(Number)).filter((p) => p.length === 2 && p.every(Number.isFinite));
  if (pts.length < 3 || pts.length > MAX_POINTS) return null;
  if (!pts.every(([x, y]) => x > -98 && x < -89 && y > 42 && y < 50)) return null; // Minnesota and nearby only
  return pts;
}

/** The shape for the address: rounded to about 10 m. */
export const polyParam = (pts) => pts.map(([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`).join(';');

/** True if the point is inside the shape (ray casting). */
export function inPoly(lng, lat, pts) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** west, south, east, north around the shape. */
export const polyBox = (pts) => [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
