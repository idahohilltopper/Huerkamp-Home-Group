// Writes the old-site redirect list (redirects.json) into the formats Netlify and Vercel read.
// Run after editing redirects.json:  node scripts/write-redirects.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const list = JSON.parse(readFileSync('redirects.json', 'utf8'));
// The site lives on www.huerkamphomes.com (Jason's choice, Nov 2026). In Netlify, www.huerkamphomes.com is the
// primary domain and huerkamphomes.com, huerkamphomegroup.com and www.huerkamphomegroup.com are domain aliases.
const NEW = 'https://www.huerkamphomes.com';
// Old Squarespace site (www.huerkamphomegroup.com): each old address goes to its new page on www.huerkamphomes.com;
// any other address keeps its path. Forced (!), so nothing is ever served on the old domain.
const oldGroup = ['https://huerkamphomegroup.com', 'https://www.huerkamphomegroup.com'].flatMap((host) =>
  list.map((r) => `${(host + r.from).padEnd(70)} ${r.to.startsWith('http') ? r.to : NEW + r.to} 301!`).concat(`${(host + '/*').padEnd(70)} ${NEW}/:splat 301!`));
// The bare huerkamphomes.com goes to www (Netlify does this too once www is primary; this makes it certain).
const bare = [`${'https://huerkamphomes.com/*'.padEnd(70)} ${NEW}/:splat 301!`];
// Old Luxury Presence addresses (built by scripts/build-lp-redirects.py) now arrive on the new site itself, so these
// are plain paths and NOT forced: a rule only applies when no new page has that address.
const lp = JSON.parse(readFileSync('redirects-lp.json', 'utf8'));
const lpRules = lp.filter((r) => r.from !== r.to).map((r) => `${r.from.padEnd(70)} ${r.to} 301`);

const netlify = ['# Generated from redirects.json and redirects-lp.json by scripts/write-redirects.mjs.',
  '# Old huerkamphomegroup.com (Squarespace) addresses -> www.huerkamphomes.com']
  .concat(oldGroup, '', '# huerkamphomes.com -> www.huerkamphomes.com', bare, '',
    '# Old huerkamphomes.com (Luxury Presence) addresses -> new pages (only where no new page has that address)', lpRules)
  .join('\n') + '\n';
writeFileSync('public/_redirects', netlify);

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
// Vercel may match paths without regard to case, so a rule that only changes case (/Buyer -> /buyer)
// could loop there; Vercel gets the rest.
vercel.redirects = list.filter((r) => r.from.toLowerCase() !== r.to.toLowerCase()).map((r) => ({ source: r.from, destination: r.to, permanent: true }));
writeFileSync('vercel.json', JSON.stringify(vercel, null, 2) + '\n');
console.log(`Wrote ${oldGroup.length} huerkamphomegroup.com rules and ${lpRules.length} old huerkamphomes.com rules to public/_redirects, ${list.length} to vercel.json`);
