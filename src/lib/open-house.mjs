// Open houses from the MLS feed (Repliers "openHouse": an array, or an object keyed "1", "2"..., each with date,
// startTime, endTime, type, status, TZ). NorthstarMLS (BR documentation section 11): only public open houses may be
// shown (never broker or agent opens), every display credits the listing broker, and carries OPEN_HOUSE_NOTE.
// Shared by the build (src/lib/mls-feed.mjs) and the browser (cards), so plain JavaScript with no imports.

export const OPEN_HOUSE_NOTE = 'Open House information is subject to change without warning.';
const TZ = 'America/Chicago';

/** "13:00", "1:00 PM", "2026-11-08T13:00:00" -> "13:00"; null if unreadable. */
function hhmm(v) {
  const s = String(v ?? '').trim();
  const iso = s.match(/T(\d{2}):(\d{2})/);
  if (iso) return `${iso[1]}:${iso[2]}`;
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]\.?m\.?)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  if (m[3]) { const pm = /p/i.test(m[3]); if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0; }
  return h <= 23 ? `${String(h).padStart(2, '0')}:${m[2]}` : null;
}

/** Today's date in Minneapolis, YYYY-MM-DD. */
export const today = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

/** Upcoming public open houses: [{ date: 'YYYY-MM-DD', start: 'HH:MM', end: 'HH:MM' | null }], soonest first, at most 4. */
export function openHouses(raw, now = new Date()) {
  const list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? Object.values(raw) : [];
  const from = today(now);
  const out = [];
  for (const o of list) {
    if (!o || typeof o !== 'object') continue;
    const words = `${o.type ?? ''} ${o.status ?? ''} ${o.openHouseType ?? ''}`;
    if (/broker|caravan|agent|office|private|cancel|virtual only/i.test(words)) continue; // public opens only
    const date = String(o.date ?? o.startTime ?? '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < from) continue;
    const start = hhmm(o.startTime), end = hhmm(o.endTime);
    if (!start) continue;
    out.push({ date, start, end });
  }
  const seen = new Set();
  return out.filter((o) => { const k = `${o.date} ${o.start}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`)).slice(0, 4);
}

const clock = (t) => { const [h, m] = t.split(':').map(Number); const h12 = h % 12 || 12; return m ? `${h12}:${String(m).padStart(2, '0')}` : `${h12}`; };
const half = (t) => (Number(t.split(':')[0]) < 12 ? 'AM' : 'PM');

/** "Sat, Nov 8 · 1–3 PM" (or "Sat, Nov 8 · 11 AM–1 PM"). */
export function formatOpenHouse(o, { long = false } = {}) {
  const d = new Date(`${o.date}T12:00:00`);
  const day = d.toLocaleDateString('en-US', long ? { weekday: 'long', month: 'long', day: 'numeric' } : { weekday: 'short', month: 'short', day: 'numeric' });
  const time = o.end
    ? (half(o.start) === half(o.end) ? `${clock(o.start)}–${clock(o.end)} ${half(o.end)}` : `${clock(o.start)} ${half(o.start)}–${clock(o.end)} ${half(o.end)}`)
    : `${clock(o.start)} ${half(o.start)}`;
  return `${day} · ${time}`;
}
