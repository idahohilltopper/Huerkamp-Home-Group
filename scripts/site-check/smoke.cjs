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
  // Never send our own test visits to Meta Pixel or Google Analytics: their hits are answered here and go nowhere
  // (until Nov 10, 2026 every check run showed up in Google Analytics as ~60 visitors).
  { const nc = b.newContext.bind(b); b.newContext = async (o) => { const c = await nc(o); await c.route(/facebook\.com\/tr|google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect/, (r) => r.fulfill({ status: 200, body: "" })); return c; }; }
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
      // The tour form asks for the day and time first; "Continue" shows the name, email and phone fields.
      const cont = showing.locator('[data-tour-next]');
      if (await cont.count() && await cont.isVisible()) await cont.click();
      for (const [n, v] of [['firstName', 'Test'], ['lastName', 'Smoke'], ['email', 'smoke@example.com'], ['phone', '6125550100']]) await showing.locator(`[name=${n}]`).fill(v).catch(() => {});
      for (const s of await showing.locator('select[required]').all()) await s.selectOption({ index: 1 });
      // Wait up to 10 s for the send: a listing with many photos can keep a slow browser busy (Safari once took over 1.5 s).
      await showing.locator('button[type=submit]').click();
      for (let t = 0; t < 20 && !leads.some((l) => l.form === 'showing'); t++) await p.waitForTimeout(500);
      const sent = leads.some((l) => l.form === 'showing');
      // When it isn't sent, say which fields the browser refused (its own form check), so a Safari-only problem is clear.
      const bad = sent ? '' : await showing.evaluate((f) => [...f.querySelectorAll(':invalid')].map((e) => `${e.name || e.id}: ${e.validationMessage}`).join('; '));
      const btn = sent ? '' : ` [button shows "${(await showing.locator('button[type=submit]').textContent()).trim()}"]`;
      ok('Schedule a showing form', sent, `${(await showing.locator('.form__status').textContent()).trim()}${bad ? ` [fields refused: ${bad}]` : ''}${btn}`);
    } else ok('Schedule a showing form', false, 'form not found');
    // Nearby homes strip under Neighborhood: the arrow scrolls it sideways.
    const strip = p.locator('.home__nearby').first();
    if (await strip.count()) {
      await strip.scrollIntoViewIfNeeded();
      const list = strip.locator('[data-strip-list]');
      const wide = await list.evaluate((e) => e.scrollWidth > e.clientWidth + 10);
      await strip.locator('[data-strip-step="1"]').click();
      await p.waitForTimeout(900);
      const moved = await list.evaluate((e) => e.scrollLeft > 0);
      ok('Listing page: nearby homes arrows', !wide || moved, `${await list.locator('li').count()} homes${wide ? (moved ? ', arrow scrolled' : ', arrow did not scroll') : ', all fit'}`);
    } else ok('Listing page: nearby homes arrows', true, 'no nearby homes on this listing');
  });
  // Share a home (Nov 10, 2026): the Share button opens the "Share this home" box with the home's link (desktop).
  await step('Listing page: share', async () => {
    await p.goto(BASE + '/homes-for-sale/minneapolis', { waitUntil: 'domcontentloaded' });
    const href = await p.getAttribute('a[href^="/homes/"]:not([href^="/homes/listing"])', 'href').catch(() => null);
    if (!href) return ok('Listing page: share', true, 'no listing pages to try');
    await p.goto(BASE + href, { waitUntil: 'domcontentloaded' });
    await p.locator('.home__actions [data-share]').first().click();
    await p.waitForSelector('dialog.share-dlg[open]', { timeout: 5000 });
    const link = await p.inputValue('dialog.share-dlg input');
    await p.click('dialog.share-dlg [data-m="copy"]');
    await p.waitForTimeout(400);
    const status = (await p.textContent('dialog.share-dlg .share-dlg__status'))?.trim();
    await p.keyboard.press('Escape');
    ok('Listing page: share', link.includes('/homes/') && link.includes('utm_source=share') && status === 'Link copied.', `${link.replace(/^https?:\/\/[^/]+/, '').slice(0, 70)} · ${status || 'no status'}`);
  });
  // Map search "Save search" (Nov 11, 2026): opens the alert form in a popup over the map, and puts it back on close.
  await step('Map search: Save search popup', async () => {
    // As a visitor who already signed up (no nudge on the page): the popup must work and throw no errors (Nov 11, 2026).
    await p.goto(BASE + '/home-search?place=lakeville', { waitUntil: 'load' });
    await p.evaluate(() => { try { localStorage.setItem('hhg-registered', '1'); } catch {} });
    await p.reload({ waitUntil: 'load' });
    await p.locator('a.hs-save').first().click();
    await p.waitForSelector('dialog.ss-dlg[open] form[data-lead="community-alert"]', { timeout: 5000 });
    const summary = (await p.textContent('dialog.ss-dlg [data-alert-summary]').catch(() => '')) ?? '';
    await p.click('dialog.ss-dlg .ss-dlg__x');
    const back = await p.locator('#alerts form[data-lead="community-alert"]').count();
    ok('Map search: Save search popup', back === 1 && /lakeville/i.test(summary), `popup showed "${summary.trim().slice(0, 60)}"; form back in place: ${back === 1}`);
  });
  // Blog posts end with a new-listing sign-up (Nov 11, 2026): the story's town, or the whole Twin Cities.
  await step('Blog post: listing sign-up', async () => {
    await p.goto(BASE + '/blog/campbell-shores-prior-lake-new-homes-campbell-lake', { waitUntil: 'domcontentloaded' });
    const town = await p.$eval('form[data-lead="community-alert"]', (f) => ({ q: f.dataset.alertQuery ?? '', consent: !!f.querySelector('[name=smsConsent]') })).catch(() => null);
    await p.goto(BASE + '/blog/best-time-to-sell-a-house-in-minnesota', { waitUntil: 'domcontentloaded' });
    const general = await p.$eval('form[data-lead="community-alert"]', (f) => ({ q: f.dataset.alertQuery ?? '', area: !!f.querySelector('[name=message]') })).catch(() => null);
    ok('Blog post: listing sign-up', !!town && /prior-lake/.test(town.q) && town.consent && !!general && !general.q && general.area,
      `local story: ${town ? `saved search ${town.q}` : 'no form'}; general post: ${general ? (general.area ? 'asks for the area' : 'form without area') : 'no form'}`);
  });
  // Sign-up popup (Jason, Nov 11, 2026): name, email, phone and the Privacy Policy box are required; the call/text
  // consent box is optional and unchecked (TCPA). Checked in the page itself; nothing is sent.
  await step('Sign-up form: required fields', async () => {
    await p.goto(BASE + '/homes-for-sale/minneapolis', { waitUntil: 'domcontentloaded' });
    const href = await p.getAttribute('a[href^="/homes/"]:not([href^="/homes/listing"])', 'href').catch(() => null);
    if (!href) return ok('Sign-up form: required fields', true, 'no listing pages to try');
    await p.goto(BASE + href, { waitUntil: 'load' });
    const s = await p.$eval('form[data-lead="register"]', (f) => ({
      req: ['firstName', 'lastName', 'email', 'phone', 'privacyAgree'].filter((n) => !f.querySelector(`[name=${n}]`)?.required),
      sms: f.querySelector('[name=smsConsent]') ? (f.querySelector('[name=smsConsent]').required || f.querySelector('[name=smsConsent]').checked ? 'required or pre-checked' : 'optional') : 'missing',
    })).catch((e) => ({ req: ['form missing'], sms: e.message }));
    ok('Sign-up form: required fields', !s.req.length && s.sms === 'optional', `${s.req.length ? `not required: ${s.req.join(', ')}` : 'name, email, phone, privacy box required'}; call/text box ${s.sms}`);
  });
  // NorthstarMLS Rule 12.3(i): the disclaimer is at least as large as the largest listing text on the page (price, stats).
  await step('MLS disclaimer size', async () => {
    await p.goto(BASE + '/homes-for-sale/minneapolis', { waitUntil: 'domcontentloaded' });
    const href = await p.getAttribute('a[href^="/homes/"]:not([href^="/homes/listing"])', 'href').catch(() => null);
    if (!href) return ok('MLS disclaimer size', true, 'no listing pages to try');
    await p.goto(BASE + href, { waitUntil: 'domcontentloaded' });
    const s = await p.evaluate(() => {
      const px = (sel) => Math.max(0, ...[...document.querySelectorAll(sel)].map((e) => parseFloat(getComputedStyle(e).fontSize)));
      return { disc: px('.idx-disc__big'), listing: px('.home__price, .home__stats dd, .home__title, .lcard__price') };
    });
    ok('MLS disclaimer size', s.disc > 0 && s.disc >= s.listing, `disclaimer ${s.disc}px, largest listing text ${s.listing}px`);
  });
  // Activity feed for Follow Up Boss (Nov 11, 2026, like Ylopo's): a known visitor's home views (once per home per day)
  // and map searches (after 8 s without changes) are sent by email only. /api/lead is intercepted, nothing reaches FUB.
  await step('Known visitor: views and searches reach Follow Up Boss', async () => {
    const ec = await b.newContext();
    await ec.addInitScript(() => { try { sessionStorage.setItem('idx-eula', '1'); localStorage.setItem('hhg-fav-me', JSON.stringify({ firstName: 'Test', lastName: 'Activity', email: 'smoke-activity@example.com', phone: '' })); } catch {} });
    const sent = [];
    await ec.route('**/api/lead', (r) => { sent.push(r.request().postDataJSON()); r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
    await ec.route('**/api/client-error', (r) => r.fulfill({ status: 202, body: '{}' }));
    await ec.route(/google-analytics\.com|googletagmanager\.com\/.*collect|facebook\.com\/tr/, (r) => r.fulfill({ status: 204, body: '' }));
    const m = await ec.newPage();
    try {
      await m.goto(BASE + '/homes-for-sale/minneapolis', { waitUntil: 'domcontentloaded' });
      const href = await m.getAttribute('a[href^="/homes/"]:not([href^="/homes/listing"])', 'href').catch(() => null);
      if (!href) return ok('Known visitor: views and searches reach Follow Up Boss', true, 'no listing pages to try');
      for (let i = 0; i < 2; i++) { await m.goto(BASE + href, { waitUntil: 'load' }); await m.waitForTimeout(1500); }
      const views = sent.filter((l) => l.form === 'activity-view');
      await m.locator('.home__actions [data-share]').first().click();
      await m.click('dialog.share-dlg [data-m="copy"]');
      for (let t = 0; t < 10 && !sent.some((l) => l.form === 'hot-share'); t++) await m.waitForTimeout(300);
      const shared = sent.some((l) => l.form === 'hot-share' && l.fields?.shareMethod === 'copy');
      await m.goto(BASE + '/home-search?place=lakeville&min=300000', { waitUntil: 'load' });
      for (let t = 0; t < 30 && !sent.some((l) => l.form === 'activity-search'); t++) await m.waitForTimeout(500);
      const search = sent.find((l) => l.form === 'activity-search');
      const good = views.length === 1 && views[0].fields?.email === 'smoke-activity@example.com' && !!views[0].fields?.propMls && !views[0].fields?.firstName
        && shared && !!search && /lakeville/i.test(search.fields?.searchUrl ?? '');
      ok('Known visitor: views and searches reach Follow Up Boss', good, `${views.length} view event(s) for 2 visits (MLS ${views[0]?.fields?.propMls ?? '?'}); share ${shared ? 'sent' : 'not sent'}; search: ${search ? search.fields.search : 'not sent'}`);
    } finally { await ec.close(); }
  });
  // A lead form sent before the page's scripts have loaded (slow phone, listing with many photos) must still be sent,
  // without the page reloading or the details landing in the address (found Nov 9, 2026). Scripts are held back 4 s.
  await step('Form sent while the page is still loading', async () => {
    const ec = await b.newContext();
    await ec.addInitScript(() => { try { sessionStorage.setItem('idx-eula', '1'); } catch {} });
    const sent = [];
    await ec.route('**/api/lead', (r) => { sent.push(r.request().postDataJSON()); r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
    await ec.route('**/api/client-error', (r) => r.fulfill({ status: 202, body: '{}' }));
    await ec.route('**/_astro/*.js', async (r) => { await new Promise((x) => setTimeout(x, 4000)); r.continue().catch(() => {}); });
    const m = await ec.newPage();
    try {
      await m.goto(BASE + '/contact', { waitUntil: 'commit' });
      const f = m.locator('form[data-lead="contact"]').first();
      await f.locator('[name=email]').waitFor({ timeout: 20000 });
      for (const [n, v] of [['firstName', 'Test'], ['lastName', 'Early'], ['email', 'smoke-early@example.com'], ['phone', '6125550100'], ['message', 'test']]) {
        const el = f.locator(`[name=${n}]`); if (await el.count()) await el.fill(v);
      }
      for (const sel of await f.locator('select[required]').all()) await sel.selectOption({ index: 1 }).catch(() => {});
      const url = m.url();
      await f.locator('button[type=submit]').click({ noWaitAfter: true });
      for (let t = 0; t < 30 && !sent.length; t++) await m.waitForTimeout(500);
      const leaked = m.url() !== url || /early/.test(m.url());
      ok('Form sent while the page is still loading', sent.length === 1 && !leaked, sent.length ? 'held until ready, then sent once' : `not sent${leaked ? '; the page reloaded with the details in its address' : ''}`);
    } finally { await ec.close(); }
  });
  // "Remove boundary" (Jason, Nov 9, 2026): drops the town's outline and searches the map area instead.
  await step('Map: remove boundary', async () => {
    await p.setViewportSize({ width: 1366, height: 900 });
    await p.goto(BASE + '/home-search?place=lakeville&view=map', { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => !!window.__hsMap, null, { timeout: 25000 });
    await p.waitForSelector('[data-results] .lcard', { timeout: 20000 });
    const btn = p.locator('[data-remove-boundary]');
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.click();
    await p.waitForFunction(() => !new URLSearchParams(location.search).get('place') && !!new URLSearchParams(location.search).get('bbox'), null, { timeout: 15000 });
    await p.waitForSelector('[data-results] .lcard', { timeout: 20000 });
    await p.waitForTimeout(1000);
    const outline = await p.evaluate(() => {
      const { kind, map } = window.__hsMap;
      if (kind === 'main') return map.queryRenderedFeatures({ layers: ['place-line', 'place-fill'].filter((l) => map.getLayer(l)) }).length;
      return map.__place ? 1 : 0;
    });
    const n = await p.$$eval('[data-results] .lcard', (e) => e.length);
    ok('Map: remove boundary', outline === 0 && n > 0 && await btn.isHidden(), `outline ${outline ? 'still shown' : 'gone'}, ${n} homes in the map area`);
  });
  // "Draw boundary" pencil (Jason, Nov 9, 2026): its label shows on hover; drawing a shape searches inside it.
  await step('Map: draw boundary', async () => {
    await p.setViewportSize({ width: 1366, height: 900 });
    await p.goto(BASE + '/home-search?place=lakeville&view=map', { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => !!window.__hsMap, null, { timeout: 25000 });
    await p.waitForSelector('[data-results] .lcard', { timeout: 20000 });
    await p.waitForTimeout(1500);
    const pencil = p.locator('[data-draw]');
    await pencil.hover(); await p.waitForTimeout(300);
    const tip = await p.locator('[data-draw] .hs-map__tip').evaluate((e) => ({ text: e.textContent.trim(), op: getComputedStyle(e).opacity }));
    if (tip.text !== 'Draw boundary' || Number(tip.op) < 0.9) throw new Error(`the pencil's "Draw boundary" label didn't show on hover (${tip.text}, opacity ${tip.op})`);
    await pencil.click();
    const box = await p.locator('[data-sketch]').boundingBox();
    if (!box) throw new Error('the drawing layer did not open');
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2, r = Math.min(box.width, box.height) / 4;
    await p.mouse.move(cx - r, cy - r); await p.mouse.down();
    for (const [x, y] of [[cx + r, cy - r], [cx + r, cy + r], [cx - r, cy + r], [cx - r, cy - r + 5]]) await p.mouse.move(x, y, { steps: 12 });
    await p.mouse.up();
    await p.waitForFunction(() => !!new URLSearchParams(location.search).get('poly') && !new URLSearchParams(location.search).get('place'), null, { timeout: 15000 });
    await p.waitForTimeout(2000);
    const outline = await p.evaluate(() => { const { kind, map } = window.__hsMap; return kind === 'main' ? map.queryRenderedFeatures({ layers: ['place-line'].filter((l) => map.getLayer(l)) }).length : map.__place ? 1 : 0; });
    const n = await p.$$eval('[data-results] .lcard', (e) => e.length);
    const remove = await p.locator('[data-remove-boundary]').isVisible();
    ok('Map: draw boundary', outline > 0 && remove, `label on hover; shape drawn and outlined, ${n} homes listed; "Remove boundary" ${remove ? 'shown' : 'missing'}`);
  });
  await step('Sold homes view', async () => {
    await p.goto(BASE + '/home-search?status=sold&place=lakeville', { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('[data-results] .lcard', { timeout: 25000 });
    const n = await p.$$eval('[data-results] .lcard', (e) => e.length);
    // A sold home opens its own sold page (reported Nov 9, 2026: sold homes on the map couldn't be opened).
    await p.click('[data-results] .lcard--sold a');
    await p.waitForURL(/\/listings\/property\?mlsNumber=/, { timeout: 15000 });
    await p.waitForSelector('h1:has-text("Sold:")', { timeout: 20000 });
    ok('Sold homes view', true, `${n} sold homes; opened ${(await p.textContent('h1')).trim().slice(0, 60)}`);
  });
  // City market pages: the "What's your <city> home worth?" box opens the estimate with the address filled in.
  await step('Market page: home value box', async () => {
    await p.goto(BASE + '/market/plymouth', { waitUntil: 'domcontentloaded' });
    await p.fill('[data-hvbox] [name=address]', '3400 Plymouth Blvd');
    await p.fill('[data-hvbox] [name=zip]', '55447');
    await p.click('[data-hvbox] button[type=submit]');
    await p.waitForURL(/home-estimate/, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => document.querySelector('#es-address')?.value === '3400 Plymouth Blvd', null, { timeout: 10000 });
    ok('Market page: home value box', true, `opened ${new URL(p.url()).pathname} with the address filled in`);
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
    ['/land-for-sale', 'community-alert'], ['/hobby-farms-for-sale-mn', 'community-alert'], ['/zip-codes/woodbury-mn', 'community-alert'], ['/commute/downtown-minneapolis/maple-grove', 'community-alert'], ['/duplexes-for-sale-mn', 'community-alert'], ['/townhomes-for-sale-mn', 'community-alert'], ['/minnesota-homes-for-sale/duluth', 'mn-referral'], ['/barndominiums-for-sale-mn', 'community-alert'], ['/down-payment-assistance-minnesota', 'first-time-buyer'], ['/real-estate-agents/burnsville-mn', 'community-contact'], ['/minneapolis-suburbs', 'compare'], ['/mid-century-modern-homes-for-sale', 'community-alert'], ['/historic-homes-for-sale', 'community-alert'], ['/first-time-home-buyer-minnesota', 'first-time-buyer'],
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
  await step('Mortgage calculator', async () => {
    await p.goto(BASE + '/calculators/mortgage', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1500);
    const before = (await p.textContent('#m-total'))?.trim();
    await p.fill('#m-down', '5'); await p.waitForTimeout(300);
    const after = (await p.textContent('#m-total'))?.trim();
    ok('Mortgage calculator', /^\$[\d,]{3,}$/.test(before ?? '') && before !== '$0' && after !== before, `20% down: ${before}/mo; 5% down: ${after}/mo`);
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
  // Meta Pixel (live domain only): the page view and, after a sent home value request, the Lead event are sent
  // (answered by the guard after launch, so they never reach Meta).
  if (LOCAL) skip('Meta Pixel', 'runs only on huerkamphomes.com'); else await step('Meta Pixel', async () => {
    // Meta ignores browsers that call themselves HeadlessChrome, so this one presents as ordinary Chrome.
    const c4 = await b.newContext({ viewport: { width: 1366, height: 900 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
    await c4.route('**/api/client-error', (r) => r.fulfill({ status: 202, body: '{}' }));
    const hits = [];
    const ids = [];
    c4.on('request', (r) => { const u = r.url(); if (/facebook\.com\/tr/.test(u)) { const q = new URL(u).searchParams; hits.push(q.get('ev')); if (q.get('ev') === 'ViewContent' && q.get('cd[content_ids]')) ids.push(q.get('cd[content_ids]')); } });
    const m = await c4.newPage();
    await m.goto(BASE + '/sell', { waitUntil: 'load' });
    for (let t = 0; t < 20 && !hits.includes('PageView'); t++) await m.waitForTimeout(500);
    await m.evaluate(() => window.dispatchEvent(new CustomEvent('lead-sent', { detail: { form: 'home-value', fields: {} } })));
    for (let t = 0; t < 12 && !hits.includes('Lead'); t++) await m.waitForTimeout(500);
    // Retargeting (Nov 11, 2026): a home page sends ViewContent with the home's MLS number as the catalog id.
    await m.goto(BASE + '/homes-for-sale/minneapolis', { waitUntil: 'domcontentloaded' });
    const href = await m.getAttribute('a[href^="/homes/"]:not([href^="/homes/listing"])', 'href').catch(() => null);
    if (href) await m.goto(BASE + href, { waitUntil: 'load' });
    for (let t = 0; href && t < 20 && !ids.length; t++) await m.waitForTimeout(500);
    const feed = await m.request.get(BASE + '/feeds/meta-home-listings.csv');
    const csv = feed.ok() ? await feed.text() : '';
    ok('Meta Pixel', hits.includes('PageView') && hits.includes('Lead') && (!href || ids.length > 0) && csv.startsWith('home_listing_id,') && feed.headers()['x-robots-tag'] === 'noindex',
      `events sent: ${hits.join(', ') || 'none'}; home viewed: ${ids.join(', ') || 'none'}; catalog feed: ${csv ? `${csv.trim().split('\n').length - 1} team listings` : `HTTP ${feed.status()}`}`);
    await c4.close();
  });
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
    // The map must zoom in to the spot and mark it (it once stayed on the whole metro).
    const zoomed = await m.waitForFunction(() => { const h = window.__hsMap; return h && h.map.getZoom() >= 11 && !!document.querySelector('.hs-here'); }, null, { timeout: 15000 }).then(() => true, () => false);
    const z = await m.evaluate(() => window.__hsMap?.map.getZoom().toFixed(1));
    ok('Use my current location', opened < 3000 && n > 0 && zoomed, `search page opened in ${(opened / 1000).toFixed(1)} s, ${n} homes near the spot, map zoom ${z}${zoomed ? ' with the you-are-here dot' : ' (did not zoom in to the spot)'}`);
    // The map's own locate button, starting from a city search somewhere else.
    await m.goto(BASE + '/home-search?place=edina&view=map', { waitUntil: 'domcontentloaded' });
    await m.waitForFunction(() => !!window.__hsMap, null, { timeout: 25000 });
    await m.waitForSelector('[data-results] .lcard', { timeout: 20000 });
    await m.click('[data-locate]');
    const moved = await m.waitForFunction(() => document.querySelector('[data-h1]')?.textContent?.includes('near you') && !!document.querySelector('.hs-here'), null, { timeout: 20000 }).then(() => true, () => false);
    ok('Map: use my location button', moved, moved ? 'searched near the spot and marked it' : 'did not move to the spot');
    await c3.close();
  });
  // A browser with 3D graphics (WebGL) turned off gets the backup flat map (src/scripts/search-map-flat.ts), with pins.
  if (BROWSER !== 'chromium') skip('Map without 3D graphics', 'Chrome-only switch'); else await step('Map without 3D graphics', async () => {
    const b2 = await pw.chromium.launch({ args: ['--disable-webgl', '--disable-3d-apis'] });
    // Never send our own test visits to Meta Pixel or Google Analytics: their hits are answered here and go nowhere
  // (until Nov 10, 2026 every check run showed up in Google Analytics as ~60 visitors).
    { const nc = b2.newContext.bind(b2); b2.newContext = async (o) => { const c = await nc(o); await c.route(/facebook\.com\/tr|google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect/, (r) => r.fulfill({ status: 200, body: "" })); return c; }; }
    const c2 = await b2.newContext({ viewport: { width: 1366, height: 900 } });
    await c2.addInitScript(() => { try { sessionStorage.setItem('idx-eula', '1'); } catch {} });
    await c2.route('**/api/client-error', (r) => r.fulfill({ status: 202, body: '{}' })); // don't count our own test as a visitor error
    const m = await c2.newPage();
    await m.goto(BASE + '/home-search?place=lakeville&view=map', { waitUntil: 'domcontentloaded' });
    await m.waitForSelector('.leaflet-tile-loaded', { timeout: 25000 });
    await m.waitForFunction(() => document.querySelectorAll('[data-results] .lcard').length > 0, null, { timeout: 20000 });
    ok('Map without 3D graphics', !(await m.locator('.hs-mapfail').count()), `flat map with ${await m.locator('.leaflet-tile-loaded').count()} map tiles`);
    // The flat map's own layers once covered our map buttons (Firefox and Safari use it more often).
    const blocked = [];
    for (const [sel, name] of [['[data-remove-boundary]', 'Remove boundary'], ['[data-draw]', 'Draw boundary'], ['[data-locate]', 'Use my location']]) {
      await m.locator(sel).click({ timeout: 5000, trial: true }).catch(() => blocked.push(name));
    }
    ok('Flat map: buttons can be clicked', !blocked.length, blocked.length ? `covered by the map: ${blocked.join(', ')}` : 'Remove boundary, Draw boundary, Use my location');
    await b2.close();
  });
  // Pointing at a home on the map makes it bigger and clicking opens its photo card (src/scripts/map-card.ts), on whichever map this
  // browser gets (main or backup). Finds a pin on screen through the map object the page exposes for tests.
  await step('Map hover preview', async () => {
    await p.setViewportSize({ width: 1366, height: 900 });
    await p.goto(BASE + '/home-search?place=lakeville&view=map', { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => !!window.__hsMap, null, { timeout: 25000 });
    await p.waitForSelector('[data-results] .lcard', { timeout: 20000 });
    await p.waitForTimeout(2500); // pins drawn and the map settled
    // The map can still be moving into place on a slow machine, so find the pin again and retry up to three times.
    const find = () => p.evaluate(() => {
      const { kind, map } = window.__hsMap;
      const box = map.getContainer().getBoundingClientRect();
      if (kind === 'main') {
        const f = map.queryRenderedFeatures({ layers: ['homes', 'homes-tags'].filter((l) => map.getLayer(l)) })[0];
        if (!f) return null;
        const q = map.project(f.geometry.coordinates);
        return { x: box.left + q.x, y: box.top + q.y, kind };
      }
      const m = [...map.__bySlug.values()].find((x) => map.getBounds().contains(x.getLatLng()));
      if (!m) return null;
      const r = m.getElement?.()?.getBoundingClientRect(); // the pin as drawn on screen, when drawn as its own shape
      if (r && r.width) return { x: r.left + r.width / 2, y: r.top + r.height / 2, kind };
      const q = map.latLngToContainerPoint(m.getLatLng());
      return { x: box.left + q.x, y: box.top + q.y, kind };
    });
    // Pointing at a home makes it 50% bigger, with no preview (Jason, Nov 9, 2026); clicking opens the photo card, whose
    // arrows show only while the pointer is over the photo.
    const bigger = () => p.evaluate(() => {
      const { kind, map } = window.__hsMap;
      if (kind === 'main') return ['homes-hover', 'homes-tags-hover'].some((l) => /"[a-z0-9-]{6,}"/.test(JSON.stringify(map.getFilter(l) ?? '')));
      return [...map.__bySlug.values()].some((m) => m.getRadius() > 6);
    });
    let pt = null, big = false;
    for (let t = 0; t < 3 && !big; t++) {
      if (t) { await p.mouse.move(5, 5); await p.waitForTimeout(1500); }
      pt = await find();
      if (!pt) continue;
      await p.mouse.move(pt.x - 30, pt.y - 30); await p.mouse.move(pt.x, pt.y, { steps: 5 });
      await p.waitForTimeout(400);
      big = await bigger();
    }
    if (!pt) throw new Error('no home pin visible on the map');
    if (!big) throw new Error(`the home under the mouse did not get bigger after 3 tries (${pt.kind} map)`);
    if (await p.locator('.hs-peek:visible').count()) throw new Error('a hover preview appeared; it should open only on click');
    await p.mouse.click(pt.x, pt.y);
    await p.waitForSelector('.hs-pop-card', { state: 'visible', timeout: 5000 });
    const card = await p.$eval('.hs-pop-card', (e) => ({ text: e.textContent.replace(/\s+/g, ' ').trim(), photo: !!e.querySelector('.hs-pop-card__photo img') || /coming soon/i.test(e.textContent) }));
    let arrows = 'one photo';
    const next = p.locator('.hs-mappop__next').first();
    if (await next.count()) {
      const op = () => next.evaluate((e) => getComputedStyle(e).opacity);
      await p.mouse.move(5, 5); await p.waitForTimeout(300);
      const hidden = await op();
      const ph = await p.locator('.hs-pop-card:visible .hs-pop-card__photo').first().boundingBox();
      await p.mouse.move(ph.x + ph.width / 2, ph.y + ph.height / 2); await p.waitForTimeout(400);
      const shown = await op();
      if (!(Number(hidden) < 0.1 && Number(shown) > 0.9)) throw new Error(`photo arrows should show only over the photo (opacity away ${hidden}, over ${shown})`);
      arrows = 'arrows on hover';
    }
    ok('Map hover preview', card.photo && /\$|Auction/.test(card.text) && /courtesy of/i.test(card.text), `${pt.kind} map: dot grew; card: ${card.text.slice(0, 70)}; ${arrows}`);
  });
  // On a phone, tapping a home's dot opens the full card (not the mouse-only preview), and tapping its photo opens the
  // home. Reported Nov 9, 2026: on an iPhone the tap showed the preview, which couldn't be tapped.
  await step('Phone map: tap a home, then its photo', async () => {
    const mc = await b.newContext(PHONE);
    await mc.addInitScript(() => { try { sessionStorage.setItem('idx-eula', '1'); } catch {} });
    await mc.route('**/api/client-error', (r) => r.fulfill({ status: 202, body: '{}' }));
    const m = await mc.newPage();
    m.on('pageerror', (e) => errors.push(`${m.url()} :: ${e.message.slice(0, 120)}`));
    try {
      await m.goto(BASE + '/home-search?place=lakeville&view=map', { waitUntil: 'domcontentloaded' });
      await m.waitForFunction(() => !!window.__hsMap, null, { timeout: 25000 });
      await m.waitForSelector('[data-results] .lcard', { state: 'attached', timeout: 20000 }); // the list is hidden in map view on phones
      await m.waitForTimeout(2500);
      const tap = (x, y) => (PHONE.hasTouch ? m.touchscreen.tap(x, y) : m.mouse.click(x, y));
      let card = false, kind = '';
      for (let t = 0; t < 3 && !card; t++) {
        const pt = await m.evaluate(() => {
          const { kind, map } = window.__hsMap;
          const box = map.getContainer().getBoundingClientRect();
          if (kind === 'main') {
            const f = map.queryRenderedFeatures({ layers: ['homes', 'homes-tags'].filter((l) => map.getLayer(l)) })[0];
            if (!f) return null;
            const q = map.project(f.geometry.coordinates);
            return { x: box.left + q.x, y: box.top + q.y, kind };
          }
          const mk = [...map.__bySlug.values()].find((x) => map.getBounds().contains(x.getLatLng()));
          if (!mk) return null;
          const q = map.latLngToContainerPoint(mk.getLatLng());
          return { x: box.left + q.x, y: box.top + q.y, kind };
        });
        if (!pt) { await m.waitForTimeout(1500); continue; }
        kind = pt.kind;
        await tap(pt.x, pt.y);
        card = await m.waitForSelector('.hs-pop-card', { state: 'visible', timeout: 4000 }).then(() => true, () => false);
      }
      if (!card) throw new Error(`tapping a home's dot didn't open its card (${kind} map; preview shown instead: ${await m.locator('.hs-peek:visible').count() > 0})`);
      // Photo arrows: the next arrow shows the home's second photo (when the build wrote its photo list).
      let photos = 'one photo';
      const next = m.locator('.hs-mappop__next:visible').first();
      if (await next.count()) {
        const before = await m.locator('.hs-pop-card:visible .hs-pop-card__photo img').first().getAttribute('src');
        const nb = await next.boundingBox(); await tap(nb.x + nb.width / 2, nb.y + nb.height / 2); await m.waitForTimeout(1200);
        const after = await m.locator('.hs-pop-card:visible .hs-pop-card__photo img').first().getAttribute('src').catch(() => before);
        if (!m.url().includes('/home-search')) throw new Error('the photo arrow opened a page instead of showing the next photo');
        const gone = !(await m.locator('.hs-mappop__next:visible').count());
        if (after === before && !gone) throw new Error('the photo arrow did not change the photo');
        photos = after !== before ? `arrow showed ${(await m.textContent('.hs-mappop__count').catch(() => '')).trim() || 'the next photo'}` : 'no photo list for this home';
      }
      const img = await m.locator('.hs-pop-card:visible .hs-pop-card__photo').first().boundingBox();
      await tap(img.x + img.width / 2, img.y + img.height / 2);
      await m.waitForURL(/\/homes\//, { timeout: 15000 });
      ok('Phone map: tap a home, then its photo', true, `${kind} map, ${photos}: opened ${new URL(m.url()).pathname.slice(0, 70)}`);
    } finally { await mc.close(); }
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
