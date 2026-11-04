// Sign in with an email link (no passwords): /api/account/*
//   POST /api/account/start   { email, firstName?, lastName?, phone? }  emails a sign-in link (30 minutes). Someone new
//                             is asked for a name first ({ needName: true }); then their client record is created at
//                             Repliers under the team agent, like a first saved search or heart.
//   POST /api/account/verify  { t }   the link's token -> a 90-day session token plus who they are
//   GET  /api/account/me      header x-hhg-session   who the session belongs to
// A session token works anywhere the alerts API takes a "token" (src/pages/profile.astro, netlify/functions/alerts.mjs),
// so "My account" is the existing My alerts page. Tokens are signed, not stored (src/lib/session.mjs). Emails go out
// through src/lib/mail.mjs (needs RESEND_API_KEY); until then /start answers 'email-not-set-up'.
import { rq, agentId, clientFor, TEAM } from './alerts.mjs';
import { sign, verify, secretFrom } from '../../src/lib/session.mjs';
import { sendMail } from '../../src/lib/mail.mjs';
// Business details for the email (kept in step with src/data/site.ts by hand; functions stay plain JavaScript).
const site = { name: 'Huerkamp Home Group', brokerage: 'Keller Williams Preferred Realty', street: '14300 Nicollet Ct, Ste 208', cityStateZip: 'Burnsville, MN 55306', phone: '(612) 843-9620' };

const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();
const ALLOWED = /^https:\/\/((www\.)?huerkamphomegroup\.com|(www\.)?huerkamphomes\.com|[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app)$|^http:\/\/localhost(:\d+)?$/;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clean = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const list = (d, key) => (Array.isArray(d) ? d : d?.[key] ?? d?.results ?? []);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function findClient(key, f, email) {
  const r = await rq(key, 'GET', '/clients', { params: { email } }, f);
  return list(r.data, 'clients').find((c) => String(c.email ?? '').toLowerCase() === email) ?? null;
}

function linkEmail(firstName, link) {
  const hi = firstName ? `Hi ${firstName},` : 'Hi,';
  const text = `${hi}\n\nHere's your link to sign in to ${site.name}. It works for ${30} minutes:\n${link}\n\nIf you didn't ask for this, you can ignore this email.\n\n${site.name} · ${site.brokerage}\n${site.street}, ${site.cityStateZip} · ${site.phone}`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#1b1819;max-width:520px">
<p>${esc(hi)}</p><p>Here's your link to sign in to ${esc(site.name)}. It works for 30 minutes.</p>
<p><a href="${esc(link)}" style="display:inline-block;padding:12px 22px;background:#d40000;color:#fff;font-weight:bold;text-decoration:none;border-radius:6px">Sign in</a></p>
<p style="font-size:13px;color:#5e5856">Or copy this link: ${esc(link)}</p>
<p style="font-size:13px;color:#5e5856">If you didn't ask for this, you can ignore this email.</p>
<p style="font-size:13px;color:#5e5856">${esc(site.name)} · ${esc(site.brokerage)}<br>${esc(site.street)}, ${esc(site.cityStateZip)} · ${esc(site.phone)}</p></div>`;
  return { subject: `Your ${site.name} sign-in link`, text, html };
}

export default async (req, _ctx, f = fetch, mail = sendMail) => {
  const url = new URL(req.url);
  const action = url.pathname.split('/').pop();
  const key = env('REPLIERS_API_KEY');
  const secret = secretFrom(env);
  if (!key || !secret) return json(503, { ok: false, error: 'not-configured' });
  try {
    if (req.method === 'GET' && action === 'me') {
      const s = verify('session', req.headers.get('x-hhg-session') ?? '', secret);
      return s ? json(200, { ok: true, me: { firstName: s.n ?? '', email: s.e } }) : json(401, { ok: false, error: 'signed-out' });
    }
    if (req.method !== 'POST') return json(405, { ok: false, error: 'method' });
    const origin = req.headers.get('origin');
    if (origin && !ALLOWED.test(origin)) return json(403, { ok: false, error: 'Forbidden' });
    const b = await req.json().catch(() => ({}));

    if (action === 'start') {
      const email = clean(b.email, 120).toLowerCase();
      if (!isEmail(email)) return json(400, { ok: false, error: 'Please enter your email address.' });
      if (email === TEAM.email) return json(400, { ok: false, error: `${TEAM.email} is our team inbox. Please use your own email address.` });
      let client = await findClient(key, f, email);
      let created = false;
      if (!client) {
        const firstName = clean(b.firstName, 60);
        if (!firstName) return json(200, { ok: true, needName: true });
        const agent = await agentId(key, f);
        const id = agent ? await clientFor(key, f, { email, firstName, lastName: clean(b.lastName, 60), phone: clean(b.phone, 30) }, agent) : null;
        if (!id) return json(502, { ok: false, error: 'mls-error' });
        client = { clientId: id, fname: firstName };
        created = true;
      }
      const base = origin && ALLOWED.test(origin) ? origin : 'https://www.huerkamphomes.com';
      const next = /^\/[a-z0-9/_-]*$/i.test(String(b.next ?? '')) ? b.next : '/profile';
      const link = `${base}/account/verify?t=${encodeURIComponent(sign('link', { c: client.clientId, e: email, n: client.fname ?? '' }, secret))}&next=${encodeURIComponent(next)}`;
      const sent = await mail({ to: email, ...linkEmail(client.fname ?? '', link) });
      if (!sent.ok) return json(sent.error === 'email-not-set-up' ? 503 : 502, { ok: false, error: sent.error, created });
      return json(200, { ok: true, sent: true, created });
    }

    if (action === 'verify') {
      const l = verify('link', clean(b.t, 2000), secret);
      if (!l) return json(401, { ok: false, error: 'link-expired' });
      const c = (await rq(key, 'GET', `/clients/${l.c}`, {}, f)).data ?? {};
      const me = { firstName: c.fname ?? l.n ?? '', lastName: c.lname ?? '', email: l.e, phone: c.phone ? String(c.phone) : '' };
      return json(200, { ok: true, session: sign('session', { c: l.c, e: l.e, n: me.firstName }, secret), me });
    }
    return json(404, { ok: false, error: 'unknown' });
  } catch (e) {
    console.error('account', e.message);
    return json(502, { ok: false, error: 'mls-error' });
  }
};

export const config = { path: '/api/account/*' };
