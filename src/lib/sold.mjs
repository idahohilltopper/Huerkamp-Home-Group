// Sold homes (NorthstarMLS "Delivery and Display of Sold Content", Aug 21, 2026), asked of Repliers when someone looks
// and cached for a day by /api/sold (netlify/functions/sold.mjs). Kept apart from the function so the rules can be
// tested without calling Repliers. The rules, all enforced here:
//   - only homes reported Sold (or Comp Sold), never expired, cancelled or temporarily-not-available listings;
//   - nothing sold more than 3 years ago (MAX_MONTHS);
//   - never a home whose seller chose "Advertising: No"; no address (and no map point, which would give it away)
//     for one that chose "Display Address: No";
//   - only the fields NorthstarMLS lists for sold listings (Attachment A). Notably NOT square feet, list price,
//     days on market or the description. List office name is required on every display;
//   - on search-result cards ("thumbnails", Rule 12.3(f)), another brokerage's sold home shows only its photo, sale
//     price, sold date, address, MLS number and listing office, as for homes for sale (thumbnail());
//   - every display carries the Broker Reciprocity logo, the accuracy disclaimer (IdxDisclosure) and SOLD_DISCLAIMER.
import { sellerChoices, homeType } from './mls-feed.mjs';
import { CDN } from './repliers.mjs';
import cities from '../data/ylopo-cities.json' with { type: 'json' };
import team from '../data/team.json' with { type: 'json' };

export const MAX_MONTHS = 36;
export const DEFAULT_MONTHS = 6;
export const PAGE = 24;
export const MAX_PINS = 300;
export const SOLD_DISCLAIMER = 'This home sale information is not an appraisal, competitive or comparative market analysis, CMA or home valuation.';
export const FIELDS = 'mlsNumber,soldPrice,soldDate,status,lastStatus,class,type,address,map,details,lot,images,office,agents,permissions';

const text = (v) => (v == null ? '' : String(v).trim());
const num = (v) => { const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, '')); return Number.isFinite(n) && n > 0 ? n : null; };
const coord = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
const int = (v, lo, hi) => { const n = parseInt(String(v ?? ''), 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : null; };
// Same test as isOwnBrokerage in src/data/mls.ts (kept in step by hand; this file must stay plain JavaScript).
const ownBrokerage = (b) => /keller williams preferred/i.test(b ?? '');
// Team members by page slug (/team/<slug>), for an agent's own recent sales (?agent=<slug>).
const AGENT = Object.fromEntries(team.members.map((m) => [m.profileUrl.split('/').pop(), m.name]));
const CITY = Object.fromEntries(Object.entries(cities.communities).filter(([, w]) => w.city).map(([slug, w]) => [slug, w.city]));

/** A sold listing as the site may show it, or null when it may not be shown at all. */
export function soldCard(l, now = new Date()) {
  const status = `${text(l.lastStatus)} ${text(l.status)}`;
  if (!/sld|sold/i.test(status)) return null;
  const choices = sellerChoices(l);
  if (choices.hide) return null;
  const soldDate = text(l.soldDate).slice(0, 10);
  const cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - MAX_MONTHS);
  if (!soldDate || new Date(soldDate) < cutoff) return null;
  const office = text(l.office?.brokerageName);
  if (!office) return null; // List Office Name is required on every sold display
  const a = l.address ?? {}, d = l.details ?? {}, lot = l.lot ?? {};
  const street = [a.streetNumber, a.streetDirectionPrefix, a.streetName, a.streetSuffix, a.streetDirection].map(text).filter(Boolean).join(' ')
    + (text(a.unitNumber) ? ` #${text(a.unitNumber)}` : '');
  return {
    mls: text(l.mlsNumber),
    status: 'Sold',
    soldPrice: num(l.soldPrice), soldDate,
    street: choices.hideAddress ? '' : street, city: text(a.city), state: 'MN', zip: text(a.zip).slice(0, 5),
    addressHidden: choices.hideAddress ? 1 : 0,
    county: text(a.area ?? a.county) || null, schoolDistrict: text(a.district) || null,
    type: homeType(l), style: text(d.style) || null, yearBuilt: num(d.yearBuilt),
    beds: num(d.numBedrooms), baths: num(d.numBathrooms), garage: num(d.numGarageSpaces),
    acres: num(lot.acres), lotSize: text(lot.size) || null,
    photo: l.images?.[0] ? `${CDN}/${l.images[0]}` : null,
    office, agent: text(l.agents?.[0]?.name) || null, ownBrokerage: ownBrokerage(office) ? 1 : 0,
    lat: choices.hideAddress ? null : coord(l.map?.latitude), lng: choices.hideAddress ? null : coord(l.map?.longitude),
  };
}

