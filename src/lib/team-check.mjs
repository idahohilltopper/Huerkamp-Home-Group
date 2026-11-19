// Weekly team check (Jason, Nov 19, 2026): who is in Follow Up Boss but not on the website's team page, and who is on
// the team page but no longer an active Follow Up Boss user. Names only, never emails or phone numbers.
// Follow Up Boss API: GET /v1/users (Basic auth, the API key as the user name), paged with limit/offset.

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
const mail = (s) => String(s ?? '').trim().toLowerCase();

export async function fubUsers(key, fetcher = fetch) {
  const auth = 'Basic ' + Buffer.from(`${key}:`).toString('base64');
  const users = [];
  for (let offset = 0; offset < 1000; offset += 100) {
    const r = await fetcher(`https://api.followupboss.com/v1/users?limit=100&offset=${offset}`, { headers: { authorization: auth, accept: 'application/json' } });
    if (!r.ok) throw new Error(`Follow Up Boss answered ${r.status}`);
    const d = await r.json();
    const page = d.users ?? [];
    users.push(...page);
    if (page.length < 100) break;
  }
  return users;
}

/** Active = not marked inactive/deleted/suspended in the user's status (Follow Up Boss omits it for active users). */
const active = (u) => !/inactive|deleted|disabled|suspend/i.test(String(u.status ?? 'Active'));

export function compareTeam(members, users) {
  const live = users.filter(active);
  const byEmail = new Map(live.map((u) => [mail(u.email), u]));
  const byName = new Map(live.map((u) => [norm(u.name ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`), u]));
  const matched = new Set();
  const notInFub = [];
  for (const m of members) {
    const u = byEmail.get(mail(m.email)) ?? byName.get(norm(m.name));
    if (u) matched.add(u.id);
    else notInFub.push({ name: m.name, title: m.title });
  }
  const newInFub = live.filter((u) => !matched.has(u.id)).map((u) => ({ name: u.name ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(), role: u.role ?? null }));
  return { onSite: members.length, activeInFub: live.length, newInFub, notInFub };
}
