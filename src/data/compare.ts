// Side-by-side comparisons: "Lakeville vs. Apple Valley", "Linden Hills vs. Fulton".
//   /compare                              every community, with links to its comparisons
//   /compare/<community>                  one community against every nearby community, in one table
//   /compare/<a>-vs-<b>                   two communities within PAIR_MILES of each other
//   /compare/neighborhoods/<a>-vs-<b>     two Minneapolis or Saint Paul neighborhoods that touch
// Like the area guides, places are compared only by their homes, their housing market and their location
// (price, speed of sale, age and type of homes, drive times, lakes), never by who lives there (fair housing).
// Every figure comes from the same sourced data as the rest of the site, so the pages update with it monthly.
import details from './community-details.json';
import { communities, milesBetween, type Community } from './areas';
import { hoods, hoodKey, hoodHref, CITY_NAME, type Hood } from './neighborhoods';
import { lakesTouching, lakeHref } from './lakes';
import { marketFor, latest, monthLabel, money, count, signed, type AreaMarket } from './market';

export const PAIR_MILES = 15;
/** Both places need this many sales in 12 months for search engines to see the page (fewer and the numbers swing). */
export const MIN_SALES = 30;
export const MIN_HOOD_SALES = 20;

const D = details.communities as Record<string, any>;
const DEST = details.driveDestinations as Record<string, string>;
const month = monthLabel(latest);
const r12 = (m: AreaMarket | undefined, k: keyof Omit<AreaMarket, 'name' | 'url'>) => (m?.[k] as any)?.r12?.[1] ?? null;
const mo = (m: AreaMarket | undefined, k: keyof Omit<AreaMarket, 'name' | 'url'>) => (m?.[k] as any)?.month?.[1] ?? null;
const sales = (m?: AreaMarket) => r12(m, 'closedSales') ?? 0;
const pct = (n: number | null) => (n == null ? '—' : `${Math.round(n)}%`);
const num = (n: number | null) => (n == null ? '—' : Math.round(n).toLocaleString('en-US'));
const list = (a: string[]) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a.at(-1)}`);

/** One place on a comparison page. */
export interface Side {
  key: string; name: string; short: string; href: string; marketHref: string | null; kind: 'community' | 'hood';
  m?: AreaMarket; center: number[]; community?: Community; hood?: Hood;
}
export interface Row { label: string; a: string; b: string; note?: string; an?: number | null; bn?: number | null }
export interface Group { title: string; source: string; rows: Row[] }
export interface Pair { path: string; kind: 'community' | 'hood'; a: Side; b: Side; miles: number; driveMinutes: number | null; index: boolean }

const sideOf = (c: Community): Side => ({
  key: c.slug, name: `${c.name}, MN`, short: c.name, href: `/communities/${c.slug}`, kind: 'community',
  marketHref: sales(marketFor(c.slug)) > 0 ? `/market/${c.slug}` : null, m: marketFor(c.slug), center: c.center, community: c,
});
const hoodSide = (h: Hood): Side => ({
  key: hoodKey(h), name: `${h.name}, ${CITY_NAME[h.city]}`, short: h.name, href: hoodHref(h), kind: 'hood',
  marketHref: sales(marketFor(hoodKey(h))) > 0 ? `${hoodHref(h)}#market` : null, m: marketFor(hoodKey(h)), center: h.center, hood: h,
});

// ---------- which pairs get a page ----------
const placed = communities.filter((c) => D[c.slug]);
const drive = (a: string, b: string): number | null => D[a]?.driveMinutesToCommunities?.[b] ?? D[b]?.driveMinutesToCommunities?.[a] ?? null;

