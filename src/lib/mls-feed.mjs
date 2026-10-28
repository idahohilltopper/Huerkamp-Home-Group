// Every active MLS listing in our service area, downloaded once per build from Repliers (NorthstarMLS) and sorted
// into our communities, Minneapolis/Saint Paul neighborhoods, ZIP codes and lakes. The listing pages
// (/homes-for-sale/..., /homes/<listing>) are built from it.
//
// Nothing is downloaded or published unless MLS_PUBLIC is "yes" (live) or "preview" (pages built but kept out of
// search engines) in Netlify, and REPLIERS_API_KEY is set. Set MLS_PUBLIC only once the NorthstarMLS IDX license is
// approved. For local design work only, MLS_FIXTURE=<file> loads made-up sample listings (refused on Netlify).
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { repliers, isLakefront, CDN } from './repliers.mjs';

const root = pathToFileURL(`${process.cwd()}/`);
const read = (p) => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const CACHE = new URL('.cache/mls-feed.json', root);

export const mlsMode = () => {
  const v = (process.env.MLS_PUBLIC ?? '').trim().toLowerCase();
  return v === 'yes' ? 'live' : v === 'preview' ? 'preview' : 'off';
};

// ---------- shapes ----------
function rings(geom) {
  if (!geom) return [];
  return geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
}
function inRing(x, y, ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
/** Inside a polygon (outer ring, not in a hole) of any part. */
const inPolys = (x, y, polys) => polys.some(([outer, ...holes]) => inRing(x, y, outer) && !holes.some((h) => inRing(x, y, h)));
function areaIndex(features, key = (f) => f.properties.slug) {
  return features.map((f) => {
    const polys = rings(f.geometry);
    const pts = polys.flat(2);
    return { slug: key(f), polys, box: [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))] };
  });
}
const findArea = (idx, x, y) => idx.filter((a) => x >= a.box[0] && x <= a.box[2] && y >= a.box[1] && y <= a.box[3] && inPolys(x, y, a.polys)).map((a) => a.slug);

// ---------- one listing, trimmed to what the pages use ----------
const num = (v) => { const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, '')); return Number.isFinite(n) && n > 0 ? n : null; };
const coord = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
const text = (v) => (v == null ? '' : String(v).trim());
const slugify = (s) => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Home type from the MLS class, property type and style. */
export function homeType(l) {
  const s = `${l.class ?? ''} ${l.details?.propertyType ?? ''} ${l.details?.style ?? ''}`;
  if (/land|lot\b|acreage/i.test(s) && !/residen|house|home/i.test(l.details?.propertyType ?? '')) return 'land';
  if (/condo/i.test(s)) return 'condo';
  if (/town|twin ?home|row ?house|quad|attached/i.test(s)) return 'townhome';
  if (/multi|duplex|triplex|fourplex|4-?plex|income/i.test(s)) return 'multi-family';
  if (/manufactured|mobile/i.test(s)) return 'manufactured';
  return 'single-family';
}

/** Any value in the listing whose key matches (the MLS field names vary). */
function findField(obj, re, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 3) return undefined;
  for (const [k, v] of Object.entries(obj)) {
    if (re.test(k) && v != null && typeof v !== 'object' && String(v).trim() !== '') return v;
    const deep = typeof v === 'object' ? findField(v, re, depth + 1) : undefined;
    if (deep !== undefined) return deep;
  }
  return undefined;
}
const no = (v) => /^(n|no|false|0)$/i.test(String(v ?? '').trim());

/** NorthstarMLS seller choices (Broker Reciprocity agreement, section 13): "Advertising: No" means the listing may not
 *  appear on any website; "Display Address: No" means it may appear without its address. */
export function sellerChoices(l) {
  const p = l.permissions ?? {};
  return {
    hide: no(p.displayPublic) || no(p.displayInternetEntireListing) || no(findField(l, /^(internetEntireListingDisplay|advertising)(yn)?$/i)),
    hideAddress: no(p.displayAddressOnInternet) || no(findField(l, /^(internetAddressDisplay|displayAddress)(yn)?$/i)),
  };
}

