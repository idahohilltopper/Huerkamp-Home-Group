// Meta (Facebook/Instagram) Conversions API: the server sends the same lead events as the browser's Meta Pixel, so
// leads still count for ad retargeting and optimization when an ad blocker or the phone's privacy settings stop the
// pixel. Facebook drops the copy it already got from the browser by the shared event_id.
// Only when META_CAPI_TOKEN is set in Netlify (Events Manager > the pixel > Settings > Conversions API > Generate access
// token); never when the visitor turned ads/analytics off on /cookies or their browser sends Global Privacy Control.
import { createHash } from 'node:crypto';

export const META_PIXEL = '2726990550925323'; // same as site.metaPixel in src/data/site.ts
const GRAPH = 'https://graph.facebook.com/v21.0';

// Which Meta standard event each website form is. Forms not listed are a Lead; activity and hot signals send nothing.
const EVENT = { register: 'CompleteRegistration', favorite: 'AddToWishlist', 'community-alert': 'Lead', showing: 'Schedule' };
export const metaEventName = (form, cfg) => (cfg?.hot ? null : EVENT[form] ?? 'Lead');

const sha = (v) => (v ? createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex') : undefined);
const phone = (p) => { const d = String(p ?? '').replace(/\D/g, ''); return d.length === 10 ? `1${d}` : d.length === 11 && d[0] === '1' ? d : ''; };
const cookie = (header, name) => (String(header ?? '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`)) ?? [])[1];

/** The Conversions API body for one website lead, or null when nothing should be sent. Pure, for tests. */
export function capiEvent(input, cfg, { ip, userAgent, cookies, at = Date.now() } = {}) {
  const name = metaEventName(input?.form, cfg);
  const f = input?.fields ?? {};
  if (!name || input?.ads === false || !f.email) return null;
  const user_data = Object.fromEntries(Object.entries({
    em: [sha(f.email)], ph: phone(f.phone) ? [sha(phone(f.phone))] : undefined,
    fn: f.firstName ? [sha(f.firstName)] : undefined, ln: f.lastName ? [sha(f.lastName)] : undefined,
    st: [sha('mn')], country: [sha('us')],
    client_ip_address: ip || undefined, client_user_agent: userAgent || undefined,
    fbp: cookie(cookies, '_fbp'), fbc: cookie(cookies, '_fbc'),
  }).filter(([, v]) => v !== undefined));
  const mls = f.propMls ? String(f.propMls) : '';
  return {
    data: [{
      event_name: name,
      event_time: Math.floor(at / 1000),
      ...(input.eid && { event_id: String(input.eid).slice(0, 64) }),
      action_source: 'website',
      event_source_url: `https://www.huerkamphomes.com${String(input.page ?? '/').slice(0, 300)}`,
      user_data,
      custom_data: { content_name: String(input.form), ...(mls && { content_ids: [mls], content_type: 'home_listing' }) },
    }],
  };
}

/** Sends it; never throws (a Meta hiccup must not affect the lead). */
export async function sendCapi(body, fetcher = fetch) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token || !body) return { sent: false };
  try {
    const r = await fetcher(`${GRAPH}/${META_PIXEL}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) console.error('Meta Conversions API', r.status, (await r.text()).slice(0, 300));
    return { sent: r.ok };
  } catch (e) { console.error('Meta Conversions API', e?.message); return { sent: false }; }
}
