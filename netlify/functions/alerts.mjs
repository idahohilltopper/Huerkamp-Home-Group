// Saved searches and new-listing alerts (Repliers, Professional plan). The browser never sees the API key.
//   POST /api/alerts/save         { firstName, lastName, email, phone?, query, frequency, name }  -> { ok, searchId }
//   GET  /api/alerts/me?token=     the visitor's saved searches (token from any alert email link)
//   GET  /api/alerts/search?searchId=&token=   one saved search as a /home-search address
//   POST /api/alerts/update       { token, searchId, frequency? | active? | remove? | query? }
//   POST /api/alerts/unsubscribe  { token }   stop every email
//   GET  /api/alerts/check?email=  (x-report-key) what Repliers holds for the team agent and that client
//   GET  /api/alerts/listing?mls=  the site page for an MLS number (alert "view listing" links)
//   POST /api/alerts/favorite     { firstName, lastName, email, phone?, mls }  heart a home (Repliers favorites)
//   POST /api/alerts/unfavorite   { email, mls }  un-heart it
// The token in alert-email links identifies the client (Repliers GET /messages?token=), so people manage their alerts
// without a password. Every change is checked against that client. The lead itself still goes to Follow Up Boss
// through /api/lead (the page sends both). Needs REPLIERS_API_KEY; optional REPLIERS_AGENT_ID picks the agent the
// clients are assigned to (otherwise the first agent on the account, created as "Huerkamp Home Group" if none).
import { timingSafeEqual } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { API } from '../../src/lib/repliers.mjs';
import { toSavedSearch, toSiteQuery, describeSaved, FREQUENCIES } from '../../src/lib/alerts.mjs';
import { INDEX_FILE } from '../../src/lib/search-index.mjs';

