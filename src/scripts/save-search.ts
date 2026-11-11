// "Save this search" on the map search (/home-search), Nov 11, 2026 (Jason: turn more traffic into sign-ups).
//  - The Save search button opens the alert form in a popup over the map instead of jumping to the bottom of the page.
//    The form itself (the #alerts section's form, kept up to date with the current search by home-search.ts) is moved
//    into the popup and back, so it keeps its listeners and its saved-search details.
//  - A small, closable nudge appears once per visit after 40 seconds of searching or the second search change, for
//    visitors who haven't signed up yet. It never blocks the page.
import { isRegistered } from './register';

const NUDGED = 'hhg-ss-nudged';
const seen = () => { try { return sessionStorage.getItem(NUDGED) === '1'; } catch { return true; } };
const mark = () => { try { sessionStorage.setItem(NUDGED, '1'); } catch { /* private window */ } };

export function initSaveSearch() {
  const home = document.querySelector<HTMLElement>('#alerts .hs-alert');
  if (!home) return;
  const dlg = document.createElement('dialog');
  dlg.className = 'ss-dlg section--dark'; // same dark styles as the #alerts section the form comes from
  dlg.setAttribute('aria-label', 'Save this search');
  dlg.innerHTML = '<button type="button" class="ss-dlg__x" aria-label="Close">×</button>';
  document.body.append(dlg);
  const parts = () => [...home.children] as HTMLElement[];
  let moved: HTMLElement[] = [];
  // The nudge box exists only for visitors who haven't signed up (made below); hiding it is safe either way.
  let box: HTMLElement | null = null;
  const hideNudge = () => { if (box) box.hidden = true; };
  const open = () => {
    if (dlg.open) return;
    moved = parts();
    dlg.append(...moved);
    dlg.showModal();
    dlg.querySelector<HTMLInputElement>('input[name="firstName"]')?.focus();
    hideNudge();
    mark();
  };
  // Put the form back on the page right away (the dialog's own 'close' event comes a moment later, e.g. after Esc).
  const restore = () => { if (moved.length) { home.append(...moved); moved = []; } };
  const close = () => { restore(); dlg.close(); };
  dlg.addEventListener('close', restore);
  dlg.querySelector('.ss-dlg__x')!.addEventListener('click', close);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  document.querySelectorAll<HTMLAnchorElement>('a.hs-save, [data-save-search]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); open(); }));

  // The nudge.
  if (isRegistered() || seen()) return;
  box = document.createElement('div');
  box.className = 'ss-nudge';
  box.setAttribute('role', 'status');
  box.innerHTML = '<p><strong>Get new homes like these by email.</strong> We’ll watch this search for you, free.</p>'
    + '<button type="button" class="btn ss-nudge__go">Save this search</button><button type="button" class="ss-nudge__x" aria-label="No thanks">×</button>';
  box.hidden = true;
  document.body.append(box);
  const show = () => { if (!box || isRegistered() || seen() || dlg.open) return; box.hidden = false; mark(); };
  box.querySelector('.ss-nudge__go')!.addEventListener('click', open);
  box.querySelector('.ss-nudge__x')!.addEventListener('click', hideNudge);
  const timer = setTimeout(show, 40_000);
  let changes = 0;
  window.addEventListener('home-searched', () => { if (++changes === 3) { clearTimeout(timer); setTimeout(show, 1500); } }); // the first event is the page's own load
  window.addEventListener('lead-sent', () => { clearTimeout(timer); hideNudge(); });
}
