// /api/team-check: compares the website's team (src/data/team.json) with the active users in Follow Up Boss, for the
// weekly team check (a scheduled Claude task reads it every Monday and tells Jason who joined or left). Names and roles
// only, never emails or phone numbers. FUB_API_KEY is already set in Netlify for the lead form. Cached an hour.
import team from '../../src/data/team.json' with { type: 'json' };
import { fubUsers, compareTeam } from '../../src/lib/team-check.mjs';

const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();
const json = (status, body, cache = 'no-store') => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': cache, 'x-robots-tag': 'noindex' } });

export default async () => {
  const key = env('FUB_API_KEY');
  if (!key) return json(503, { ok: false, error: 'Follow Up Boss key missing' });
  try {
    const r = compareTeam(team.members, await fubUsers(key));
    return json(200, { ok: true, checked: new Date().toISOString(), ...r }, 'public, max-age=0, s-maxage=3600');
  } catch (e) {
    console.error('team-check', e?.message);
    return json(502, { ok: false, error: 'Follow Up Boss did not answer' });
  }
};

export const config = { path: '/api/team-check' };