export function compact(l, now = new Date()) {
  const a = l.address ?? {}, d = l.details ?? {};
  const choices = sellerChoices(l);
  const contingency = text(findField(l, /contingen/i));
  const street = [a.streetNumber, a.streetDirectionPrefix, a.streetName, a.streetSuffix, a.streetDirection].map(text).filter(Boolean).join(' ')
    + (text(a.unitNumber) ? ` #${text(a.unitNumber)}` : '');
  const city = text(a.city), zip = text(a.zip).slice(0, 5);
  const yearBuilt = num(d.yearBuilt);
  const year = now.getFullYear();
  return {
    mls: text(l.mlsNumber),
    slug: slugify(`${choices.hideAddress ? 'home-for-sale' : street} ${city} mn ${zip} ${l.mlsNumber}`),
    street: choices.hideAddress ? 'Address withheld by the seller' : street, city, zip,
    addressHidden: choices.hideAddress, hide: choices.hide,
    contingency: contingency && !/^none$/i.test(contingency) ? contingency : '',
    price: num(l.listPrice),
    beds: num(d.numBedrooms), baths: num(d.numBathrooms), sqft: num(d.sqft),
    type: homeType(l), style: text(d.style), yearBuilt,
    newConstruction: !!yearBuilt && yearBuilt >= year - 1,
    lotAcres: num(l.lot?.acres),
    garage: num(d.numGarageSpaces),
    description: text(d.description).slice(0, 4000),
    photos: (l.images ?? []).slice(0, 24).map((p) => `${CDN}/${p}`),
    listed: text(l.listDate).slice(0, 10) || null,
    updated: text(l.updatedOn ?? l.timestamps?.listingUpdated).slice(0, 10) || null,
    brokerage: text(l.office?.brokerageName),
    agent: text(l.agents?.[0]?.name),
    lat: coord(l.map?.latitude), lng: coord(l.map?.longitude),
    lakefront: isLakefront(l),
    taxes: num(l.taxes?.annualAmount), hoa: num(l.condominium?.fees?.maintenance),
    heating: text(d.heating), cooling: text(d.airConditioning), basement: [d.basement1, d.basement2].map(text).filter(Boolean).join(', '),
  };
}

// ---------- download ----------
const FIELDS = 'boardId,mlsNumber,listPrice,listDate,updatedOn,timestamps,status,lastStatus,class,type,address,map,details,lot,images,office,agents,taxes,condominium,permissions';

async function download(key, box) {
  // Small tiles keep each search well inside Repliers' paging limits; 4 run at a time.
  // A tile that keeps failing is skipped and reported, so one bad request can't stop the whole site build.
  const [w, s, e, n] = box, step = 0.12, out = new Map(), stats = { tiles: 0, requests: 0, failedTiles: 0, errors: [], cappedTiles: 0 };
  const tiles = [];
  for (let x = w; x < e; x += step) for (let y = s; y < n; y += step) tiles.push([[[x, y + step], [x + step, y + step], [x + step, y], [x, y], [x, y + step]]]);
  stats.tiles = tiles.length;
  const ask = async (tile, page) => {
    for (let attempt = 1; ; attempt++) {
      stats.requests++;
      const r = await repliers(key, '/listings', { status: 'A', type: 'Sale', resultsPerPage: 100, pageNum: page, fields: FIELDS }, { map: tile }).catch((err) => ({ status: 0, data: null, error: String(err?.message ?? err) }));
      if (r.data) return r.data;
      if (attempt >= 3 || r.status === 401 || r.status === 403) throw new Error(`Repliers ${r.status}: ${r.error}`);
      await new Promise((ok) => setTimeout(ok, 1500 * attempt));
    }
  };
  const one = async (tile) => {
    try {
      for (let page = 1, pages = 1; page <= pages && page <= 50; page++) {
        const d = await ask(tile, page);
        pages = d.numPages ?? 1;
        if (page === 1 && pages > 50) stats.cappedTiles++;
        for (const l of d.listings ?? []) out.set(l.mlsNumber, l);
      }
    } catch (err) {
      stats.failedTiles++;
      if (stats.errors.length < 5) stats.errors.push(String(err.message).slice(0, 200));
      if (/Repliers (401|403)/.test(err.message)) throw err; // a bad or unauthorized key: stop right away
    }
  };
  for (let i = 0; i < tiles.length; i += 4) await Promise.all(tiles.slice(i, i + 4).map(one));
  // What the key can see in total, and from which MLS ("boards"), to spot a key with only partial data.
  const boards = {};
  for (const l of out.values()) boards[l.boardId ?? 'unknown'] = (boards[l.boardId ?? 'unknown'] ?? 0) + 1;
  stats.boards = boards;
  const probe = async (params) => { const r = await repliers(key, '/listings', { status: 'A', type: 'Sale', resultsPerPage: 1, fields: 'mlsNumber', ...params }).catch(() => null); return r?.data ? (r.data.count ?? r.data.numListings ?? null) : `error ${r?.status}`; };
  stats.keySees = { allActiveForSale: await probe({}), minneapolis: await probe({ city: 'Minneapolis' }), lakeville: await probe({ city: 'Lakeville' }) };
  return { listings: [...out.values()], stats };
}

