// Hot-buyer signals and everyday activity (homes viewed, searches) for known visitors: sent to Follow Up Boss through /api/lead (forms "hot-return" and "hot-repeat"
// in src/lib/lead.mjs, by email only), where they land on the person's record under their assigned agent, tagged
// "Hot buyer"; Lead Claimer picks them up from Follow Up Boss. Saving a home (heart) is the third signal and is already
// sent by src/scripts/favorites.ts.
//   came back:     a page load 7 or more days after this browser's previous visit
//   repeat views:  the same home opened on 3 different days (sent once per home)
// Only for visitors the site knows (hhg-fav-me: any lead form, a heart, a sign-in or an alert-email click). Everything
// is remembered in this browser's localStorage; in a private window nothing is, and nothing is sent.
import { me } from './session';

export const AWAY_DAYS = 7, VIEW_DAYS = 3;
const LAST = 'hhg-last-visit', DAYS = 'hhg-view-days', ME = 'hhg-fav-me', ACT = 'hhg-activity-sent';
const DAY = 86_400_000;
const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private window */ } };
const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the visitor's time zone

type Home = { mls: string; street?: string; city?: string; zip?: string; price?: string | number };

/** Off when the visitor turned it off on /cookies (hhg-activity) or their browser sends Global Privacy Control. */
export const sharingOff = () => get('hhg-activity') === 'off' || (navigator as any).globalPrivacyControl === true;

function send(form: 'hot-return' | 'hot-repeat' | 'hot-share' | 'activity-view' | 'activity-search', fields: Record<string, string>) {
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

/** Everyday activity (a home viewed, a search run): true the first time `key` is seen today, with at most 40 sends a
 * day from this browser so a long browsing session can't flood the timeline. Exported for tests. */
// /api/lead takes 10 posts a minute per visitor (netlify/functions/lead.mjs), so activity uses at most 4 of them a minute
// and a real form sent right after fast browsing still gets through. A view skipped for that reason isn't remembered,
// so the next look at the home sends it.
export function firstToday(key: string, day = today(), now = Date.now()): boolean {
  let s: { day?: string; keys?: string[]; t?: number[] } = {};
  try { s = JSON.parse(get(ACT) ?? '{}') ?? {}; } catch { /* start over */ }
  const keys = s.day === day ? s.keys ?? [] : [];
  const recent = (s.t ?? []).filter((x) => now - x < 60_000);
  if (keys.includes(key) || keys.length >= 40 || recent.length >= 4) return false;
  put(ACT, JSON.stringify({ day, keys: [...keys, key], t: [...recent, now] }));
  return true;
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
  if (!me()?.email) return;
  const home = { listing: `${[h.street, h.city].filter(Boolean).join(', ')} (MLS #${h.mls})`,
    propStreet: h.street ?? '', propCity: h.city ?? '', propZip: h.zip ?? '', propMls: h.mls, propPrice: String(h.price ?? '') };
  if (n) send('hot-repeat', { viewDays: String(n), ...home });
  else if (firstToday(`v:${h.mls}`)) send('activity-view', home);
}

// A search on the map search page (src/scripts/home-search.ts announces each one). Sent once the filters have stayed
// put for 8 seconds, so dragging the map or clicking through filters counts as one search.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
function searched(d: { summary?: string; url?: string }) {
  clearTimeout(searchTimer);
  if (!d.url || !me()?.email) return;
  searchTimer = setTimeout(() => {
    const key = `s:${d.url!.replace(/^https?:\/\/[^/]+/, '')}`;
    if (firstToday(key)) send('activity-search', { search: d.summary ?? '', searchUrl: d.url! });
  }, 8000);
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
  // The Share button announces each share (src/components/ShareHome.astro): the home's MLS number, title and how.
  window.addEventListener('home-shared', (e: Event) => {
    const d = (e as CustomEvent).detail ?? {};
    if (d.mls && me()?.email && firstToday(`sh:${d.mls}`)) send('hot-share', { listing: `${d.title ?? ''} (MLS #${d.mls})`, propMls: d.mls, shareMethod: d.method ?? '' });
  });
  window.addEventListener('home-searched', (e: Event) => searched((e as CustomEvent).detail ?? {}));
}
