// Lake homes "up north" (src/data/north-lakes.json): the lakefront homes for sale and sold on each lake, downloaded
// once per site build like the Twin Cities feed (src/lib/mls-feed.mjs), and kept apart from it so these listings
// don't land in the Twin Cities searches, ZIP pages or community counts.
//   - For sale: active listings in each chain's map box, kept when the MLS marks them lakefront and their map point is
//     in a lake's 200 m shoreline zone (src/data/geo/north-lake-shores.json).
//   - Sold: the last 36 months (MAX_MONTHS in src/lib/sold.mjs), the same way, through soldCard(), which applies the
//     NorthstarMLS sold-content rules (Sold status only, seller choices, allowed fields, list office required).
// Pages show sold homes inside the license-gated listing blocks, like every listing display on the site.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { compact, download, inPolys, mlsMode } from './mls-feed.mjs';
import { repliers, isLakefront } from './repliers.mjs';
import { soldCard, FIELDS as SOLD_FIELDS, MAX_MONTHS } from './sold.mjs';

const root = pathToFileURL(`${process.cwd()}/`);
const read = (p) => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const CACHE = new URL('.cache/north-lakes-v2.json', root);
export const north = read('src/data/north-lakes.json');
/** Every lake group (a chain or one lake), across all regions. */
export const allGroups = north.regions.flatMap((r) => r.groups);
const shores = read('src/data/geo/north-lake-shores.json');
// Leave out anything under $200,000 (mostly lots and lake-access parcels), for sale and sold. Jason, 2026-11-07.
const MIN_PRICE = 200000;

/** The lake keys ("brainerd/gull-lake") whose shoreline zone holds this point, within one group. */
function lakesAt(group, x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return [];
  return group.lakes.filter((l) => {
    const [w, s, e, n] = l.bbox;
    return x >= w - 0.004 && x <= e + 0.004 && y >= s - 0.003 && y <= n + 0.003 && inPolys(x, y, shores[l.key]);
  }).map((l) => l.key);
}

async function soldIn(key, box, now) {
  const since = new Date(now); since.setMonth(since.getMonth() - MAX_MONTHS);
  const [w, s, e, n] = box;
  const out = [];
  for (let page = 1; page <= 40; page++) {
    const r = await repliers(key, '/listings', { status: 'U', lastStatus: 'Sld', type: 'Sale', minSoldDate: since.toISOString().slice(0, 10),
      sortBy: 'soldDateDesc', resultsPerPage: 100, pageNum: page, fields: `${SOLD_FIELDS},details` }, { map: [[[w, n], [e, n], [e, s], [w, s], [w, n]]] });
    if (!r.data) throw new Error(`Repliers sold ${r.status}`);
    out.push(...(r.data.listings ?? []));
    if (page >= (r.data.numPages ?? 1)) break;
  }
  return out;
}

/** { at, mode, groups: { <group slug>: { active: [...], sold: [...] } } }; empty when the MLS feed is off. */
let loading;
export function loadNorthLakes() {
  return (loading ??= (async () => {
    const empty = { at: null, mode: 'off', groups: Object.fromEntries(allGroups.map((g) => [g.slug, { active: [], sold: [] }])) };
    const fixture = process.env.MLS_FIXTURE;
    if (fixture && process.env.NETLIFY !== 'true') {
      // Local previews: NORTH_FIXTURE is a saved copy of this function's result, for checking the pages' layout.
      const nf = process.env.NORTH_FIXTURE;
      return nf ? JSON.parse(readFileSync(nf, 'utf8')) : { ...empty, mode: 'preview' };
    }
    const mode = mlsMode();
    const key = (process.env.REPLIERS_API_KEY ?? '').trim();
    if (mode === 'off' || !key) return empty;
    if (existsSync(CACHE) && Date.now() - statSync(CACHE).mtimeMs < 3 * 3600e3) return JSON.parse(readFileSync(CACHE, 'utf8'));
    try {
      const now = new Date();
      const groups = {};
      for (const g of allGroups) {
        const { listings } = await download(key, g.bbox);
        const active = [];
        for (const raw of listings) {
          const c = compact(raw, now);
          if (c.hide || !c.mls || !(c.price >= MIN_PRICE) || !c.lakefront) continue;
          const lakes = lakesAt(g, c.lng, c.lat);
          if (lakes.length) active.push({ ...c, community: null, northGroup: g.slug, northLakes: lakes });
        }
        const sold = [];
        for (const raw of await soldIn(key, g.bbox, now)) {
          if (!isLakefront(raw)) continue;
          const c = soldCard(raw, now);
          if (!c || !(c.soldPrice >= MIN_PRICE)) continue;
          const lakes = lakesAt(g, c.lng, c.lat);
          if (lakes.length) sold.push({ ...c, northLakes: lakes });
        }
        groups[g.slug] = { active: active.sort((a, b) => b.price - a.price), sold };
        console.log(`North lakes: ${g.name}: ${active.length} for sale, ${sold.length} sold in ${MAX_MONTHS} months`);
      }
      const out = { at: now.toISOString(), mode, groups };
      mkdirSync(new URL('.cache/', root), { recursive: true });
      writeFileSync(CACHE, JSON.stringify(out));
      return out;
    } catch (err) {
      console.error(`North lakes: download failed, building without them: ${err.message}`);
      return empty;
    }
  })());
}
