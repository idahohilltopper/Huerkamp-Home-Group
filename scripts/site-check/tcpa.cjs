// Monthly TCPA check: every form that asks for a phone number must offer call/text consent the way the law and our
// own rules expect, and the lead system must only treat a checked box as consent. Nothing reaches Follow Up Boss
// (lead sends are intercepted). Not legal advice: it checks that the site still does what the attorney-approved
// design says (src/lib/consent.mjs, /sms-terms, /privacy). Usage: node scripts/site-check/tcpa.cjs  (SITE_BASE, BROWSER)
//
// What it checks
//  1. The lead logic (src/lib/lead.mjs): consent only with the box checked AND a 10-digit phone; then the record keeps
//     the exact words, wording version, time, page and IP; without it the lead is tagged "No call/text consent".
//  2. Every phone form on the main pages and a sample of each kind of page: a consent box that is unchecked, not
//     required, readable (12 px or larger, not hidden), above the submit button, with the exact current wording
//     (identity, automated technology, "not required", STOP/HELP, rates) and working SMS Terms and Privacy links.
//  3. Sending a form: with the box unchecked the lead carries no consent; checked, it carries smsConsent=yes.
//  4. /sms-terms and /privacy still say what they must (how to join, not required, frequency, rates, STOP, HELP,
//     any reasonable way to opt out within 10 business days, no sharing of numbers for marketing, carriers).
const pw = require('playwright');
const path = require('node:path');
const BROWSER = process.env.BROWSER || 'chromium';
const BASE = (process.env.SITE_BASE || 'https://www.huerkamphomes.com').replace(/\/$/, '');
const lines = [];
const ok = (name, pass, info = '') => lines.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`);
const root = path.resolve(__dirname, '../..');

const PAGES = ['/', '/contact', '/sell', '/buy', '/cash-offer', '/expired-listing', '/home-estimate', '/invest', '/ramsey', '/account',
  '/home-search', '/lake-homes', '/new-construction', '/land-for-sale', '/hobby-farms-for-sale-mn', '/duplexes-for-sale-mn',
  '/first-time-home-buyer-minnesota', '/selling/cost-to-sell-a-house-in-minnesota', '/buying/veterans-and-military-home-buyers-minnesota',
  '/downsizing', '/calculators/affordability', '/calculators/mortgage-payoff', '/lake-homes/brainerd', '/youtube-form'];
const KINDS = [/\/communities\/[^/]+$/, /\/communities\/[^/]+\/[^/]+$/, /\/homes-for-sale\/[^/]+$/, /\/lake-homes\/[^/]+$/, /\/team\/[^/]+$/,
  /\/guides\/[^/]+$/, /\/compare\/[^/]+$/, /\/commute\//, /\/homes\/[^/]+$/, /\/new-construction\/[^/]+$/, /\/foreclosure\//, /\/downsizing\/[^/]+$/];
const MUST = ['Huerkamp Home Group', 'Keller Williams Preferred Realty', 'automated technology', 'prerecorded voice',
  'Consent is not required', 'Reply STOP', 'HELP', 'Message frequency varies', 'message and data rates may apply'];

(async () => {
  // 1. The lead logic itself.
  const { buildEvent } = await import(path.join(root, 'src/lib/lead.mjs'));
  const { consentText, CONSENT_VERSION } = await import(path.join(root, 'src/lib/consent.mjs'));
  const base = { form: 'contact', fields: { firstName: 'Test', lastName: 'Tcpa', email: 'tcpa@example.com', phone: '612-555-0100', message: 'x' }, page: '/contact', title: 'Contact', elapsed: 60000 }; // elapsed: typed like a person (a fast send counts as a bot)
  const meta = { ip: '203.0.113.9', userAgent: 'check', at: '2026-01-01T12:00:00Z' };
  const none = buildEvent(base, meta), yes = buildEvent({ ...base, fields: { ...base.fields, smsConsent: 'yes' } }, meta);
  const noPhone = buildEvent({ ...base, fields: { ...base.fields, phone: '', smsConsent: 'yes' } }, meta);
  const tags = (b) => b.event?.person?.tags ?? [];
  ok('Lead logic: no box, no consent', !none.consent && tags(none).includes('No call/text consent') && !tags(none).includes('Call/text consent'));
  ok('Lead logic: box checked, consent recorded', !!yes.consent && tags(yes).includes('Call/text consent') && yes.consent.text === consentText()
    && yes.consent.version === CONSENT_VERSION && yes.consent.ip === meta.ip && !!yes.consent.page && !!yes.consent.at, `wording version ${CONSENT_VERSION}`);
  ok('Lead logic: box checked without a phone is not consent', !noPhone.consent && !tags(noPhone).includes('Call/text consent'));
  ok('Consent wording has every required part', MUST.every((m) => consentText().toLowerCase().includes(m.toLowerCase())), MUST.filter((m) => !consentText().toLowerCase().includes(m.toLowerCase())).join(', '));

  // 2. Every phone form on the pages.
  const sm = await (await fetch(`${BASE}/sitemap-0.xml`)).text().catch(() => '');
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''));
  const pages = [...new Set([...PAGES, ...KINDS.flatMap((re) => urls.filter((u) => re.test(u)).slice(0, 2))])];
  const b = await pw[BROWSER].launch();
  // Never send our own test visits to Meta's ad measurement (Meta Pixel): its hits are answered here and go nowhere.
  { const nc = b.newContext.bind(b); b.newContext = async (o) => { const c = await nc(o); await c.route(/facebook\.com\/tr/, (r) => r.fulfill({ status: 200, body: '' })); return c; }; }
  const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('idx-eula', '1'); } catch {} });
  const leads = [];
  await ctx.route('**/api/lead', async (r) => { leads.push(r.request().postDataJSON()); await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  for (const pat of ['**/api/alerts/**', '**/api/account/**', '**/api/client-error']) await ctx.route(pat, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  let forms = 0;
  const problems = [];
  for (const pg of pages) {
    const p = await ctx.newPage();
    try {
      await p.goto(BASE + pg, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await p.waitForTimeout(1200);
      // The account page shows name and phone only for a new account; open that part so it is checked too.
      await p.evaluate(() => document.querySelectorAll('[data-new][hidden]').forEach((e) => { e.hidden = false; }));
      const found = await p.$$eval('form', (fs, want) => fs.filter((f) => f.querySelector('input[type=tel], input[name=phone]')).map((f) => {
        const box = f.querySelector('input[name=smsConsent]');
        const label = box?.closest('label');
        const submit = f.querySelector('button[type=submit], input[type=submit]');
        const st = label ? getComputedStyle(label) : null;
        const links = label ? [...label.querySelectorAll('a')].map((a) => a.getAttribute('href')) : [];
        const text = (label?.textContent ?? '').replace(/\s+/g, ' ').trim();
        return {
          name: f.dataset.lead || (f.dataset.start !== undefined ? 'account sign-up' : f.id || 'form'),
          box: !!box, type: box?.type, checked: !!box?.checked, required: !!box?.required,
          size: st ? parseFloat(st.fontSize) : 0, shown: !!label && st.display !== 'none' && st.visibility !== 'hidden' && st.opacity !== '0',
          before: !!(label && submit && (label.compareDocumentPosition(submit) & Node.DOCUMENT_POSITION_FOLLOWING)),
          exact: text === want, links,
        };
      }), consentText());
      for (const f of found) {
        forms++;
        const why = [!f.box && 'no consent box', f.box && f.type !== 'checkbox' && 'not a checkbox', f.checked && 'pre-checked', f.required && 'required',
          f.box && f.size < 12 && `text ${f.size}px`, f.box && !f.shown && 'hidden', f.box && !f.before && 'not above the submit button',
          f.box && !f.exact && 'wording differs from src/lib/consent.mjs', f.box && !f.links.includes('/sms-terms') && 'no SMS Terms link',
          f.box && !f.links.some((h) => /privacy/.test(h ?? '')) && 'no Privacy link'].filter(Boolean);
        if (why.length) problems.push(`${pg} (${f.name}): ${why.join(', ')}`);
      }
    } catch (e) { problems.push(`${pg}: page didn't load (${e.message.split('\n')[0].slice(0, 80)})`); }
    await p.close();
  }
  ok('Every phone form offers consent correctly', !problems.length, `${forms} forms on ${pages.length} pages${problems.length ? `; problems: ${problems.slice(0, 8).join(' | ')}` : ''}`);

  // 3. Sending a form, without and with the box.
  const p = await ctx.newPage();
  for (const tick of [false, true]) {
    await p.goto(BASE + '/contact', { waitUntil: 'domcontentloaded' });
    const f = p.locator('form[data-lead="contact"]').first();
    for (const [n, v] of [['firstName', 'Test'], ['lastName', 'Tcpa'], ['email', 'tcpa@example.com'], ['phone', '6125550100'], ['message', 'TCPA check']]) await f.locator(`[name=${n}]`).fill(v).catch(() => {});
    for (const s of await f.locator('select').all()) await s.selectOption({ index: 1 }).catch(() => {});
    if (tick) await f.locator('input[name=smsConsent]').check();
    const before = leads.length;
    await f.locator('button[type=submit]').click();
    await p.waitForTimeout(1500);
    const sent = leads[before];
    ok(`Sending a form with the box ${tick ? 'checked' : 'unchecked'}`, !!sent && (tick ? sent.fields?.smsConsent === 'yes' : !sent.fields?.smsConsent), sent ? `smsConsent=${sent.fields?.smsConsent ?? '(none)'}` : 'nothing sent');
  }
  await b.close();

  // 4. The SMS Terms and Privacy pages.
  const text = async (u) => (await (await fetch(BASE + u)).text()).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ');
  const sms = await text('/sms-terms');
  const smsNeeds = ['How you join', 'unchecked box', 'never required', 'Message frequency varies', 'Message and data rates may apply', 'STOP', 'HELP',
    'any other reasonable way', '10 business days', 'do not share mobile numbers', 'Carriers are not liable'];
  ok('SMS Terms page', smsNeeds.every((n) => sms.includes(n)), smsNeeds.filter((n) => !sms.includes(n)).map((n) => `missing "${n}"`).join(', '));
  const priv = await text('/privacy');
  const privNeeds = ['do not share mobile phone numbers or text-message consent with third parties', 'reply STOP', '10 business days'];
  ok('Privacy Policy', privNeeds.every((n) => priv.includes(n)), privNeeds.filter((n) => !priv.includes(n)).map((n) => `missing "${n}"`).join(', '));

  console.log(`TCPA check: ${BASE} in ${BROWSER} (${new Date().toISOString()})`);
  console.log(lines.join('\n'));
  process.exitCode = lines.some((l) => l.startsWith('FAIL')) ? 1 : 0;
})();
