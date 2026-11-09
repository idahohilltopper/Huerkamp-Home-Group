import { soldHref } from './sold-card';
// The pop-up card for one home on the search map (both the MapLibre map, src/scripts/search-map.ts, and the
// no-WebGL backup map, src/scripts/search-map-flat.ts). NorthstarMLS Rule 12.3(f): like a listing card, it shows the
// photo, price, address and listing brokerage, with the Broker Reciprocity thumbnail logo on other brokerages' listings.
// Tapping it opens the home: its page for homes for sale, its sold page for sold homes (p.slug is the MLS number then).
const cardHref = (p: any) => (p.sold ? soldHref(String(p.slug)) : `/homes/${encodeURIComponent(p.slug)}`);
export function pinCard(p: any, brThumb: string): HTMLElement {
  const a = document.createElement('a');
  a.className = 'hs-pop-card';
  a.href = cardHref(p);
  const ph = document.createElement('span');
  ph.className = 'hs-pop-card__photo';
  if (p.photo) {
    const img = Object.assign(document.createElement('img'), { src: `${p.photo}?class=small`, alt: p.addr, width: 240, height: 160, decoding: 'async' });
    img.onerror = () => { ph.textContent = 'Photo coming soon'; };
    ph.append(img);
  } else ph.textContent = 'Photo coming soon';
  const price = document.createElement('strong');
  price.textContent = p.price > 1 ? `$${Number(p.price).toLocaleString('en-US')}` : 'Auction';
  const addr = document.createElement('span');
  addr.textContent = p.addr;
  const when = document.createElement('span');
  if (p.sold) when.textContent = `Sold ${new Date(`${p.sold}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const by = document.createElement('small');
  if (!p.own && brThumb) by.append(Object.assign(document.createElement('img'), { src: brThumb, alt: 'Broker Reciprocity listing', height: 14 }));
  by.append(`Listing courtesy of ${p.brokerage || 'the listing brokerage'}`);
  a.append(ph, price, ...(p.sold ? [when] : []), addr, by);
  // Homes for sale get a heart on the photo, like the cards (src/scripts/favorites.ts handles the click and fills it in
  // when saved; it runs before the click could open the home). The MLS number is the end of the home's address slug.
  const box = document.createElement('div');
  box.className = 'hs-mappop';
  box.append(a);
  const mls = p.sold ? '' : String(p.slug).split('-').pop() ?? '';
  if (mls) {
    const [street = '', city = ''] = String(p.addr).split(',').map((x: string) => x.trim());
    const heart = Object.assign(document.createElement('button'), { type: 'button', className: 'fav hs-mappop__fav', textContent: '♡' });
    Object.assign(heart.dataset, { fav: mls, favName: p.addr, favStreet: street, favCity: city, favZip: (String(p.addr).match(/\b\d{5}\b/) ?? [''])[0], favPrice: String(p.price) });
    heart.setAttribute('aria-pressed', 'false');
    heart.setAttribute('aria-label', `Save: ${p.addr}`);
    box.append(heart);
  }
  return box;
}

/**
 * The preview that appears when pointing at a home on the map (as on Zillow and Redfin): photo, price, address and
 * the listing brokerage with the Broker Reciprocity logo on other brokerages' homes, the same fields as a listing card
 * (Rule 12.3(f)). Only on devices with a mouse (canHover): on iPhones a tap set off the hover too, and Safari then showed
 * this preview instead of the full card. If it is ever clicked anyway, it opens the home like the full card.
 */
export const canHover = () => typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;
export function hoverCard(p: any, brThumb: string): HTMLElement {
  const box = document.createElement('a');
  box.href = cardHref(p);
  box.className = 'hs-peek';
  const ph = document.createElement('span');
  ph.className = 'hs-peek__photo';
  if (p.photo) {
    const img = Object.assign(document.createElement('img'), { src: `${p.photo}?class=small`, alt: '', width: 220, height: 146, decoding: 'async' });
    img.onerror = () => { img.remove(); ph.textContent = 'Photo coming soon'; };
    ph.append(img);
  } else ph.textContent = 'Photo coming soon';
  const price = document.createElement('strong');
  price.textContent = p.price > 1 ? `$${Number(p.price).toLocaleString('en-US')}` : 'Auction';
  const addr = document.createElement('span');
  addr.className = 'hs-peek__addr';
  addr.textContent = p.addr;
  const by = document.createElement('small');
  if (!p.own && brThumb) by.append(Object.assign(document.createElement('img'), { src: brThumb, alt: 'Broker Reciprocity listing', height: 12 }));
  by.append(`Listing courtesy of ${p.brokerage || 'the listing brokerage'}`);
  if (p.sold) { const when = document.createElement('span'); when.className = 'hs-peek__sold'; when.textContent = `Sold ${new Date(`${p.sold}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`; box.append(ph, price, when, addr, by); }
  else box.append(ph, price, addr, by);
  return box;
}
