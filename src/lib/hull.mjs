// Shapes sent to Repliers as one ring (it reads extra rings as holes): src/lib/alerts.mjs, src/lib/sold.mjs.
/** The smallest convex shape around these points (monotone chain), closed. */
export function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo.at(-2), lo.at(-1), q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (hi.length >= 2 && cross(hi.at(-2), hi.at(-1), q) <= 0) hi.pop(); hi.push(q); }
  const ring = [...lo.slice(0, -1), ...hi.slice(0, -1)];
  ring.push(ring[0]);
  return ring;
}
