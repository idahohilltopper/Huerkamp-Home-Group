// Sign in with an email link (no passwords): /api/account/*
//   POST /api/account/start   { email, firstName?, lastName?, phone? }  emails a sign-in link (30 minutes). Someone new
//                             is asked for a name first ({ needName: true }); then their client record is created at
//                             Repliers under the team agent, like a first saved search or heart.
//   POST /api/account/verify  { token } the token Repliers adds to links in its emails (the sign-in email below, and
//                             every alert email link) -> a 90-day session token plus who they are; { t } is our own
//                             signed link token (used only when RESEND_API_KEY sends the email instead)
//   GET  /api/account/me      header x-hhg-session   who the session belongs to
// A session token works anywhere the alerts API takes a "token" (src/pages/profile.astro, netlify/functions/alerts.mjs),
// so "My account" is the existing My alerts page. Sessions are signed, not stored (src/lib/session.mjs).
// The sign-in email is a Repliers message from the team agent (POST /messages): Repliers adds ?token=... to the link and
// GET /messages?token= tells us which client clicked it. Repliers sends only once alerts.huerkamphomes.com is verified
// and the client has email turned on. If RESEND_API_KEY is set, src/lib/mail.mjs sends it instead.
import { rq, agentId, clientFor, TEAM } from './alerts.mjs';
import { sign, verify, secretFrom } from '../../src/lib/session.mjs';
import { sendMail, mailReady } from '../../src/lib/mail.mjs';
// Business details for the email (kept in step with src/data/site.ts by hand; functions stay plain JavaScript).
const site = { name: 'Huerkamp Home Group', brokerage: 'Keller Williams Preferred Realty', street: '14300 Nicollet Ct, Ste 208', cityStateZip: 'Burnsville, MN 55306', phone: '(612) 502-7653' };

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
        if (!clean(b.lastName, 60)) return json(400, { ok: false, error: 'Please enter your last name.' });
        if (String(b.phone ?? '').replace(/\D/g, '').length < 10) return json(400, { ok: false, error: 'Please enter your phone number, including area code.' });
        const agent = await agentId(key, f);
        const id = agent ? await clientFor(key, f, { email, firstName, lastName: clean(b.lastName, 60), phone: clean(b.phone, 30) }, agent) : null;
        if (!id) return json(502, { ok: false, error: 'mls-error' });
        client = { clientId: id, fname: firstName };
        created = true;
      }
      const base = origin && ALLOWED.test(origin) ? origin : 'https://www.huerkamphomes.com';
      if (mailReady() || mail !== sendMail) {
        // Our own email service (Resend): a link carrying our signed token.
        const link = `${base}/account/verify?t=${encodeURIComponent(sign('link', { c: client.clientId, e: email, n: client.fname ?? '' }, secret))}`;
        const sent = await mail({ to: email, ...linkEmail(client.fname ?? '', link) });
        if (!sent.ok) return json(sent.error === 'email-not-set-up' ? 503 : 502, { ok: false, error: sent.error, created });
        return json(200, { ok: true, sent: true, created });
      }
      // Repliers sends it from the team agent; it adds ?token= to the link.
      const agent = await agentId(key, f);
      const hi = client.fname ? `Hi ${client.fname},` : 'Hi,';
      const r = await rq(key, 'POST', '/messages', { body: { sender: 'agent', agentId: agent, clientId: client.clientId, content: {
        subject: `Your ${site.name} sign-in link`,
        message: `${hi} here's your link to sign in to your ${site.name} account, where you can see and change your saved searches and saved homes. If you didn't ask for this, you can ignore this email.`,
        links: [`${base}/account/verify`],
      } } }, f);
      if (!r.ok) { console.error('Repliers sign-in message', r.status, r.error); return json(502, { ok: false, error: 'email-failed', created }); }
      return json(200, { ok: true, sent: true, created });
    }

    if (action === 'verify') {
      let clientId = null, email = '';
      const token = clean(b.token, 64);
      if (/^[0-9a-f-]{20,64}$/i.test(token)) {
        // A Repliers message token: the sign-in email or any alert email link.
        const m = list((await rq(key, 'GET', '/messages', { params: { token } }, f)).data, 'messages').find((x) => !x.token || x.token === token);
        clientId = m?.clientId ?? null;
      } else {
        const l = verify('link', clean(b.t, 2000), secret);
        if (l) { clientId = l.c; email = l.e; }
      }
      if (!clientId) return json(401, { ok: false, error: 'link-expired' });
      const c = (await rq(key, 'GET', `/clients/${clientId}`, {}, f)).data ?? {};
      email = String(c.email ?? email).toLowerCase();
      if (!email) return json(401, { ok: false, error: 'link-expired' });
      const me = { firstName: c.fname ?? '', lastName: c.lname ?? '', email, phone: c.phone ? String(c.phone) : '' };
      return json(200, { ok: true, session: sign('session', { c: clientId, e: email, n: me.firstName }, secret), me });
    }
    return json(404, { ok: false, error: 'unknown' });
  } catch (e) {
    console.error('account', e.message);
    return json(502, { ok: false, error: 'mls-error' });
  }
};

// At most 10 requests a minute from one visitor (Netlify rate limiting), so a bot can't flood it.
export const config = { path: '/api/account/*', rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
