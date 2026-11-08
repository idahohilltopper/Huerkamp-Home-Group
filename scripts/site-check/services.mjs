// Hourly check of the outside services the site depends on, and of its own data. No browser needed.
//   - map images: the main map's style and one tile (OpenFreeMap), the backup map's tile (OpenStreetMap)
//   - homes for sale: /api/search answers with homes; the last MLS download (/mls-status.json) is recent and complete
//   - sold homes: /api/sold answers (Repliers)
//   - address suggestions: /api/address-suggest answers (Google Places)
//   - lead form endpoint: /api/lead is up (asked with GET, which it refuses; nothing is sent to Follow Up Boss)
//   - visitor errors: no sudden jump in the last hour (netlify/functions/client-error.mjs)
// Exit code 1 when anything fails. Usage: node scripts/site-check/services.mjs
const SITE = (process.env.SITE_BASE || 'https://www.huerkamphomes.com').replace(/\/$/, '');
const UA = { 'user-agent': 'Mozilla/5.0 (Huerkamp Home Group site check)' };
const lines = [];
const ok = (name, pass, info = '') => lines.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`);
const get = async (url, opts = {}) => {
  const t0 = Date.now();
  const r = await fetch(url, { signal: AbortSignal.timeout(20000), ...opts, headers: { ...UA, ...(opts.headers ?? {}) } });
  return { r, ms: Date.now() - t0 };
};
const check = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, e.name === 'TimeoutError' ? 'no answer in 20 s' : e.message.slice(0, 120)); } };

await check('Main map style (OpenFreeMap)', async () => {
  const { r, ms } = await get('https://tiles.openfreemap.org/styles/liberty');
  const style = await r.json();
  const tj = await (await get(Object.values(style.sources).find((s) => s.url)?.url)).r.json();
  const tile = await get(tj.tiles[0].replace('{z}', '12').replace('{x}', '987').replace('{y}', '1479'));
  ok('Main map style (OpenFreeMap)', r.ok && tile.r.ok, `style ${r.status} in ${ms} ms, tile ${tile.r.status} in ${tile.ms} ms`);
});
await check('Backup map tiles (OpenStreetMap)', async () => {
  const { r, ms } = await get('https://tile.openstreetmap.org/12/987/1479.png');
  ok('Backup map tiles (OpenStreetMap)', r.ok, `${r.status} in ${ms} ms`);
});
await check('Home search (/api/search)', async () => {
  const { r, ms } = await get(`${SITE}/api/search?place=lakeville`, { headers: { 'x-idx-eula': 'agreed' } });
  const a = await r.json();
  ok('Home search (/api/search)', r.ok && a.total > 50, `${a.total} Lakeville homes in ${ms} ms`);
});
await check('MLS download (last build)', async () => {
  const s = await (await get(`${SITE}/mls-status.json?t=${Date.now()}`)).r.json();
  const age = (Date.now() - Date.parse(s.listingsAt)) / 3600e3;
  // Builds run hourly 8 AM-10 PM Central, so overnight the newest download can be up to about 10 hours old.
  ok('MLS download (last build)', s.mode === 'live' && s.listings > 5000 && age < 11 && !(s.errors ?? []).length,
    `${s.listings} listings, ${age.toFixed(1)} h old${(s.errors ?? []).length ? `, errors: ${s.errors[0]}` : ''}${s.lakeSales?.failedLakes ? `; lake sales: ${s.lakeSales.failedLakes} lakes failed` : ''}`);
});
await check('Sold homes (/api/sold)', async () => {
  const { r, ms } = await get(`${SITE}/api/sold?place=lakeville`, { headers: { 'x-idx-eula': 'agreed' } });
  const a = await r.json();
  ok('Sold homes (/api/sold)', r.ok && a.ok && a.total > 0, `${a.total} Lakeville sales in ${ms} ms`);
});
await check('Address suggestions (Google)', async () => {
  const { r, ms } = await get(`${SITE}/api/address-suggest?q=${encodeURIComponent('14300 Nicollet')}`);
  const a = await r.json();
  ok('Address suggestions (Google)', r.ok && (a.suggestions ?? []).length > 0, `${(a.suggestions ?? []).length} suggestions in ${ms} ms`);
});
await check('Lead form endpoint', async () => {
  const { r, ms } = await get(`${SITE}/api/lead`);
  ok('Lead form endpoint', r.status < 500, `up (answered ${r.status} to a plain GET in ${ms} ms)`);
});
await check('Visitor errors (last hour)', async () => {
  const a = await (await get(`${SITE}/api/client-error?hours=1`)).r.json();
  // Not errors: the backup map doing its job, a page reloading itself after a deploy, browser-extension noise.
  const real = (a.errors ?? []).filter((g) => !['map-flat', 'stale'].includes(g.kind) && !/MetaMask|ethereum|web3/i.test(g.msg));
  const n = real.reduce((s, g) => s + g.count, 0);
  ok('Visitor errors (last hour)', n <= 10, `${n} in the last hour${real.length ? `: ${real.slice(0, 3).map((g) => `${g.count}× "${g.msg.slice(0, 60)}" on ${g.page}`).join(' | ')}` : ''}`);
});

console.log(`Services check: ${SITE} (${new Date().toISOString()})`);
console.log(lines.join('\n'));
process.exitCode = lines.some((l) => l.startsWith('FAIL')) ? 1 : 0;
