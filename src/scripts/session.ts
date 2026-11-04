// Signed-in visitor (email-link sign-in, src/pages/account.astro). The session token lives in this browser's
// localStorage for 90 days; the server checks its signature on every use (src/lib/session.mjs). Signing in also fills
// in hhg-fav-me, so hearts save in one click and lead forms come pre-filled.
const SESSION = 'hhg-session', ME = 'hhg-fav-me', REGISTERED = 'hhg-registered';
export type Me = { firstName: string; lastName?: string; email: string; phone?: string };
const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };

export const session = (): string => get(SESSION) ?? '';
export const signedIn = () => !!session();
export function me(): Me | null { try { return JSON.parse(get(ME) ?? 'null'); } catch { return null; } }

export function signIn(token: string, who: Me) {
  try {
    localStorage.setItem(SESSION, token);
    localStorage.setItem(ME, JSON.stringify(who));
    localStorage.setItem(REGISTERED, '1');
  } catch { /* private window: signed in for this page only */ }
}
export function signOut() {
  try { [SESSION, ME, 'hhg-favs'].forEach((k) => localStorage.removeItem(k)); sessionStorage.removeItem('hhg-alert-token'); } catch { /* nothing stored */ }
}
