// The site's own home search (/home-search and /api/search), built on the same MLS feed as the homes-for-sale pages
// (src/lib/mls-feed.mjs, Repliers / NorthstarMLS). The build writes a compact index of every active listing in our
// communities to .cache/search-index.json; the Netlify Function bundles that file (netlify.toml, included_files) and
// filters it here. One shared file, so the search page, the function and tests all use the same rules.
// Listings refresh with every build (twice a day once BUILD_HOOK_URL is set; see netlify/functions/rebuild.mjs).

export const INDEX_FILE = '.cache/search-index.json';
export const PAGE_SIZE = 24;
export const MAX_PINS = 2000;
export const TYPES = ['single-family', 'townhome', 'condo', 'multi-family', 'land', 'manufactured'];
export const SORTS = { new: 'Newest', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', sqft: 'Largest' };

// Row layout (arrays keep the file small).
const F = ['mls', 'slug', 'street', 'city', 'zip', 'price', 'beds', 'baths', 'sqft', 'type', 'newConstruction', 'lotAcres', 'lakefront', 'community', 'hood', 'lakes', 'lat', 'lng', 'listed', 'brokerage', 'photo', 'team'];

/** Build-time: listings (src/data/listings.ts shape) → index object. `teamNames` marks the team's own listings. */
export function buildIndex(listings, { at = null, mode = 'off', teamNames = [], teamBrokerage = /keller williams preferred/i } = {}) {
  const names = new Set(teamNames.map((n) => n.toLowerCase().trim()));
  const rows = listings.map((l) => [
    l.mls, l.slug, l.street, l.city, l.zip, l.price, l.beds ?? null, l.baths ?? null, l.sqft ?? null, l.type,
    l.newConstruction ? 1 : 0, l.lotAcres ?? null, l.lakefront ? 1 : 0, l.community ?? null, l.hood ?? null, (l.lakes ?? []).join('|'),
    Math.round(l.lat * 1e5) / 1e5, Math.round(l.lng * 1e5) / 1e5, l.listed ?? null, l.brokerage ?? '', l.photos?.[0] ?? null,
    teamBrokerage.test(l.brokerage ?? '') && names.has(String(l.agent ?? '').toLowerCase().trim()) ? 1 : 0,
  ]);
  return { v: 1, at, mode, fields: F, rows };
}

const obj = (fields, r) => Object.fromEntries(fields.map((f, i) => [f, r[i]]));

/** Read and validate a query (URLSearchParams or plain object). Unknown or malformed values are dropped. */
export function parseQuery(input) {
  const get = (k) => (input instanceof URLSearchParams ? input.get(k) : input?.[k]) ?? '';
  const int = (k, lo, hi) => { const n = Number(String(get(k)).replace(/[^0-9.]/g, '')); return Number.isFinite(n) && n >= lo && n <= hi && String(get(k)) !== '' ? Math.round(n) : null; };
  const places = String(get('place')).split(',').map((s) => s.trim().toLowerCase()).filter((s) =>
    /^[a-z0-9-]{2,40}$/.test(s) || /^hood:[a-z0-9-]{2,40}\/[a-z0-9-]{2,60}$/.test(s) || /^zip:\d{5}$/.test(s) || /^lake:[a-z0-9-]{2,60}$/.test(s)).slice(0, 12);
  const types = String(get('type')).split(',').map((s) => s.trim()).filter((t) => TYPES.includes(t));
  const bbox = String(get('bbox')).split(',').map(Number);
  const flag = (k) => /^(1|true|yes|on)$/i.test(String(get(k)));
  const sort = Object.hasOwn(SORTS, String(get('sort'))) ? String(get('sort')) : 'new';
  return {
    places, types, sort,
    min: int('min', 1, 1e9), max: int('max', 1, 1e9),
    beds: int('beds', 1, 10), baths: int('baths', 1, 10),
    lakefront: flag('lakefront'), newConstruction: flag('new'), acres: flag('acres'), team: flag('team'),
    bbox: bbox.length === 4 && bbox.every(Number.isFinite) && bbox[0] < bbox[2] && bbox[1] < bbox[3] ? bbox : null,
    page: int('page', 1, 500) ?? 1,
  };
}

/** The query as a URL query string (only the values that are set), for links and the address bar. */
export function toSearch(q) {
  const p = new URLSearchParams();
  if (q.places?.length) p.set('place', q.places.join(','));
  if (q.min) p.set('min', String(q.min));
  if (q.max) p.set('max', String(q.max));
  if (q.beds) p.set('beds', String(q.beds));
  if (q.baths) p.set('baths', String(q.baths));
  if (q.types?.length) p.set('type', q.types.join(','));
  if (q.lakefront) p.set('lakefront', '1');
  if (q.newConstruction) p.set('new', '1');
  if (q.acres) p.set('acres', '1');
  if (q.team) p.set('team', '1');
  if (q.sort && q.sort !== 'new') p.set('sort', q.sort);
  if (q.bbox) p.set('bbox', q.bbox.map((n) => n.toFixed(4)).join(','));
  if (q.page && q.page > 1) p.set('page', String(q.page));
  return p.toString();
}

function matchPlace(l, p) {
  if (p.startsWith('hood:')) return l.hood === p.slice(5);
  if (p.startsWith('zip:')) return l.zip === p.slice(4);
  if (p.startsWith('lake:')) return String(l.lakes ?? '').split('|').includes(p.slice(5));
  return l.community === p;
}

/** Run a parsed query against the index. */
export function search(index, q) {
  const all = (index?.rows ?? []).map((r) => obj(index.fields, r));
  const hits = all.filter((l) =>
    (!q.places.length || q.places.some((p) => matchPlace(l, p))) &&
    (!q.types.length || q.types.includes(l.type)) &&
    (!q.min || l.price >= q.min) && (!q.max || l.price <= q.max) &&
    (!q.beds || (l.beds ?? 0) >= q.beds) && (!q.baths || (l.baths ?? 0) >= q.baths) &&
    (!q.lakefront || l.lakefront) && (!q.newConstruction || l.newConstruction) && (!q.acres || (l.lotAcres ?? 0) >= 1) &&
    (!q.team || l.team) &&
    (!q.bbox || (l.lng >= q.bbox[0] && l.lat >= q.bbox[1] && l.lng <= q.bbox[2] && l.lat <= q.bbox[3])));
  const by = {
    new: (a, b) => String(b.listed ?? '').localeCompare(String(a.listed ?? '')) || b.price - a.price,
    'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price,
    sqft: (a, b) => (b.sqft ?? 0) - (a.sqft ?? 0),
  }[q.sort];
  hits.sort(by);
  const pages = Math.max(1, Math.ceil(hits.length / PAGE_SIZE));
  const page = Math.min(q.page, pages);
  return {
    total: hits.length, page, pages,
    results: hits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(({ team, community, hood, lakes, ...l }) => l),
    pins: hits.slice(0, MAX_PINS).map((l) => [l.lat, l.lng, l.price, l.slug]),
  };
}
