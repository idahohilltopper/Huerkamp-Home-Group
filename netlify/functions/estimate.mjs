// POST /api/estimate { zip, type, beds, baths, sqft }: the instant home value estimate (src/lib/estimate.mjs) for the
// /home-estimate page. The homeowner's email copy is sent when their lead arrives (lead.mjs -> estimateLeadEmail below),
// so it goes out even if they never click I AGREE on the page.
// Uses NorthstarMLS sold data, so like every sold display: only while MLS_PUBLIC is "yes" or "preview", only after the
// visitor clicked I AGREE this visit (x-idx-eula), and only from the site's own pages. Each estimate asks Repliers for
// at most a few pages of sales (6 months, then 12 if there are too few).
// Needs REPLIERS_API_KEY (Functions scope); never sends it, or any error text, to the browser.
import { repliers } from '../../src/lib/repliers.mjs';
import { soldQuery, repliersParams, thumbnail, SOLD_DISCLAIMER } from '../../src/lib/sold.mjs';
import { estimateInput, estimate, MIN_COMPS } from '../../src/lib/estimate.mjs';
import { estimateEmail } from '../../src/lib/notify.mjs';
import { sendMail, mailReady } from '../../src/lib/mail.mjs';
import { rq, agentId, clientFor } from './alerts.mjs';

const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();
const ALLOWED = /^https:\/\/((www\.)?huerkamphomegroup\.com|(www\.)?huerkamphomes\.com|[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app)$|^http:\/\/localhost(:\d+)?$/;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clean = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/**
 * Email the homeowner their estimate (or that an agent will prepare it). The page sends the same name, email and phone
 * it just sent to Follow Up Boss. Uses Resend when RESEND_API_KEY is set, otherwise a Repliers message from the team
 * agent (the system that sends the sign-in and alert emails). Someone who unsubscribed from our emails is skipped.
 * Never throws: a failed email is logged and the estimate still shows on the page.
 */
export async function emailEstimate(b, answer, { key, f = fetch, mail = sendMail } = {}) {
  const person = { email: clean(b?.email).toLowerCase(), firstName: clean(b?.firstName, 60), lastName: clean(b?.lastName, 60), phone: clean(b?.phone, 30) };
  if (!isEmail(person.email) || !person.firstName) return { sent: false, why: 'no-contact' };
  const e = estimateEmail(person, clean(b?.address), answer);
  try {
    if (mailReady() || mail !== sendMail) {
      const r = await mail({ to: person.email, subject: e.subject, text: e.text, html: e.html });
      return { sent: !!r.ok, via: 'resend' };
    }
    if (!key) return { sent: false, why: 'not-configured' };
    const found = ((await rq(key, 'GET', '/clients', { params: { email: person.email } }, f)).data?.clients ?? [])
      .find((c) => String(c.email ?? '').toLowerCase() === person.email);
    if (found && (found.preferences?.unsubscribe || found.status === false)) return { sent: false, why: 'unsubscribed' };
    const agent = await agentId(key, f);
    const clientId = found?.clientId ?? (agent ? await clientFor(key, f, person, agent) : null);
    if (!agent || !clientId) return { sent: false, why: 'no-client' };
    const r = await rq(key, 'POST', '/messages', { body: { sender: 'agent', agentId: agent, clientId, content: { subject: e.subject, message: e.message, links: [e.link] } } }, f);
    if (!r.ok) console.error('Repliers estimate message', r.status, r.error);
    return { sent: r.ok, via: 'repliers' };
  } catch (err) {
    console.error('estimate email', err.message);
    return { sent: false, why: 'error' };
  }
}

/**
 * The estimate for a visitor's answers, as the page shows it: { ok: true, low, mid, high, n, months, zip, comps, ... } or
 * { ok: false, error }. Shared by this endpoint and the home value lead (netlify/functions/lead.mjs), which emails it.
 */
export async function runEstimate(b, { key = env('REPLIERS_API_KEY'), call = repliers } = {}) {
  if (!['yes', 'preview'].includes(env('MLS_PUBLIC').toLowerCase())) return { ok: false, error: 'not-public-yet' };
  if (!key) return { ok: false, error: 'not-configured' };
  const input = estimateInput(b);
  if (input.error) return { ok: false, error: 'bad-input', message: input.error };
  try {
    let result = null, months = 6;
    for (months of [6, 12]) {
      const q = soldQuery(new URLSearchParams({ place: `zip:${input.zip}`, months: String(months) }));
      const all = [];
      for (let page = 1; page <= 3; page++) {
        const { params, body } = repliersParams(q, { pageSize: 100, page });
        const r = await call(key, '/listings', params, body);
        if (!r.data) { console.error('Repliers estimate', r.status, r.error); return { ok: false, error: 'mls-error' }; }
        all.push(...(r.data.listings ?? []));
        if ((r.data.listings ?? []).length < 100) break;
      }
      result = estimate(input, all);
      if (!result.error) break;
    }
    if (result.error) return { ok: false, error: 'not-enough-sales', n: result.n, min: MIN_COMPS, zip: input.zip, disclaimer: SOLD_DISCLAIMER };
    return { ok: true, ...result, comps: result.comps.map(thumbnail), months, zip: input.zip, disclaimer: SOLD_DISCLAIMER };
  } catch (e) {
    console.error('estimate', e.message);
    return { ok: false, error: 'mls-error' };
  }
}

/** The home value lead's email: works out the estimate and sends it (called by lead.mjs when the form arrives). */
export async function estimateLeadEmail(fields, deps = {}) {
  const answer = await runEstimate({ ...fields, type: fields?.homeType ?? fields?.type }, deps);
  return emailEstimate(fields, answer.error === 'bad-input' ? { ok: false, error: 'mls-error' } : answer, { key: deps.key ?? env('REPLIERS_API_KEY'), ...deps });
}

export default async (req, _ctx, call = repliers) => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' });
  const origin = req.headers.get('origin');
  if (origin && !ALLOWED.test(origin)) return json(403, { ok: false, error: 'Forbidden' });
  if (req.headers.get('x-idx-eula') !== 'agreed') return json(403, { ok: false, error: 'license-not-agreed' });
  const a = await runEstimate(await req.json().catch(() => ({})), { call });
  if (a.error === 'bad-input') return json(400, { ok: false, error: a.message });
  return json(a.ok ? 200 : a.error === 'not-configured' ? 503 : a.error === 'mls-error' ? 502 : 200, a);
};

// At most 10 requests a minute from one visitor (Netlify rate limiting), so a bot can't flood it.
export const config = { path: '/api/estimate', rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
