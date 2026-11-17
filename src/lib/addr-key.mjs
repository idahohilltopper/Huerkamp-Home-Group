// A street address reduced to a comparable key, so "20 NE 2nd St" (Google) and "20 2nd Street NE #1203" (the MLS) match:
// the house number (or a range "712-844"), then the street words with suffixes abbreviated, with the direction words set
// apart and sorted. Used by the condo-building pages (src/data/condo-buildings.ts) and their sold homes (src/lib/sold.mjs).
const ABBR = { street: 'st', avenue: 'ave', drive: 'dr', road: 'rd', lane: 'ln', court: 'ct', circle: 'cir', place: 'pl', boulevard: 'blvd', parkway: 'pkwy', terrace: 'ter', trail: 'trl', north: 'n', south: 's', east: 'e', west: 'w', northeast: 'ne', northwest: 'nw', southeast: 'se', southwest: 'sw', saint: 'st' };
const DIRS = new Set(['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']);
export function addrKey(street) {
  const s = String(street ?? '').toLowerCase().replace(/#.*$/, '').replace(/\b(unit|apt|suite|ste)\b.*$/, '').replace(/[.,]/g, ' ').trim();
  const m = s.match(/^(\d+)(?:-(\d+))?\s+(.+)$/);
  if (!m) return null;
  const words = m[3].split(/\s+/).map((w) => ABBR[w] ?? w);
  const dirs = words.filter((w) => DIRS.has(w)).sort(), rest = words.filter((w) => !DIRS.has(w));
  return { lo: +m[1], hi: m[2] ? +m[2] : +m[1], key: `${rest.join(' ')}|${dirs.join(' ')}` };
}
/** True when the address falls inside one of a building's addresses (a range covers every number in it). */
export const atAddress = (street, addresses) => { const k = addrKey(street); return !!k && addresses.some((a) => { const b = addrKey(a); return b && b.key === k.key && k.lo >= b.lo && k.lo <= b.hi; }); };
