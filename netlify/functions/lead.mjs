// Website form → Follow Up Boss.
// Every form on the site posts here (/api/lead). This sends it to Follow Up Boss's Events API,
// which creates or updates the person, attaches the inquiry and runs the team's lead routing.
// The API key lives in Netlify (FUB_API_KEY), never in this repository.
// Fello picks up sellers from Follow Up Boss through its own integration.

import { getStore } from '@netlify/blobs';
import { buildEvent, FORMS } from '../../src/lib/lead.mjs';
import { leadEmail } from '../../src/lib/notify.mjs';
import { sendMail, mailReady } from '../../src/lib/mail.mjs';
import { estimateLeadEmail } from './estimate.mjs';
import { capiEvent, sendCapi } from '../../src/lib/meta.mjs';

const FUB_URL = 'https://api.followupboss.com/v1/events';

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// Only the site's own pages may post leads (the live domains, Netlify previews, local testing). Browsers always
// send Origin on a POST, so another website can't push spam into Follow Up Boss through this endpoint.
const ALLOWED = /^https:\/\/((www\.)?huerkamphomegroup\.com|(www\.)?huerkamphomes\.com|[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app)$|^http:\/\/localhost(:\d+)?$/;

// A copy of every lead to the team inbox (LEAD_NOTIFY_EMAIL, default leads@hhgus.com), as a backup to Follow Up Boss's
// own alerts. Only when RESEND_API_KEY is set (src/lib/mail.mjs); never blocks or fails the lead.
async function copyToTeam(input, delivered, mail, note = '') {
  if (!mailReady() && mail === sendMail) return;
  if (FORMS[input?.form]?.hot) return; // hot-buyer signals and browsing activity go to Follow Up Boss (and Lead Claimer) only
  const to = (process.env.LEAD_NOTIFY_EMAIL ?? '').trim() || 'leads@hhgus.com';
  const f = Object.fromEntries(Object.entries(input?.fields ?? {}).map(([k, v]) => [k, String(v ?? '').slice(0, 1000)]));
  const label = FORMS[input?.form]?.label ?? 'Website form';
  try {
    const r = await mail({ to, ...leadEmail(label, f, String(input?.page ?? '').slice(0, 200), delivered, note) });
    if (!r.ok) console.error('Lead copy email', r.error);
  } catch (e) { console.error('Lead copy email', e?.message); }
}

export default async (req, ctx, mail = sendMail, fetcher = fetch, homeValueEmail = estimateLeadEmail) => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' });
  const origin = req.headers.get('origin');
  if (origin && !ALLOWED.test(origin)) return json(403, { ok: false, error: 'Forbidden' });

  let input;
  try {
    input = await req.json();
  } catch {
    return json(400, { ok: false, error: 'Bad request' });
  }

  const built = buildEvent(input, {
    at: new Date().toISOString(),
    ip: req.headers.get('x-nf-client-connection-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    userAgent: req.headers.get('user-agent') ?? '',
  });
  // Site-check traffic never reaches Follow Up Boss. The checks fill forms with @example.com/.org addresses (reserved, no
  // real person has one) and intercept the sends, but a send made as a page closes can slip past the interception
  // (Nov 11, 2026: "smoke@example.com" reached Follow Up Boss as a Viewed Property and was offered by Lead Claimer).
  if (/@example\.(com|org|net)$/i.test(String(input?.fields?.email ?? '').trim())) return json(200, { ok: true, test: true });
  if (built.spam) {
    // Bots get a quiet "ok". Every drop is kept (Netlify Blobs store "spam-drops", 7 days of detail is enough to recover a
    // real person), and a drop caused only by timing is also emailed to the team, marked as possibly real (Nov 11, 2026).
    const f = input?.fields ?? {};
    const drop = { at: new Date().toISOString(), reason: built.reason, form: String(input?.form ?? '').slice(0, 40), page: String(input?.page ?? '').slice(0, 200),
      name: `${f.firstName ?? ''} ${f.lastName ?? ''}`.trim().slice(0, 80), email: String(f.email ?? '').slice(0, 120), phone: String(f.phone ?? '').slice(0, 40) };
    console.error('Lead filtered as spam:', drop.reason, drop.form, drop.page);
    try { await getStore('spam-drops').setJSON(`${drop.at.slice(0, 10)}/${drop.at}-${crypto.randomUUID()}`, drop); } catch (e) { console.error('spam-drops', e?.message); }
    if (/^sent \d+ ms/.test(built.reason ?? '') && !FORMS[input?.form]?.hot && f.email) {
      const job = copyToTeam({ ...input, form: input.form }, false, mail, `Filtered as possible spam (${built.reason}). If this is a real person, add them to Follow Up Boss.`);
      if (ctx?.waitUntil) ctx.waitUntil(job); else await job;
    }
    return json(200, { ok: true });
  }
  if (built.error) return json(400, { ok: false, error: built.error });

  // Proof of call/text consent, kept by the website itself (Netlify Blobs store "consent-records") so it
  // survives edits in Follow Up Boss. Never blocks the lead: a storage hiccup is logged, the lead still goes.
  if (built.consent) {
    try {
      await getStore('consent-records').setJSON(`${built.consent.at.slice(0, 10)}/${built.consent.at}-${crypto.randomUUID()}`, built.consent);
    } catch (e) {
      console.error('Could not save consent record', e?.message, JSON.stringify(built.consent));
    }
  }

  const key = process.env.FUB_API_KEY;
  if (!key) {
    console.error('FUB_API_KEY is not set');
    await copyToTeam(input, false, mail);
    return json(500, { ok: false, error: 'Not configured' });
  }

  const res = await fetcher(FUB_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Basic ' + Buffer.from(`${key}:`).toString('base64'),
      'X-System': 'HuerkampHomeGroupWebsite',
    },
    body: JSON.stringify(built.event),
  });

  // 200/201 = created or updated; 204 = Follow Up Boss took the request but ignored the lead (a lead flow rule for this
  // source, e.g. "Do not create", or an archived person). The visitor still sees "thank you", but the team copy says
  // ACTION NEEDED so a dropped lead is never silent (Nov 11, 2026: Jason saw no leads since the source name changed).
  const ignored = res.status === 204;
  if (ignored && !FORMS[input?.form]?.hot) console.error('Follow Up Boss ignored the lead (204): check Admin > Lead Flow for source', built.event.source, input?.form);
  await copyToTeam(input, res.ok && !ignored, mail);
  // Home value requests: email the homeowner their estimate. Finishes after the answer (waitUntil) so the page isn't kept waiting.
  if (input.form === 'home-value') {
    const job = homeValueEmail(input.fields ?? {}).then((r) => { if (!r?.sent) console.error('Home value email not sent', r?.why ?? ''); }).catch((e) => console.error('Home value email', e?.message));
    if (ctx?.waitUntil) ctx.waitUntil(job); else await job;
  }
  // Facebook/Instagram: the same lead from the server (Conversions API), for retargeting and ad optimization.
  if (res.ok) {
    const capi = capiEvent(input, FORMS[input?.form], { ip: req.headers.get('x-nf-client-connection-ip') ?? null, userAgent: req.headers.get('user-agent') ?? '', cookies: req.headers.get('cookie') });
    if (capi) { const job = sendCapi(capi); if (ctx?.waitUntil) ctx.waitUntil(job); else await job; }
  }
  if (res.ok) return json(200, { ok: true });
  console.error('Follow Up Boss error', res.status, (await res.text()).slice(0, 500));
  return json(502, { ok: false, error: 'Could not send' });
};

// At most 10 requests a minute from one visitor (Netlify rate limiting), so a bot can't flood it.
export const config = { path: '/api/lead', rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
