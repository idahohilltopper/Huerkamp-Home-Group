// POST /api/estimate { zip, type, beds, baths, sqft }: the instant home value estimate (src/lib/estimate.mjs).
// Uses NorthstarMLS sold data, so like every sold display: only while MLS_PUBLIC is "yes" or "preview", only after the
// visitor clicked I AGREE this visit (x-idx-eula), and only from the site's own pages. Each estimate asks Repliers for
// at most a few pages of sales (6 months, then 12 if there are too few).
// Needs REPLIERS_API_KEY (Functions scope); never sends it, or any error text, to the browser.
import { repliers } from '../../src/lib/repliers.mjs';
import { soldQuery, repliersParams, thumbnail, SOLD_DISCLAIMER } from '../../src/lib/sold.mjs';
import { estimateInput, estimate, MIN_COMPS } from '../../src/lib/estimate.mjs';

const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();
const ALLOWED = /^https:\/\/((www\.)?huerkamphomegroup\.com|(www\.)?huerkamphomes\.com|[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app)$|^http:\/\/localhost(:\d+)?$/;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default async (req, _ctx, call = repliers) => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' });
  const origin = req.headers.get('origin');
  if (origin && !ALLOWED.test(origin)) return json(403, { ok: false, error: 'Forbidden' });
  if (!['yes', 'preview'].includes(env('MLS_PUBLIC').toLowerCase())) return json(200, { ok: false, error: 'not-public-yet' });
  if (req.headers.get('x-idx-eula') !== 'agreed') return json(403, { ok: false, error: 'license-not-agreed' });
  const key = env('REPLIERS_API_KEY');
  if (!key) return json(503, { ok: false, error: 'not-configured' });
  const input = estimateInput(await req.json().catch(() => ({})));
  if (input.error) return json(400, { ok: false, error: input.error });
  try {
    let result = null, months = 6;
    for (months of [6, 12]) {
      const q = soldQuery(new URLSearchParams({ place: `zip:${input.zip}`, months: String(months) }));
      const all = [];
      for (let page = 1; page <= 3; page++) {
        const { params, body } = repliersParams(q, { pageSize: 100, page });
        const r = await call(key, '/listings', params, body);
        if (!r.data) { console.error('Repliers estimate', r.status, r.error); return json(502, { ok: false, error: 'mls-error' }); }
        all.push(...(r.data.listings ?? []));
        if ((r.data.listings ?? []).length < 100) break;
      }
      result = estimate(input, all);
      if (!result.error) break;
    }
    if (result.error) return json(200, { ok: false, error: 'not-enough-sales', n: result.n, min: MIN_COMPS, disclaimer: SOLD_DISCLAIMER });
    return json(200, { ok: true, ...result, comps: result.comps.map(thumbnail), months, zip: input.zip, disclaimer: SOLD_DISCLAIMER });
  } catch (e) {
    console.error('estimate', e.message);
    return json(502, { ok: false, error: 'mls-error' });
  }
};

// At most 10 requests a minute from one visitor (Netlify rate limiting), so a bot can't flood it.
export const config = { path: '/api/estimate', rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
