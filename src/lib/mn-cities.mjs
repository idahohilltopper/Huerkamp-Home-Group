// Homes for sale in Greater Minnesota towns outside our service area (src/data/mn-cities.json): Duluth, Rochester,
// Mankato and the rest, for /minnesota-homes-for-sale/<town>. Downloaded once per site build, one search per town by
// the MLS city name (a few requests each), and kept apart from the Twin Cities feed (src/lib/mls-feed.mjs) so these
// homes don't land in the Twin Cities searches, ZIP pages or community counts. Leads from these pages are referred to
// a local agent (Jason, Nov 10, 2026). Sold homes load live on the page through /api/sold (place "mn:<slug>"), which
// applies the NorthstarMLS sold rules, including sales shown only to signed-in visitors.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { compact, mlsMode, FIELDS } from './mls-feed.mjs';
import { repliers } from './repliers.mjs';
import towns from '../data/mn-cities.json' with { type: 'json' };
import wiTownsData from '../data/wi-towns.json' with { type: 'json' };

const root = pathToFileURL(`${process.cwd()}/`);
const CACHE = new URL('.cache/mn-cities.json', root);
export const mnTowns = towns.cities;
export const mnRegions = towns.regions;
// Western Wisconsin towns near the Twin Cities (/wisconsin-homes-for-sale/<town>), same download, Wisconsin homes only.
// Unlike Greater Minnesota, the team serves these itself (Nov 15, 2026).
export const wiTowns = wiTownsData.cities;
export const wiRegions = wiTownsData.regions;
const norm = (s) => String(s ?? '').toLowerCase().replace(/\bst\.?\s/g, 'saint ').replace(/[^a-z]+/g, ' ').trim();

async function forSaleIn(key, city) {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    let r;
    for (let attempt = 1; ; attempt++) {
      r = await repliers(key, '/listings', { status: 'A', type: 'Sale', city, resultsPerPage: 100, pageNum: page, fields: FIELDS }).catch((err) => ({ status: 0, data: null, error: String(err?.message ?? err) }));
      if (r.data || attempt >= 3 || r.status === 401 || r.status === 403) break;
      await new Promise((ok) => setTimeout(ok, 2000 * attempt)); // 429s: back off and retry
    }
    if (!r.data) throw new Error(`Repliers ${r.status}`);
    out.push(...(r.data.listings ?? []));
    if (page >= (r.data.numPages ?? 1)) break;
  }
  return out;
}

/** { at, mode, towns: { <slug>: [listing, ...] }, failed: [slug] }; empty when the MLS feed is off. */
const loading = {};
function loadTowns(list, state, cache, label) {
  return (loading[state] ??= (async () => {
    const empty = { at: null, mode: 'off', towns: Object.fromEntries(list.map((t) => [t.slug, []])), failed: [] };
    if (process.env.MLS_FIXTURE && process.env.NETLIFY !== 'true') return { ...empty, mode: 'preview' }; // local previews
    const mode = mlsMode();
    const key = (process.env.REPLIERS_API_KEY ?? '').trim();
    if (mode === 'off' || !key) return empty;
    if (existsSync(cache) && Date.now() - statSync(cache).mtimeMs < 3 * 3600e3) return JSON.parse(readFileSync(cache, 'utf8'));
    const now = new Date();
    const out = { at: now.toISOString(), mode, towns: {}, failed: [] };
    for (const t of list) {
      try {
        // NorthstarMLS spells "Saint"; try "St." too if that finds nothing.
        let raw = await forSaleIn(key, t.mlsCity);
        if (!raw.length && /^Saint /.test(t.mlsCity)) raw = await forSaleIn(key, t.mlsCity.replace(/^Saint /, 'St. '));
        const want = norm(t.mlsCity);
        out.towns[t.slug] = raw.map((l) => compact(l, now))
          .filter((c) => !c.hide && c.mls && c.price > 1000 && c.state === state && norm(c.city) === want)
          .map((c) => ({ ...c, community: null, mnTown: t.slug }))
          .sort((a, b) => a.price - b.price);
      } catch (err) {
        out.towns[t.slug] = [];
        out.failed.push(t.slug);
        console.error(`${label}: ${t.name}: ${err.message}`);
      }
    }
    console.log(`${label}: ${Object.values(out.towns).reduce((n, l) => n + l.length, 0)} homes for sale in ${list.length} towns${out.failed.length ? `; failed: ${out.failed.join(', ')}` : ''}`);
    if (out.failed.length < list.length / 2) {
      mkdirSync(new URL('.cache/', root), { recursive: true });
      writeFileSync(cache, JSON.stringify(out));
    }
    return out;
  })());
}
export const loadMnCities = () => loadTowns(mnTowns, 'MN', CACHE, 'Greater Minnesota');
export const loadWiTowns = () => loadTowns(wiTowns, 'WI', new URL('.cache/wi-towns.json', root), 'Western Wisconsin');