export const pairs: Pair[] = [];
for (let i = 0; i < placed.length; i++) {
  for (let j = i + 1; j < placed.length; j++) {
    const miles = milesBetween(placed[i].center, placed[j].center);
    if (miles > PAIR_MILES) continue;
    const [x, y] = [placed[i], placed[j]].sort((p, q) => p.slug.localeCompare(q.slug));
    const a = sideOf(x), b = sideOf(y);
    pairs.push({ path: `${x.slug}-vs-${y.slug}`, kind: 'community', a, b, miles, driveMinutes: drive(x.slug, y.slug),
      index: sales(a.m) >= MIN_SALES && sales(b.m) >= MIN_SALES });
  }
}
const seenHood = new Set<string>();
for (const h of hoods) {
  for (const k of (h as any).neighbors ?? []) {
    const o = hoods.find((x) => hoodKey(x) === k);
    if (!o) continue;
    const [x, y] = [h, o].sort((p, q) => p.slug.localeCompare(q.slug));
    const path = `neighborhoods/${x.slug}-vs-${y.slug}`;
    if (seenHood.has(path)) continue;
    seenHood.add(path);
    const a = hoodSide(x), b = hoodSide(y);
    pairs.push({ path, kind: 'hood', a, b, miles: milesBetween(x.center, y.center), driveMinutes: null,
      index: sales(a.m) >= MIN_HOOD_SALES && sales(b.m) >= MIN_HOOD_SALES });
  }
}
// Closest first, so each place's list starts with the comparisons people make most.
pairs.sort((p, q) => p.miles - q.miles);

export const compareHref = (p: Pair) => `/compare/${p.path}`;
export const pairsFor = (key: string) => pairs.filter((p) => p.a.key === key || p.b.key === key);
export const other = (p: Pair, key: string) => (p.a.key === key ? p.b : p.a);
export const hubHref = (c: Community) => `/compare/${c.slug}`;
export const hasCompare = (c: Community) => pairsFor(c.slug).length > 0;

// ---------- the numbers, side by side ----------
const acs = (s: Side) => (s.kind === 'community' ? D[s.key]?.acs : null);
const census = (s: Side) => (s.kind === 'hood' ? (s.hood as any)?.census : null);

export function groups(p: Pair): Group[] {
  const { a, b } = p;
  const row = (label: string, f: (s: Side) => number | null, show: (n: number | null) => string, note?: string): Row => {
    const an = f(a), bn = f(b);
    return { label, a: show(an), b: show(bn), an, bn, note };
  };
  const out: Group[] = [];
  const mk = [
    row('Median sale price', (s) => r12(s.m, 'medianPrice'), money),
    row('Change from a year earlier', (s) => s.m?.medianPrice?.r12[2] ?? null, signed),
    row('Homes sold', (s) => r12(s.m, 'closedSales'), count),
    row('Days on market', (s) => r12(s.m, 'daysOnMarket'), count),
    row('Share of original list price', (s) => r12(s.m, 'pctOfList'), (n) => (n == null ? '—' : `${n.toFixed(1)}%`)),
    row('Price per square foot', (s) => r12(s.m, 'pricePerSqft'), money),
    row('New listings', (s) => r12(s.m, 'newListings'), count),
    row(`Homes for sale (${month})`, (s) => mo(s.m, 'inventory'), count),
    row(`Months of supply (${month})`, (s) => mo(s.m, 'monthsSupply'), (n) => (n == null ? '—' : n.toFixed(1))),
  ].filter((r) => r.an != null || r.bn != null);
  if (mk.length) out.push({ title: `Housing market, 12 months through ${month}`, source: 'Minneapolis Area REALTORS® Local Market Update (NorthstarMLS data)', rows: mk });

  if (p.kind === 'community') {
    out.push({ title: 'The homes', source: 'US Census Bureau, American Community Survey 2020–2024', rows: [
      row('Median home value (owner estimate)', (s) => acs(s)?.medianHomeValue ?? null, money),
      row('Median year built', (s) => acs(s)?.medianYearBuilt ?? null, (n) => (n == null ? '—' : String(n))),
      row('Single-family homes', (s) => acs(s)?.singleFamilyPct ?? null, pct, 'Share of all housing units, detached houses'),
      row('Owner-occupied homes', (s) => acs(s)?.ownerOccupiedPct ?? null, pct),
      row('Median rent', (s) => acs(s)?.medianGrossRent ?? null, money),
    ].filter((r) => r.an != null || r.bn != null) });
    out.push({ title: 'The place', source: 'US Census Bureau 2024 estimates and TIGER/Line; drive times from OpenStreetMap routing (light traffic)', rows: [
      row('Population (2024)', (s) => s.community?.population2024 ?? null, num),
      row('Land area', (s) => s.community?.landSqMi ?? null, (n) => (n == null ? '—' : `${n.toLocaleString('en-US')} sq mi`)),
      ...Object.entries(DEST).map(([k, label]) => row(`Drive to ${label}`, (s) => D[s.key]?.driveMinutes?.[k] ?? null, (n) => (n == null ? '—' : `${n} min`))),
      row('Average commute to work', (s) => acs(s)?.meanCommuteMinutes ?? null, (n) => (n == null ? '—' : `${n} min`)),
      row('Lakes of 10+ acres', (s) => lakesTouching(s.key).length, num, 'Minnesota DNR lake outlines touching the city'),
    ].filter((r) => r.an != null || r.bn != null) });
  } else {
    out.push({ title: 'The homes', source: 'US Census Bureau, American Community Survey 2020–2024 (block groups in the neighborhood)', rows: [
      row('Median home value (owner estimate)', (s) => census(s)?.medianHomeValue ?? null, money),
      row('Single-family houses', (s) => census(s)?.housing?.singleFamily ?? null, pct),
      row('Townhomes and duplexes', (s) => census(s)?.housing?.townhomeDuplex ?? null, pct),
      row('Apartment buildings', (s) => (census(s)?.housing ? (census(s).housing.smallApartment ?? 0) + (census(s).housing.largeApartment ?? 0) : null), pct),
      row('Built before 1940', (s) => census(s)?.builtBefore1940Pct ?? null, pct),
      row('Built 2000 or later', (s) => census(s)?.built2000onPct ?? null, pct),
      row('Owner-occupied homes', (s) => census(s)?.ownerPct ?? null, pct),
      row('Population', (s) => census(s)?.population ?? null, num),
      row('Area', (s) => (s.hood as any)?.acres ?? null, (n) => (n == null ? '—' : `${n.toLocaleString('en-US')} acres`)),
    ].filter((r) => r.an != null || r.bn != null) });
  }
  return out.filter((g) => g.rows.length);
}

