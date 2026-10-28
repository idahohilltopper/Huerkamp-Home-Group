// The site's own listings index (src/lib/search-index.mjs) built from this build's MLS feed. It's used by the
// listings sections that replace the Ylopo widget, and written to .cache/search-index.json for /api/search.
import { mkdirSync, writeFileSync } from 'node:fs';
import { listingsData, type Listing } from './listings';
import team from './team.json';
import { buildIndex, search, INDEX_FILE } from '../lib/search-index.mjs';
import type { OwnQuery } from './search';

const homes = await listingsData;
export const ownIndex = buildIndex(homes.listings, { at: homes.at, mode: homes.mode, teamNames: team.members.map((m) => m.name) });

if (homes.mode !== 'off') {
  mkdirSync('.cache', { recursive: true });
  writeFileSync(INDEX_FILE, JSON.stringify(ownIndex));
}

const full = (q: OwnQuery) => ({ places: [], types: [], min: null, max: null, beds: null, baths: null, lakefront: false,
  newConstruction: false, acres: false, team: false, bbox: null, page: 1, sort: 'new',
  ...Object.fromEntries(Object.entries(q).filter(([, v]) => v !== undefined)) });

/** Listings matching an own query (at most 24), newest first unless sorted otherwise. */
export function ownListings(q: OwnQuery, limit = 12): Listing[] {
  return search(ownIndex, full(q)).results.slice(0, limit).map((x: { slug: string }) => homes.bySlug.get(x.slug)).filter(Boolean) as Listing[];
}
export const ownCount = (q: OwnQuery) => search(ownIndex, full(q)).total;
export const feedAt = homes.at;
