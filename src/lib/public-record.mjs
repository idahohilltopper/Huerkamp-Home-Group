// County property records (Repliers "Public Record & Parcel Data" add-on, $199/month, turned on Nov 24, 2026).
// Repliers (Adrian, Nov 23, 2026): public-record data may be shown with a clear label that it doesn't come from the
// MLS; "Source: Public Record Data" is enough. It is kept apart from NorthstarMLS content: its own box, its own label.
// Coverage test (Nov 24): about two thirds of Burnsville and Lakeville parcels have a last sale price and date; the data
// runs about 5 months behind (refreshed quarterly). Records include owner names: never pass them on or show them.

const ABBR = {
  AVENUE: 'AVE', AV: 'AVE', STREET: 'ST', DRIVE: 'DR', ROAD: 'RD', LANE: 'LN', COURT: 'CT', CIRCLE: 'CIR', TRAIL: 'TRL',
  BOULEVARD: 'BLVD', PARKWAY: 'PKWY', PLACE: 'PL', TERRACE: 'TER', HIGHWAY: 'HWY', POINT: 'PT', CROSSING: 'XING',
  NORTH: 'N', SOUTH: 'S', EAST: 'E', WEST: 'W', NORTHEAST: 'NE', NORTHWEST: 'NW', SOUTHEAST: 'SE', SOUTHWEST: 'SW',
};

/** A street address in the county's style, for matching: "14300 Nicollet Court" -> "14300 NICOLLET CT". Units dropped. */
export function normStreet(s) {
  return String(s ?? '').toUpperCase().split(',')[0].replace(/\s*(#|\bAPT\b|\bUNIT\b|\bSTE\b|\bSUITE\b).*$/, '')
    .replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).map((w) => ABBR[w] ?? w).join(' ');
}

const money = (v) => { const n = Number(String(v ?? '').replace(/[^0-9.]/g, '')); return n >= 1000 ? Math.round(n) : null; };
const ymd = (v) => { const s = String(v ?? ''); return /^(19|20)\d{6}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : null; };

/** The last recorded sale and the one before it: { last: {price, date} | null, prior: {...} | null }. Prices only. */
export function sales(pr = {}) {
  const pick = (p, d) => { const price = money(p), date = ymd(d); return price && date ? { price, date } : null; };
  const last = pick(pr.purchasePrice, pr.purchaseSaleDate) ?? pick(pr.salePriceLastTransfer, pr.transferSaleDate);
  const prior = pick(pr.pastPriceSale, pr.priorSalesDate) ?? pick(pr.pastPriceTransfer, pr.pastSaleDateTransfer);
  return { last, prior: prior && (!last || prior.date < last.date) ? prior : null };
}

const UNIT = /\s*(?:#|\b(?:APT|APARTMENT|UNIT|STE|SUITE|NO)\b\.?)\s*#?\s*([A-Z0-9-]+)\s*$/i;

/** "204", "#0204", "Unit 204" -> "204"; blank -> "". */
export function normUnit(u) {
  return String(u ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^0+(?=.)/, '');
}

/** A typed address split into street and unit: "1500 Main St #204, Burnsville" -> { street: "1500 Main St", unit: "204" }. */
export function splitUnit(address) {
  const [first, ...rest] = String(address ?? '').split(',');
  const m = first.match(UNIT);
  return { street: (m ? first.slice(0, m.index) : first).trim() + (rest.length ? `,${rest.join(',')}` : ''), unit: m ? normUnit(m[1]) : '' };
}

/** A county record's unit, from its own field or the end of its street address. */
const parcelUnit = (x) => normUnit(x?.address?.unitNumber) || splitUnit(x?.address?.streetAddress).unit;

/** The parcel whose street address (and unit, for condos and townhomes) matches, from a /locations answer; null if
 * none matches, or if more than one does and the unit can't tell them apart. */
export function pickParcel(locations, street, unit = '') {
  const want = normStreet(street);
  if (!/^\d+[A-Z]? \S/.test(want)) return null;
  const hits = (locations ?? []).filter((x) => normStreet(x?.address?.streetAddress) === want);
  const u = normUnit(unit);
  if (u && hits.some(parcelUnit)) {
    const same = hits.filter((x) => parcelUnit(x) === u);
    return same.length === 1 ? same[0] : null;
  }
  return hits.length === 1 ? hits[0] : null;
}

/** What the page may show for one home: the sales only (never owner names, tax IDs or the legal description). */
export function publicView(loc) {
  const { last, prior } = sales(loc?.publicRecord);
  return last ? { ok: true, last, prior, source: 'Public Record Data' } : { ok: false, error: 'no-sale' };
}
