// Launch dry run: every address from the two old sites, run through public/_redirects the way Netlify reads it,
// must end on a page that exists in dist/ (or on the Ylopo home search). Run after `npm run build`:
//   node scripts/check-launch.mjs
// After launch, check the real thing over the internet (every address must end on a 200 page on www):
//   node scripts/check-launch.mjs --live
// Address lists: tests/old-urls/squarespace.txt (www.huerkamphomegroup.com) and luxury-presence.txt (huerkamphomes.com).
import { existsSync, readFileSync, statSync } from 'node:fs';

const SITE = 'www.huerkamphomegroup.com';
const SEARCH = 'search.huerkamphomegroup.com';

// Netlify rules: first match wins; "!" forces the rule even when a page exists at that address;
// a rule without "!" only applies when nothing is there. Rules can name a host ("https://huerkamphomes.com/...").
const rules = readFileSync('public/_redirects', 'utf8').split('\n')
  .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [from, to, code = '301'] = l.split(/\s+/);
    const m = from.match(/^https?:\/\/([^/]+)(\/.*)$/);
    return { host: m ? m[1] : null, path: m ? m[2] : from, to, status: parseInt(code, 10), force: code.endsWith('!') };
  });

const trim = (p) => (p.length > 1 ? p.replace(/\/$/, '') : p);
const pageExists = (path) => {
  const p = decodeURIComponent(path.split(/[?#]/)[0]);
  if (p === '/') return existsSync('dist/index.html');
  const f = `dist${trim(p)}`;
  return existsSync(`${f}.html`) || existsSync(`${f}/index.html`) || (existsSync(f) && statSync(f).isFile());
};
function match(rule, host, path) {
  if (rule.host && rule.host !== host) return null;
  const p = trim(path.split('?')[0]);
  if (rule.path.endsWith('/*')) {
    const base = rule.path.slice(0, -2);
    return p === base || p.startsWith(`${base}/`) ? p.slice(base.length + 1) : null;
  }
  return trim(rule.path) === p ? '' : null;
}

/** Follow redirects from host+path; returns [finalUrl, hops, problem]. */
function resolve(host, path) {
  const hops = [];
  for (let i = 0; i < 6; i++) {
    const internal = host === SITE;
    const rule = rules.find((r) => {
      const m = match(r, host, path);
      return m !== null && (r.force || !(internal && pageExists(path)));
    });
    if (!rule) {
      if (host === SEARCH) return [`https://${host}${path}`, hops, null];
      if (!internal) return [`https://${host}${path}`, hops, 'no rule for this old-domain address'];
      return [`https://${host}${path}`, hops, pageExists(path) ? null : 'page not found'];
    }
    const splat = match(rule, host, path);
    let to = rule.to.replace(':splat', splat);
    hops.push(`${rule.status} → ${to}`);
    const u = new URL(to, `https://${host}`);
    host = u.host; path = u.pathname + u.search;
    if (host === SITE && path.split('?')[0] === '/' && hops.length > 1 && hops.at(-2).endsWith(' → /')) break;
  }
  return [`https://${host}${path}`, hops, hops.length >= 6 ? 'redirect loop' : null];
}

if (process.argv.includes('--live')) {
  const lines = (f) => readFileSync(f, 'utf8').split('\n').map((x) => x.trim()).filter(Boolean);
  const urls = [
    ...lines('tests/old-urls/squarespace.txt').map((p) => `https://${SITE}${p}`),
    ...['huerkamphomes.com', 'www.huerkamphomes.com'].flatMap((h) => lines('tests/old-urls/luxury-presence.txt').map((p) => `https://${h}${p}`)),
    'http://huerkamphomegroup.com/', 'https://huerkamphomegroup.com/', 'http://www.huerkamphomegroup.com/',
  ];
  let bad = 0;
  for (let i = 0; i < urls.length; i += 8) {
    await Promise.all(urls.slice(i, i + 8).map(async (u) => {
      try {
        const r = await fetch(u, { redirect: 'follow', headers: { 'User-Agent': 'HHG-launch-check' } });
        const host = new URL(r.url).host;
        if (r.status !== 200 || (host !== SITE && host !== SEARCH)) { bad++; console.log(`  ✗ ${u} → ${r.status} ${r.url}`); }
      } catch (e) { bad++; console.log(`  ✗ ${u} → ${e.message}`); }
    }));
  }
  console.log(bad ? `\n${bad} of ${urls.length} live addresses need attention.` : `\nAll ${urls.length} live addresses end on a working page.`);
  process.exit(bad ? 1 : 0);
}

let failures = 0;
const report = (label, host, list) => {
  const rows = list.map((p) => [p, ...resolve(host, p)]);
  const bad = rows.filter((r) => r[3]);
  const toHome = rows.filter((r) => !r[3] && r[1] === `https://${SITE}/` && r[0] !== '/');
  console.log(`\n${label}: ${rows.length} addresses, ${rows.length - bad.length} end on a real page, ${toHome.length} of them on the home page`);
  bad.forEach(([p, final, hops, why]) => console.log(`  ✗ ${host}${p} → ${final} (${why}) ${hops.join(' ')}`));
  failures += bad.length;
  return rows;
};
const lines = (f) => readFileSync(f, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);

report('Old Squarespace site (www.huerkamphomegroup.com)', SITE, lines('tests/old-urls/squarespace.txt'));
for (const host of ['huerkamphomes.com', 'www.huerkamphomes.com']) {
  const rows = report(`Old Luxury Presence site (${host})`, host, lines('tests/old-urls/luxury-presence.txt'));
  if (host === 'huerkamphomes.com') {
    for (const p of ['/youtube-form', '/webinarsignup', '/neighborhoods/saint-paul', '/blog/7-huge-signs-its-time-to-sell-your-house']) {
      const r = rows.find((x) => x[0] === p) ?? [p, ...resolve(host, p)];
      console.log(`  e.g. ${p} → ${r[1]}`);
    }
  }
}
console.log(failures ? `\n${failures} address(es) need attention.` : '\nEvery old address lands on a real page.');
process.exit(failures ? 1 : 0);
