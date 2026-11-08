// Home builders selling in our communities, found by the listing brokerage on their new homes: builders sell through
// their own sales companies ("Lennar Sales Corp", "Pulte Homes Of Minnesota, LLC"), so a listing whose brokerage is the
// builder's is one of that builder's homes. A builder gets a page (/new-construction/builders/<slug>) with MIN_HOMES or
// more homes for sale. To add a builder: add a row with the start of its brokerage name as it appears in NorthstarMLS.
import { listingsData, median, type Listing } from './listings';
import { developmentsData } from './developments';

export const MIN_HOMES = 3;
export const BUILDERS: { slug: string; name: string; match: RegExp }[] = [
  { slug: 'lennar', name: 'Lennar', match: /^lennar sales/i },
  { slug: 'pulte-homes', name: 'Pulte Homes', match: /^pulte homes/i },
  { slug: 'dr-horton', name: 'D.R. Horton', match: /^d\.?\s?r\.?\s?horton/i },
  { slug: 'm-i-homes', name: 'M/I Homes', match: /^m\/i homes/i },
  { slug: 'robert-thomas-homes', name: 'Robert Thomas Homes', match: /^robert thomas homes/i },
  { slug: 'gonyea-homes', name: 'Gonyea Homes', match: /^gonyea homes/i },
  { slug: 'david-weekley-homes', name: 'David Weekley Homes', match: /^(david )?weekley homes/i },
  { slug: 'youngfield-homes', name: 'Youngfield Homes', match: /^youngfield homes/i },
  { slug: 'hanson-builders', name: 'Hanson Builders', match: /^hanson builders/i },
];

export interface Builder {
  slug: string; name: string; brokerage: string; listings: Listing[]; min: number; max: number; median: number | null;
  devs: { name: string; path: string; city: string; n: number; min: number }[]; cities: string[];
}

export const buildersData = (async () => {
  const data = await listingsData;
  const devs = (await developmentsData).list;
  const out: Builder[] = [];
  for (const b of BUILDERS) {
    const list = data.listings.filter((l) => b.match.test(l.brokerage) && l.type !== 'land').sort((a, z) => a.price - z.price);
    if (list.length < MIN_HOMES) continue;
    const mine = new Set(list.map((l) => l.mls));
    const inDevs = devs.map((d) => ({ d, l: d.listings.filter((l) => mine.has(l.mls)) })).filter((x) => x.l.length)
      .map((x) => ({ name: x.d.name, path: x.d.path, city: x.d.city, n: x.l.length, min: Math.min(...x.l.map((l) => l.price)) }))
      .sort((a, z) => z.n - a.n);
    const prices = list.map((l) => l.price);
    out.push({
      slug: b.slug, name: b.name, brokerage: list[0].brokerage, listings: list, min: Math.min(...prices), max: Math.max(...prices), median: median(prices),
      devs: inDevs, cities: [...new Set(list.map((l) => l.city))].sort(),
    });
  }
  return { at: data.at, preview: data.preview, mode: data.mode, list: out.sort((a, z) => z.listings.length - a.listings.length) };
})();
