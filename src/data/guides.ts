// "Best places for…" guides: Twin Cities communities ranked by one plain, sourced measure each.
// Every guide ranks places by the homes, the market or the location (price, speed of sale, drive time, lakes,
// age of the housing) and never by who lives there, so the guides stay clear of fair-housing steering.
// Figures come from the same data as the rest of the site, so each guide updates with it every month.
import details from './community-details.json';
import { communities, type Community } from './areas';
import { hoods, hoodHref, hoodKey, CITY_NAME, type Hood } from './neighborhoods';
import { lakesTouching, lakeHref } from './lakes';
import { communitySearch } from './ylopo';
import { marketFor, hasMarket, latest, monthLabel, money, moneyK, count, signed, type AreaMarket } from './market';

const month = monthLabel(latest);
const D = details.communities as Record<string, any>;
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** Fewer sales than this in 12 months and a town's median price or days on market can swing on a few homes. */
export const MIN_SALES = 30;
export const MIN_HOOD_SALES = 20;
const sales = (m?: AreaMarket) => m?.closedSales?.r12[1] ?? 0;

export interface Row {
  name: string;
  href: string;          // our guide to the place
  sub?: string;          // county or city, under the name
  cells: string[];       // one per column
  links: [string, string][];
}
export interface Guide {
  slug: string;
  title: string;         // page heading
  short: string;         // link text on the guides hub
  description: string;   // meta description and hub blurb
  eyebrow: string;
  intro: string;
  how: string;           // how the list was made
  columns: string[];
  rows: Row[];
  hoodColumns?: string[];
  hoodRows?: Row[];
  sources: ('market' | 'acs' | 'drive' | 'lakes')[];
  faq: { q: string; a: string }[];
}

