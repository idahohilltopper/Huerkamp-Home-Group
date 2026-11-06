// Hot-buyer signals for known visitors: sent to Follow Up Boss through /api/lead (forms "hot-return" and "hot-repeat"
// in src/lib/lead.mjs, by email only), where they land on the person's record under their assigned agent, tagged
// "Hot buyer"; Lead Claimer picks them up from Follow Up Boss. Saving a home (heart) is the third signal and is already
// sent by src/scripts/favorites.ts.
//   came back:     a page load 7 or more days after this browser's previous visit
//   repeat views:  the same home opened on 3 different days (sent once per home)
// Only for visitors the site knows (hhg-fav-me: any lead form, a heart, a sign-in or an alert-email click). Everything
// is remembered in this browser's localStorage; in a private window nothing is, and nothing is sent.
import { me } from './session';

export const AWAY_DAYS = 7, VIEW_DAYS = 3;
const LAST = 'hhg-last-visit', DAYS = 'hhg-view-days', ME = 'hhg-fav-me';
const DAY = 86_400_000;
const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private window */ } };
const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the visitor's time zone

type Home = { mls: string; street?: string; city?: string; zip?: string; price?: string | number };

/** Off when the visitor turned it off on /cookies (hhg-activity) or their browser sends Global Privacy Control. */
export const sharingOff = () => get('hhg-activity') === 'off' || (navigator as any).globalPrivacyControl === true;

function send(form: 'hot-return' | 'hot-repeat', fields: Record<string, string>) {
  const who = me();
  if (!who?.email || sharingOff()) return;
  fetch('/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, keepalive: true,
    body: JSON.stringify({ form, hp: '', elapsed: 99999, page: location.pathname, title: document.title, fields: { email: who.email, ...fields } }) }).catch(() => {});
}

/** Days since the previous visit if this load counts as "came back" (and records this visit). Exported for tests. */
export function cameBack(now = Date.now()): number | null {
  const last = Number(get(LAST));
  // Count a visit once per hour at most, so moving between pages doesn't keep resetting it.
  if (!last || now - last > 3_600_000) put(LAST, String(now));
  return last && now - last >= AWAY_DAYS * DAY ? Math.floor((now - last) / DAY) : null;
}

/** Record today's view of a home; true the first time it reaches VIEW_DAYS different days. Exported for tests. */
export function repeatView(mls: string, day = today()): number | null {
  let all: Record<string, string[]> = {};
  try { all = JSON.parse(get(DAYS) ?? '{}') ?? {}; } catch { /* start over */ }
  const days = all[mls] ?? [];
  if (days.includes(day)) return null;
  days.push(day);
  delete all[mls]; all[mls] = days.slice(-30); // newest last; keep the 200 most recent homes
  const keys = Object.keys(all);
  for (const k of keys.slice(0, Math.max(0, keys.length - 200))) delete all[k];
  put(DAYS, JSON.stringify(all));
  return days.length === VIEW_DAYS ? days.length : null;
}

function viewed(h: Home) {
  if (!h.mls) return;
  const n = repeatView(h.mls);
  if (n && me()?.email) send('hot-repeat', { viewDays: String(n), listing: `${[h.street, h.city].filter(Boolean).join(', ')} (MLS #${h.mls})`,
    propStreet: h.street ?? '', propCity: h.city ?? '', propZip: h.zip ?? '', propMls: h.mls, propPrice: String(h.price ?? '') });
}

export function initHot() {
  // Any lead form with a name and email makes the visitor known here too (forms, hearts and alerts come pre-filled).
  window.addEventListener('lead-sent', (e: Event) => {
    const f = (e as CustomEvent).detail?.fields;
    if (f?.email && f.firstName && !get(ME)) put(ME, JSON.stringify({ firstName: f.firstName, lastName: f.lastName ?? '', email: f.email, phone: f.phone ?? '' }));
  });
  const away = cameBack();
  if (away && me()?.email) send('hot-return', { awayDays: String(away) });
  // A home page built at deploy time carries its details on the big heart button; the live listing page announces itself.
  const b = document.querySelector<HTMLElement>('.fav--big[data-fav]');
  if (b) viewed({ mls: b.dataset.fav!, street: b.dataset.favStreet, city: b.dataset.favCity, zip: b.dataset.favZip, price: b.dataset.favPrice });
  window.addEventListener('home-viewed', (e: Event) => viewed((e as CustomEvent).detail ?? {}));
}
