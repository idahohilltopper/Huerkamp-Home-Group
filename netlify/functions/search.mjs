// The site's own home search: /api/search?place=burnsville&max=400000&beds=3&type=townhome&page=2 ...
// Answers from the search index the build writes (src/lib/search-index.mjs; bundled through netlify.toml
// included_files), so a search never calls Repliers and never needs the API key. Serves listings only while
// MLS_PUBLIC is "yes" or "preview" (set only after the NorthstarMLS IDX license is approved), like every listing page.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { INDEX_FILE, parseQuery, search } from '../../src/lib/search-index.mjs';

const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();
const VARY = 'query=place|min|max|beds|baths|type|lakefront|new|acres|team|sort|bbox|page,header=x-idx-eula';
const json = (status, body, cache = false) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json',
    ...(cache
      ? { 'cache-control': 'public, max-age=300', 'netlify-cdn-cache-control': 'public, s-maxage=900, stale-while-revalidate=3600', 'netlify-vary': VARY }
      : { 'cache-control': 'no-store' }),
  },
});

let index;
function load() {
  if (index !== undefined) return index;
  const here = new URL('.', import.meta.url).pathname;
  const tries = [join(process.cwd(), INDEX_FILE), join(here, '../../', INDEX_FILE), join(here, INDEX_FILE), join('/var/task', INDEX_FILE)];
  const file = tries.find((p) => existsSync(p));
  try { index = file ? JSON.parse(readFileSync(file, 'utf8')) : null; } catch { index = null; }
  return index;
}

export default async (req) => {
  if (req.method !== 'GET') return json(405, { ok: false, error: 'GET only' });
  const mode = env('MLS_PUBLIC').toLowerCase();
  if (!['yes', 'preview'].includes(mode)) return json(200, { ok: false, error: 'not-public-yet' });
  // NorthstarMLS EULA: listings only after the visitor clicked I AGREE this visit (the page sends this header then).
  if (req.headers.get('x-idx-eula') !== 'agreed') return json(403, { ok: false, error: 'license-not-agreed' });
  const idx = load();
  if (!idx?.rows?.length) return json(503, { ok: false, error: 'no-index' });
  const q = parseQuery(new URL(req.url).searchParams);
  return json(200, { ok: true, updated: idx.at, ...search(idx, q) }, true);
};

export const config = { path: '/api/search' };
