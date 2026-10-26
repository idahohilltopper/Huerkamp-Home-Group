// Health check of a finished build: node scripts/audit-site.mjs [dist]
// Reads every page in dist/ and reports broken internal links, missing or duplicate titles and descriptions,
// pages without exactly one h1, skipped heading levels, broken structured data, wrong canonicals, images
// without alt text, very large pages, and sitemap entries that don't exist or are noindex.
// Exits with 1 if anything that would hurt search rankings is found.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const ORIGIN = 'https://www.huerkamphomegroup.com';
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : f.endsWith('.html') && files.push(p); } })(dist);

const pathOf = (f) => '/' + relative(dist, f).replace(/\\/g, '/').replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
const exists = (p) => {
  const clean = decodeURIComponent(p.split('#')[0].split('?')[0]).replace(/\/$/, '') || '/';
  if (clean === '/') return true;
  return [`${clean}.html`, `${clean}/index.html`, clean].some((x) => existsSync(join(dist, x)) && statSync(join(dist, x)).isFile());
};
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

const issues = new Map(); // kind -> [{page, detail}]
const add = (kind, page, detail = '') => (issues.get(kind) ?? issues.set(kind, []).get(kind)).push({ page, detail });
const titles = new Map(), descs = new Map();
const noindex = new Set();
let indexable = 0, links = 0;

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const page = pathOf(f);
  const isNoindex = /<meta[^>]+name="robots"[^>]+noindex/i.test(html);
  if (isNoindex) noindex.add(page); else indexable++;
  if (statSync(f).size > 600_000) add('Page over 600 KB', page, `${Math.round(statSync(f).size / 1024)} KB`);

  // Links to our own pages and files
  for (const [, href] of html.matchAll(/\shref="([^"]*)"/g)) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    links++;
    if (!exists(href)) add('Broken internal link', page, href);
  }
  for (const [, src] of html.matchAll(/\ssrc="(\/[^"/][^"]*)"/g)) if (!exists(src)) add('Missing image or script', page, src);

  // Structured data
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json); } catch (e) { add('Structured data does not parse', page, e.message.slice(0, 80)); }
  }
  if (/redirect|<meta http-equiv="refresh"/i.test(html.slice(0, 600)) && html.length < 2000) continue; // redirect stubs

  if (isNoindex) continue;
  // Indexable pages only from here
  const title = text(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const canon = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (!title) add('Missing title', page);
  else { (titles.get(title) ?? titles.set(title, []).get(title)).push(page); if (title.length > 75) add('Title over 75 characters', page, `${title.length}: ${title}`); }
  if (!desc) add('Missing description', page);
  else { (descs.get(desc) ?? descs.set(desc, []).get(desc)).push(page); if (desc.length < 50) add('Description under 50 characters', page, desc); }
  if (!canon) add('Missing canonical', page);
  else if (canon !== `${ORIGIN}${page === '/' ? '/' : page}`) add('Canonical points elsewhere', page, canon);
  const h1s = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1s !== 1) add(h1s ? 'More than one h1' : 'No h1', page, String(h1s));
  const main = html.split(/<footer[\s>]/)[0];
  let last = 1;
  for (const [, n] of main.matchAll(/<h([1-6])[\s>]/g)) { const lvl = +n; if (lvl > last + 1) { add('Skipped heading level', page, `h${last} → h${lvl}`); break; } last = lvl; }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt(=|\s|>)/.test(tag)) add('Image without alt', page, tag.slice(0, 80));
}
for (const [t, pages] of titles) if (pages.length > 1) add('Duplicate title', pages.slice(0, 3).join(', ') + (pages.length > 3 ? ` +${pages.length - 3}` : ''), t);
for (const [d, pages] of descs) if (pages.length > 1) add('Duplicate description', pages.slice(0, 3).join(', ') + (pages.length > 3 ? ` +${pages.length - 3}` : ''), d.slice(0, 90));

// Sitemap: every entry must exist and be indexable
const maps = readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f));
let inSitemap = 0;
for (const m of maps) {
  for (const [, loc] of readFileSync(join(dist, m), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    inSitemap++;
    const p = loc.replace(ORIGIN, '') || '/';
    if (!exists(p)) add('Sitemap entry missing', p);
    else if (noindex.has(p.replace(/\/$/, '') || '/')) add('Sitemap lists a noindex page', p);
  }
}

console.log(`${files.length} pages (${indexable} open to search engines, ${noindex.size} noindex), ${links} internal links, ${inSitemap} sitemap entries\n`);
const blocking = ['Broken internal link', 'Missing image or script', 'Structured data does not parse', 'Missing title', 'Missing description', 'Missing canonical', 'Canonical points elsewhere', 'No h1', 'More than one h1', 'Sitemap entry missing', 'Sitemap lists a noindex page', 'Duplicate title'];
let bad = 0;
for (const [kind, list] of [...issues].sort((a, b) => b[1].length - a[1].length)) {
  const block = blocking.includes(kind);
  if (block) bad += list.length;
  console.log(`${block ? '✗' : '·'} ${kind}: ${list.length}`);
  for (const { page, detail } of list.slice(0, 8)) console.log(`    ${page}${detail ? `  ${detail}` : ''}`);
}
if (!issues.size) console.log('No issues found.');
process.exit(bad ? 1 : 0);