const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();
const ALLOWED = /^https:\/\/((www\.)?huerkamphomegroup\.com|(www\.)?huerkamphomes\.com|[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app)$|^http:\/\/localhost(:\d+)?$/;
// Repliers requires all six fields to create an agent (phone: 11 digits with the country code).
const TEAM = { fname: 'Huerkamp', lname: 'Home Group', email: 'leads@hhgus.com', phone: '16128439620', brokerage: 'Keller Williams Preferred Realty', designation: 'Realtor' };
const BOARD_ID = 187; // NorthstarMLS at Repliers
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clean = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const phone11 = (v) => { const d = String(v ?? '').replace(/\D/g, ''); return d.length === 10 ? `1${d}` : d.length === 11 && d[0] === '1' ? d : null; };
const list = (d, key) => (Array.isArray(d) ? d : d?.[key] ?? d?.results ?? []);

/** Call Repliers (any method). */
export async function rq(key, method, path, { params, body } = {}, fetcher = fetch) {
  const url = new URL(path, API);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, String(v));
  const res = await fetcher(url, { method, headers: { 'REPLIERS-API-KEY': key, accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let data = null; try { data = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
  return { status: res.status, ok: res.ok, data, error: res.ok ? null : text.slice(0, 300) };
}

async function agentId(key, f) {
  const set = Number(env('REPLIERS_AGENT_ID'));
  if (set) return set;
  const r = await rq(key, 'GET', '/agents', {}, f);
  const agents = list(r.data, 'agents');
  const team = agents.find((a) => String(a.email ?? '').toLowerCase() === TEAM.email) ?? agents[0];
  if (team?.agentId) return team.agentId;
  const made = await rq(key, 'POST', '/agents', { body: { ...TEAM } }, f);
  if (!made.data?.agentId) console.error('Repliers agent create', made.status, made.error);
  return made.data?.agentId ?? null;
}

async function clientFor(key, f, { email, firstName, lastName, phone }, agent) {
  const found = list((await rq(key, 'GET', '/clients', { params: { email } }, f)).data, 'clients').find((c) => String(c.email ?? '').toLowerCase() === email.toLowerCase());
  if (found?.clientId) {
    // Someone who unsubscribed and now saves a new search wants emails again.
    if (found.preferences?.unsubscribe || found.status === false) await rq(key, 'PATCH', `/clients/${found.clientId}`, { body: { status: true, preferences: { email: true, unsubscribe: false } } }, f);
    return found.clientId;
  }
  const body = { agentId: agent, fname: firstName, lname: lastName, email, status: true, tags: ['website'], preferences: { email: true, sms: false, unsubscribe: false } };
  const p = phone11(phone); if (p) body.phone = p;
  let made = await rq(key, 'POST', '/clients', { body }, f);
  if (!made.ok && body.phone) { delete body.phone; made = await rq(key, 'POST', '/clients', { body }, f); } // phone already used elsewhere
  const id = made.data?.clientId ?? made.data?.client?.clientId ?? null;
  if (!id) console.error('Repliers client create', made.status, made.error);
  return id;
}

/** The client a message token belongs to, or null. */
async function clientOfToken(key, f, token) {
  if (!/^[0-9a-f-]{20,64}$/i.test(token ?? '')) return null;
  const r = await rq(key, 'GET', '/messages', { params: { token } }, f);
  const m = list(r.data, 'messages').find((x) => !x.token || x.token === token) ?? null;
  return m?.clientId ?? null;
}
async function ownSearch(key, f, clientId, searchId) {
  if (!/^\d+$/.test(String(searchId ?? ''))) return null;
  const r = await rq(key, 'GET', `/searches/${searchId}`, {}, f);
  return r.data && String(r.data.clientId) === String(clientId) ? r.data : null;
}

let index;
function slugFor(mls) {
  if (index === undefined) {
    const here = new URL('.', import.meta.url).pathname;
    const file = [join(process.cwd(), INDEX_FILE), join(here, '../../', INDEX_FILE), join(here, INDEX_FILE), join('/var/task', INDEX_FILE)].find((p) => existsSync(p));
    try { index = file ? JSON.parse(readFileSync(file, 'utf8')) : null; } catch { index = null; }
  }
  const cols = index?.fields ?? [];
  const iM = cols.indexOf('mls'), iS = cols.indexOf('slug');
  const row = (index?.rows ?? []).find((r) => String(Array.isArray(r) ? r[iM] : r.mls) === mls);
  return row ? (Array.isArray(row) ? row[iS] : row.slug) : null;
}

export default async (req, _ctx, f = fetch) => {
  const url = new URL(req.url);
  const action = url.pathname.replace(/^\/api\/alerts\/?/, '');
  const key = env('REPLIERS_API_KEY');
  if (!key) return json(503, { ok: false, error: 'not-configured' });
  try {
    if (req.method === 'GET') {
      if (action === 'listing') {
        const mls = clean(url.searchParams.get('mls'), 20);
        const slug = /^[A-Za-z0-9-]+$/.test(mls) ? slugFor(mls) : null;
        return json(200, { ok: true, slug });
      }
      if (action === 'check') {
        // For the /report page (passcode REPORT_KEY): what Repliers holds for the team agent and one client, to confirm
        // alerts are wired up. Read-only; never creates anything.
        const want = env('REPORT_KEY'), got = (req.headers.get('x-report-key') ?? '').trim();
        if (!want || got.length !== want.length || !timingSafeEqual(Buffer.from(got), Buffer.from(want))) return json(401, { ok: false, error: 'wrong-passcode' });
        const agents = list((await rq(key, 'GET', '/agents', {}, f)).data, 'agents')
          .map((a) => ({ agentId: a.agentId, name: [a.fname, a.lname].filter(Boolean).join(' '), email: a.email ?? '' }));
        const set = Number(env('REPLIERS_AGENT_ID'));
        const siteAgent = set || (agents.find((a) => a.email.toLowerCase() === TEAM.email) ?? agents[0])?.agentId || null;
        const email = clean(url.searchParams.get('email'), 120).toLowerCase();
        let client = null;
        if (isEmail(email)) {
          const c = list((await rq(key, 'GET', '/clients', { params: { email } }, f)).data, 'clients').find((x) => String(x.email ?? '').toLowerCase() === email);
          if (c?.clientId) {
            const searches = list((await rq(key, 'GET', '/searches', { params: { clientId: c.clientId } }, f)).data, 'searches')
              .filter((x) => String(x.clientId ?? x.client?.clientId ?? c.clientId) === String(c.clientId)).map((x) => ({ searchId: x.searchId, summary: describeSaved(x), frequency: x.notificationFrequency ?? '' }));
            const favorites = list((await rq(key, 'GET', '/favorites', { params: { clientId: c.clientId } }, f)).data, 'favorites')
              .map((x) => ({ mls: String(x.mlsNumber ?? x.listing?.mlsNumber ?? ''), boardId: x.boardId ?? x.listing?.boardId ?? null }));
            client = { clientId: c.clientId, agentId: c.agentId, name: [c.fname, c.lname].filter(Boolean).join(' '), searches, favorites };
          }
        }
        return json(200, { ok: true, agents, siteAgent, fromEnv: !!set, email, client });
      }
      const clientId = await clientOfToken(key, f, url.searchParams.get('token'));
      if (!clientId) return json(401, { ok: false, error: 'link-expired' });
      if (action === 'me') {
        const r = await rq(key, 'GET', '/searches', { params: { clientId } }, f);
        const searches = list(r.data, 'searches').filter((s) => String(s.clientId ?? s.client?.clientId ?? clientId) === String(clientId)).map((s) => ({
          searchId: s.searchId, name: s.name, summary: describeSaved(s), frequency: s.notificationFrequency, active: s.status !== false, query: toSiteQuery(s).toString(),
        }));
        const c = (await rq(key, 'GET', `/clients/${clientId}`, {}, f)).data ?? {};
        const favorites = list((await rq(key, 'GET', '/favorites', { params: { clientId } }, f)).data, 'favorites')
          .filter((x) => String(x.clientId ?? clientId) === String(clientId))
          .map((x) => { const mls = String(x.mlsNumber ?? x.listing?.mlsNumber ?? ''); return { mls, slug: slugFor(mls) }; }).filter((x) => x.mls);
        return json(200, { ok: true, firstName: c.fname ?? '', unsubscribed: !!c.preferences?.unsubscribe, searches, favorites });
      }
      if (action === 'search') {
        const s = await ownSearch(key, f, clientId, url.searchParams.get('searchId'));
        return s ? json(200, { ok: true, searchId: s.searchId, name: s.name, query: toSiteQuery(s).toString() }) : json(404, { ok: false, error: 'not-found' });
      }
      return json(404, { ok: false, error: 'unknown' });
    }
    if (req.method !== 'POST') return json(405, { ok: false, error: 'method' });
    const origin = req.headers.get('origin');
    if (origin && !ALLOWED.test(origin)) return json(403, { ok: false, error: 'Forbidden' });
    const b = await req.json().catch(() => ({}));
    // The team's address belongs to the agent record; Repliers refuses a client with the same email (409).
    if (String(b.email ?? '').trim().toLowerCase() === TEAM.email) return json(400, { ok: false, error: `${TEAM.email} is our team inbox, so it can't be used for alerts. Please use your own email address.` });

    if (action === 'favorite' || action === 'unfavorite') {
      const email = clean(b.email, 120).toLowerCase(), mls = clean(b.mls, 20);
      if (!isEmail(email) || !/^[A-Za-z0-9-]+$/.test(mls)) return json(400, { ok: false, error: 'bad-request' });
      if (action === 'unfavorite') {
        const c = list((await rq(key, 'GET', '/clients', { params: { email } }, f)).data, 'clients').find((x) => String(x.email ?? '').toLowerCase() === email);
        if (!c?.clientId) return json(200, { ok: true });
        const fav = list((await rq(key, 'GET', '/favorites', { params: { clientId: c.clientId } }, f)).data, 'favorites').find((x) => String(x.mlsNumber ?? x.listing?.mlsNumber) === mls);
        if (fav?.favoriteId) await rq(key, 'DELETE', `/favorites/${fav.favoriteId}`, {}, f);
        return json(200, { ok: true });
      }
      const person = { firstName: clean(b.firstName, 60), lastName: clean(b.lastName, 60), email, phone: clean(b.phone, 30) };
      if (!person.firstName) return json(400, { ok: false, error: 'Please enter your name.' });
      const agent = await agentId(key, f);
      const clientId = agent ? await clientFor(key, f, person, agent) : null;
      if (!clientId) return json(502, { ok: false, error: 'mls-error' });
      const r = await rq(key, 'POST', '/favorites', { body: { clientId, mlsNumber: mls, boardId: BOARD_ID } }, f);
      if (!r.ok && r.status !== 403) { console.error('Repliers favorite', r.status, r.error); return json(502, { ok: false, error: 'mls-error' }); } // 403 = already saved
      return json(200, { ok: true });
    }

    if (action === 'save') {
      const person = { firstName: clean(b.firstName, 60), lastName: clean(b.lastName, 60), email: clean(b.email, 120).toLowerCase(), phone: clean(b.phone, 30) };
      if (!person.firstName || !isEmail(person.email)) return json(400, { ok: false, error: 'Please enter your name and email.' });
      const q = Object.fromEntries(Object.entries(b.query ?? {}).map(([k, v]) => [k, clean(v, 400)]));
      const agent = await agentId(key, f);
      if (!agent) return json(502, { ok: false, error: 'mls-error' });
      const clientId = await clientFor(key, f, person, agent);
      if (!clientId) return json(502, { ok: false, error: 'mls-error' });
      const built = toSavedSearch(q, { clientId, agentId: agent, frequency: clean(b.frequency, 10), name: clean(b.name, 50) });
      if (built.error) return json(400, { ok: false, error: built.error });
      const r = await rq(key, 'POST', '/searches', { body: built.body }, f);
      if (r.status === 406) return json(400, { ok: false, error: /saved searches|limit|maximum/i.test(r.error ?? '') ? 'You already have 5 saved searches. Remove one from your alerts page first.' : 'That search matches too many homes for email alerts (over 100). Narrow it with a price range, beds or a smaller map area.' });
      if (!r.ok) { console.error('Repliers save', r.status, r.error); return json(502, { ok: false, error: 'mls-error' }); }
      return json(200, { ok: true, searchId: r.data?.searchId ?? null, skipped: built.skipped });
    }

    const clientId = await clientOfToken(key, f, b.token);
    if (!clientId) return json(401, { ok: false, error: 'link-expired' });
    if (action === 'unsubscribe') {
      const r = await rq(key, 'PATCH', `/clients/${clientId}`, { body: { preferences: { email: false, sms: false, unsubscribe: true } } }, f);
      return r.ok ? json(200, { ok: true }) : json(502, { ok: false, error: 'mls-error' });
    }
    if (action === 'update') {
      const s = await ownSearch(key, f, clientId, b.searchId);
      if (!s) return json(404, { ok: false, error: 'not-found' });
      if (b.remove) { const r = await rq(key, 'DELETE', `/searches/${s.searchId}`, {}, f); return r.ok ? json(200, { ok: true }) : json(502, { ok: false, error: 'mls-error' }); }
      const patch = {};
      if (FREQUENCIES.includes(b.frequency)) patch.notificationFrequency = b.frequency;
      if (typeof b.active === 'boolean') patch.status = b.active;
      if (b.query && typeof b.query === 'object') {
        const q = Object.fromEntries(Object.entries(b.query).map(([k, v]) => [k, clean(v, 400)]));
        const built = toSavedSearch(q, { clientId, agentId: s.agentId, frequency: patch.notificationFrequency ?? s.notificationFrequency, name: s.name });
        if (built.error) return json(400, { ok: false, error: built.error });
        const { clientId: _c, agentId: _a, ...criteria } = built.body;
        Object.assign(patch, criteria);
      }
      if (!Object.keys(patch).length) return json(400, { ok: false, error: 'nothing-to-change' });
      const r = await rq(key, 'PATCH', `/searches/${s.searchId}`, { body: patch }, f);
      if (r.status === 406) return json(400, { ok: false, error: 'That search matches too many homes for email alerts (over 100). Narrow it with a price range, beds or a smaller map area.' });
      return r.ok ? json(200, { ok: true }) : json(502, { ok: false, error: 'mls-error' });
    }
    return json(404, { ok: false, error: 'unknown' });
  } catch (e) {
    console.error('alerts', e.message);
    return json(502, { ok: false, error: 'mls-error' });
  }
};

export const config = { path: '/api/alerts/*' };
