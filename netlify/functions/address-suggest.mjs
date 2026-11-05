// GET /api/address-suggest?q=17000 Kenw&s=<session>: street addresses that match what the visitor has typed so far,
// for the home page search box and the home value form (src/scripts/address-suggest.ts). Uses Google Places
// Autocomplete (Places API (New)) with GOOGLE_PLACES_API_KEY, limited to street addresses in Minnesota and western
// Wisconsin. Answers { ok, suggestions: [{ text, main, secondary }] }; without a key, or if Google fails, an empty list
// (the boxes still work by typing the whole address). Nothing is stored. Each answer is cached for a day.
// Cost note: Google bills these "Autocomplete Requests" per call after its monthly free allowance; the browser waits
// until the visitor pauses typing and has typed a house number and a few letters, so a lookup is usually 3 to 6 calls.
const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();
const ALLOWED = /^https:\/\/((www\.)?huerkamphomegroup\.com|(www\.)?huerkamphomes\.com|[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app)$|^http:\/\/localhost(:\d+)?$/;
const URL_ = 'https://places.googleapis.com/v1/places:autocomplete';
// Minnesota plus western Wisconsin.
const AREA = { rectangle: { low: { latitude: 43.4, longitude: -97.3 }, high: { latitude: 49.4, longitude: -90.0 } } };

const json = (status, body, cache = false) => new Response(JSON.stringify(body), { status, headers: {
  'content-type': 'application/json',
  ...(cache ? { 'cache-control': 'public, max-age=3600', 'netlify-cdn-cache-control': 'public, s-maxage=86400', 'netlify-vary': 'query=q' } : { 'cache-control': 'no-store' }),
} });

/** The typed text, if it's far enough along to look up: a house number, a space and at least 2 letters. */
export function suggestQuery(raw) {
  const q = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, 100);
  return /^\d{1,6}[a-z]?\s+[a-z0-9].*[a-z]/i.test(q) && q.replace(/^\d+\s*/, '').length >= 2 ? q : null;
}

/** Google's answer as short suggestions, Minnesota and Wisconsin only, "USA" trimmed. */
export function toSuggestions(data) {
  const out = [];
  for (const s of data?.suggestions ?? []) {
    const p = s.placePrediction;
    if (!p) continue;
    const text = String(p.text?.text ?? '').replace(/,\s*USA$/, '');
    if (!/,\s*(MN|WI)\b/.test(text)) continue;
    const main = p.structuredFormat?.mainText?.text ?? text.split(',')[0];
    const secondary = String(p.structuredFormat?.secondaryText?.text ?? text.split(',').slice(1).join(',')).replace(/,\s*USA$/, '').trim();
    out.push({ text, main, secondary });
  }
  return out.slice(0, 5);
}

export default async (req, _ctx, fetcher = fetch) => {
  if (req.method !== 'GET') return json(405, { ok: false, error: 'GET only' });
  const origin = req.headers.get('origin');
  if (origin && !ALLOWED.test(origin)) return json(403, { ok: false, error: 'Forbidden' });
  const u = new URL(req.url);
  const q = suggestQuery(u.searchParams.get('q'));
  if (!q) return json(200, { ok: true, suggestions: [] });
  const key = env('GOOGLE_PLACES_API_KEY');
  if (!key) return json(200, { ok: false, error: 'not-configured', suggestions: [] });
  const session = (u.searchParams.get('s') ?? '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
  try {
    const r = await fetcher(URL_, {
      method: 'POST',
      headers: { 'X-Goog-Api-Key': key, 'content-type': 'application/json',
        'X-Goog-FieldMask': 'suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat' },
      body: JSON.stringify({ input: q, includedRegionCodes: ['us'], includedPrimaryTypes: ['street_address', 'premise', 'subpremise'],
        locationRestriction: AREA, ...(session ? { sessionToken: session } : {}) }),
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) { console.error('address-suggest', r.status, (await r.text()).slice(0, 300)); return json(200, { ok: false, error: 'google-error', suggestions: [] }); }
    return json(200, { ok: true, suggestions: toSuggestions(await r.json()) }, true);
  } catch (e) {
    console.error('address-suggest', e.message);
    return json(200, { ok: false, error: 'google-error', suggestions: [] });
  }
};

// At most 60 a minute from one visitor (a fast typist makes about one a second), so a bot can't run up the bill.
export const config = { path: '/api/address-suggest', rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
