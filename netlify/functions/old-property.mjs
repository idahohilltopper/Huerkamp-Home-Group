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

/** Where an old /properties/... path should go now. */
export function target(path) {
  const p = decodeURIComponent(String(path ?? '')).toLowerCase().replace(/^\/+|\/+$/g, '');
  if (p === 'sale' || p === 'featured') return '/home-search?team=1';
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
