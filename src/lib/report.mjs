// The private results report (/report): live numbers from Follow Up Boss and Google Search Console.
// Used by netlify/functions/report.mjs; kept separate so it can be tested without calling either service.
// Only counts leave the server: no names, emails or phone numbers.
import { createSign } from 'node:crypto';
import { FORMS, SOURCE } from './lead.mjs';

const DAY = 86400000;
const iso = (d) => d.toISOString().slice(0, 10);
const json = async (res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status} ${(await res.text()).slice(0, 200)}`)));

// ---------- Follow Up Boss: website leads ----------

/** Leads from the website (and the YouTube form), newest first, back to `days` ago. */
export async function fubPeople(key, days = 120, fetchFn = fetch) {
  const since = Date.now() - days * DAY;
  const auth = 'Basic ' + Buffer.from(`${key}:`).toString('base64');
  const out = [];
  for (let offset = 0; offset < 2000; offset += 100) {
    const url = `https://api.followupboss.com/v1/people?sort=-created&limit=100&offset=${offset}&fields=id,created,source,tags`;
    const page = await json(await fetchFn(url, { headers: { authorization: auth, 'X-System': 'HuerkampHomeGroupWebsite' } }));
    const people = page.people ?? [];
    for (const p of people) if (Date.parse(p.created) >= since) out.push(p);
    if (people.length < 100 || Date.parse(people.at(-1).created) < since) break;
  }
  const sources = new Set([SOURCE, ...Object.values(FORMS).map((f) => f.source).filter(Boolean)]);
  return out.filter((p) => sources.has(p.source));
}

/** Counts by week and by form, from the people Follow Up Boss returned. */
export function summarizeLeads(people, now = new Date(), weeks = 12) {
  const labels = Object.fromEntries(Object.values(FORMS).flatMap((f) => f.tags.map((t) => [t, f.label])));
  const t = now.getTime();
  const within = (d) => people.filter((p) => t - Date.parse(p.created) < d * DAY).length;
  const byWeek = Array.from({ length: weeks }, (_, i) => {
    const end = t - i * 7 * DAY, start = end - 7 * DAY;
    return { weekOf: iso(new Date(start)), leads: people.filter((p) => { const c = Date.parse(p.created); return c >= start && c < end; }).length };
  }).reverse();
  const tagCounts = {};
  for (const p of people.filter((x) => t - Date.parse(x.created) < 30 * DAY)) {
    for (const tag of p.tags ?? []) if (labels[tag] || /Seller lead|Buyer lead|YouTube/.test(tag)) tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
  }
  return {
    last7: within(7), last30: within(30), prior30: within(60) - within(30), last90: within(90),
    sellers30: people.filter((p) => t - Date.parse(p.created) < 30 * DAY && (p.tags ?? []).includes('Seller lead')).length,
    byWeek, tags30: Object.entries(tagCounts).sort((a, b) => b[1] - a[1]),
  };
}

// ---------- Google Search Console ----------

/** OAuth token for a Google service account (the key is Netlify's GSC_PRIVATE_KEY; newlines may be written as \n). */
export async function googleToken(email, privateKey, fetchFn = fetch) {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(privateKey.replace(/\\n/g, '\n'), 'base64url');
  const res = await fetchFn('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  });
  return (await json(res)).access_token;
}

/** Clicks, impressions, top searches and top pages: the last 28 days against the 28 before, and 16 weeks of clicks.
 *  Search Console runs about 3 days behind, so the window ends 3 days ago. */
export async function searchConsole(token, site, now = new Date(), fetchFn = fetch) {
  const q = async (body) => (await json(await fetchFn(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(body),
  }))).rows ?? [];
  const end = new Date(now.getTime() - 3 * DAY);
  const d = (n) => iso(new Date(end.getTime() - n * DAY));
  const sum = (rows) => rows.reduce((a, r) => ({ clicks: a.clicks + r.clicks, impressions: a.impressions + r.impressions }), { clicks: 0, impressions: 0 });
  const [cur, prev, daily, queries, pages] = await Promise.all([
    q({ startDate: d(27), endDate: d(0) }),
    q({ startDate: d(55), endDate: d(28) }),
    q({ startDate: d(111), endDate: d(0), dimensions: ['date'], rowLimit: 200 }),
    q({ startDate: d(27), endDate: d(0), dimensions: ['query'], rowLimit: 25 }),
    q({ startDate: d(27), endDate: d(0), dimensions: ['page'], rowLimit: 25 }),
  ]);
  const weeks = Array.from({ length: 16 }, (_, i) => ({ weekOf: d(111 - i * 7), clicks: 0, impressions: 0 }));
  for (const r of daily) {
    const i = Math.min(15, Math.floor((Date.parse(r.keys[0]) - Date.parse(d(111))) / (7 * DAY)));
    if (i >= 0) { weeks[i].clicks += r.clicks; weeks[i].impressions += r.impressions; }
  }
  const row = (r) => ({ key: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: Math.round(r.position * 10) / 10 });
  return { through: d(0), last28: sum(cur), prior28: sum(prev), weeks, queries: queries.map(row), pages: pages.map(row) };
}