let feed;
/** All active listings in our communities, each tagged with community, neighborhood, ZIP and lakes. */
export function loadFeed() {
  return (feed ??= (async () => {
    const mode = mlsMode();
    const fixture = process.env.MLS_FIXTURE;
    if (fixture && process.env.NETLIFY !== 'true') return { mode: mode === 'off' ? 'preview' : mode, at: new Date().toISOString(), listings: JSON.parse(readFileSync(fixture, 'utf8')), fixture: true };
    const key = (process.env.REPLIERS_API_KEY ?? '').trim();
    const env = { MLS_PUBLIC: process.env.MLS_PUBLIC ?? null, REPLIERS_API_KEY: key ? 'set' : 'missing' };
    if (mode === 'off' || !key) {
      if (mode !== 'off') console.warn('MLS feed: MLS_PUBLIC is set but REPLIERS_API_KEY is not available to the build (check its Builds scope).');
      return { mode: 'off', at: null, listings: [], status: { env, reason: mode === 'off' ? 'MLS_PUBLIC is not "yes" or "preview"' : 'REPLIERS_API_KEY not available during the build' } };
    }
    // One download per build: later pages reuse the file written by the first.
    if (existsSync(CACHE) && Date.now() - statSync(CACHE).mtimeMs < 3 * 3600e3) return JSON.parse(readFileSync(CACHE, 'utf8'));

    try {
      const comm = areaIndex(read('src/data/geo/communities.geojson').features);
      const hoods = areaIndex(read('src/data/geo/neighborhoods.geojson').features);
      const shores = Object.entries(read('src/data/geo/lake-shores.json')).map(([slug, parts]) => {
        const pts = parts.flat(2);
        return { slug, polys: parts, box: [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))] };
      });
      const all = comm.flatMap((c) => [[c.box[0], c.box[1]], [c.box[2], c.box[3]]]);
      const box = [Math.min(...all.map((p) => p[0])), Math.min(...all.map((p) => p[1])), Math.max(...all.map((p) => p[0])), Math.max(...all.map((p) => p[1]))];

      const started = Date.now();
      const { listings: raw, stats } = await download(key, box);
      const now = new Date();
      const listings = [];
      const dropped = { incomplete: 0, outside: 0 };
      for (const l of raw) {
        const c = compact(l, now);
        if (c.hide) { dropped.sellerOptOut = (dropped.sellerOptOut ?? 0) + 1; continue; } // "Advertising: No"
        if (!c.mls || !c.price || !c.street || !Number.isFinite(c.lat) || !Number.isFinite(c.lng)) { dropped.incomplete++; continue; }
        c.community = findArea(comm, c.lng, c.lat)[0] ?? null;
        if (!c.community) { dropped.outside++; continue; } // outside the communities we cover
        c.hood = findArea(hoods, c.lng, c.lat)[0] ?? null;
        c.lakes = c.lakefront ? findArea(shores, c.lng, c.lat) : [];
        listings.push(c);
      }
      const status = { env, downloaded: raw.length, kept: listings.length, dropped, seconds: Math.round((Date.now() - started) / 1000), ...stats };
      console.log(`MLS feed: ${raw.length} listings downloaded, ${listings.length} in our communities (${JSON.stringify(status)})`);
      const out = { mode, at: now.toISOString(), listings, status };
      mkdirSync(new URL('.cache/', root), { recursive: true });
      writeFileSync(CACHE, JSON.stringify(out));
      return out;
    } catch (err) {
      // Never fail the whole site over the listings: build without them and say why.
      console.error(`MLS feed: download failed, building without listing pages: ${err.message}`);
      return { mode: 'off', at: null, listings: [], status: { env, reason: 'download failed', error: String(err.message).slice(0, 300) } };
    }
  })());
}
