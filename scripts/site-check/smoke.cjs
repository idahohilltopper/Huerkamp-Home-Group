// Daily site check, part 2: clicks through the main features on the live site (Playwright).
// Form sends to /api/lead and /api/alerts are intercepted, so no test leads reach Follow Up Boss.
// Run from the repo folder: node scripts/site-check/smoke.cjs
const { chromium } = require('playwright');
const BASE = 'https://www.huerkamphomes.com';
const results = [];
const ok = (name, pass, info = '') => { results.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('idx-eula', '1'); } catch {} });
  const leads = [];
  await ctx.route('**/api/lead', async (r) => { leads.push(r.request().postDataJSON()); await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  await ctx.route('**/api/alerts/**', async (r) => { await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  const errors = [];
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`${p.url()} :: ${e.message.slice(0, 120)}`));
  const step = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, e.message.split('\n')[0].slice(0, 140)); } };

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
  await step('Map search + open a home', async () => {
    await p.goto(BASE + '/home-search?view=map', { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('[data-results] .lcard a', { timeout: 20000 });
    await p.waitForSelector('.maplibregl-canvas', { timeout: 20000 });
    const href = await p.getAttribute('[data-results] .lcard a[href^="/homes/"]', 'href');
    ok('Map search loads with map', true, `first home ${href}`);
    await p.goto(BASE + href, { waitUntil: 'domcontentloaded' });
    const photos = await p.$$eval('img', (e) => e.filter((i) => /photo|cdn\.repliers|repliers/.test(i.src)).length);
    ok('Listing page', (await p.title()).length > 5, `${await p.title()} · ${photos} photo images`);
    const showing = p.locator('form[data-lead="showing"]');
    if (await showing.count()) {
      for (const [n, v] of [['firstName', 'Test'], ['lastName', 'Smoke'], ['email', 'smoke@example.com'], ['phone', '6125550100']]) await showing.locator(`[name=${n}]`).fill(v).catch(() => {});
      for (const s of await showing.locator('select[required]').all()) await s.selectOption({ index: 1 });
      await showing.locator('button[type=submit]').click(); await p.waitForTimeout(1500);
      ok('Schedule a showing form', leads.some((l) => l.form === 'showing'), (await showing.locator('.form__status').textContent()).trim());
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
    ['/land-for-sale', 'community-alert'], ['/hobby-farms-for-sale-mn', 'community-alert'], ['/first-time-home-buyer-minnesota', 'first-time-buyer']]) {
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
    const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 844 });
    await m.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    const btn = m.locator('button[aria-controls], .menu-toggle, [data-menu-toggle]').first();
    await btn.click(); await m.waitForTimeout(500);
    const vis = await m.locator('nav a:visible').count();
    ok('Mobile menu', vis > 5, `${vis} menu links visible`); await m.close();
  });
  await step('Open houses page', async () => {
    const r = await p.goto(BASE + '/open-houses', { waitUntil: 'domcontentloaded' });
    ok('Open houses page', r.status() === 200, `${await p.$$eval('.lcard', (e) => e.length)} homes`);
  });
  await step('Videos page', async () => {
    const r = await p.goto(BASE + '/videos', { waitUntil: 'domcontentloaded' });
    ok('Videos page', r.status() === 200, `${await p.$$eval('a[href*="youtube"], [data-video], .vcard', (e) => e.length)} video links`);
  });
  await step('Alert email "See photos & details" link', async () => {
    const a = await (await fetch(BASE + '/api/search?sort=new', { headers: { 'x-idx-eula': 'agreed' } })).json();
    const mls = a.results?.[0]?.mls;
    await p.goto(`${BASE}/listings/property?mlsNumber=${mls}&boardId=187`, { waitUntil: 'domcontentloaded' });
    await p.waitForURL(/\/homes\//, { timeout: 15000 });
    ok('Alert email "See photos & details" link', true, `MLS ${mls} opened ${p.url().replace(BASE, '')}`);
  });
  ok('No JavaScript errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  console.log(results.join('\n'));
  process.exitCode = results.some((r) => r.startsWith('FAIL')) ? 1 : 0;
  await b.close();
})();
