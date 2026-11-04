// "Recently viewed homes": each home page a visitor opens is remembered in this browser (localStorage, newest first,
// 12 at most) and listed on My account (src/pages/profile.astro). Like any listing display (NorthstarMLS Rule 12.3(f)),
// an entry shows only the photo, address, MLS number and listing brokerage, with the Broker Reciprocity thumbnail
// logo on other brokerages' homes, and only after I AGREE. No price is kept, so nothing shown can go stale.
const KEY = 'hhg-recent', MAX = 12;
export type Recent = { mls: string; slug: string; addr: string; photo: string | null; brokerage: string; own: 0 | 1; at: string };

export function recent(): Recent[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
export function remember(r: Omit<Recent, 'at'>) {
  try {
    const list = [{ ...r, at: new Date().toISOString().slice(0, 10) }, ...recent().filter((x) => x.mls !== r.mls)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* private window: nothing kept */ }
}
export const clearRecent = () => { try { localStorage.removeItem(KEY); } catch { /* nothing kept */ } };

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export function recentHtml(list: Recent[], brThumb?: string) {
  return list.map((r) => `<li class="recent"><a href="/homes/${esc(r.slug)}">`
    + (r.photo ? `<img src="${esc(r.photo)}?class=small" alt="${esc(r.addr)}" width="160" height="107" loading="lazy" decoding="async" />` : '<span class="recent__nophoto">No photo</span>')
    + `<span class="recent__addr">${esc(r.addr)}</span></a>`
    + `<span class="recent__by">MLS #${esc(r.mls)} · ${!r.own && brThumb ? `<img src="${esc(brThumb)}" alt="Broker Reciprocity listing" height="14" /> ` : ''}Listing courtesy of ${esc(r.brokerage || 'the listing brokerage')}</span></li>`).join('');
}