// ---------- plain-English answers ----------
const diffPct = (x: number, y: number) => Math.round((Math.abs(x - y) / Math.min(x, y)) * 100);

/** The opening answer: one sentence each on price, speed, homes and location, from whatever both places have. */
export function summary(p: Pair): string[] {
  const { a, b } = p;
  const out: string[] = [];
  const pa = r12(a.m, 'medianPrice'), pb = r12(b.m, 'medianPrice');
  if (pa && pb) {
    const [hi, lo, hiP, loP] = pa >= pb ? [a, b, pa, pb] : [b, a, pb, pa];
    out.push(hiP === loP
      ? `Homes in ${a.short} and ${b.short} sold for the same median price, ${money(pa)}, over the 12 months through ${month}.`
      : `Homes in ${hi.short} sold for a median ${money(hiP)} over the 12 months through ${month}, ${diffPct(hiP, loP)}% more than in ${lo.short} (${money(loP)}).`);
  }
  const da = r12(a.m, 'daysOnMarket'), db = r12(b.m, 'daysOnMarket');
  if (da != null && db != null) out.push(da === db ? `Homes in both took ${count(da)} days to sell on average.` : `Homes sold faster in ${da < db ? a.short : b.short}: ${count(Math.min(da, db))} days on market on average, against ${count(Math.max(da, db))} in ${da < db ? b.short : a.short}.`);
  if (p.kind === 'community') {
    const ya = acs(a)?.medianYearBuilt, yb = acs(b)?.medianYearBuilt;
    if (ya && yb && Math.abs(ya - yb) >= 5) out.push(`${ya > yb ? a.short : b.short}'s homes are newer, with a median year built of ${Math.max(ya, yb)} against ${Math.min(ya, yb)}.`);
    const ma = D[a.key]?.driveMinutes?.downtownMinneapolis, mb = D[b.key]?.driveMinutes?.downtownMinneapolis;
    if (ma != null && mb != null) out.push(ma === mb ? `Both are about ${ma} minutes from downtown Minneapolis by car.` : `${ma < mb ? a.short : b.short} is closer to downtown Minneapolis: about ${Math.min(ma, mb)} minutes by car, against ${Math.max(ma, mb)}.`);
  } else {
    const oa = census(a)?.builtBefore1940Pct, ob = census(b)?.builtBefore1940Pct;
    if (oa != null && ob != null && Math.abs(oa - ob) >= 10) out.push(`${oa > ob ? a.short : b.short} has more older homes: ${Math.max(oa, ob)}% were built before 1940, against ${Math.min(oa, ob)}%.`);
  }
  out.push(`The two are about ${p.miles < 1 ? 'a mile' : `${Math.round(p.miles)} miles`} apart${p.driveMinutes ? `, roughly a ${p.driveMinutes}-minute drive` : ''}${p.kind === 'hood' ? ' (center to center)' : ''}.`);
  return out;
}

