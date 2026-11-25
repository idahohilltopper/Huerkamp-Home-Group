// IndexNow: tell Bing (and the other IndexNow search engines, which share submissions) which joinhhg.com pages
// are new or changed. ChatGPT search and Microsoft Copilot use Bing's index. Google does not use IndexNow.
//
// Run by .github/workflows/indexnow.yml after a push to main that changes app/. Usage:
//   node scripts/indexnow.mjs <before-sha> <after-sha>     pages whose app/<page>/page.js changed in that range
//   node scripts/indexnow.mjs --all                         every page in the sitemap
// Only pages that answer 200 on the live site are sent, so drafts that aren't published yet are skipped.
// The key is public by design; the same value is served at /<key>.txt (public/).
import { execFileSync } from 'node:child_process';

const KEY = '450ffc5646a64b8eb2be52758202cdea';
const HOST = 'joinhhg.com';
const ORIGIN = `https://${HOST}`;

function changedPaths([before, after]) {
  // A new branch has no "before" commit (all zeros); compare with the commit before "after" instead.
  const range = !before || /^0+$/.test(before) ? [`${after}~1`, after] : [`${before}..${after}`];
  const files = execFileSync('git', ['diff', '--name-only', ...range, '--', 'app'], { encoding: 'utf8' })
    .split('\n').filter(Boolean);
  // A change to a shared component or the layout can touch every page; then send them all.
  if (files.some((f) => !/^app\/(.+\/)?page\.js$/.test(f) && /\.(js|css)$/.test(f) && !f.startsWith('app/api/'))) return null;
  return files.filter((f) => /^app\/(.+\/)?page\.js$/.test(f)).map((f) => f.replace(/^app/, '').replace(/\/?page\.js$/, ''));
}

async function sitemapPaths() {
  const xml = await (await fetch(`${ORIGIN}/sitemap.xml`, { headers: { 'cache-control': 'no-cache' } })).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(ORIGIN, '').replace(/\/$/, ''));
}

const args = process.argv.slice(2);
let paths = args[0] === '--all' ? null : changedPaths(args);
if (paths === null) paths = await sitemapPaths();
if (!paths.length) { console.log('IndexNow: no page changed'); process.exit(0); }

const served = await fetch(`${ORIGIN}/${KEY}.txt`).then((r) => (r.ok ? r.text() : '')).catch(() => '');
if (served.trim() !== KEY) { console.log(`IndexNow skipped: ${ORIGIN}/${KEY}.txt is not live`); process.exit(0); }

const live = [];
for (const p of [...new Set(paths)]) {
  const url = ORIGIN + (p || '/');
  const r = await fetch(url, { redirect: 'manual' }).catch(() => null);
  if (r?.status === 200) live.push(url); else console.log(`skipped (${r?.status ?? 'no answer'}): ${url}`);
}
if (!live.length) { console.log('IndexNow: none of the changed pages are live'); process.exit(0); }

const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList: live }),
});
console.log(`IndexNow: sent ${live.length} → ${r.status}\n${live.join('\n')}`);
process.exitCode = r.status === 200 || r.status === 202 ? 0 : 1;