const county = (c: Community) => `${c.counties[0]} County`;
const cityLinks = (c: Community, f = {}): [string, string][] => [
  ['Homes for sale', communitySearch(c.slug, f)],
  ...(hasMarket(c.slug) ? [['Market report', `/market/${c.slug}`] as [string, string]] : []),
];
const hoodRow = (h: Hood, cells: string[]): Row => ({
  name: h.name, href: hoodHref(h), sub: CITY_NAME[h.city], cells, links: [],
});
const list = (a: string[]) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a.at(-1)}`);

// Places with enough sales for their market numbers to mean something
const marketTowns = communities.map((c) => ({ c, m: marketFor(c.slug)! })).filter(({ m }) => sales(m) >= MIN_SALES);
const marketHoods = hoods.map((h) => ({ h, m: marketFor(hoodKey(h))! })).filter(({ m }) => sales(m) >= MIN_HOOD_SALES);
const r12 = (m: AreaMarket, k: 'medianPrice' | 'daysOnMarket' | 'pctOfList') => m[k]?.r12[1] ?? null;

function under400k(): Guide {
  const CAP = 400000;
  const towns = marketTowns.filter(({ m }) => (r12(m, 'medianPrice') ?? Infinity) < CAP).sort((a, b) => r12(a.m, 'medianPrice')! - r12(b.m, 'medianPrice')!);
  const hs = marketHoods.filter(({ m }) => (r12(m, 'medianPrice') ?? Infinity) < CAP).sort((a, b) => r12(a.m, 'medianPrice')! - r12(b.m, 'medianPrice')!);
  const cheapest = towns[0];
  return {
    slug: 'homes-under-400k', short: 'Where homes sell for under $400K', eyebrow: `Price · 12 months through ${month}`,
    title: 'Twin Cities cities where homes sell for under $400,000',
    description: `${towns.length} Twin Cities-area cities, plus Minneapolis and Saint Paul neighborhoods, where the median home sold for under $400,000 over the 12 months through ${month}. NorthstarMLS data, updated monthly.`,
    intro: `Half the homes sold in each of these places went for less than the price shown, over the 12 months through ${month}. Lowest first. Links open the homes for sale there under $400,000.`,
    how: `Every city in our community guides with at least ${MIN_SALES} sales in the 12 months (and Minneapolis and Saint Paul neighborhoods with at least ${MIN_HOOD_SALES}) whose median sale price was under $400,000.`,
    columns: ['Median sale price', 'Change from a year earlier', 'Homes sold'],
    rows: towns.map(({ c, m }) => ({ name: c.name, href: `/communities/${c.slug}`, sub: county(c),
      cells: [money(r12(m, 'medianPrice')), signed(m.medianPrice?.r12[2]), count(sales(m))], links: cityLinks(c, { maxPrice: CAP }) })),
    hoodColumns: ['Median sale price', 'Change', 'Homes sold'],
    hoodRows: hs.map(({ h, m }) => hoodRow(h, [money(r12(m, 'medianPrice')), signed(m.medianPrice?.r12[2]), count(sales(m))])),
    sources: ['market'],
    faq: [
      ...(cheapest ? [{ q: 'What is the most affordable city in our Twin Cities guides?', a: `${cheapest.c.name}, where the median home sold for ${money(r12(cheapest.m, 'medianPrice'))} over the 12 months through ${month} (${count(sales(cheapest.m))} sales), according to the Minneapolis Area REALTORS® Local Market Update. Among cities with at least ${MIN_SALES} sales.` }] : []),
      { q: 'How many Twin Cities-area cities have a median sale price under $400,000?', a: `${towns.length} of the cities in our community guides, over the 12 months through ${month}${hs.length ? `, plus ${hs.length} Minneapolis and Saint Paul neighborhoods` : ''}.` },
      { q: 'Does a median under $400,000 mean every home there costs less?', a: 'No. The median is the middle sale: half the homes sold for more and half for less. Most of these places have homes well above and below it, so search by your price range.' },
    ],
  };
}

function priciest(): Guide {
  const towns = [...marketTowns].sort((a, b) => (r12(b.m, 'medianPrice') ?? 0) - (r12(a.m, 'medianPrice') ?? 0)).slice(0, 15);
  const hs = [...marketHoods].sort((a, b) => (r12(b.m, 'medianPrice') ?? 0) - (r12(a.m, 'medianPrice') ?? 0)).slice(0, 10);
  return {
    slug: 'highest-priced-markets', short: 'Highest-priced markets', eyebrow: `Price · 12 months through ${month}`,
    title: 'The Twin Cities’ highest-priced housing markets',
    description: `The 15 Twin Cities-area cities and 10 Minneapolis and Saint Paul neighborhoods with the highest median sale price over the 12 months through ${month}. NorthstarMLS data, updated monthly.`,
    intro: `Where homes sold for the most over the 12 months through ${month}, by median sale price.`,
    how: `Cities in our community guides with at least ${MIN_SALES} sales in the 12 months, and Minneapolis and Saint Paul neighborhoods with at least ${MIN_HOOD_SALES}, ranked by median sale price.`,
    columns: ['Median sale price', 'Change from a year earlier', 'Homes sold'],
    rows: towns.map(({ c, m }) => ({ name: c.name, href: `/communities/${c.slug}`, sub: county(c),
      cells: [money(r12(m, 'medianPrice')), signed(m.medianPrice?.r12[2]), count(sales(m))], links: cityLinks(c) })),
    hoodColumns: ['Median sale price', 'Change', 'Homes sold'],
    hoodRows: hs.map(({ h, m }) => hoodRow(h, [money(r12(m, 'medianPrice')), signed(m.medianPrice?.r12[2]), count(sales(m))])),
    sources: ['market'],
    faq: [
      { q: 'Which Twin Cities city has the highest home prices?', a: `${towns[0].c.name}, with a median sale price of ${money(r12(towns[0].m, 'medianPrice'))} over the 12 months through ${month}, among cities in our guides with at least ${MIN_SALES} sales. Next: ${list(towns.slice(1, 4).map(({ c, m }) => `${c.name} (${moneyK(r12(m, 'medianPrice'))})`))}.` },
      ...(hs[0] ? [{ q: 'Which Minneapolis or Saint Paul neighborhood has the highest home prices?', a: `${hs[0].h.name} in ${CITY_NAME[hs[0].h.city]}, at a median ${money(r12(hs[0].m, 'medianPrice'))} over the same 12 months (${count(sales(hs[0].m))} sales).` }] : []),
    ],
  };
}

function fastest(): Guide {
  const by = (a: { m: AreaMarket }, b: { m: AreaMarket }) => (r12(a.m, 'daysOnMarket') ?? 999) - (r12(b.m, 'daysOnMarket') ?? 999);
  const towns = marketTowns.filter(({ m }) => r12(m, 'daysOnMarket') != null).sort(by).slice(0, 15);
  const hs = marketHoods.filter(({ m }) => r12(m, 'daysOnMarket') != null).sort(by).slice(0, 10);
  const pct = (m: AreaMarket) => (r12(m, 'pctOfList') == null ? '—' : `${r12(m, 'pctOfList')!.toFixed(1)}%`);
  return {
    slug: 'fastest-selling-markets', short: 'Where homes sell fastest', eyebrow: `Days on market · 12 months through ${month}`,
    title: 'Where homes sell fastest in the Twin Cities',
    description: `The 15 Twin Cities-area cities and 10 Minneapolis and Saint Paul neighborhoods where homes sold in the fewest days over the 12 months through ${month}, with the share of list price sellers got. NorthstarMLS data.`,
    intro: `Fewest days from listing to sale over the 12 months through ${month}. In these places buyers should be ready to move quickly, and sellers can expect strong interest when a home is priced right.`,
    how: `Cities in our community guides with at least ${MIN_SALES} sales in the 12 months, and Minneapolis and Saint Paul neighborhoods with at least ${MIN_HOOD_SALES}, ranked by days on market until sale (lowest first).`,
    columns: ['Days on market', 'Share of original list price', 'Homes sold'],
    rows: towns.map(({ c, m }) => ({ name: c.name, href: `/communities/${c.slug}`, sub: county(c),
      cells: [count(r12(m, 'daysOnMarket')), pct(m), count(sales(m))], links: cityLinks(c) })),
    hoodColumns: ['Days on market', 'Share of list price', 'Homes sold'],
    hoodRows: hs.map(({ h, m }) => hoodRow(h, [count(r12(m, 'daysOnMarket')), pct(m), count(sales(m))])),
    sources: ['market'],
    faq: [
      { q: 'Where do homes sell fastest in the Twin Cities?', a: `${towns[0].c.name}: homes there spent ${count(r12(towns[0].m, 'daysOnMarket'))} days on market on average over the 12 months through ${month}, the fewest of the cities in our guides with at least ${MIN_SALES} sales. Then ${list(towns.slice(1, 4).map(({ c, m }) => `${c.name} (${count(r12(m, 'daysOnMarket'))} days)`))}.` },
      { q: 'What does “share of original list price” mean?', a: 'The sale price as a percentage of the first asking price. Above 100% means homes typically sold for more than they were first listed at.' },
    ],
  };
}

function rising(): Guide {
  const MIN = 50;
  const ch = (m: AreaMarket) => m.medianPrice?.r12[2] ?? null;
  const towns = marketTowns.filter(({ m }) => sales(m) >= MIN && ch(m) != null).sort((a, b) => ch(b.m)! - ch(a.m)!).slice(0, 15);
  return {
    slug: 'rising-home-prices', short: 'Where prices are rising fastest', eyebrow: `Price change · 12 months through ${month}`,
    title: 'Where Twin Cities home prices are rising fastest',
    description: `The 15 Twin Cities-area cities where the median sale price rose the most over the 12 months through ${month}, compared with the 12 months before. NorthstarMLS data, updated monthly.`,
    intro: `The change in median sale price over the 12 months through ${month}, compared with the 12 months before. Prices in a single city move with the mix of homes that sold, so read these together with the number of sales.`,
    how: `Cities in our community guides with at least ${MIN} sales in the 12 months, ranked by the change in median sale price. Neighborhoods are left out because their small number of sales makes the change swing too much.`,
    columns: ['Change in median price', 'Median sale price', 'Homes sold'],
    rows: towns.map(({ c, m }) => ({ name: c.name, href: `/communities/${c.slug}`, sub: county(c),
      cells: [signed(ch(m)), money(r12(m, 'medianPrice')), count(sales(m))], links: cityLinks(c) })),
    sources: ['market'],
    faq: [
      { q: 'Where are Twin Cities home prices rising fastest?', a: `${towns[0].c.name}, where the median sale price over the 12 months through ${month} was ${signed(ch(towns[0].m))} from the year before (${money(r12(towns[0].m, 'medianPrice'))}, ${count(sales(towns[0].m))} sales). Among cities in our guides with at least ${MIN} sales.` },
      { q: 'Does a rising median mean my home is worth that much more?', a: 'Not exactly. A median moves when the mix of homes that sold changes, not only when values change. For your home, ask us for a free valuation based on recent sales near you.' },
    ],
  };
}

function buyersChoice(): Guide {
  const ms = (m: AreaMarket) => m.monthsSupply?.month[1] ?? null;
  const towns = marketTowns.filter(({ m }) => ms(m) != null).sort((a, b) => ms(b.m)! - ms(a.m)!).slice(0, 15);
  return {
    slug: 'most-homes-to-choose-from', short: 'Where buyers have the most choice', eyebrow: `Months of supply · ${month}`,
    title: 'Where Twin Cities buyers have the most homes to choose from',
    description: `The 15 Twin Cities-area cities with the most months of housing supply at the end of ${month}: more homes for sale compared with how fast they sell. NorthstarMLS data, updated monthly.`,
    intro: `Months of supply is how long the homes for sale would last at the current pace of sales. More months means more choice and usually more room to negotiate; around four to six months is often called a balanced market.`,
    how: `Cities in our community guides with at least ${MIN_SALES} sales in the 12 months through ${month}, ranked by months of supply at the end of ${month}.`,
    columns: ['Months of supply', 'Homes for sale', 'Median sale price (12 months)'],
    rows: towns.map(({ c, m }) => ({ name: c.name, href: `/communities/${c.slug}`, sub: county(c),
      cells: [String(ms(m)), count(m.inventory?.month[1]), money(r12(m, 'medianPrice'))], links: cityLinks(c) })),
    sources: ['market'],
    faq: [
      { q: 'Where do Twin Cities buyers have the most choice right now?', a: `${towns[0].c.name}, with ${ms(towns[0].m)} months of supply and ${count(towns[0].m.inventory?.month[1])} homes for sale at the end of ${month}, the most of the cities in our guides with at least ${MIN_SALES} sales a year.` },
      { q: 'What is months of supply?', a: 'The number of months it would take to sell every home on the market at the recent pace of sales, if no new homes were listed. Low supply favors sellers; high supply favors buyers.' },
    ],
  };
}

function commute(dest: 'downtownMinneapolis' | 'downtownSaintPaul'): Guide {
  const label = details.driveDestinations[dest];
  const self = dest === 'downtownMinneapolis' ? 'minneapolis' : 'saint-paul';
  const city = dest === 'downtownMinneapolis' ? 'Minneapolis' : 'Saint Paul';
  const towns = communities.filter((c) => c.slug !== self && D[c.slug]?.driveMinutes?.[dest] != null)
    .sort((a, b) => D[a.slug].driveMinutes[dest] - D[b.slug].driveMinutes[dest] || a.name.localeCompare(b.name)).slice(0, 20);
  const mins = (c: Community) => D[c.slug].driveMinutes[dest];
  return {
    slug: dest === 'downtownMinneapolis' ? 'closest-to-downtown-minneapolis' : 'closest-to-downtown-saint-paul',
    short: `Closest suburbs to downtown ${city}`, eyebrow: 'Drive time',
    title: `Suburbs with the shortest drive to downtown ${city}`,
    description: `The 20 cities in our Twin Cities guides with the shortest drive to downtown ${city}, in light traffic, with residents' average commute from the Census.`,
    intro: `Drive time from the middle of each city to ${label} in light traffic. Rush hour adds time; residents' average one-way commute (to wherever they work) is shown too.`,
    how: `Every city in our community guides except ${city} itself, ranked by drive time in light traffic from OpenStreetMap routing.`,
    columns: ['Drive to downtown', 'Miles (straight line)', 'Residents’ average commute'],
    rows: towns.map((c) => ({ name: c.name, href: `/communities/${c.slug}`, sub: county(c),
      cells: [`${mins(c)} min`, String(dest === 'downtownMinneapolis' ? c.milesToMinneapolis : c.milesToSaintPaul), D[c.slug].acs?.meanCommuteMinutes ? `${D[c.slug].acs.meanCommuteMinutes} min` : '—'], links: cityLinks(c) })),
    sources: ['drive', 'acs'],
    faq: [
      { q: `Which suburb is closest to downtown ${city}?`, a: `${list(towns.filter((c) => mins(c) === mins(towns[0])).map((c) => c.name))}: about ${mins(towns[0])} minutes by car in light traffic, the shortest drive of the cities in our guides.` },
      { q: 'Are these rush-hour times?', a: 'No. They are light-traffic drive times from OpenStreetMap routing, so allow more at rush hour. The Census column shows how long residents actually spend getting to work, wherever that is.' },
    ],
  };
}