/** A sold card for a results list: other brokerages' homes keep only the thumbnail fields (Rule 12.3(f)). */
export const thumbnail = (c) => (c.ownBrokerage ? c : { ...c, beds: null, baths: null, garage: null, acres: null, lotSize: null,
  style: null, yearBuilt: null, type: null, county: null, schoolDistrict: null, agent: null });

/** The visitor's filters, checked and limited. place: a community slug or "zip:55337"; bbox: "w,s,e,n". */
export function soldQuery(sp, now = new Date()) {
  const q = { months: int(sp.get('months'), 1, MAX_MONTHS) ?? DEFAULT_MONTHS, page: int(sp.get('page'), 1, 50) ?? 1 };
  const place = text(sp.get('place')).toLowerCase();
  if (/^zip:\d{5}$/.test(place)) q.zip = place.slice(4);
  else if (CITY[place]) q.city = CITY[place];
  else if (place) q.unsupported = place;
  const agent = text(sp.get('agent')).toLowerCase();
  if (AGENT[agent]) q.agentName = AGENT[agent];
  else if (agent) q.unsupported = agent;
  // One home by MLS number (the sold alert email's "View sold price" link, src/pages/listings/property.astro).
  const mls = text(sp.get('mls'));
  if (/^[A-Za-z0-9-]{1,20}$/.test(mls)) q.mls = mls;
  for (const k of ['min', 'max']) { const v = int(sp.get(k), 0, 100_000_000); if (v) q[k] = v; }
  for (const k of ['beds', 'baths']) { const v = int(sp.get(k), 1, 10); if (v) q[k] = v; }
  const b = text(sp.get('bbox')).split(',').map(Number);
  if (b.length === 4 && b.every(Number.isFinite) && b[0] < b[2] && b[1] < b[3] && b[2] - b[0] < 3 && b[3] - b[1] < 3) q.bbox = b;
  const from = new Date(now); from.setMonth(from.getMonth() - q.months);
  q.since = from.toISOString().slice(0, 10);
  return q;
}

/** Repliers parameters (and map shape) for a sold query. */
export function repliersParams(q, { pageSize = PAGE, page = q.page, fields = FIELDS } = {}) {
  const p = { status: 'U', lastStatus: 'Sld', type: 'Sale', minSoldDate: q.since, sortBy: 'soldDateDesc', resultsPerPage: pageSize, pageNum: page, fields };
  if (q.mls) p.mlsNumber = q.mls;
  if (q.city) p.city = q.city;
  if (q.zip) p.zip = q.zip;
  if (q.agentName) p.agent = q.agentName;
  if (q.min) p.minSoldPrice = q.min;
  if (q.max) p.maxSoldPrice = q.max;
  if (q.beds) p.minBedrooms = q.beds;
  if (q.baths) p.minBaths = q.baths;
  const [w, s, e, n] = q.bbox ?? [];
  const body = q.bbox ? { map: [[[w, n], [e, n], [e, s], [w, s], [w, n]]] } : undefined;
  return { params: p, body };
}
