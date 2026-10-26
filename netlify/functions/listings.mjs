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

/** Debug: the same rectangle asked three ways, plus one town by name, to see how Repliers reads the map. */
async function diagnose(key, box) {
  const count = async (params, body) => { const r = await repliers(key, '/listings', { status: 'A', type: 'Sale', resultsPerPage: 1, ...params }, body); return r.data ? r.data.count : `error ${r.status}`; };
  const [[w, n], [e], , [, s0]] = [box[0][0], box[0][1], box[0][2], box[0][3]];
  return {
    postMap: await count({}, { map: box }),
    getMap: await count({ map: JSON.stringify(box) }),
    latLongRange: await count({ minLat: s0, maxLat: n, minLng: w, maxLng: e }),
    cityWayzata: await count({ city: 'Wayzata' }),
  };
}

/** Is the point inside any part of the zone? (ray casting on each part's outer ring) */
export function inside(x, y, zone) {
  if (!isFinite(x) || !isFinite(y)) return false;
  return zone.some(([ring]) => {
    let hit = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  });
}

export default async (req) => {
  const q = new URL(req.url).searchParams;
  // Debug answers need the report passcode; normal answers need the MLS go-ahead.
  const pass = env('REPORT_KEY');
  const given = (req.headers.get('x-report-key') ?? q.get('key') ?? '').trim();
  const debug = q.get('debug') === '1' && !!pass && same(given, pass);
  if (q.get('debug') === '1' && !debug) return json(401, { ok: false, error: 'debug-needs-passcode' }, false);
  if (!debug && env('MLS_PUBLIC').toLowerCase() !== 'yes') return json(200, { ok: false, error: 'not-public-yet' }, false);  // 200, so browsers don't log it as an error
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

  // Ask Repliers for every active home for sale in a plain rectangle around the zone (a detailed outline came back
  // with too few homes), then keep the ones whose map point is inside the shoreline zone ourselves.
  const pts = zone.flatMap((part) => part[0]);
  const [w, s0, e, n] = [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
  const box = [[[w, n], [e, n], [e, s0], [w, s0], [w, n]]];
  const all = new Map();
  let page = 1, boxInfo;
  do {
    const r = await repliers(key, '/listings', { status: 'A', type: 'Sale', resultsPerPage: 100, pageNum: page }, { map: box });
    if (!r.data) return failed(r);
    for (const l of r.data.listings ?? []) all.set(l.mlsNumber, l);
    boxInfo = { count: r.data.count, numPages: r.data.numPages };
    page += 1;
  } while (page <= Math.min(boxInfo.numPages ?? 1, 15));
  const inBox = [...all.values()];
  const noPoint = inBox.filter((l) => !isFinite(parseFloat(l.map?.longitude)) || !isFinite(parseFloat(l.map?.latitude))).length;
  const inZone = inBox.filter((l) => inside(parseFloat(l.map?.longitude), parseFloat(l.map?.latitude), zone));
  const lakefront = inZone.filter(isLakefront);
  const listings = lakefront.map(card).sort((a, b) => String(b.listed).localeCompare(String(a.listed)));
  return json(200, {
    ok: true, updated: new Date().toISOString(), lake, listings, nearby: inZone.length - lakefront.length,
    ...(debug ? { version: 'box-2', parts: [{ count: inZone.length }], box: { ...boxInfo, fetched: inBox.length, withoutMapPoint: noPoint, corners: box[0] },
      tests: await diagnose(key, box), mlsTotal: (await repliers(key, '/listings', { status: 'A', type: 'Sale', resultsPerPage: 1 })).data?.count ?? null,
      photos: inZone.filter((l) => l.images?.length).length, sample: inZone.slice(0, 6).map((l) => ({ mls: l.mlsNumber, address: l.address, lakefront: isLakefront(l), water: waterFields(l) })) } : {}),
  }, !debug);
};

export const config = { path: '/api/listings' };
