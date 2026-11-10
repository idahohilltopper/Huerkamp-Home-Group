// Weekly crawl: on the main pages (and a sample of each kind of page), click every button and check every link.
//   FAIL  a link inside the site that leads nowhere (404 or error), a button that causes a JavaScript error,
//         or a page that doesn't load
//   WARN  a button that visibly does nothing, an outside link that answers with an error (some sites block robots,
//         so these are worth a look, not proof)
// Lead forms are not submitted here (the daily site check does that, intercepted). Nothing is sent to Follow Up Boss.
// Usage: node scripts/site-check/crawl.cjs     SITE_BASE=... BROWSER=webkit|firefox|chromium as for smoke.cjs
const pw = require('playwright');
const BROWSER = process.env.BROWSER || 'chromium';
const BASE = (process.env.SITE_BASE || 'https://www.huerkamphomes.com').replace(/\/$/, '');
const out = [];
const add = (kind, what, info = '') => out.push(`${kind}  ${what}${info ? '  — ' + info : ''}`);

const MAIN = ['/', '/home-search', '/home-search?view=map', '/buy', '/sell', '/team', '/reviews', '/contact', '/ramsey', '/lake-homes',
  '/new-construction', '/land-for-sale', '/hobby-farms-for-sale-mn', '/open-houses', '/market', '/data', '/calculators', '/calculators/affordability',
  '/calculators/seller-net-proceeds', '/calculators/mortgage-payoff', '/first-time-home-buyer-minnesota', '/cost-of-living-minnesota',
  '/home-estimate', '/cash-offer', '/downsizing', '/videos', '/blog', '/guides', '/compare', '/communities', '/walkability', '/diners-drive-ins-and-dives-minnesota', '/luxury-homes-for-sale-mn', '/zip-codes', '/zip-codes/woodbury-mn', '/property-taxes', '/property-taxes/hennepin-county-mn', '/property-taxes/minnesota-homestead', '/mortgage-rates-minnesota', '/townhomes-for-sale-mn', '/condos-for-sale-mn', '/minnesota-homes-for-sale', '/minnesota-homes-for-sale/duluth', '/barndominiums-for-sale-mn', '/tiny-homes-for-sale-mn', '/down-payment-assistance-minnesota', '/calculators/mortgage', '/real-estate-agents', '/real-estate-agents/burnsville-mn', '/minneapolis-suburbs'];
