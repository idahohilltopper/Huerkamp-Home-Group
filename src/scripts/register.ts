// Sign-up wall bookkeeping (src/components/RegisterWall.astro). Everything lives in this browser's localStorage:
//   hhg-views       the MLS numbers of the homes opened so far (each counted once)
//   hhg-registered  set once the visitor is known: any lead form sent on this site, a saved home (hhg-fav-me), or a
//                   click from one of our alert emails (src/scripts/alert-links.ts calls markRegistered)
// In a private window or with storage blocked, nothing is remembered and the wall never shows.
const VIEWS = 'hhg-views', REGISTERED = 'hhg-registered', FAV_ME = 'hhg-fav-me';
const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k: string, v: string) => { try { localStorage.setItem(k, v); return true; } catch { return false; } };

export const markRegistered = () => { put(REGISTERED, '1'); };
export const isRegistered = () => get(REGISTERED) === '1' || !!get(FAV_ME);

/** Any lead form sent with an email address counts as signing up (Base.astro sends 'lead-sent'). */
export function listenForLeads() {
  window.addEventListener('lead-sent', (e: Event) => {
    const { form, fields } = (e as CustomEvent).detail ?? {};
    if (!fields?.email) return;
    markRegistered();
    // Hearts won't ask again either (src/scripts/favorites.ts).
    if (form === 'register' && !get(FAV_ME)) put(FAV_ME, JSON.stringify({ firstName: fields.firstName, lastName: fields.lastName ?? '', email: fields.email, phone: fields.phone ?? '' }));
  });
}

/** Count this home and return how many different homes this browser has opened (0 if storage is unavailable). */
export function countView(mls: string): number {
  let seen: string[] = [];
  try { seen = JSON.parse(get(VIEWS) ?? '[]'); } catch { /* start over */ }
  if (!Array.isArray(seen)) seen = [];
  if (!seen.includes(mls)) seen.push(mls);
  return put(VIEWS, JSON.stringify(seen.slice(-200))) ? seen.length : 0;
}

export function initRegisterWall() {
  const dlg = document.querySelector<HTMLDialogElement>('#register-wall');
  if (!dlg || isRegistered()) return;
  const free = Number(dlg.dataset.free) || 7;
  const check = () => {
    if (isRegistered() || countView(dlg.dataset.mls ?? location.pathname) <= free) return;
    dlg.showModal();
  };
  // Forced: no close button, and Esc doesn't close it. Sending the form does.
  dlg.addEventListener('cancel', (e) => e.preventDefault());
  window.addEventListener('lead-sent', (e: Event) => {
    if ((e as CustomEvent).detail?.form === 'register') setTimeout(() => dlg.close(), 900);
  });
  // The license agreement (I AGREE) comes first; count the home once it's showing.
  if (document.documentElement.classList.contains('idx-ok')) check();
  else window.addEventListener('idx-agreed', check, { once: true });
}
