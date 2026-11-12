// Open houses from the MLS feed (Repliers "openHouse": an array, or an object keyed "1", "2"..., each with date,
// startTime, endTime, type, status, TZ). NorthstarMLS (BR documentation section 11): only public open houses may be
// shown (never broker or agent opens), every display credits the listing broker, and carries OPEN_HOUSE_NOTE.
// Shared by the build (src/lib/mls-feed.mjs) and the browser (cards), so plain JavaScript with no imports.

export const OPEN_HOUSE_NOTE = 'Open House information is subject to change without warning.';
const TZ = 'America/Chicago';

/** "13:00", "1:00 PM", "2026-11-08T13:00:00" -> "13:00"; null if unreadable. */
function hhmm(v) {
  const s = String(v ?? '').trim();
  const iso = s.match(/^\d{4}-\d{2}-\d{2}[T ](\d{2}):(\d{2})/);
  if (iso) return `${iso[1]}:${iso[2]}`;
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]\.?m\.?)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  if (m[3]) { const pm = /p/i.test(m[3]); if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0; }
  return h <= 23 ? `${String(h).padStart(2, '0')}:${m[2]}` : null;
}

/** "2026-11-15" + "20:00" read as UTC -> Minneapolis { date, time }; handles the day rolling back across midnight. */
function fromUtc(date, t) {
  const d = new Date(`${date}T${t}:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** Is this open house's time given in UTC? Repliers sends TZ: "UTC" (Nov 12, 2026: times showed 6 hours late), or an ISO
 *  time ending in Z / +00:00. Times with no zone at all are taken as Minneapolis time. */
const isUtc = (o) => /^(utc|gmt|z|etc\/utc)$/i.test(String(o.TZ ?? o.tz ?? o.timeZone ?? '').trim())
  || [o.startTime, o.endTime].some((v) => /[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]00:?00)$/i.test(String(v ?? '').trim()));

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
    let date = String(o.date ?? o.startTime ?? '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    let start = hhmm(o.startTime), end = hhmm(o.endTime);
    if (!start) continue;
    if (isUtc(o)) {
      const sDay = /^\d{4}-\d{2}-\d{2}[T ]/.test(String(o.startTime)) ? String(o.startTime).slice(0, 10) : date;
      const eDay = /^\d{4}-\d{2}-\d{2}[T ]/.test(String(o.endTime)) ? String(o.endTime).slice(0, 10) : (end && end < start ? null : date);
      const s = fromUtc(sDay, start);
      if (!s) continue;
      ({ date, time: start } = s);
      // An end time "earlier" than the start in UTC (e.g. 23:00-01:00) belongs to the next UTC day.
      const eDate = eDay ?? new Date(Date.parse(`${sDay}T00:00:00Z`) + 864e5).toISOString().slice(0, 10);
      end = end ? fromUtc(eDate, end)?.time ?? null : null;
    }
    if (date < from) continue;
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
