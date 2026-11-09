// One sold home as a card (community pages' "Recently sold" and the home search's Sold view). The fields are already
// limited by /api/sold (src/lib/sold.mjs): other brokerages' homes arrive with only photo, sale price, sold date,
// address, MLS number and listing office, plus the Broker Reciprocity thumbnail logo here. Sold homes have no page of
// their own, so the card is not a link.
export type Sold = { mls: string; soldPrice: number | null; soldDate: string; street: string; city: string; zip: string; addressHidden: 0 | 1;
  beds: number | null; baths: number | null; type: string | null; yearBuilt: number | null; photo: string | null; office: string; ownBrokerage: 0 | 1; state?: string };

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export const soldOn = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** A sold home's own page (src/pages/listings/property.astro), with what the NorthstarMLS sold rules allow. */
export const soldHref = (mls: string) => `/listings/property?mlsNumber=${encodeURIComponent(mls)}`;

export function soldCardHtml(l: Sold, brThumb?: string) {
  const st = l.state ?? 'MN';
  const addr = l.addressHidden || !l.street ? `${l.city}, ${st} ${l.zip}` : `${l.street}, ${l.city}, ${st} ${l.zip}`;
  const specs = [l.beds && `${l.beds} bd`, l.baths && `${l.baths} ba`, l.yearBuilt && `built ${l.yearBuilt}`].filter(Boolean).join(' · ');
  const img = l.photo ? `<img src="${esc(l.photo)}?class=small" alt="${esc(addr)}" width="400" height="267" loading="lazy" decoding="async" />` : '<span class="lcard__nophoto">No photo</span>';
  const icon = !l.ownBrokerage && brThumb ? `<img src="${esc(brThumb)}" alt="Broker Reciprocity listing" height="18" />` : '';
  return `<li class="lcard lcard--sold"><a class="lcard__box" href="${esc(soldHref(l.mls))}"><span class="lcard__photo">${img}<span class="lcard__flag lcard__flag--sold">Sold ${esc(soldOn(l.soldDate))}</span></span>`
    + `<strong class="lcard__price">${l.soldPrice ? `$${Math.round(l.soldPrice).toLocaleString('en-US')}` : 'Sold'}</strong>`
    + (specs ? `<span class="lcard__specs">${esc(specs)}</span>` : '')
    + `<span class="lcard__addr">${esc(addr)}</span><span class="lcard__mls">MLS #${esc(l.mls)}</span>`
    + `<span class="lcard__broker">${icon}Listing courtesy of ${esc(l.office)}</span></a></li>`;
}

/** Headers for /api/sold: the listing license, plus the sign-in session if there is one (signed-in visitors also see
 *  the older sales the MLS feed keeps for registered visitors; src/lib/sold.mjs soldChoices). */
export function soldHeaders(): Record<string, string> {
  let token = '';
  try { token = localStorage.getItem('hhg-session') ?? ''; } catch { /* storage blocked */ }
  return { 'x-idx-eula': 'agreed', ...(token ? { 'x-account': token } : {}) };
}

/** A short "sign in to see every sale" line, when sales were held back only because the visitor isn't signed in. */
export const signInNote = (n: number) => (n > 0
  ? `<p class="sold-signin">Some sales are shown only to signed-in visitors. <a href="/account">Sign in free with your email</a> to see every sale.</p>`
  : '');
