// MLS listings for the site's pages, from Repliers (NorthstarMLS).
//   /api/listings?lake=<slug>    active lakefront listings on one lake (inside its shoreline zone)
//   /api/listings?mls=<number>   one listing
// Listings show on the site only once MLS_PUBLIC=yes is set in Netlify (after the NorthstarMLS IDX license is
// approved); until then the lake sections stay hidden.
// Add &debug=1 with the report passcode (x-report-key header, as the /report page's "Check MLS feed" button sends it,
// or &key=) to see counts and the MLS's water fields (to check the lakefront filter).
// The API key lives in Netlify (REPLIERS_API_KEY), never in this repository. Answers are cached for 15 minutes.

import { timingSafeEqual } from 'node:crypto';
import shores from '../../src/data/geo/lake-shores.json' with { type: 'json' };
import { repliers, card, detail, isLakefront, waterFields } from '../../src/lib/repliers.mjs';

const json = (status, body, cache = true) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      // Good answers: browsers keep them 5 minutes, Netlify 15. Errors are never kept, so a fix shows at once.
      ...(cache && status === 200
        ? { 'cache-control': 'public, max-age=300', 'netlify-cdn-cache-control': 'public, s-maxage=900, stale-while-revalidate=3600, durable', 'netlify-vary': 'query' }
        : { 'cache-control': 'no-store' }),
    },
  });

// Repliers says "not authorized" until the MLS data license is approved.
const failed = (r) => {
  console.error('Repliers error', r.status, r.error);
  return json(502, { ok: false, error: r.status === 401 || r.status === 403 ? 'not-authorized' : 'mls-error', status: r.status }, false);
};

const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();
const same = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export default async (req) => {
  const q = new URL(req.url).searchParams;
  // Debug answers need the report passcode; normal answers need the MLS go-ahead.
  const pass = env('REPORT_KEY');
  const given = (req.headers.get('x-report-key') ?? q.get('key') ?? '').trim();
  const debug = q.get('debug') === '1' && !!pass && same(given, pass);
  if (q.get('debug') === '1' && !debug) return json(401, { ok: false, error: 'debug-needs-passcode' }, false);
  if (!debug && env('MLS_PUBLIC').toLowerCase() !== 'yes') return json(403, { ok: false, error: 'not-public-yet' }, false);
  const key = env('REPLIERS_API_KEY');
  if (!key) {
    if (!debug) return json(503, { ok: false, error: 'not-configured' }, false);
    // With &debug=1, help find a missing key: the NAMES of the Repliers / Follow Up Boss settings this site sees
    // (never their values), and which site and deploy answered.
    const names = Object.keys({ ...process.env, ...(globalThis.Netlify?.env?.toObject?.() ?? {}) }).filter((n) => /repl|fub/i.test(n)).sort();
    return json(503, { ok: false, error: 'not-configured', settingsFound: names, site: process.env.SITE_NAME ?? process.env.URL ?? null, context: process.env.CONTEXT ?? globalThis.Netlify?.context?.deploy?.context ?? null }, false);
  }

  const mls = q.get('mls');
  if (mls) {
    if (!/^[A-Za-z0-9-]{3,20}$/.test(mls)) return json(400, { ok: false, error: 'bad-mls' }, false);
    const r = await repliers(key, `/listings/${encodeURIComponent(mls)}`);
    if (r.status === 404) return json(404, { ok: false, error: 'not-found' }, false);
    if (!r.data) return failed(r);
    return json(200, { ok: true, updated: new Date().toISOString(), listing: detail(r.data), ...(debug ? { water: waterFields(r.data), keys: Object.keys(r.data) } : {}) }, !debug);
  }

  const lake = q.get('lake');
  const zone = lake && shores[lake];
  if (!zone) return json(400, { ok: false, error: 'unknown-lake' }, false);

  // One request per part of the shoreline zone (most lakes have one); active homes for sale, every page.
  const all = new Map(), parts = [];
  for (const part of zone) {
    let page = 1, info;
    do {
      const r = await repliers(key, '/listings', { status: 'A', type: 'Sale', resultsPerPage: 100, pageNum: page }, { map: part });
      if (!r.data) return failed(r);
      for (const l of r.data.listings ?? []) all.set(l.mlsNumber, l);
      info = { points: part[0].length, count: r.data.count, numPages: r.data.numPages, returned: (r.data.listings ?? []).length };
      page += 1;
    } while (page <= Math.min(info.numPages ?? 1, 10));
    parts.push(info);
  }
  const inZone = [...all.values()];
  const lakefront = inZone.filter(isLakefront);
  const listings = lakefront.map(card).sort((a, b) => String(b.listed).localeCompare(String(a.listed)));
  return json(200, {
    ok: true, updated: new Date().toISOString(), lake, listings, nearby: inZone.length - lakefront.length,
    ...(debug ? { parts, mlsTotal: (await repliers(key, '/listings', { status: 'A', type: 'Sale', resultsPerPage: 1 })).data?.count ?? null,
      photos: inZone.filter((l) => l.images?.length).length, sample: inZone.slice(0, 6).map((l) => ({ mls: l.mlsNumber, address: l.address, lakefront: isLakefront(l), water: waterFields(l) })) } : {}),
  }, !debug);
};

export const config = { path: '/api/listings' };