function lakeTowns(): Guide {
  const rows = communities.map((c) => ({ c, ls: lakesTouching(c.slug) })).filter(({ ls }) => ls.length)
    .sort((a, b) => b.ls.length - a.ls.length || b.ls[0].acres - a.ls[0].acres).slice(0, 20);
  return {
    slug: 'best-lake-towns', short: 'Towns with the most lakes', eyebrow: 'Lakes',
    title: 'Twin Cities towns with the most lakes',
    description: `The 20 cities in our Twin Cities guides with the most lakes of 10 acres or more on their shores, with the biggest lake in each. Minnesota DNR lake data.`,
    intro: 'Counting every Minnesota DNR lake of 10 acres or more that touches the city. Each lake has its own page with the lakefront homes for sale on it.',
    how: 'Every city in our community guides, ranked by the number of lakes of 10+ acres touching it (ties go to the city with the bigger largest lake).',
    columns: ['Lakes of 10+ acres', 'Largest lake', 'Its size'],
    rows: rows.map(({ c, ls }) => ({ name: c.name, href: `/communities/${c.slug}`, sub: county(c),
      cells: [String(ls.length), ls[0].name, `${fmt(ls[0].acres)} acres`], links: [['Lakes and lakefront homes', `/communities/${c.slug}#lakes`], [ls[0].name, lakeHref(ls[0])]] })),
    sources: ['lakes'],
    faq: [
      { q: 'Which Twin Cities town has the most lakes?', a: `${rows[0].c.name}, with ${rows[0].ls.length} lakes of 10 acres or more on its shores, the largest being ${rows[0].ls[0].name} (${fmt(rows[0].ls[0].acres)} acres). Then ${list(rows.slice(1, 4).map(({ c, ls }) => `${c.name} (${ls.length})`))}.` },
      { q: 'How do I find lakefront homes for sale?', a: 'Every lake has its own page on our Lake Homes guide with the lakefront listings on it. You can also ask us for new lakefront listings on a lake as they come up.' },
    ],
  };
}

