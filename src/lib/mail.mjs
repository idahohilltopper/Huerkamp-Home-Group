// Sends the site's own emails (today: the sign-in link). Uses Resend (resend.com) when RESEND_API_KEY is set in
// Netlify; MAIL_FROM sets the sender (default "Huerkamp Home Group <signin@huerkamphomes.com>", which needs the domain
// verified at Resend). Without a key it reports 'email-not-set-up' and sends nothing.
const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();

export const mailReady = () => !!env('RESEND_API_KEY');

export async function sendMail({ to, subject, html, text }, fetcher = fetch) {
  const key = env('RESEND_API_KEY');
  if (!key) return { ok: false, error: 'email-not-set-up' };
  const from = env('MAIL_FROM') || 'Huerkamp Home Group <signin@huerkamphomes.com>';
  const res = await fetcher('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html, text, reply_to: 'leads@hhgus.com' }),
  }).catch((e) => ({ ok: false, status: 0, text: async () => e.message }));
  if (res.ok) return { ok: true };
  console.error('mail', res.status, (await res.text()).slice(0, 300));
  return { ok: false, error: 'email-failed' };
}
