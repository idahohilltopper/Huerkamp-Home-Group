// Lake sales snapshot for the Twin Cities lake pages: for each lake, how many lakefront homes sold and their median
// sale price over the last 12 complete months, next to the 12 months before. Downloaded once per site build:
//   - sold homes (NorthstarMLS via Repliers, status U / lastStatus Sld) in the last 24 complete months, asked for
//     inside the lakes' 200 m shoreline zones (src/data/geo/lake-shores.json), 25 lakes per request;
//   - kept when the MLS marks the home lakefront, it isn't land, the seller didn't choose "Advertising: No", and its
//     map point is in that lake's shoreline zone (the same rule as the lake pages' homes for sale and sold homes).
// Only counts and medians are kept here (no addresses or single sale prices); a median needs 3 or more sales.
// Local previews: LAKE_SALES_FIXTURE is a saved copy of the result, for checking the layout.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { inPolys, mlsMode, homeType } from './mls-feed.mjs';
import { repliers, isLakefront } from './repliers.mjs';
import { soldChoices } from './sold.mjs';

const root = pathToFileURL(`${process.cwd()}/`);
const CACHE = new URL('.cache/lake-sales.json', root);
const shores = JSON.parse(readFileSync(new URL('src/data/geo/lake-shores.json', root), 'utf8'));
export const MIN_FOR_MEDIAN = 3;
const BATCH = 25, POINTS = 60;

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

async function soldIn(key, map, since) {
  const out = [];
  for (let page = 1; page <= 30; page++) {
    const r = await repliers(key, '/listings', { status: 'U', lastStatus: 'Sld', type: 'Sale', minSoldDate: since, sortBy: 'soldDateDesc',
      resultsPerPage: 100, pageNum: page, fields: 'mlsNumber,soldPrice,soldDate,status,lastStatus,class,type,map,details,permissions' }, { map });
    if (!r.data) throw new Error(`Repliers ${r.status}`);
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
    // One download per build: later pages reuse the file written by the first.
    if (existsSync(CACHE) && Date.now() - statSync(CACHE).mtimeMs < 3 * 3600e3) return JSON.parse(readFileSync(CACHE, 'utf8'));
    try {
      const started = Date.now();
      const slugs = Object.keys(shores);
      const raw = new Map();
      for (let i = 0; i < slugs.length; i += BATCH) {
        const map = slugs.slice(i, i + BATCH).flatMap((s) => shores[s].map((poly) => thin(poly[0])));
        for (const l of await soldIn(key, map, w.before[0])) raw.set(l.mlsNumber, l);
      }
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
      const lakes = Object.fromEntries(Object.entries(prices).map(([s, p]) => [s, { now: stat(p.now), before: stat(p.before) }]));
      console.log(`Lake sales: ${raw.size} sold records in the shoreline zones, ${kept} lakefront homes kept, ${Object.keys(lakes).length} lakes with sales (${Math.round((Date.now() - started) / 1000)} s)`);
      const out = { at: new Date().toISOString(), mode, through: w.label, from: w.fromLabel, lakes };
      mkdirSync(new URL('.cache/', root), { recursive: true });
      writeFileSync(CACHE, JSON.stringify(out));
      return out;
    } catch (err) {
      console.error(`Lake sales: download failed, building without the snapshot: ${err.message}`);
      return empty;
    }
  })());
}
