// Tables behind /data and its CSV downloads. Each one carries its source so a download is self-explaining.
import market from '../data/market.json';
import rates from '../data/rates.json';
import hpi from '../data/hpi.json';
import tax from '../data/property-tax.json';
import communities from '../data/communities.json';
import { history, latest, asOf, REGION, source as marketSource } from '../data/market';

type Row = (string | number | null)[];
export interface Dataset { slug: string; title: string; description: string; source: string; sourceUrl: string; header: string[]; rows: Row[] }

const areas = (market.months as any)[latest].areas as Record<string, any>;
const cur = (a: any, k: string, w: 'month' | 'r12' = 'month') => a?.[k]?.[w]?.[1] ?? null;
const pct = (a: any, k: string, w: 'month' | 'r12' = 'month') => a?.[k]?.[w]?.[2] ?? null;
const commName = new Map(communities.communities.map((c) => [c.slug, c.name]));

const metroKeys = ['medianPrice', 'closedSales', 'newListings', 'inventory', 'monthsSupply', 'daysOnMarket', 'pctOfList'] as const;
const metroHist = Object.fromEntries(metroKeys.map((k) => [k, new Map(history(REGION, k).map((p) => [p.month, p.value]))]));
const metroMonths = [...new Set(metroKeys.flatMap((k) => [...metroHist[k].keys()]))].sort();

export const datasets: Dataset[] = [
  {
    slug: 'twin-cities-market-monthly',
    title: 'Twin Cities housing market by month',
    description: `16-county Twin Cities region, monthly, through ${latest}.`,
    source: `${marketSource.publisher} Local Market Update (${marketSource.data} data)`,
    sourceUrl: marketSource.url,
    header: ['month', 'median_sale_price', 'closed_sales', 'new_listings', 'homes_for_sale', 'months_supply', 'days_on_market', 'pct_of_original_list_price'],
    rows: metroMonths.map((m) => [m, ...metroKeys.map((k) => metroHist[k].get(m) ?? null)]),
  },
  {
    slug: 'twin-cities-cities-latest',
    title: `Twin Cities cities: market snapshot, ${latest}`,
    description: 'Every city and area in the Minneapolis Area REALTORS® monthly report, with year-over-year change.',
    source: `${marketSource.publisher} Local Market Update (${marketSource.data} data), published ${asOf}`,
    sourceUrl: marketSource.url,
    header: ['area', 'median_sale_price', 'median_change_pct_yoy', 'median_price_12mo', 'closed_sales', 'closed_sales_12mo', 'days_on_market', 'months_supply', 'homes_for_sale', 'pct_of_original_list_price'],
    rows: Object.entries(areas)
      .filter(([k, a]) => k !== REGION && (cur(a, 'closedSales', 'r12') ?? 0) > 0)
      .map(([k, a]) => [commName.get(k) ?? a.name, cur(a, 'medianPrice'), pct(a, 'medianPrice'), cur(a, 'medianPrice', 'r12'), cur(a, 'closedSales'), cur(a, 'closedSales', 'r12'), cur(a, 'daysOnMarket'), cur(a, 'monthsSupply'), cur(a, 'inventory'), cur(a, 'pctOfList')] as Row)
      .sort((x, y) => String(x[0]).localeCompare(String(y[0]))),
  },
  {
    slug: 'mortgage-rates',
    title: '30- and 15-year mortgage rates by month',
    description: 'National average fixed rates, last weekly survey of each month since 2000.',
    source: rates.source,
    sourceUrl: rates.url,
    header: ['week_of', 'rate_30yr_fixed', 'rate_15yr_fixed'],
    rows: rates.monthly.map((w) => [w.date, w.rate30, w.rate15]),
  },
  {
    slug: 'twin-cities-home-price-index',
    title: 'Twin Cities home price index by quarter',
    description: `${hpi.area}, quarterly since 1990 (index, 1995 Q1 = 100).`,
    source: hpi.source,
    sourceUrl: hpi.url,
    header: ['quarter', 'index'],
    rows: hpi.quarterly.map((q) => [q.q, q.index]),
  },
  {
    slug: 'twin-cities-property-tax-rates',
    title: 'Property tax rates by Twin Cities city',
    description: 'Typical effective property tax rate: median real estate taxes paid ÷ median home value, owner-occupied homes.',
    source: tax.source,
    sourceUrl: 'https://www.census.gov/programs-surveys/acs',
    header: ['city', 'median_real_estate_taxes', 'median_home_value', 'effective_rate_pct', 'note'],
    rows: Object.entries(tax.cities as Record<string, any>)
      .map(([k, v]) => [commName.get(k) ?? k, v.medianTax, v.medianValue, v.rate, v.topCoded ? 'taxes top-coded at $10,000+; rate is a minimum' : ''] as Row)
      .sort((x, y) => String(x[0]).localeCompare(String(y[0]))),
  },
];

const cell = (v: string | number | null) => (v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
export const toCsv = (d: Dataset) =>
  [`# ${d.title}`, `# Source: ${d.source} (${d.sourceUrl})`, `# Compiled by Huerkamp Home Group: https://www.huerkamphomegroup.com/data`, d.header.join(','), ...d.rows.map((r) => r.map(cell).join(','))].join('\n') + '\n';
