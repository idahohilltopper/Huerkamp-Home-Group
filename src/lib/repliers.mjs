// MLS listings from Repliers (NorthstarMLS), trimmed to what the site shows.
// Used by netlify/functions/listings.mjs; kept separate so it can be tested without calling Repliers.

export const API = 'https://api.repliers.io';
export const CDN = 'https://cdn.repliers.io';

const yes = (v) => v === true || /^(y|yes|true|lake|lakefront)/i.test(String(v ?? '').trim());
const text = (v) => (Array.isArray(v) ? v.join(', ') : String(v ?? '')).trim();

/** Every value in a listing whose key mentions water, lake or shore (the MLS fields vary by board). */
export function waterFields(obj, path = '', out = {}) {
  if (!obj || typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) waterFields(v, p, out);
    else if (/water|lake|shore|frontage/i.test(k) && v != null && v !== '') out[p] = v;
  }
  return out;
}

/** True when the MLS marks the home as on a lake (waterfront yes, or a lake in its water features). */
export function isLakefront(l) {
  const w = waterFields(l);
  const no = (v) => !text(v) || /^(n|no|none|0)$/i.test(text(v));
  return Object.entries(w).some(([k, v]) =>
    (/waterfront(yn)?$/i.test(k) && yes(v)) ||                         // "waterfront": "Yes"
    (/lake/i.test(k) && !/view/i.test(k) && !no(v)) ||                 // "lakeName": "Lake Minnetonka"
    (/front/i.test(k) && /lake/i.test(text(v))));                      // "waterfrontFeatures": "Lake Front"

}

const street = (a = {}) =>
  [a.streetNumber, a.streetDirectionPrefix, a.streetName, a.streetSuffix, a.streetDirection].filter(Boolean).join(' ') +
  (a.unitNumber ? ` #${a.unitNumber}` : '');

const num = (v) => (v == null || v === '' || isNaN(Number(v)) ? null : Number(v));
const photo = (p, size = 'medium') => (p ? `${CDN}/${p}?class=${size}` : null);

/** A listing card. */
export function card(l) {
  const a = l.address ?? {}, d = l.details ?? {};
  return {
    mls: l.mlsNumber,
    street: street(a),
    city: a.city ?? '', state: a.state ?? 'MN', zip: a.zip ?? '',
    price: num(l.listPrice),
    beds: num(d.numBedrooms), baths: num(d.numBathrooms), sqft: num(d.sqft),
    type: d.propertyType ?? '',
    photo: photo(l.images?.[0]),
    listed: l.listDate ?? null,
    status: l.lastStatus || l.status || '',
    brokerage: l.office?.brokerageName ?? '',
    lat: num(l.map?.latitude), lng: num(l.map?.longitude),
  };
}

/** A full listing page. */
export function detail(l) {
  const d = l.details ?? {}, lot = l.lot ?? {};
  const facts = [
    ['Property type', d.propertyType], ['Style', d.style], ['Year built', d.yearBuilt],
    ['Lot size', lot.acres ? `${lot.acres} acres` : lot.size], ['Garage', d.numGarageSpaces ?? d.garage],
    ['Basement', text(d.basement1 ? [d.basement1, d.basement2].filter(Boolean) : '')], ['Heating', d.heating],
    ['Cooling', d.airConditioning], ['HOA fee', l.condominium?.fees?.maintenance], ['Taxes', l.taxes?.annualAmount],
    ['Waterfront', text(d.waterfront)], ['School district', l.address?.district],
  ].filter(([, v]) => v != null && text(v) !== '' && text(v) !== '0').map(([k, v]) => [k, text(v)]);
  return {
    ...card(l),
    description: d.description ?? '',
    photos: (l.images ?? []).map((p) => photo(p, 'large')),
    facts,
    agent: l.agents?.[0]?.name ?? '',
    updated: l.updatedOn ?? l.timestamps?.listingUpdated ?? null,
  };
}

/** Call Repliers. `body` (a map polygon) makes it a POST, as Repliers recommends for shapes. */
export async function repliers(key, path, params = {}, body) {
  const url = new URL(path, API);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { 'REPLIERS-API-KEY': key, accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.ok ? await res.json() : null;
  return { status: res.status, data, error: res.ok ? null : (await res.text()).slice(0, 300) };
}
