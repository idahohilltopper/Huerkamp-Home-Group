import { NextResponse } from 'next/server';

const MAX_BODY = 10_000; // bytes
const ALLOWED_HOSTS = new Set(['joinhhg.com', 'www.joinhhg.com']);
const LICENSED = new Set(['Yes, active license', 'In progress', 'Not yet, but interested']);
const EXPERIENCE = new Set(['New to real estate', '1–3 years', '4–10 years', '10+ years']);
const LOOKING = new Set(['Warm leads', 'Hands-on training', 'Mentorship', 'Better split', 'Team culture', 'Tech & marketing', 'Room to grow', 'Transaction support']);

// Best-effort per-instance rate limits (resets when the server instance restarts).
// General cap on every request, and a stricter cap on real submissions to Follow Up Boss.
const general = new Map();
const submits = new Map();
function over(map, ip, max) {
  const now = Date.now();
  const recent = (map.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  map.set(ip, recent);
  if (map.size > 5000) map.clear();
  return recent.length > max;
}

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);

function originAllowed(req) {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    const u = new URL(origin);
    return ALLOWED_HOSTS.has(u.hostname) || u.hostname === 'localhost' || u.hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

export async function POST(req) {
  if (!originAllowed(req)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }
  if (!(req.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 415 });
  }
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (over(general, ip, 40)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let b;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY) return NextResponse.json({ error: 'Request too large.' }, { status: 413 });
    b = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!b || typeof b !== 'object' || Array.isArray(b)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: pretend success for bots.
  if (b.website) return NextResponse.json({ ok: true });

  const name = clean(b.name, 100);
  const email = clean(b.email, 254);
  const phone = clean(b.phone, 30);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, '').length < 7) {
    return NextResponse.json({ error: 'Please provide a valid name, email, and phone.' }, { status: 400 });
  }

  if (over(submits, ip, 5)) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
  }

  const apiKey = process.env.FUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });
  }

  const licensed = LICENSED.has(b.licensed) ? b.licensed : 'n/a';
  const experience = EXPERIENCE.has(b.experience) ? b.experience : 'n/a';
  const looking = Array.isArray(b.looking) ? b.looking.filter((x) => LOOKING.has(x)).slice(0, 12) : [];
  const message = clean(b.message, 2000);

  const [firstName, ...rest] = name.split(/\s+/);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(apiKey + ':').toString('base64'),
  };
  if (process.env.FUB_SYSTEM) headers['X-System'] = clean(process.env.FUB_SYSTEM, 60);
  if (process.env.FUB_SYSTEM_KEY) headers['X-System-Key'] = process.env.FUB_SYSTEM_KEY;

  const description = [
    looking.length ? `Looking for: ${looking.join(', ')}` : '',
    `Licensed: ${licensed}`,
    `Experience: ${experience}`,
    message ? `Message: ${message}` : '',
  ].filter(Boolean).join('\n');

  let res;
  try {
    res = await fetch('https://api.followupboss.com/v1/events', {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        source: 'HHG Recruiting Website',
        system: clean(process.env.FUB_SYSTEM, 60) || 'HHGRecruiting',
        type: 'Registration',
        message: description,
        person: {
          firstName,
          lastName: rest.join(' '),
          emails: [{ value: email }],
          phones: [{ value: phone }],
          tags: ['Recruiting'],
        },
      }),
    });
  } catch {
    console.error('FUB request failed');
    return NextResponse.json({ error: 'Could not submit right now. Please try again.' }, { status: 502 });
  }

  if (!res.ok) {
    console.error('FUB error status', res.status); // status only, never log submitted details
    return NextResponse.json({ error: 'Could not submit right now. Please try again.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
