// /api/sold?place=burnsville&months=6&min=300000&beds=3&bbox=...&page=2&pins=1
// Recently sold homes, asked of Repliers (NorthstarMLS) when someone looks; each answer is cached a day, since sales
// don't change by the hour. The NorthstarMLS sold-content rules are applied in src/lib/sold.mjs. Like every listing
// display: only while MLS_PUBLIC is "yes" or "preview", and only after the visitor clicked I AGREE this visit.
// Needs REPLIERS_API_KEY in Netlify (Functions scope); never sends it, or any error text, to the browser.
import { repliers } from '../../src/lib/repliers.mjs';
import { soldCard, thumbnail, soldQuery, repliersParams, PAGE, MAX_PINS, SOLD_DISCLAIMER } from '../../src/lib/sold.mjs';

const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();
const VARY = 'query=place|agent|months|min|max|beds|baths|bbox|page|pins,header=x-idx-eula';
const json = (status, body, cache = false) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json',
    ...(cache
      ? { 'cache-control': 'public, max-age=3600', 'netlify-cdn-cache-control': 'public, s-maxage=86400, stale-while-revalidate=86400, durable', 'netlify-vary': VARY }
      : { 'cache-control': 'no-store' }),
  },
});

export default async (req, _ctx, call = repliers) => {
  if (req.method !== 'GET') return json(405, { ok: false, error: 'GET only' });
  if (!['yes', 'preview'].includes(env('MLS_PUBLIC').toLowerCase())) return json(200, { ok: false, error: 'not-public-yet' });
  if (req.headers.get('x-idx-eula') !== 'agreed') return json(403, { ok: false, error: 'license-not-agreed' });
  const key = env('REPLIERS_API_KEY');
  if (!key) return json(503, { ok: false, error: 'not-configured' });
  const sp = new URL(req.url).searchParams;
  const q = soldQuery(sp);
  if (q.unsupported) return json(200, { ok: true, total: 0, page: 1, pages: 1, results: [], pins: [], unsupported: true, disclaimer: SOLD_DISCLAIMER }, true);
  try {
    const { params, body } = repliersParams(q);
    const r = await call(key, '/listings', params, body);
    if (!r.data) { console.error('Repliers sold', r.status, r.error); return json(502, { ok: false, error: 'mls-error' }); }
    const total = r.data.count ?? 0;
    // An agent's sales: only homes they listed (NorthstarMLS doesn't allow the selling agent to be shown on sold homes).
    const mine = (c) => !q.agentName || (c.ownBrokerage && String(c.agent ?? '').toLowerCase() === q.agentName.toLowerCase());
    const results = (r.data.listings ?? []).map((l) => soldCard(l)).filter((c) => c && mine(c)).map(thumbnail);
    let pins = [];
    if (sp.get('pins') === '1') {
      // The map: up to MAX_PINS homes, 100 per request.
      const all = [];
      for (let page = 1; page <= Math.ceil(MAX_PINS / 100); page++) {
        const p = repliersParams(q, { pageSize: 100, page });
        const m = await call(key, '/listings', p.params, p.body);
        const list = m.data?.listings ?? [];
        all.push(...list);
        if (list.length < 100) break;
      }
      pins = all.map((l) => soldCard(l)).filter((c) => c && c.lat != null)
        .map((c) => [c.lat, c.lng, c.soldPrice ?? 0, c.mls, c.photo, c.street ? `${c.street}, ${c.city}` : `${c.city}, MN ${c.zip}`, c.office, c.ownBrokerage, c.soldDate]);
    }
    return json(200, { ok: true, total, page: q.page, pages: Math.max(1, Math.ceil(total / PAGE)), months: q.months, results, pins, disclaimer: SOLD_DISCLAIMER }, true);
  } catch (e) {
    console.error('sold', e.message);
    return json(502, { ok: false, error: 'mls-error' });
  }
};

export const config = { path: '/api/sold' };
