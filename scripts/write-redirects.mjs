// Writes the old-site redirect list (redirects.json) into the formats Netlify and Vercel read.
// Run after editing redirects.json:  node scripts/write-redirects.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const list = JSON.parse(readFileSync('redirects.json', 'utf8'));

const netlify = ['# Generated from redirects.json by scripts/write-redirects.mjs. Old huerkamphomegroup.com addresses -> new pages.']
  .concat(list.map((r) => `${r.from.padEnd(44)} ${r.to.padEnd(44)} 301`))
  .join('\n') + '\n';
writeFileSync('public/_redirects', netlify);

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
vercel.redirects = list.map((r) => ({ source: r.from, destination: r.to, permanent: true }));
writeFileSync('vercel.json', JSON.stringify(vercel, null, 2) + '\n');
console.log(`Wrote ${list.length} redirects to public/_redirects and vercel.json`);
