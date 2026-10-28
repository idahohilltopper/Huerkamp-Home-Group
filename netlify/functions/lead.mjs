// Website form → Follow Up Boss.
// Every form on the site posts here (/api/lead). This sends it to Follow Up Boss's Events API,
// which creates or updates the person, attaches the inquiry and runs the team's lead routing.
// The API key lives in Netlify (FUB_API_KEY), never in this repository.
// Fello picks up sellers from Follow Up Boss through its own integration.

import { getStore } from '@netlify/blobs';
import { buildEvent } from '../../src/lib/lead.mjs';

const FUB_URL = 'https://api.followupboss.com/v1/events';

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// Only the site's own pages may post leads (the live domains, Netlify previews, local testing). Browsers always
// send Origin on a POST, so another website can't push spam into Follow Up Boss through this endpoint.
const ALLOWED = /^https:\/\/((www\.)?huerkamphomegroup\.com|(www\.)?huerkamphomes\.com|[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app)$|^http:\/\/localhost(:\d+)?$/;

export default async (req) => {
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
  if (built.spam) return json(200, { ok: true });          // quietly ignore bots
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
    return json(500, { ok: false, error: 'Not configured' });
  }

  const res = await fetch(FUB_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Basic ' + Buffer.from(`${key}:`).toString('base64'),
      'X-System': 'HuerkampHomeGroupWebsite',
    },
    body: JSON.stringify(built.event),
  });

  // 200/201 = created or updated; 204 = Follow Up Boss chose to ignore it (e.g. lead flow archived it).
  if (res.ok) return json(200, { ok: true });
  console.error('Follow Up Boss error', res.status, (await res.text()).slice(0, 500));
  return json(502, { ok: false, error: 'Could not send' });
};

export const config = { path: '/api/lead' };
