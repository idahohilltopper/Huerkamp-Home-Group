// Signed, stateless tokens for "sign in with an email link" (netlify/functions/account.mjs). Nothing is stored on the
// server: a token carries who it's for and when it expires, signed with HMAC-SHA256 so it can't be forged or edited.
//   link    the one-time link in the sign-in email (30 minutes)
//   session what the browser keeps after clicking it (90 days); sent back as the "token" the alerts API already takes
// The secret is ACCOUNT_SECRET in Netlify, or (until that's set) one derived from the Repliers key, which never leaves
// the server either. Changing the secret signs everyone out.
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

export const LINK_MINUTES = 30;
export const SESSION_DAYS = 90;
const PREFIX = 's1.';
const b64 = (buf) => Buffer.from(buf).toString('base64url');

export function secretFrom(env) {
  const own = env('ACCOUNT_SECRET');
  if (own) return own;
  const key = env('REPLIERS_API_KEY');
  return key ? createHash('sha256').update(`hhg-account|${key}`).digest('hex') : '';
}

export function sign(kind, data, secret, now = Date.now()) {
  const life = kind === 'link' ? LINK_MINUTES * 60_000 : SESSION_DAYS * 86_400_000;
  const body = b64(JSON.stringify({ k: kind, ...data, exp: now + life }));
  return `${PREFIX}${body}.${b64(createHmac('sha256', secret).update(body).digest())}`;
}

/** The token's data if it's genuine, of this kind and not expired; otherwise null. */
export function verify(kind, token, secret, now = Date.now()) {
  if (!secret || typeof token !== 'string' || !token.startsWith(PREFIX) || token.length > 2000) return null;
  const [body, sig] = token.slice(PREFIX.length).split('.');
  if (!body || !sig) return null;
  const want = createHmac('sha256', secret).update(body).digest();
  const got = Buffer.from(sig, 'base64url');
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  let data; try { data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch { return null; }
  return data?.k === kind && Number(data.exp) > now ? data : null;
}

export const isSessionToken = (t) => typeof t === 'string' && t.startsWith(PREFIX);
