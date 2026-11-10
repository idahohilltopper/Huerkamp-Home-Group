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

const root = pathToFileURL(`${process.cwd()}/`);
const CACHE = new URL('.cache/mn-cities.json', root);
export const mnTowns = towns.cities;
export const mnRegions = towns.regions;
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
let loading;
export function loadMnCities() {
  return (loading ??= (async () => {
    const empty = { at: null, mode: 'off', towns: Object.fromEntries(mnTowns.map((t) => [t.slug, []])), failed: [] };
    if (process.env.MLS_FIXTURE && process.env.NETLIFY !== 'true') return { ...empty, mode: 'preview' }; // local previews
    const mode = mlsMode();
    const key = (process.env.REPLIERS_API_KEY ?? '').trim();
    if (mode === 'off' || !key) return empty;
    if (existsSync(CACHE) && Date.now() - statSync(CACHE).mtimeMs < 3 * 3600e3) return JSON.parse(readFileSync(CACHE, 'utf8'));
    const now = new Date();
    const out = { at: now.toISOString(), mode, towns: {}, failed: [] };
    for (const t of mnTowns) {
      try {
        // NorthstarMLS spells "Saint"; try "St." too if that finds nothing.
        let raw = await forSaleIn(key, t.mlsCity);
        if (!raw.length && /^Saint /.test(t.mlsCity)) raw = await forSaleIn(key, t.mlsCity.replace(/^Saint /, 'St. '));
        const want = norm(t.mlsCity);
        out.towns[t.slug] = raw.map((l) => compact(l, now))
          .filter((c) => !c.hide && c.mls && c.price > 1000 && c.state === 'MN' && norm(c.city) === want)
          .map((c) => ({ ...c, community: null, mnTown: t.slug }))
          .sort((a, b) => a.price - b.price);
      } catch (err) {
        out.towns[t.slug] = [];
        out.failed.push(t.slug);
        console.error(`Greater Minnesota: ${t.name}: ${err.message}`);
      }
    }
    console.log(`Greater Minnesota: ${Object.values(out.towns).reduce((n, l) => n + l.length, 0)} homes for sale in ${mnTowns.length} towns${out.failed.length ? `; failed: ${out.failed.join(', ')}` : ''}`);
    if (out.failed.length < mnTowns.length / 2) {
      mkdirSync(new URL('.cache/', root), { recursive: true });
      writeFileSync(CACHE, JSON.stringify(out));
    }
    return out;
  })());
}
