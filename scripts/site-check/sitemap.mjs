// Daily site check, part 1: every page in the live sitemap answers 200. Run: node scripts/site-check/sitemap.mjs
const base = 'https://www.huerkamphomes.com';
const idx = await (await fetch(base + '/sitemap-index.xml')).text();
const maps = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
let urls = [];
for (const m of maps) urls.push(...[...(await (await fetch(m)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]));
console.log('sitemaps', maps.length, 'urls', urls.length);
const bad = []; let done = 0;
const q = [...urls];
async function worker() { while (q.length) { const u = q.shift(); try { const r = await fetch(u, { redirect: 'manual' }); if (r.status !== 200) bad.push(`${r.status} ${u} ${r.headers.get('location') ?? ''}`); await r.arrayBuffer(); } catch (e) { bad.push(`ERR ${u} ${e.message}`); } done++; } }
await Promise.all(Array.from({ length: 12 }, worker));
console.log('checked', done, 'problems', bad.length); console.log(bad.slice(0, 40).join('\n'));
process.exitCode = bad.length ? 1 : 0;
