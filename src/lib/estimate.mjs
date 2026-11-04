// Instant home value estimate (/home-estimate): a price range for the visitor's home from recent nearby sales.
// It is an ESTIMATE, never an appraisal, CMA or home valuation, and every display carries SOLD_DISCLAIMER (NorthstarMLS
// sold-content rules, src/lib/sold.mjs, which also decides which sales may be used and shown).
//   1. Sales in the same ZIP code in the last 6 months (12 if fewer than MIN_COMPS), from netlify/functions/estimate.mjs.
//   2. Keep the most similar: same kind of home (house / townhome / condo), bedrooms within one.
//   3. With the home's finished square feet and enough sales that list theirs: middle price per square foot x the
//      home's size, range from the 25th to the 75th percentile. Otherwise: the middle sale price and its 25th-75th range.
// Pure functions, tested without the network.
import { soldCard } from './sold.mjs';
import { homeType } from './mls-feed.mjs';

export const MIN_COMPS = 4;
const TYPES = ['single-family', 'townhome', 'condo'];

/** The visitor's answers, cleaned; { error } in plain words if something's missing. */
export function estimateInput(b) {
  const zip = String(b?.zip ?? '').trim();
  if (!/^\d{5}$/.test(zip)) return { error: 'Please enter the home’s 5-digit ZIP code.' };
  const type = TYPES.includes(b?.type) ? b.type : 'single-family';
  const n = (v, lo, hi) => { const x = parseFloat(String(v ?? '').replace(/[^0-9.]/g, '')); return Number.isFinite(x) && x >= lo && x <= hi ? x : null; };
  return { zip, type, beds: n(b?.beds, 0, 12), baths: n(b?.baths, 0, 12), sqft: n(b?.sqft, 300, 20000) };
}

/** Finished square feet from the MLS: a number, or the middle of a range like "1500-1999". */
export function sqftOf(l) {
  const raw = String(l?.details?.sqft ?? '').replace(/,/g, '');
  const nums = raw.match(/\d+(\.\d+)?/g)?.map(Number).filter((x) => x >= 300 && x <= 20000) ?? [];
  if (!nums.length) return null;
  return nums.length >= 2 ? Math.round((nums[0] + nums[1]) / 2) : nums[0];
}

const quantile = (sorted, q) => {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
};
const round = (x) => Math.round(x / 1000) * 1000;

/** The estimate from raw Repliers sold listings: { low, mid, high, n, method, comps } or { error }. */
export function estimate(input, rawListings, now = new Date()) {
  const sales = [];
  for (const l of rawListings ?? []) {
    const card = soldCard(l, now); // applies the sold rules (Sold/Comp Sold only, recent enough, seller permissions)
    if (!card?.soldPrice) continue;
    if (homeType(l) !== input.type) continue;
    if (input.beds != null && card.beds != null && Math.abs(card.beds - input.beds) > 1) continue;
    sales.push({ card, price: card.soldPrice, sqft: sqftOf(l) });
  }
  if (sales.length < MIN_COMPS) return { error: 'not-enough-sales', n: sales.length };
  let low, mid, high, method;
  const withSize = sales.filter((s) => s.sqft);
  if (input.sqft && withSize.length >= MIN_COMPS) {
    const ppsf = withSize.map((s) => s.price / s.sqft).sort((a, b) => a - b);
    [low, mid, high] = [0.25, 0.5, 0.75].map((q) => quantile(ppsf, q) * input.sqft);
    method = 'price per square foot';
  } else {
    const prices = sales.map((s) => s.price).sort((a, b) => a - b);
    [low, mid, high] = [0.25, 0.5, 0.75].map((q) => quantile(prices, q));
    method = 'sale prices';
  }
  // Never a falsely precise range: at least 5% either side of the middle.
  low = Math.min(low, mid * 0.95); high = Math.max(high, mid * 1.05);
  // The most similar sales to show: closest in size (when known), newest first otherwise.
  const shown = [...sales].sort((a, b) => (input.sqft && a.sqft && b.sqft ? Math.abs(a.sqft - input.sqft) - Math.abs(b.sqft - input.sqft) : 0)
    || String(b.card.soldDate).localeCompare(String(a.card.soldDate))).slice(0, 6).map((s) => s.card);
  return { low: round(low), mid: round(mid), high: round(high), n: sales.length, method, comps: shown };
}
