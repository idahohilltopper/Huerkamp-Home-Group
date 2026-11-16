// Old Luxury Presence listing addresses (/properties/<address>-nst<MLS #>, thousands of them in Google): send each to
// that home's page here while it's for sale, otherwise to the home search for its ZIP code (or all homes). Reached by a
// rewrite in public/_redirects (scripts/write-redirects.mjs), so the visitor gets a single 301.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { INDEX_FILE } from '../../src/lib/search-index.mjs';

let index;
function slugFor(mls) {
  if (index === undefined) {
    const here = new URL('.', import.meta.url).pathname;
    const file = [join(process.cwd(), INDEX_FILE), join(here, '../../', INDEX_FILE), join(here, INDEX_FILE), join('/var/task', INDEX_FILE)].find((p) => existsSync(p));
    try { index = file ? JSON.parse(readFileSync(file, 'utf8')) : null; } catch { index = null; }
  }
  const cols = index?.fields ?? [];
  const iM = cols.indexOf('mls'), iS = cols.indexOf('slug');
  const row = (index?.rows ?? []).find((r) => String(Array.isArray(r) ? r[iM] : r.mls) === mls);
  return row ? (Array.isArray(row) ? row[iS] : row.slug) : null;
}

// Old Ylopo listing pages (/home-search/listings/<Ylopo id>-<street>, e.g. 8557196039825622466-1060-230th-Street-W): no MLS
// number in the address, so match the street against homes for sale now (Search Console, Nov 16, 2026: these still show
// in Google for street-address searches and all went to the plain home search).
const ABBR = { street: 'st', avenue: 'ave', drive: 'dr', road: 'rd', lane: 'ln', court: 'ct', circle: 'cir', place: 'pl',
  boulevard: 'blvd', parkway: 'pkwy', terrace: 'ter', trail: 'trl', way: 'way', north: 'n', south: 's', east: 'e', west: 'w',
  northeast: 'ne', northwest: 'nw', southeast: 'se', southwest: 'sw', point: 'pt', highway: 'hwy', curve: 'curv', crossing: 'xing' };
export const streetKey = (s) => String(s ?? '').toLowerCase().replace(/[#.,]/g, ' ').replace(/\b(unit|apt|apartment|suite|ste)\b/g, ' ')
  .split(/[\s-]+/).filter(Boolean).map((w) => ABBR[w] ?? w).join(' ');
function slugForStreet(street) {
  slugFor('');
  const cols = index?.fields ?? [];
  const iS = cols.indexOf('slug'), iT = cols.indexOf('street');
  const want = streetKey(street);
  if (!want || !/^\d/.test(want)) return null;
  const row = (index?.rows ?? []).find((r) => streetKey(Array.isArray(r) ? r[iT] : r.street) === want);
  return row ? (Array.isArray(row) ? row[iS] : row.slug) : null;
}

/** Where an old /properties/... path should go now. */
export function target(path) {
  const p = decodeURIComponent(String(path ?? '')).toLowerCase().replace(/^\/+|\/+$/g, '');
  if (p === 'sale' || p === 'featured') return '/home-search?team=1';
  const ylopo = p.match(/^(?:home-search\/)?listings\/\d+-(.+)$/)?.[1]; // req.url keeps the visitor's address after a rewrite
  if (ylopo !== undefined) { const slug = slugForStreet(ylopo); return slug ? `/homes/${slug}` : '/home-search'; }
  const mls = p.match(/(?:^|-)(?:nst)?(\d{6,8})$/)?.[1];
  const slug = mls ? slugFor(mls) : null;
  if (slug) return `/homes/${slug}`;
  const zip = p.match(/-mn-(?:us-)?(\d{5})(?:-|$)/)?.[1];
  return zip ? `/home-search?place=zip:${zip}` : '/home-search';
}

export default async (req) => {
  const path = new URL(req.url).pathname.replace(/^\/api\/old-property\/?/, '');
  return new Response(null, { status: 301, headers: { location: target(path), 'cache-control': 'public, max-age=3600' } });
};

export const config = { path: '/api/old-property/*' };
