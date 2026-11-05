// GET /api/geocode?q=14300 Nicollet Ct, Burnsville: a street address -> { ok, lat, lng, address, street, city, zip }.
// Used by the /home-search box (src/scripts/home-search.ts) so a visitor can type their own address: the map moves
// there and they're offered an instant home value estimate for it. Uses the U.S. Census Bureau geocoder (free, public,
// no API key). Minnesota and western Wisconsin only, like the rest of the site. "MN" is assumed when no state is typed.
// Nothing is stored; the address goes only to the Census geocoder.
const ALLOWED = /^https:\/\/((www\.)?huerkamphomegroup\.com|(www\.)?huerkamphomes\.com|[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app)$|^http:\/\/localhost(:\d+)?$/;
const CENSUS = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress';
const json = (status, body, cache = 'no-store') => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': cache } });
const title = (s) => String(s ?? '').toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()).replace(/\b(Mn|Wi)\b/g, (m) => m.toUpperCase());

/** The text to look up, cleaned; null if it isn't a street address. */
export function addressQuery(raw) {
  const q = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (!/^\d{1,6}[a-z]?\s+\S/i.test(q) || /^\d{5}$/.test(q)) return null;
  return /,?\s*\b(mn|minn|minnesota|wi|wis|wisconsin)\b\.?(\s+\d{5})?$/i.test(q) || /\b\d{5}$/.test(q) ? q : `${q}, MN`;
}

/** The first Minnesota or Wisconsin match from a Census answer, or null. */
export function pickMatch(data) {
  const m = (data?.result?.addressMatches ?? []).find((a) => ['MN', 'WI'].includes(a?.addressComponents?.state));
  if (!m) return null;
  const c = m.addressComponents;
  const [street] = String(m.matchedAddress).split(',');
  return { lat: m.coordinates.y, lng: m.coordinates.x, street: title(street), city: title(c.city), state: c.state, zip: c.zip,
    address: `${title(street)}, ${title(c.city)}, ${c.state} ${c.zip}` };
}

export default async (req, _ctx, fetcher = fetch) => {
  if (req.method !== 'GET') return json(405, { ok: false, error: 'GET only' });
  const origin = req.headers.get('origin');
  if (origin && !ALLOWED.test(origin)) return json(403, { ok: false, error: 'Forbidden' });
  const q = addressQuery(new URL(req.url).searchParams.get('q'));
  if (!q) return json(400, { ok: false, error: 'not-an-address' });
  try {
    const u = `${CENSUS}?${new URLSearchParams({ address: q, benchmark: 'Public_AR_Current', format: 'json' })}`;
    const r = await fetcher(u, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) { console.error('geocode', r.status); return json(502, { ok: false, error: 'lookup-failed' }); }
    const hit = pickMatch(await r.json());
    if (!hit) return json(200, { ok: false, error: 'not-found' }, 'public, max-age=3600');
    return json(200, { ok: true, ...hit }, 'public, max-age=86400');
  } catch (e) {
    console.error('geocode', e.message);
    return json(502, { ok: false, error: 'lookup-failed' });
  }
};

// At most 20 lookups a minute from one visitor, so a bot can't flood it.
export const config = { path: '/api/geocode', rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