// One or two of each kind of page from the sitemap: city guides, homes-for-sale pages, lakes, neighborhoods, guides, posts.
const KINDS = [/\/communities\/[^/]+$/, /\/homes-for-sale\/[^/]+$/, /\/homes-for-sale\/[^/]+\/[^/]+$/, /\/lake-homes\/[^/]+$/, /\/neighborhoods\//,
  /\/selling\//, /\/buying\//, /\/market\/[^/]+$/, /\/blog\/\d{4}\//, /\/videos\/[^/]+$/, /\/homes\/[^/]+$/, /\/new-construction\/[^/]+$/, /\/team\/[^/]+$/];

(async () => {
  const sm = await (await fetch(`${BASE}/sitemap-0.xml`)).text().catch(() => '');
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''));
  const sample = KINDS.flatMap((re) => { const hit = urls.filter((u) => re.test(u)); return hit.length ? [hit[0], hit[Math.floor(hit.length / 2)]] : []; });
  const pages = [...new Set([...MAIN, ...sample])];

  const b = await pw[BROWSER].launch();
  // Never send our own test visits to Meta Pixel or Google Analytics: their hits are answered here and go nowhere
  // (until Nov 10, 2026 every check run showed up in Google Analytics as ~60 visitors).
  { const nc = b.newContext.bind(b); b.newContext = async (o) => { const c = await nc(o); await c.route(/facebook\.com\/tr|google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect/, (r) => r.fulfill({ status: 200, body: "" })); return c; }; }
  const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('idx-eula', '1'); } catch {} });
  for (const pat of ['**/api/lead', '**/api/alerts/**', '**/api/client-error', '**/api/account/**']) await ctx.route(pat, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  const links = new Map(); // href -> first page it was seen on
  let buttons = 0;
  for (const path of pages) {
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
    try {
      const r = await p.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (!r || r.status() >= 400) { add('FAIL', `page ${path}`, `answered ${r?.status()}`); await p.close(); continue; }
      await p.waitForTimeout(1500);
      for (const h of await p.$$eval('a[href]', (as) => as.map((a) => a.href))) {
        if (/^(mailto|tel|sms|javascript):/.test(h)) continue;
        if (!links.has(h.split('#')[0])) links.set(h.split('#')[0], path);
      }
      // Every visible button outside forms (forms are the daily check's job): click it, then see whether anything
      // changed (the page, the address, an opened panel) and whether it caused an error.
      const n = await p.$$eval('button:not([type=submit])', (bs) => bs.filter((x) => !x.closest('form') && x.offsetParent && !x.disabled).length);
      for (let i = 0; i < Math.min(n, 40); i++) {
        const btn = p.locator('button:not([type=submit])').filter({ visible: true }).nth(i);
        if (!(await btn.count()) || await btn.evaluate((x) => !!x.closest('form'))) continue;
        const label = ((await btn.getAttribute('aria-label')) || (await btn.innerText().catch(() => '')) || 'button').trim().replace(/\s+/g, ' ').slice(0, 40);
        const before = errs.length, url = p.url();
        await p.evaluate(() => { window.__mut = 0; window.__mo?.disconnect(); window.__mo = new MutationObserver((m) => { window.__mut += m.length; }); window.__mo.observe(document.body, { subtree: true, childList: true, attributes: true }); });
        await btn.click({ timeout: 3000 }).catch(() => {});
        await p.waitForTimeout(500);
        buttons++;
        const changed = p.url() !== url || (await p.evaluate(() => window.__mut ?? 0).catch(() => 1)) > 0 || (await ctx.pages()).length > pages.length + 5;
        if (errs.length > before) add('FAIL', `button "${label}" on ${path}`, errs.at(-1));
        else if (!changed) add('WARN', `button "${label}" on ${path}`, 'nothing visible happened');
        if (p.url() !== url) await p.goto(BASE + path, { waitUntil: 'domcontentloaded' }).catch(() => {});
        await p.keyboard.press('Escape').catch(() => {});
      }
      if (errs.length) add('FAIL', `JavaScript error on ${path}`, errs[0]);
    } catch (e) { add('FAIL', `page ${path}`, e.message.split('\n')[0].slice(0, 120)); }
    await p.close();
  }
  await b.close();

  // Links: inside the site must work; outside links are reported as warnings (many sites refuse robots).
  let checked = 0;
  const all = [...links];
  for (let i = 0; i < all.length; i += 8) {
    await Promise.all(all.slice(i, i + 8).map(async ([href, from]) => {
      const inside = href.startsWith(BASE) || href.startsWith('https://www.huerkamphomes.com');
      // A full GET with a browser's user agent (some sites, like MAAR's reports and the FBI's Crime Data Explorer,
      // answer a quick HEAD request with 404 although the page works), tried twice before it counts as broken.
      const get = () => fetch(href, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' } })
        .then((r) => { r.body?.cancel().catch(() => {}); return r; });
      try {
        let r = await get().catch(() => null);
        if (!r || r.status >= 400) r = await get();
        checked++;
        if (r.status >= 400) add(inside ? 'FAIL' : (r.status === 404 || r.status === 410 ? 'WARN' : 'INFO'), `link ${href.replace(BASE, '')}`, `answered ${r.status} (on ${from})`);
      } catch (e) { add(inside ? 'FAIL' : 'INFO', `link ${href.replace(BASE, '')}`, `${e.name === 'TimeoutError' ? 'no answer in 20 s, twice' : e.message.slice(0, 60)} (on ${from})`); }
    }));
  }
  console.log(`Crawl: ${BASE} in ${BROWSER}: ${pages.length} pages, ${buttons} buttons clicked, ${checked} of ${links.size} links checked (${new Date().toISOString()})`);
  const order = { FAIL: 0, WARN: 1, INFO: 2 };
  console.log(out.sort((a, b) => order[a.split(' ')[0]] - order[b.split(' ')[0]]).join('\n') || 'Everything worked.');
  process.exitCode = out.some((l) => l.startsWith('FAIL')) ? 1 : 0;
})();
