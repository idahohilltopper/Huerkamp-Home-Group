// Writes the old-site redirect list (redirects.json) into the formats Netlify and Vercel read.
// Run after editing redirects.json:  node scripts/write-redirects.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const list = JSON.parse(readFileSync('redirects.json', 'utf8'));
// Old Luxury Presence site (built by scripts/build-lp-redirects.py). These only apply once huerkamphomes.com
// is added to the Netlify site as a domain alias. They come first and are forced (!), and every
// destination is a full www.huerkamphomegroup.com address, so nothing is ever served on the old domain.
const lp = JSON.parse(readFileSync('redirects-lp.json', 'utf8'));
const NEW = 'https://www.huerkamphomegroup.com';
const lpRules = ['https://huerkamphomes.com', 'https://www.huerkamphomes.com'].flatMap((host) =>
  lp.concat({ from: '/*', to: '/' }).map((r) => `${(host + r.from).padEnd(60)} ${r.to.startsWith('http') ? r.to : NEW + r.to} 301!`));

const netlify = ['# Generated from redirects.json and redirects-lp.json by scripts/write-redirects.mjs.',
  '# Old huerkamphomes.com (Luxury Presence) addresses -> new pages']
  .concat(lpRules, '', '# Old huerkamphomegroup.com (Squarespace) addresses -> new pages')
  .concat(list.map((r) => `${r.from.padEnd(44)} ${r.to.padEnd(44)} 301`))
  .join('\n') + '\n';
writeFileSync('public/_redirects', netlify);

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
// Vercel may match paths without regard to case, so a rule that only changes case (/Buyer -> /buyer)
// could loop there; Vercel gets the rest.
vercel.redirects = list.filter((r) => r.from.toLowerCase() !== r.to.toLowerCase()).map((r) => ({ source: r.from, destination: r.to, permanent: true }));
writeFileSync('vercel.json', JSON.stringify(vercel, null, 2) + '\n');
console.log(`Wrote ${list.length} redirects to public/_redirects and vercel.json, plus ${lpRules.length} huerkamphomes.com rules to public/_redirects`);
