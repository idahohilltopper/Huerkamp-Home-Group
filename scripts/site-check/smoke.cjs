// Site check: clicks through the main features like a buyer would (Playwright).
// Form sends to /api/lead and /api/alerts are intercepted, so no test leads reach Follow Up Boss.
// Run from the repo folder: node scripts/site-check/smoke.cjs
//   SITE_BASE=http://localhost:4400   test a local build before it goes live (scripts/site-check/preflight.sh)
//   BROWSER=webkit | firefox | chromium (default)   the engine: webkit is Safari's (iPhone, Mac), firefox is Firefox's
// Steps that need the live site's own listing pages, or a Chrome-only switch, are skipped where they can't run.
const pw = require('playwright');
const BROWSER = process.env.BROWSER || 'chromium';
const engine = pw[BROWSER];
const BASE = (process.env.SITE_BASE || 'https://www.huerkamphomes.com').replace(/\/$/, '');
// Safari reports a map-image download cut off because the tab closed (our test moving on) as an "access control"
// error; that isn't something a visitor sees, so it isn't counted.
const NOISE = /due to access control checks|Load failed|NetworkError when attempting to fetch|The operation was aborted|AbortError/i;
const LOCAL = /localhost|127\.0\.0\.1/.test(BASE);
// A phone of the right kind for the engine (Firefox can't pretend to be a phone, so it gets a phone-sized window).
const PHONE = BROWSER === 'webkit' ? pw.devices['iPhone 14'] : BROWSER === 'chromium' ? pw.devices['Pixel 7'] : { viewport: { width: 390, height: 844 } };
const results = [];
const ok = (name, pass, info = '') => { results.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };
(async () => {
  const b = await engine.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('idx-eula', '1'); } catch {} });
  const leads = [];
  await ctx.route('**/api/lead', async (r) => { leads.push(r.request().postDataJSON()); await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  await ctx.route('**/api/alerts/**', async (r) => { await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  await ctx.route('**/api/client-error', (r) => r.fulfill({ status: 202, body: '{}' })); // our own test runs aren't visitor errors
  const skip = (name, why) => results.push(`SKIP  ${name}  — ${why}`);
  const errors = [];
  // Each step gets a fresh tab, so one page still busy (a redirect, a running search) can't break the next step's
  // navigation. Safari and Firefox abort a navigation that starts while the page is still navigating; Chrome doesn't.
  let p = null;
  const fresh = async () => {
    await p?.close().catch(() => {});
    p = await ctx.newPage();
    p.on('pageerror', (e) => { if (!NOISE.test(e.message)) errors.push(`${p.url()} :: ${e.message.slice(0, 120)}`); });
    p.__console = [];
    p.on('console', (m) => { if (m.type() === 'error') p.__console.push(m.text().slice(0, 140)); });
    p.on('framenavigated', (f) => { if (f === p.mainFrame()) (p.__navs ??= []).push(f.url().replace(BASE, '')); });
  };
  // What the page looked like when a step failed, so a failure in a browser we can't run here can be understood
  // from the log alone: the address, every page it went to, the results cards and where they sit, console errors.
  const diagnose = async () => {
    try {
      const d = await p.evaluate(() => {
        const r = document.querySelector('[data-results]'), c = document.querySelector('[data-results] .lcard');
        const box = (e) => { if (!e) return 'none'; const b = e.getBoundingClientRect(), st = getComputedStyle(e); return `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)} display=${st.display} visibility=${st.visibility}`; };
        return `cards=${document.querySelectorAll('[data-results] .lcard').length}; results ${box(r)}; first card ${box(c)}; map=${document.querySelector('.leaflet-container') ? 'backup' : document.querySelector('.maplibregl-canvas') ? 'main' : 'none'}; window ${innerWidth}x${innerHeight}`;
      });
      return `[at ${p.url().replace(BASE, '')}; went to: ${(p.__navs ?? []).join(' > ')}; ${d}; console errors: ${(p.__console ?? []).slice(0, 3).join(' | ') || 'none'}]`;
    } catch (e) { return `[no page details: ${e.message.slice(0, 80)}]`; }
  };
  const step = async (name, fn) => {
    await fresh();
    try { await fn(); } catch (e) {
      // A navigation aborted by the browser itself (not the site) gets one more try on a new tab.
      if (/interrupted by|NS_BINDING_ABORTED|NS_ERROR_ABORT|frame was detached/.test(e.message)) {
        await fresh();
        try { return await fn(); } catch (e2) { e = e2; }
      }
      ok(name, false, `${e.message.replace(/\s+/g, ' ').slice(0, 300)} ${await diagnose()}`);
    }
  };

  await step('Home page + city search', async () => {
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await p.fill('#hsrch-q', 'Lakeville'); await p.waitForTimeout(400);
    await p.press('#hsrch-q', 'Enter'); await p.waitForURL(/home-search/, { timeout: 15000 });
    await p.waitForSelector('[data-results] .lcard', { timeout: 20000 });
    const n = await p.$$eval('[data-results] .lcard', (e) => e.length);
    ok('Home page + city search', n > 0, `${n} homes shown, ${p.url().replace(BASE, '')}`);
  });
  await step('Address suggestions (Google)', async () => {
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await p.click('#hsrch-q'); await p.type('#hsrch-q', '14300 Nicol', { delay: 80 });
    await p.waitForSelector('.hsrch__addr', { timeout: 10000 });
    ok('Address suggestions (Google)', true, (await p.textContent('.hsrch__addr')).replace(/\s+/g, ' '));
  });
  if (LOCAL) skip('Map search + open a home', 'needs the live listing pages'); else await step('Map search + open a home', async () => {
    await p.goto(BASE + '/home-search?view=map', { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('[data-results] .lcard a', { timeout: 20000 });
    await p.waitForSelector('.maplibregl-canvas, .leaflet-container', { timeout: 20000 }); // the main map, or the backup map in browsers without 3D graphics
    const href = await p.getAttribute('[data-results] .lcard a[href^="/homes/"]', 'href');
    ok('Map search loads with map', true, `first home ${href}`);
    await p.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {}); // the page may reload itself once right after a deploy
    await p.goto(BASE + href, { waitUntil: 'domcontentloaded' });
    const photos = await p.$$eval('img', (e) => e.filter((i) => /photo|cdn\.repliers|repliers/.test(i.src)).length);
    ok('Listing page', (await p.title()).length > 5, `${await p.title()} · ${photos} photo images`);
    const showing = p.locator('form[data-lead="showing"]');
    if (await showing.count()) {
      for (const [n, v] of [['firstName', 'Test'], ['lastName', 'Smoke'], ['email', 'smoke@example.com'], ['phone', '6125550100']]) await showing.locator(`[name=${n}]`).fill(v).catch(() => {});
      for (const s of await showing.locator('select[required]').all()) await s.selectOption({ index: 1 });
      await showing.locator('button[type=submit]').click(); await p.waitForTimeout(1500);
      const sent = leads.some((l) => l.form === 'showing');
      // When it isn't sent, say which fields the browser refused (its own form check), so a Safari-only problem is clear.
      const bad = sent ? '' : await showing.evaluate((f) => [...f.querySelectorAll(':invalid')].map((e) => `${e.name || e.id}: ${e.validationMessage}`).join('; '));
      ok('Schedule a showing form', sent, `${(await showing.locator('.form__status').textContent()).trim()}${bad ? ` [fields refused: ${bad}]` : ''}`);
    } else ok('Schedule a showing form', false, 'form not found');
  });
  await step('Sold homes view', async () => {
    await p.goto(BASE + '/home-search?status=sold&place=lakeville', { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('[data-results] .lcard', { timeout: 25000 });
    ok('Sold homes view', true, `${await p.$$eval('[data-results] .lcard', (e) => e.length)} sold homes`);
  });
  await step('Instant home estimate', async () => {
    await p.goto(BASE + '/home-estimate?address=17000+Kenwood+Trail%2C+Lakeville&zip=55044', { waitUntil: 'domcontentloaded' });
    const f = p.locator('[data-estimate-form]');
    for (const [n, v] of [['firstName', 'Test'], ['lastName', 'Smoke'], ['email', 'smoke@example.com'], ['phone', '6125550100'], ['sqft', '2000']]) await f.locator(`[name=${n}]`).fill(v);
    await f.locator('[name=beds]').selectOption({ index: 3 }).catch(() => {});
    await f.locator('button[type=submit]').click();
    await p.waitForSelector('.est__range', { timeout: 30000 });
    ok('Instant home estimate', true, (await p.textContent('.est__range')).trim());
  });
  for (const [path, form] of [['/contact', 'contact'], ['/cash-offer', 'cash-offer'], ['/expired-listing', 'expired'], ['/sell', null],
    // Lead forms added 2026-11-07/08: lake report, new construction (hub and a builder page), land, hobby farms, first-time buyer.
    ['/lake-homes/brainerd', 'lake-report'], ['/new-construction', 'new-construction'], ['/new-construction/builders/lennar', 'new-construction'],
    ['/land-for-sale', 'community-alert'], ['/hobby-farms-for-sale-mn', 'community-alert'], ['/duplexes-for-sale-mn', 'community-alert'], ['/mid-century-modern-homes-for-sale', 'community-alert'], ['/historic-homes-for-sale', 'community-alert'], ['/first-time-home-buyer-minnesota', 'first-time-buyer'],
    ['/selling/cost-to-sell-a-house-in-minnesota', 'seller-guide'], ['/buying/listing-status-meanings', 'buyer-guide'], ['/buying/veterans-and-military-home-buyers-minnesota', 'buyer-guide'], ['/downsizing/selling-a-house-in-probate-minnesota', 'downsizing']]) {
    await step(`Form ${path}`, async () => {
      await p.goto(BASE + path, { waitUntil: 'domcontentloaded' });
      const f = form ? p.locator(`form[data-lead="${form}"]`).first() : p.locator('form[data-lead]').first();
      for (const n of ['firstName', 'lastName', 'email', 'phone', 'address', 'zip', 'message']) {
        const el = f.locator(`[name=${n}]`); if (await el.count()) await el.fill({ firstName: 'Test', lastName: 'Smoke', email: 'smoke@example.com', phone: '6125550100', address: '1 Main St', zip: '55044', message: 'test' }[n]);
      }
      for (const s of await f.locator('select').all()) await s.selectOption({ index: 1 }).catch(() => {});
      const before = leads.length; await f.locator('button[type=submit]').click(); await p.waitForTimeout(1500);
      ok(`Form ${path}`, leads.length > before, (await f.locator('.form__status').textContent().catch(() => '')).trim().slice(0, 60));
    });
  }
  await step('Net proceeds calculator', async () => {
    await p.goto(BASE + '/calculators/seller-net-proceeds', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1500);
    const t = (await p.innerText('main')).match(/\$[\d,]{4,}/g) ?? [];
    ok('Net proceeds calculator', t.length > 2, `${t.length} dollar figures shown`);
  });
  await step('Mobile menu', async () => {
    const pc = await b.newContext(PHONE); const m = await pc.newPage();
    await m.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    const btn = m.locator('button[aria-controls], .menu-toggle, [data-menu-toggle]').first();
    await btn.click(); await m.waitForTimeout(500);
    const vis = await m.locator('nav a:visible').count();
    ok('Mobile menu', vis > 5, `${vis} menu links visible`); await pc.close();
  });
  await step('Open houses page', async () => {
    const r = await p.goto(BASE + '/open-houses', { waitUntil: 'domcontentloaded' });
    ok('Open houses page', r.status() === 200, `${await p.$$eval('.lcard', (e) => e.length)} homes`);
  });
  await step('Videos page', async () => {
    const r = await p.goto(BASE + '/videos', { waitUntil: 'domcontentloaded' });
    ok('Videos page', r.status() === 200, `${await p.$$eval('a[href*="youtube"], [data-video], .vcard', (e) => e.length)} video links`);
  });
  if (LOCAL) skip('Alert email "See photos & details" link', 'needs the live site'); else await step('Alert email "See photos & details" link', async () => {
    const a = await (await fetch(BASE + '/api/search?sort=new', { headers: { 'x-idx-eula': 'agreed' } })).json();
    const mls = a.results?.[0]?.mls;
    await p.goto(`${BASE}/listings/property?mlsNumber=${mls}&boardId=187`, { waitUntil: 'domcontentloaded' });
    await p.waitForURL(/\/homes\//, { timeout: 15000 });
    ok('Alert email "See photos & details" link', true, `MLS ${mls} opened ${p.url().replace(BASE, '')}`);
  });
  // "Use my current location" opens a map of the 3 miles around you; checked on a big desktop screen and a phone,
  // since a blank map there was reported (Nov 8, 2026). The map must draw, with its zoom buttons, and no empty boxes.
  for (const [label, opts] of [['big desktop', { viewport: { width: 2000, height: 740 } }], ['phone', PHONE]]) {
    await step(`Near-me map (${label})`, async () => {
      const mc = await b.newContext(opts);
      await mc.addInitScript(() => { try { sessionStorage.setItem('idx-eula', '1'); } catch {} });
      await mc.route('**/api/client-error', (r) => r.fulfill({ status: 202, body: '{}' }));
      const m = await mc.newPage();
      m.on('pageerror', (e) => errors.push(`${m.url()} :: ${e.message.slice(0, 120)}`));
      await m.goto(BASE + '/home-search?bbox=-93.4142,44.5220,-93.2458,44.6080&view=map', { waitUntil: 'domcontentloaded' });
      await m.waitForSelector('.maplibregl-ctrl-zoom-in, .leaflet-control-zoom-in, .hs-mapfail', { state: 'visible', timeout: 25000 });
      const fail = await m.locator('.hs-mapfail').count();
      const loaded = await m.waitForFunction(() => (document.querySelector('.maplibregl-canvas')?.width ?? 0) > 0 || !!document.querySelector('.leaflet-tile-loaded'), null, { timeout: 15000 }).then(() => true, () => false);
      const which = await m.locator('.leaflet-container').count() ? 'backup map' : 'main map';
      const emptyBoxes = await m.$$eval('.hs-addr, .hs-panel [role=alert]', (els) => els.filter((e) => e.offsetParent && !e.textContent.trim() && e.getBoundingClientRect().height > 20).length);
      ok(`Near-me map (${label})`, loaded && !fail && !emptyBoxes, `${which}, ${await m.$$eval('[data-results] .lcard', (e) => e.length)} homes listed${emptyBoxes ? `, ${emptyBoxes} empty box(es) showing` : ''}${fail ? ', map failed message shown' : ''}`);
      await mc.close();
    });
  }
  // "Use my current location" on the home page: the search page must open right away (under 3 s, while the browser
  // finds the location) and then show homes near that spot (Lakeville here).
  await step('Use my current location', async () => {
    const c3 = await b.newContext({ viewport: { width: 1366, height: 900 }, geolocation: { latitude: 44.6497, longitude: -93.2427 }, permissions: ['geolocation'] });
    await c3.addInitScript(() => { try { sessionStorage.setItem('idx-eula', '1'); } catch {} });
    await c3.route('**/api/client-error', (r) => r.fulfill({ status: 202, body: '{}' }));
    const m = await c3.newPage();
    await m.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await m.click('#hsrch-q'); await m.waitForTimeout(300);
    const t0 = Date.now();
    await m.locator('text=Use my current location').first().click();
    await m.waitForURL(/home-search/, { timeout: 10000, waitUntil: 'domcontentloaded' }); // when the page is showing, not when every image has loaded
    const opened = Date.now() - t0;
    await m.waitForFunction(() => document.querySelector('[data-h1]')?.textContent?.includes('near you'), null, { timeout: 20000 });
    const n = await m.$$eval('[data-results] .lcard', (e) => e.length);
    ok('Use my current location', opened < 3000 && n > 0, `search page opened in ${(opened / 1000).toFixed(1)} s, ${n} homes near the spot`);
    await c3.close();
  });
  // A browser with 3D graphics (WebGL) turned off gets the backup flat map (src/scripts/search-map-flat.ts), with pins.
  if (BROWSER !== 'chromium') skip('Map without 3D graphics', 'Chrome-only switch'); else await step('Map without 3D graphics', async () => {
    const b2 = await pw.chromium.launch({ args: ['--disable-webgl', '--disable-3d-apis'] });
    const c2 = await b2.newContext({ viewport: { width: 1366, height: 900 } });
    await c2.addInitScript(() => { try { sessionStorage.setItem('idx-eula', '1'); } catch {} });
    await c2.route('**/api/client-error', (r) => r.fulfill({ status: 202, body: '{}' })); // don't count our own test as a visitor error
    const m = await c2.newPage();
    await m.goto(BASE + '/home-search?place=lakeville&view=map', { waitUntil: 'domcontentloaded' });
    await m.waitForSelector('.leaflet-tile-loaded', { timeout: 25000 });
    await m.waitForFunction(() => document.querySelectorAll('[data-results] .lcard').length > 0, null, { timeout: 20000 });
    ok('Map without 3D graphics', !(await m.locator('.hs-mapfail').count()), `flat map with ${await m.locator('.leaflet-tile-loaded').count()} map tiles`);
    await b2.close();
  });
  // What visitors' browsers hit in the last 7 days (netlify/functions/client-error.mjs).
  await step('Visitor errors (7 days)', async () => {
    const r = await (await fetch('https://www.huerkamphomes.com/api/client-error')).json();
    r.total = (r.errors ?? []).filter((g) => !['map-flat', 'stale'].includes(g.kind) && !/MetaMask|ethereum|web3/i.test(g.msg)).reduce((n, g) => n + g.count, 0); // the backup map working as designed isn't an error
    const top = (r.errors ?? []).slice(0, 5).map((g) => `${g.count}× ${g.kind} "${g.msg.slice(0, 70)}" on ${g.page}`).join(' | ');
    ok('Visitor errors (7 days)', (r.total ?? 0) <= 20, `${r.total ?? 0} reported${top ? `: ${top}` : ''}`);
  });
  ok('No JavaScript errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  console.log(`Site check: ${BASE} in ${BROWSER} (${new Date().toISOString()})`);
  console.log(results.join('\n'));
  process.exitCode = results.some((r) => r.startsWith('FAIL')) ? 1 : 0;
  await b.close();
})();
