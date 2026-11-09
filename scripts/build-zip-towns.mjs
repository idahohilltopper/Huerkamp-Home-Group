// ZIP code -> post office town (the city name USPS uses for the ZIP), for every ZIP on the community pages.
// Source: GeoNames postal codes, https://download.geonames.org/export/zip/US.zip (CC BY 4.0, credited on the pages).
// Usage: curl -sO https://download.geonames.org/export/zip/US.zip && unzip -o US.zip US.txt
//        node scripts/build-zip-towns.mjs path/to/US.txt
import fs from 'node:fs';
const [file] = process.argv.slice(2);
const towns = new Map(fs.readFileSync(file, 'utf8').split('\n').map((l) => l.split('\t')).filter((f) => f[0] === 'US' && f[4] === 'MN').map((f) => [f[1], f[2]]));
const details = JSON.parse(fs.readFileSync('src/data/community-details.json', 'utf8'));
const zips = [...new Set(Object.values(details.communities).flatMap((c) => (c.zips ?? []).map((z) => z.zip)))].sort();
const out = Object.fromEntries(zips.filter((z) => towns.has(z)).map((z) => [z, towns.get(z)]));
const missing = zips.filter((z) => !towns.has(z));
fs.writeFileSync('src/data/zip-towns.json', JSON.stringify({ source: 'GeoNames postal codes (CC BY 4.0)', built: new Date().toISOString().slice(0, 10), towns: out }, null, 1) + '\n');
console.log(`${Object.keys(out).length} ZIPs named${missing.length ? `; no name for ${missing.join(', ')}` : ''}`);