/** Quick answers (also the page's FAQ schema). */
export function faq(p: Pair) {
  const { a, b } = p;
  const q: { q: string; a: string }[] = [];
  const pa = r12(a.m, 'medianPrice'), pb = r12(b.m, 'medianPrice');
  if (pa && pb) q.push({ q: `Is ${a.short} or ${b.short} more expensive?`, a: pa === pb ? `Neither: both had a median sale price of ${money(pa)} over the 12 months through ${month}.` : `${pa > pb ? a.short : b.short}. The median sale price was ${money(Math.max(pa, pb))} there and ${money(Math.min(pa, pb))} in ${pa > pb ? b.short : a.short} over the 12 months through ${month}, according to the Minneapolis Area REALTORS® Local Market Update. The median is the middle sale, so both have homes well above and below it.` });
  const da = r12(a.m, 'daysOnMarket'), db = r12(b.m, 'daysOnMarket');
  if (da != null && db != null) q.push({ q: `Where do homes sell faster, ${a.short} or ${b.short}?`, a: `${da <= db ? a.short : b.short}: ${count(Math.min(da, db))} days on market on average against ${count(Math.max(da, db))}, over the 12 months through ${month}.` });
  if (p.kind === 'community') {
    const ma = D[a.key]?.driveMinutes?.downtownMinneapolis, mb = D[b.key]?.driveMinutes?.downtownMinneapolis;
    const sa = D[a.key]?.driveMinutes?.downtownSaintPaul, sb = D[b.key]?.driveMinutes?.downtownSaintPaul;
    if (ma != null && mb != null) q.push({ q: `Which is closer to downtown Minneapolis?`, a: `${ma <= mb ? a.short : b.short}, about ${Math.min(ma, mb)} minutes by car in light traffic (${Math.max(ma, mb)} from ${ma <= mb ? b.short : a.short})${sa != null && sb != null ? `. To downtown Saint Paul: ${sa} minutes from ${a.short}, ${sb} from ${b.short}` : ''}.` });
    q.push({ q: `How far apart are ${a.short} and ${b.short}?`, a: `About ${Math.round(p.miles)} miles in a straight line between their centers${p.driveMinutes ? `, or roughly ${p.driveMinutes} minutes by car` : ''}.` });
    const la = lakesTouching(a.key), lb = lakesTouching(b.key);
    const biggest = (ls: typeof la) => (ls.length ? ` (largest: ${[...ls].sort((x, y) => y.acres - x.acres)[0].name})` : '');
    const lead = la.length === lb.length ? 'They have the same number' : `${la.length > lb.length ? a.short : b.short} has more`;
    if (la.length || lb.length) q.push({ q: `Which has more lakes, ${a.short} or ${b.short}?`, a: `${lead}: ${la.length} lakes of 10+ acres touch ${a.short}${biggest(la)} and ${lb.length} touch ${b.short}${biggest(lb)}, by Minnesota DNR lake outlines.` });
    const sdA = (D[a.key]?.schoolDistricts ?? []).map((s: any) => s.name), sdB = (D[b.key]?.schoolDistricts ?? []).map((s: any) => s.name);
    if (sdA.length && sdB.length) q.push({ q: `Which school districts serve ${a.short} and ${b.short}?`, a: `${a.short}: ${list(sdA)}. ${b.short}: ${list(sdB)}. School district lines don't follow city lines, so check the district for a specific address before you buy.` });
  }
  q.push({ q: `Should I buy in ${a.short} or ${b.short}?`, a: `It depends on your budget, the kind of home you want and where you need to get to each day. This page compares the homes, prices and locations; a Huerkamp Home Group agent can show you homes in both and walk you through what's selling now.` });
  return q;
}

/** Lakes and school districts for the "places" section. */
export const sideLakes = (s: Side) => (s.kind === 'community' ? [...lakesTouching(s.key)].sort((x, y) => y.acres - x.acres).slice(0, 5).map((l) => ({ name: l.name, href: lakeHref(l), acres: l.acres })) : []);
export const sideDistricts = (s: Side): string[] => (s.kind === 'community' ? (D[s.key]?.schoolDistricts ?? []).map((x: any) => x.name) : []);
export const sideCounty = (s: Side) => (s.community ? `${s.community.counties.join(' & ')} County` : s.hood ? CITY_NAME[s.hood.city] : '');
export { month as compareMonth };
