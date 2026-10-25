// Live numbers for the private results report (/report): website leads from Follow Up Boss and Google search
// numbers from Search Console. Only counts are returned, and only with the report passcode.
// Netlify settings (never in this repository):
//   REPORT_KEY        the passcode for /report
//   FUB_API_KEY       already used by the lead form
//   GSC_CLIENT_EMAIL  Google service account email, added as a user on the Search Console property
//   GSC_PRIVATE_KEY   that service account's private key
//   GSC_SITE          optional: the Search Console property, default sc-domain:huerkamphomegroup.com

import { timingSafeEqual } from 'node:crypto';
import { fubPeople, summarizeLeads, googleToken, searchConsole } from '../../src/lib/report.mjs';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();
const same = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export default async (req) => {
  const want = env('REPORT_KEY');
  const got = (req.headers.get('x-report-key') ?? '').trim();
  if (!want) return json(503, { ok: false, error: 'not-configured' });
  if (!got || !same(got, want)) return json(401, { ok: false, error: 'wrong-passcode' });

  const [leads, search] = await Promise.all([
    (async () => {
      const key = env('FUB_API_KEY');
      if (!key) return { ok: false, error: 'Follow Up Boss key missing' };
      try { return { ok: true, ...summarizeLeads(await fubPeople(key)) }; }
      catch (e) { console.error('FUB', e.message); return { ok: false, error: 'Follow Up Boss did not answer' }; }
    })(),
    (async () => {
      const email = env('GSC_CLIENT_EMAIL'), pk = env('GSC_PRIVATE_KEY');
      if (!email || !pk) return { ok: false, error: 'Search Console not connected yet' };
      try { return { ok: true, ...(await searchConsole(await googleToken(email, pk), env('GSC_SITE') || 'sc-domain:huerkamphomegroup.com')) }; }
      catch (e) { console.error('GSC', e.message); return { ok: false, error: 'Search Console did not answer (check the service account has access)' }; }
    })(),
  ]);
  return json(200, { ok: true, updated: new Date().toISOString(), leads, search });
};

export const config = { path: '/api/report' };
