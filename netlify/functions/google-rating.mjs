// /api/google-rating: the team's current Google star rating and review count, straight from Google (Places API).
// The weekly "site facts" routine reads it and updates src/data/reviews.json, so the site never shows a stale count.
// Returns only public facts (rating, count, the Maps link): no review text, nothing private.
// Needs GOOGLE_PLACES_API_KEY in Netlify (a Google Cloud key restricted to the Places API (New)); optional
// GOOGLE_PLACE_ID (ChIJ...) skips the lookup by name. Without a key it answers 503 and the site keeps its last count.
// Answers are cached for a day, so the key is used at most a few times a day however often this is called.

const CID = '11174322906314648100'; // the Huerkamp Home Group listing on Google Maps (Burnsville)
const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();
const FIELDS = 'id,displayName,rating,userRatingCount,googleMapsUri';

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      ...(status === 200
        ? { 'cache-control': 'public, max-age=3600', 'netlify-cdn-cache-control': 'public, s-maxage=86400, durable', 'netlify-vary': 'query' }
        : { 'cache-control': 'no-store' }),
    },
  });

export async function findPlace(key, placeId, fetcher = fetch) {
  const headers = { 'X-Goog-Api-Key': key, 'content-type': 'application/json' };
  if (placeId) {
    const r = await fetcher(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, { headers: { ...headers, 'X-Goog-FieldMask': FIELDS } });
    return r.ok ? r.json() : { error: r.status };
  }
  const r = await fetcher('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { ...headers, 'X-Goog-FieldMask': FIELDS.split(',').map((f) => `places.${f}`).join(',') },
    body: JSON.stringify({ textQuery: 'Huerkamp Home Group, Burnsville, MN' }),
  });
  if (!r.ok) return { error: r.status };
  const places = (await r.json()).places ?? [];
  // Only the team's own listing: matched by its Maps id, or failing that its exact name.
  return places.find((p) => (p.googleMapsUri ?? '').includes(`cid=${CID}`)) ?? places.find((p) => p.displayName?.text === 'Huerkamp Home Group') ?? { error: 'not-found' };
}

export default async (req, _ctx, fetcher = fetch) => {
  if (req.method !== 'GET') return json(405, { ok: false });
  const key = env('GOOGLE_PLACES_API_KEY');
  if (!key) return json(503, { ok: false, error: 'not-configured' });
  try {
    const p = await findPlace(key, env('GOOGLE_PLACE_ID'), fetcher);
    if (p.error || typeof p.rating !== 'number' || typeof p.userRatingCount !== 'number') {
      console.error('Places API', p.error ?? 'missing fields');
      return json(502, { ok: false, error: 'google-error' });
    }
    return json(200, { ok: true, source: 'Google Places API', rating: p.rating, count: p.userRatingCount, placeId: p.id, url: p.googleMapsUri, checked: new Date().toISOString() });
  } catch (e) {
    console.error('Places API', e.message);
    return json(502, { ok: false, error: 'google-error' });
  }
};

export const config = { path: '/api/google-rating' };
