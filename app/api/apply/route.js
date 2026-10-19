import { NextResponse } from 'next/server';

export async function POST(req) {
  let b;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: pretend success for bots.
  if (b.website) return NextResponse.json({ ok: true });

  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim();
  const phone = String(b.phone || '').trim();
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !phone) {
    return NextResponse.json({ error: 'Please provide a valid name, email, and phone.' }, { status: 400 });
  }

  const apiKey = process.env.FUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });
  }

  const [firstName, ...rest] = name.split(/\s+/);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(apiKey + ':').toString('base64'),
  };
  if (process.env.FUB_SYSTEM) headers['X-System'] = process.env.FUB_SYSTEM;
  if (process.env.FUB_SYSTEM_KEY) headers['X-System-Key'] = process.env.FUB_SYSTEM_KEY;

  const description = [
    `Licensed: ${b.licensed || 'n/a'}`,
    `Experience: ${b.experience || 'n/a'}`,
    b.message ? `Message: ${String(b.message).slice(0, 2000)}` : '',
  ].filter(Boolean).join('\n');

  const res = await fetch('https://api.followupboss.com/v1/events', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source: 'HHG Recruiting Website',
      system: process.env.FUB_SYSTEM || 'HHGRecruiting',
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

  if (!res.ok) {
    console.error('FUB error', res.status, await res.text());
    return NextResponse.json({ error: 'Could not submit right now. Please try again.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
