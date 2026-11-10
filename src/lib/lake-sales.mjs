// Lake sales snapshot for the Twin Cities lake pages: for each lake, how many lakefront homes sold and their median
// sale price over the last 12 complete months, next to the 12 months before. Downloaded once per site build:
//   - sold homes (NorthstarMLS via Repliers, status U / lastStatus Sld) in the last 24 complete months, asked for
//     inside each lake's 200 m shoreline zone (src/data/geo/lake-shores.json), one request per lake (Repliers reads
//     several rings in one "map" as one shape with holes, so batching lakes returned only the first lake's sales);
//   - kept when the MLS marks the home lakefront, it isn't land, the seller didn't choose "Advertising: No", and its
//     map point is in that lake's shoreline zone (the same rule as the lake pages' homes for sale and sold homes).
// Only counts and medians are kept here (no addresses or single sale prices); a median needs 3 or more sales.
// About 443 requests, so the result is kept between builds (.cache-keep/, saved by netlify-plugin-cache in netlify.toml)
// and downloaded again only once a week or when a new month starts.
// Local previews: LAKE_SALES_FIXTURE is a saved copy of the result, for checking the layout.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { inPolys, mlsMode, homeType } from './mls-feed.mjs';
import { repliers, isLakefront } from './repliers.mjs';
import { soldChoices } from './sold.mjs';

const root = pathToFileURL(`${process.cwd()}/`);
const CACHE = new URL('.cache-keep/lake-sales.json', root);
const WEEK = 7 * 864e5;
const shores = JSON.parse(readFileSync(new URL('src/data/geo/lake-shores.json', root), 'utf8'));
export const MIN_FOR_MEDIAN = 3;
const POINTS = 80, PARALLEL = 2;

const boxes = Object.fromEntries(Object.entries(shores).map(([slug, parts]) => {
  const pts = parts.flat(2);
  return [slug, [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))]];
}));
const thin = (ring) => {
  const r = ring.map(([x, y]) => [Math.round(x * 1e5) / 1e5, Math.round(y * 1e5) / 1e5]);
  if (r.length <= POINTS) return r;
  const step = Math.ceil(r.length / POINTS), out = r.filter((_, i) => i % step === 0);
  out.push(r[0]);
  return out;
};
const lakesAt = (x, y) => Object.keys(shores).filter((s) => {
  const [w, so, e, n] = boxes[s];
  return x >= w && x <= e && y >= so && y <= n && inPolys(x, y, shores[s]);
});
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };
const stat = (prices) => ({ sold: prices.length, median: prices.length >= MIN_FOR_MEDIAN ? median(prices) : null });

const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
/** One request, tried up to 4 times when Repliers is busy (429), has a server error (5xx) or the network drops. */
async function ask(key, params, body) {
  let last = '';
  for (let i = 0; i < 6; i++) {
    if (i) await wait(1500 * 2 ** i); // 3, 6, 12, 24, 48 seconds: Repliers says 429 when asked too fast
    const r = await repliers(key, '/listings', params, body).catch((e) => ({ status: 0, data: null, error: String(e?.message ?? e) }));
    if (r.data) return r;
    last = `${r.status} ${String(r.error ?? '').slice(0, 120)}`;
    if (r.status && r.status !== 429 && r.status < 500) break; // a bad request won't get better by asking again
  }
  throw new Error(`Repliers ${last}`);
}

async function soldIn(key, map, since) {
  const out = [];
  for (let page = 1; page <= 30; page++) {
    const r = await ask(key, { status: 'U', lastStatus: 'Sld', type: 'Sale', minSoldDate: since, sortBy: 'soldDateDesc',
      resultsPerPage: 100, pageNum: page, fields: 'mlsNumber,soldPrice,soldDate,status,lastStatus,class,type,map,details,permissions' }, { map });
    out.push(...(r.data.listings ?? []));
    if (page >= (r.data.numPages ?? 1)) break;
  }
  return out;
}

