// Heart buttons (<button class="fav" data-fav="<MLS #>" data-fav-name="<address>" data-fav-price=...>) on listing cards,
// listing pages and the map search. Which homes are saved is remembered in this browser (localStorage) so hearts show
// filled; the real list lives at Repliers (favorites of the person's client record) and on their "My alerts" page.
const FAVS = 'hhg-favs', ME = 'hhg-fav-me';
const read = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? '') ?? d; } catch { return d; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private window */ } };
type Me = { firstName: string; lastName: string; email: string; phone?: string };

async function save(me: Me, b: HTMLElement) {
  const r = await fetch('/api/alerts/favorite', { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...me, mls: b.dataset.fav }) }).catch(() => null);
  return !!r && r.ok;
}
async function unsave(me: Me, mls: string) {
  await fetch('/api/alerts/unfavorite', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: me.email, mls }) }).catch(() => null);
}
/** Tell Follow Up Boss about a heart from someone already known (the first one goes through the pop-up's form). */
function tellAgent(me: Me, b: HTMLElement) {
  const d = b.dataset;
  // Facebook/Instagram (the Meta Pixel in Base.astro, and the server's copy with the same id): a saved home.
  const eid = (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.dispatchEvent(new CustomEvent('home-saved', { detail: { mls: d.fav, eid } }));
  fetch('/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ form: 'favorite', hp: '', elapsed: 99999, page: location.pathname, title: document.title, eid, ads: !(window as any).hhgAdsOff,
    fields: { firstName: me.firstName, lastName: me.lastName, email: me.email, phone: me.phone ?? '', listing: `${d.favName ?? ''} (MLS #${d.fav})`, propStreet: d.favStreet ?? '', propCity: d.favCity ?? '', propZip: d.favZip ?? '', propMls: d.fav ?? '', propPrice: d.favPrice ?? '' } }) }).catch(() => {});
}

export function initFavorites() {
  const dlg = document.querySelector<HTMLDialogElement>('#fav-dialog');
  if (!dlg) return;
  const form = dlg.querySelector('form')!;
  let pending: HTMLElement | null = null;
  const paint = () => {
    const favs = new Set(read<string[]>(FAVS, []));
    document.querySelectorAll<HTMLElement>('[data-fav]').forEach((b) => {
      const on = favs.has(b.dataset.fav!);
      b.setAttribute('aria-pressed', String(on));
      const icon = on ? '♥' : '♡';
      if (b.textContent !== icon) b.textContent = icon; // (only when it changes: the observer below watches the page)
      b.setAttribute('aria-label', `${on ? 'Saved' : 'Save'}: ${b.dataset.favName ?? 'this home'}`);
    });
  };
  const set = (mls: string, on: boolean) => { const f = new Set(read<string[]>(FAVS, [])); on ? f.add(mls) : f.delete(mls); write(FAVS, [...f]); paint(); };

  document.addEventListener('click', async (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-fav]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const mls = b.dataset.fav!;
    const me = read<Me | null>(ME, null);
    if (b.getAttribute('aria-pressed') === 'true') { set(mls, false); if (me) unsave(me, mls); return; }
    if (me?.email) { set(mls, true); if (await save(me, b)) tellAgent(me, b); return; }
    // First heart: ask who they are (the form is a lead form, sent by src/layouts/Base.astro).
    pending = b;
    const d = b.dataset;
    dlg.querySelector('[data-fav-home]')!.textContent = d.favName ?? '';
    const val = (n: string, v = '') => { (form.elements.namedItem(n) as HTMLInputElement).value = v; };
    val('listing', `${d.favName ?? ''} (MLS #${mls})`); val('propStreet', d.favStreet); val('propCity', d.favCity); val('propZip', d.favZip); val('propMls', mls); val('propPrice', d.favPrice);
    dlg.showModal();
  }, true);
  dlg.querySelector('[data-fav-close]')!.addEventListener('click', () => dlg.close());
  window.addEventListener('lead-sent', async (e: Event) => {
    const { form: name, fields } = (e as CustomEvent).detail ?? {};
    if (name !== 'favorite' || !pending) return;
    const me: Me = { firstName: fields.firstName, lastName: fields.lastName ?? '', email: fields.email, phone: fields.phone };
    write(ME, me);
    set(pending.dataset.fav!, true);
    await save(me, pending);
    pending = null;
    setTimeout(() => dlg.close(), 900);
  });
  // Cards drawn later (the map search) get painted too.
  new MutationObserver(() => paint()).observe(document.body, { childList: true, subtree: true });
  paint();
}
