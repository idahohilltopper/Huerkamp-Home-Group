// Website form → Follow Up Boss.
// Every form on the site posts here (/api/lead). This sends it to Follow Up Boss's Events API,
// which creates or updates the person, attaches the inquiry and runs the team's lead routing.
// The API key lives in Netlify (FUB_API_KEY), never in this repository.
// Fello picks up sellers from Follow Up Boss through its own integration.

import { buildEvent } from '../../src/lib/lead.mjs';

const FUB_URL = 'https://api.followupboss.com/v1/events';

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export default async (req) => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' });

  let input;
  try {
    input = await req.json();
  } catch {
    return json(400, { ok: false, error: 'Bad request' });
  }

  const built = buildEvent(input);
  if (built.spam) return json(200, { ok: true });          // quietly ignore bots
  if (built.error) return json(400, { ok: false, error: built.error });

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
