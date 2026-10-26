// Monthly housing-market numbers (src/data/market.json, from scripts/update-market.py).
// Source: Minneapolis Area REALTORS® Local Market Update reports, data from NorthstarMLS.
import market from './market.json';

type Triple = [number | null, number | null, number | null]; // [a year earlier, this period, % change]
export interface Metric { month: Triple; r12: Triple }
export interface AreaMarket {
  name: string; url: string;
  newListings?: Metric; closedSales?: Metric; medianPrice?: Metric; averagePrice?: Metric; pricePerSqft?: Metric;
  pctOfList?: Metric; daysOnMarket?: Metric; inventory?: Metric; monthsSupply?: Metric;
}
const months = market.months as unknown as Record<string, { asOf: string; areas: Record<string, AreaMarket> }>;

export const source = market.source;
export const latest: string = market.latest;
export const asOf: string = months[latest].asOf;
export const REGION = 'twin-cities';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** "2026-09" -> "September 2026" (or "Sep 2026" when short). */
export const monthLabel = (m: string, short = false) => {
  const [y, mo] = m.split('-').map(Number);
  return `${short ? MONTHS[mo - 1].slice(0, 3) : MONTHS[mo - 1]} ${y}`;
};
const minus12 = (m: string) => `${Number(m.slice(0, 4)) - 1}${m.slice(4)}`;

/** The newest month's report for an area (community slug, or REGION). */
export const marketFor = (slug: string): AreaMarket | undefined => months[latest].areas[slug];
/** A city gets a report page only if homes sold there in the past 12 months. */
export const hasMarket = (slug: string) => (marketFor(slug)?.closedSales?.r12[1] ?? 0) > 0;
export const marketHref = (slug: string) => (slug === REGION ? '/market' : `/market/${slug}`);

/** One value per month, oldest first: each report's own month, plus the year-earlier month it compares to. */
export function history(slug: string, key: keyof Omit<AreaMarket, 'name' | 'url'>) {
  const byMonth = new Map<string, number>();
  for (const [m, data] of Object.entries(months)) {
    const metric = data.areas[slug]?.[key] as Metric | undefined;
    if (!metric) continue;
    if (metric.month[1] != null) byMonth.set(m, metric.month[1]);
    if (metric.month[0] != null && !byMonth.has(minus12(m))) byMonth.set(minus12(m), metric.month[0]);
  }
  return [...byMonth].sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => ({ month, value }));
}

// Display helpers
export const money = (n: number | null | undefined) => (n == null ? '—' : `$${Math.round(n).toLocaleString('en-US')}`);
export const moneyK = (n: number | null | undefined) => (n == null ? '—' : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${Math.round(n / 1000)}K`);
export const count = (n: number | null | undefined) => (n == null ? '—' : Math.round(n).toLocaleString('en-US'));
export const change = (n: number | null | undefined) => (n == null ? '—' : n === 0 ? 'no change' : `${n > 0 ? 'up' : 'down'} ${Math.abs(n).toFixed(1)}%`);
export const signed = (n: number | null | undefined) => (n == null ? '—' : `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(1)}%`);
/** Fewer than this many sales in a month and the month's numbers can swing wildly. */
export const SMALL_SAMPLE = 10;

// ---------- past months (the archive at /market/<area>/<yyyy-mm>) ----------
/** Every month we have a report for, oldest first. */
export const monthKeys = Object.keys(months).sort();
/** Months before the newest; the newest month is the area's main report page. */
export const pastMonths = monthKeys.filter((m) => m !== latest);
export const areaIn = (month: string, key: string): AreaMarket | undefined => months[month]?.areas[key];
export const asOfFor = (month: string) => months[month]?.asOf;
/** Archive address of one area's report for one month (the newest month is the main report). */
export const archiveHref = (key: string, month: string, mainHref: string) => (month === latest ? mainHref : `/market/${key}/${month}`);
