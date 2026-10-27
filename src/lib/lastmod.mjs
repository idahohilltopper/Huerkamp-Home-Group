// Real "last changed" dates for the sitemap, so Google and AI crawlers re-read pages that actually changed.
// Only real changes count: a post's date, a video's upload date, a town's data or its newest local story.
// Pages without a known date are listed without one rather than with a made-up date.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// The project folder (builds run from it; this file's own location moves when Astro bundles it).
const root = pathToFileURL(`${process.cwd()}/`);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const max = (dates) => dates.filter(Boolean).sort().at(-1);

let compareDate; // set by lastmods(): pair pages change with the monthly market report

export function lastmods() {
  const map = new Map();
  const posts = readdirSync(new URL('src/content/blog/', root)).filter((f) => f.endsWith('.md')).map((f) => {
    const fm = read(`src/content/blog/${f}`).split('\n---\n')[0];
    const get = (k) => fm.match(new RegExp(`^${k}: "?([^"\\n]*)"?$`, 'm'))?.[1];
    return { path: get('path'), date: get('updated') || get('date'), towns: JSON.parse(get('communities') ? fm.match(/^communities: (.*)$/m)[1] : '[]'), draft: get('draft') === 'true' };
  }).filter((p) => p.path && !p.draft);
  for (const p of posts) map.set(`/blog/${p.path}`, p.date);
  const newestPost = max(posts.map((p) => p.date));
  map.set('/blog', newestPost);

  const { videos } = JSON.parse(read('src/data/youtube.json'));
  for (const v of videos) if (v.slug && v.published) map.set(`/videos/${v.slug}`, v.published.slice(0, 10));
  const newestVideo = max(videos.map((v) => v.published?.slice(0, 10)));
  map.set('/videos', newestVideo);
  map.set('/', max([newestPost, newestVideo]));

  // Market reports change when a new monthly report comes in; community guides show its numbers too.
  const market = JSON.parse(read('src/data/market.json'));
  const latest = market.months[market.latest];
  map.set('/market', latest.asOf);
  // Area guides are rebuilt from the market report and the community data (slugs read from src/data/guides.ts).
  map.set('/guides', latest.asOf);
  for (const line of read('src/data/guides.ts').split('\n').filter((l) => /^\s+slug: /.test(l))) {
    for (const [, slug] of line.matchAll(/'([a-z0-9-]+)'/g)) map.set(`/guides/${slug}`, latest.asOf);
  }
  // Past monthly reports (/market/<area>/<yyyy-mm>) were last changed when that month's report came in.
  for (const [m, data] of Object.entries(market.months)) {
    if (m === market.latest) continue;
    map.set(`/market/${m}`, data.asOf);
    for (const slug of Object.keys(data.areas)) map.set(`/market/${slug}/${m}`, data.asOf);
  }
  // Comparison pages are built from the market report and community data.
  map.set('/compare', latest.asOf);
  for (const slug of Object.keys(JSON.parse(read('src/data/community-details.json')).communities)) map.set(`/compare/${slug}`, latest.asOf);
  for (const slug of Object.keys(latest.areas)) {
    // Neighborhood keys look like "minneapolis/linden-hills"; their report is on the neighborhood guide.
    map.set(slug.includes('/') ? `/communities/${slug}` : `/market/${slug}`, latest.asOf);
  }

  const details = JSON.parse(read('src/data/community-details.json'));
  for (const slug of Object.keys(details.communities)) {
    map.set(`/communities/${slug}`, max([details.updated, latest.areas[slug] && latest.asOf, ...posts.filter((p) => p.towns.includes(slug)).map((p) => p.date)]));
  }
  compareDate = latest.asOf;
  return map;
}

// Homes-for-sale and listing pages: read after the build from the MLS download it used (src/lib/mls-feed.mjs).
// A listing's date is its last MLS update; the collection pages change with every download.
let homes;
export function homeLastmod(path) {
  if (path.startsWith('/compare/') || path.startsWith('/commute')) return compareDate;
  if (!path.startsWith('/homes')) return undefined;
  homes ??= (() => {
    const file = new URL('.cache/mls-feed.json', root);
    if (!existsSync(file)) return { at: null, bySlug: new Map() };
    const feed = JSON.parse(readFileSync(file, 'utf8'));
    return { at: feed.at?.slice(0, 10), bySlug: new Map(feed.listings.map((l) => [l.slug, l.updated || l.listed])) };
  })();
  if (path.startsWith('/homes-for-sale')) return homes.at ?? undefined;
  return homes.bySlug.get(path.slice('/homes/'.length)) ?? undefined;
}
