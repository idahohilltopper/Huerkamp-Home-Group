// Shared by the pages that alert-email links open (/listings, /search, /listings/property, /profile, /unsubscribe):
// the link's token identifies the visitor to /api/alerts (netlify/functions/alerts.mjs). It's kept for this visit only
// (sessionStorage), so "Edit" and "My alerts" keep working after the first click. Without one, a signed-in visitor's
// session token (src/scripts/session.ts) does the same job.
import { markRegistered } from './register';
import { session, signedIn, signIn } from './session';
const KEY = 'hhg-alert-token';
export const params = new URLSearchParams(location.search);
export function token(): string {
  const t = params.get('token') ?? '';
  if (t) markRegistered(); // came from one of our alert emails: no sign-up wall
  // The same Repliers token signs them in on this device (netlify/functions/account.mjs), as the sign-in email does.
  if (t && !signedIn()) fetch('/api/account/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: t }) })
    .then((r) => r.json()).then((a) => { if (a?.ok && a.session) signIn(a.session, a.me); }).catch(() => {});
  try { if (t) sessionStorage.setItem(KEY, t); return t || sessionStorage.getItem(KEY) || session(); } catch { return t || session(); }
}
export async function api(path: string, body?: unknown) {
  const r = await fetch(`/api/alerts/${path}`, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {});
  return r.json().catch(() => ({ ok: false }));
}
export const say = (el: Element | null, html: string) => { if (el) el.innerHTML = html; };
