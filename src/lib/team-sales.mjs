// The team's own sales by city (src/pages/real-estate-agents/...): homes listed by Huerkamp Home Group agents
// (src/data/team.json, licensed agents only) that sold in the last 36 months, from NorthstarMLS, counted per city.
// Built so AI answers and searchers can cite a checked number ("sold N homes in Burnsville") instead of third-party
// directory estimates (Nov 10, 2026: ChatGPT quoted FastExpert's "29 Burnsville sales over three years").
// Only listings whose list office is the team's brokerage count (common names at other brokerages are left out). These
// are listing-side sales only; buyer-side sales aren't in the MLS agent field, so the counts are a floor.
// Downloaded once per build, cached a day: sales don't change by the hour. Empty when the MLS feed is off.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { mlsMode } from './mls-feed.mjs';
import { repliers } from './repliers.mjs';
import team from '../data/team.json' with { type: 'json' };

const root = pathToFileURL(`${process.cwd()}/`);
const CACHE = new URL('.cache/team-sales.json', root);
export const MONTHS = 36;
const FIELDS = 'mlsNumber,soldPrice,soldDate,status,lastStatus,address,office,agents';
const own = (b) => /keller williams preferred/i.test(b ?? '');
const text = (v) => (v == null ? '' : String(v).trim());
/** Licensed agents on the team (titles naming a REALTOR or broker). */
export const teamAgents = team.members.filter((m) => /realtor|broker/i.test(m.title ?? '')).map((m) => ({ name: m.name, slug: m.profileUrl.split('/').pop() }));
// Most team listings carry the team itself as the listing agent (checked on Burnsville sales, Nov 10, 2026: "The
// Huerkamp Home Group"; a search for "Jason Huerkamp" found none), so the team name is searched too.
const TEAM_NAMES = [{ name: 'The Huerkamp Home Group', slug: 'team' }, { name: 'Huerkamp Home Group', slug: 'team' }];

async function soldBy(key, agent, since) {
  const out = [];
  for (let page = 1; page <= 30; page++) {
    let r;
    for (let attempt = 1; ; attempt++) {
      r = await repliers(key, '/listings', { status: 'U', lastStatus: 'Sld', type: 'Sale', agent, minSoldDate: since, sortBy: 'soldDateDesc', resultsPerPage: 100, pageNum: page, fields: FIELDS })
        .catch((err) => ({ status: 0, data: null, error: String(err?.message ?? err) }));
      if (r.data || attempt >= 3 || r.status === 401 || r.status === 403) break;
      await new Promise((ok) => setTimeout(ok, 2000 * attempt));
    }
    if (!r.data) throw new Error(`Repliers ${r.status}`);
    out.push(...(r.data.listings ?? []));
    if (page >= (r.data.numPages ?? 1)) break;
  }
  return out;
}

/** { at, mode, since, sales: [{ mls, city, price, date, agents: [slug] }], failed: [agent] }. */
let loading;
export function loadTeamSales() {
  return (loading ??= (async () => {
    const empty = { at: null, mode: 'off', since: null, sales: [], failed: [] };
    if (process.env.MLS_FIXTURE && process.env.NETLIFY !== 'true') return { ...empty, mode: 'preview' }; // local previews
    const mode = mlsMode();
    const key = (process.env.REPLIERS_API_KEY ?? '').trim();
    if (mode === 'off' || !key) return empty;
    if (existsSync(CACHE) && Date.now() - statSync(CACHE).mtimeMs < 24 * 3600e3) return JSON.parse(readFileSync(CACHE, 'utf8'));
    const now = new Date();
    const sinceD = new Date(now); sinceD.setMonth(sinceD.getMonth() - MONTHS);
    const since = sinceD.toISOString().slice(0, 10);
    const byMls = new Map(), failed = [];
    for (const a of [...TEAM_NAMES, ...teamAgents]) {
      try {
        for (const l of await soldBy(key, a.name, since)) {
          if (!/sld|sold/i.test(`${text(l.lastStatus)} ${text(l.status)}`) || !own(l.office?.brokerageName)) continue;
          const price = Number(l.soldPrice), date = text(l.soldDate).slice(0, 10), city = text(l.address?.city);
          if (!(price > 1000) || !date || !city) continue;
          const s = byMls.get(l.mlsNumber) ?? { mls: text(l.mlsNumber), city, price, date, agents: [] };
          if (!s.agents.includes(a.slug)) s.agents.push(a.slug);
          byMls.set(l.mlsNumber, s);
        }
      } catch (err) {
        failed.push(a.name);
        console.error(`Team sales: ${a.name}: ${err.message}`);
      }
    }
    const out = { at: now.toISOString(), mode, since, sales: [...byMls.values()], failed };
    console.log(`Team sales: ${out.sales.length} homes sold in ${MONTHS} months${failed.length ? `; failed: ${failed.join(', ')}` : ''}`);
    // A partial download would understate the counts: keep the last complete one instead, if there is one. The pages
    // leave the counts out when `failed` isn't empty.
    console.log(`Team sales by name: ${[...TEAM_NAMES, ...teamAgents].map((a) => `${a.name} ${out.sales.filter((x) => x.agents.includes(a.slug)).length}`).join(', ')}`);
    // No sales under the team name means the search didn't match it: the rest would badly understate the record.
    if (!out.sales.some((x) => x.agents.includes('team'))) failed.push('The Huerkamp Home Group (no sales found)');
    if (failed.length) return existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : out;
    mkdirSync(new URL('.cache/', root), { recursive: true });
    writeFileSync(CACHE, JSON.stringify(out));
    return out;
  })());
}
