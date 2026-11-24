// GET /api/public-record?address=14300 Nicollet Ct&zip=55306 -> { ok, last: {price, date}, prior, source } or
// { ok: false, error }. Shown on /home-estimate as "County records: last sold for $X in [month year]", in its own box
// labeled "Source: Public Record Data" (src/lib/public-record.mjs has the Repliers terms and the coverage notes).
// The address goes to the U.S. Census geocoder (free, no key) for its map point, then to Repliers' county records near
// that point; the parcel must match the street address exactly, and the unit ("#204") for condos and townhomes.
// The unit is taken off before the Census lookup and used only to pick the right parcel. Only sale prices and dates come back: never owner
// names. Not MLS data, so no I AGREE needed. Needs REPLIERS_API_KEY (Functions scope); never sends it or error text out.
import { repliers } from '../../src/lib/repliers.mjs';
import { pickParcel, publicView, splitUnit } from '../../src/lib/public-record.mjs';
import { addressQuery, pickMatch } from './geocode.mjs';

const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();
const ALLOWED = /^https:\/\/((www\.)?huerkamphomegroup\.com|(www\.)?huerkamphomes\.com|[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app)$|^http:\/\/localhost(:\d+)?$/;
const CENSUS = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress';
const json = (status, body, cache = 'no-store') => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': cache } });

export default async (req, _ctx, { fetcher = fetch, call = repliers } = {}) => {
  if (req.method !== 'GET') return json(405, { ok: false, error: 'GET only' });
  const origin = req.headers.get('origin');
  if (origin && !ALLOWED.test(origin)) return json(403, { ok: false, error: 'Forbidden' });
  const key = env('REPLIERS_API_KEY');
  if (!key) return json(503, { ok: false, error: 'not-configured' });
  const u = new URL(req.url);
  const zip = (u.searchParams.get('zip') ?? '').replace(/\D/g, '').slice(0, 5);
  const { street, unit } = splitUnit(u.searchParams.get('address'));
  const q = addressQuery(`${street}${zip ? ` ${zip}` : ''}`);
  if (!q) return json(400, { ok: false, error: 'not-an-address' });
  try {
    const g = await fetcher(`${CENSUS}?${new URLSearchParams({ address: q, benchmark: 'Public_AR_Current', format: 'json' })}`, { signal: AbortSignal.timeout(8000) });
    const hit = g.ok ? pickMatch(await g.json()) : null;
    if (!hit) return json(200, { ok: false, error: 'not-found' });
    const r = await call(key, '/locations', { source: 'PublicRecord', type: 'property', lat: hit.lat, long: hit.lng, radius: 0.15, resultsPerPage: 100 });
    if (!r.data) { console.error('public-record', r.status); return json(502, { ok: false, error: 'lookup-failed' }); }
    const parcel = pickParcel(r.data.locations, hit.street, unit);
    if (!parcel) return json(200, { ok: false, error: 'not-found' }, 'public, max-age=3600');
    return json(200, publicView(parcel), 'public, max-age=86400');
  } catch (e) {
    console.error('public-record', e.message);
    return json(502, { ok: false, error: 'lookup-failed' });
  }
};

// At most 10 lookups a minute from one visitor, so a bot can't flood it.
export const config = { path: '/api/public-record', rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