/** The 12-month windows: { now: [from, to), before: [from, to), label } with "to" the first day of this month. */
export function windows(at = new Date()) {
  const d = (y, m) => new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  const y = at.getUTCFullYear(), m = at.getUTCMonth();
  return { now: [d(y - 1, m), d(y, m)], before: [d(y - 2, m), d(y - 1, m)],
    label: new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    fromLabel: new Date(Date.UTC(y - 1, m, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) };
}

/** { at, mode, through, from, lakes: { <slug>: { now: {sold, median}, before: {sold, median} } } }; lakes empty when off. */
let loading;
export function loadLakeSales() {
  return (loading ??= (async () => {
    const w = windows();
    const empty = { at: null, mode: 'off', through: w.label, from: w.fromLabel, lakes: {} };
    if (process.env.LAKE_SALES_FIXTURE && process.env.NETLIFY !== 'true') return JSON.parse(readFileSync(process.env.LAKE_SALES_FIXTURE, 'utf8'));
    const mode = mlsMode();
    const key = (process.env.REPLIERS_API_KEY ?? '').trim();
    if (mode === 'off' || !key || (process.env.MLS_FIXTURE && process.env.NETLIFY !== 'true')) return empty;
    // Kept from an earlier build (or an earlier page of this one) while it covers the same months and is under a week old.
    if (existsSync(CACHE)) {
      try {
        const old = JSON.parse(readFileSync(CACHE, 'utf8'));
        if (old.through === w.label && old.version === 2 && Date.now() - Date.parse(old.at) < WEEK) return old;
      } catch { /* download again */ }
    }
    try {
      const started = Date.now();
      // One request per shoreline part (443 for 442 lakes), six at a time.
      // A lake whose request still fails after the retries is listed in "failed": its page shows no snapshot, rather than
      // a wrong "no homes sold". More than a quarter failing means something bigger is wrong: keep last week's snapshot.
      const jobs = Object.keys(shores).flatMap((s) => shores[s].map((poly) => ({ slug: s, map: [thin(poly[0])] })));
      const raw = new Map();
      const failed = new Set();
      let next = 0, firstError = '';
      await Promise.all(Array.from({ length: PARALLEL }, async () => {
        while (next < jobs.length) {
          const job = jobs[next++];
          try { for (const l of await soldIn(key, job.map, w.before[0])) raw.set(l.mlsNumber, l); }
          catch (e) { failed.add(job.slug); firstError ||= String(e?.message ?? e); }
        }
      }));
      // A second, slower pass for the lakes Repliers turned away (429 Too Many Requests: 12 of 443 on Nov 8, 2026):
      // after a pause, one request at a time, so those lake pages don't go a week without their snapshot.
      if (failed.size && failed.size <= jobs.length / 4) {
        await wait(30000);
        const again = jobs.filter((j) => failed.has(j.slug));
        const okNow = new Set(), stillBad = new Set();
        for (const job of again) {
          try { for (const l of await soldIn(key, job.map, w.before[0])) raw.set(l.mlsNumber, l); okNow.add(job.slug); }
          catch { stillBad.add(job.slug); }
        }
        // A lake with several shoreline parts counts as recovered only when every part came back.
        for (const slug of okNow) if (!stillBad.has(slug)) failed.delete(slug);
        console.log(`Lake sales: second pass recovered ${again.length - [...again].filter((j) => failed.has(j.slug)).length} of ${again.length} requests`);
      }
      if (failed.size > jobs.length / 4) throw new Error(`${failed.size} of ${jobs.length} lake requests failed, first: ${firstError}`);
      const prices = {};
      let kept = 0;
      for (const l of raw.values()) {
        const date = String(l.soldDate ?? '').slice(0, 10), price = Number(l.soldPrice);
        if (!(price > 1000) || !date || date >= w.now[1] || date < w.before[0]) continue;
        if (!isLakefront(l) || homeType(l) === 'land' || soldChoices(l).hide) continue;
        const x = Number(l.map?.longitude), y = Number(l.map?.latitude);
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        const span = date >= w.now[0] ? 'now' : 'before';
        for (const s of lakesAt(x, y)) ((prices[s] ??= { now: [], before: [] })[span]).push(price);
        kept++;
      }
      const lakes = Object.fromEntries(Object.entries(prices).filter(([s]) => !failed.has(s)).map(([s, p]) => [s, { now: stat(p.now), before: stat(p.before) }]));
      console.log(`Lake sales: ${raw.size} sold records in the shoreline zones, ${kept} lakefront homes kept, ${Object.keys(lakes).length} lakes with sales, ${failed.size} lakes failed${firstError ? ` (${firstError})` : ''} (${Math.round((Date.now() - started) / 1000)} s)`);
      const status = { records: raw.size, kept, lakesWithSales: Object.keys(lakes).length, requests: jobs.length, failedLakes: failed.size, firstError, seconds: Math.round((Date.now() - started) / 1000) };
      const out = { version: 2, at: new Date().toISOString(), mode, through: w.label, from: w.fromLabel, lakes, failed: [...failed], status };
      mkdirSync(new URL('.cache-keep/', root), { recursive: true });
      writeFileSync(CACHE, JSON.stringify(out));
      return out;
    } catch (err) {
      // Keep an older snapshot for the same months if there is one (it's at most a few weeks old), otherwise none.
      try {
        const old = JSON.parse(readFileSync(CACHE, 'utf8'));
        if (old.through === w.label && old.version === 2) { console.error(`Lake sales: download failed (${err.message}); keeping the snapshot from ${old.at}`); return { ...old, status: { ...old.status, keptOlder: true, error: err.message } }; }
      } catch { /* no older snapshot */ }
      console.error(`Lake sales: download failed, building without the snapshot: ${err.message}`);
      return { ...empty, status: { error: err.message } };
    }
  })());
}