function newestHomes(): Guide {
  const yr = (c: Community) => D[c.slug]?.acs?.medianYearBuilt ?? null;
  const towns = communities.filter((c) => yr(c) && (D[c.slug].acs.households ?? 0) >= 1000).sort((a, b) => yr(b) - yr(a) || a.name.localeCompare(b.name)).slice(0, 20);
  return {
    slug: 'newest-homes', short: 'Suburbs with the newest homes', eyebrow: 'Housing age',
    title: 'Twin Cities suburbs with the newest homes',
    description: 'The 20 cities in our Twin Cities guides whose homes are newest, by the median year built from the Census, with the share of single-family homes and the median home value.',
    intro: 'Half the homes in each of these cities were built in the year shown or later. Newer housing usually means fewer big repairs and more open floor plans, and often new-construction neighborhoods still being built.',
    how: 'Every city in our community guides with at least 1,000 households, ranked by the median year its homes were built (US Census American Community Survey).',
    columns: ['Median year built', 'Single-family homes', 'Median home value'],
    rows: towns.map((c) => { const a = D[c.slug].acs; return { name: c.name, href: `/communities/${c.slug}`, sub: county(c),
      cells: [String(yr(c)), a.singleFamilyPct != null ? `${Math.round(a.singleFamilyPct)}%` : '—', money(a.medianHomeValue)], links: cityLinks(c) }; }),
    sources: ['acs'],
    faq: [
      { q: 'Which Twin Cities suburb has the newest homes?', a: `${towns[0].name}: half its homes were built in ${yr(towns[0])} or later, according to the Census Bureau's American Community Survey (2020–2024). Then ${list(towns.slice(1, 4).map((c) => `${c.name} (${yr(c)})`))}.` },
      { q: 'Where can I find new construction?', a: 'Cities near the top of this list usually have new-construction neighborhoods still selling. Ask us: we can show you builders’ homes and resales, and represent you with the builder at no cost to you.' },
    ],
  };
}

export const guides: Guide[] = [
  under400k(), fastest(), lakeTowns(), commute('downtownMinneapolis'), commute('downtownSaintPaul'),
  newestHomes(), rising(), buyersChoice(), priciest(),
];
export const guideHref = (g: Guide) => `/guides/${g.slug}`;
