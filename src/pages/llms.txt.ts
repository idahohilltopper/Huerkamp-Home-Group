// /llms.txt: a plain-text guide to this site for AI assistants (llmstxt.org format).
// Built from the same data as the pages, so it never drifts from what visitors see.
import type { APIContext } from 'astro';
import { site } from '../data/site';
import { communities } from '../data/areas';
import team from '../data/team.json';
import { lakes, lakeHref, lakeCommunities, INDEX_MIN_ACRES } from '../data/lakes';
import { hoods, hoodHref, hoodKey, CITY_NAME } from '../data/neighborhoods';
import { members, agentHref, isAgent, reviewsFor } from '../data/agents';
import { source as mSource, latest as mLatest, asOf as mAsOf, REGION, marketFor, hasMarket, monthLabel, money, signed, count } from '../data/market';
import reviews from '../data/reviews.json';
import { getPosts, postUrl } from '../data/blog';
import { watchable, channel } from '../data/youtube';
import { guides, guideHref } from '../data/guides';
import { pairs, compareHref } from '../data/compare';
import { dguides, dguideHref } from '../data/downsizing';
import { DESTS, commuteHref } from '../data/commute';
import { listingsData, homesHref, stats, money as lMoney } from '../data/listings';

export async function GET(context: APIContext) {
  const url = (p: string) => new URL(p, context.site).href;
  const g = reviews.summary.google;
  const posts = (await getPosts()).slice(0, 25);
  // Homes for sale: listed only when the MLS pages are live (not in preview).
  const homes = await listingsData;
  const homeAreas = homes.mode === 'live' ? homes.collections.filter((k) => !k.facet && k.area.kind === 'community') : [];
  const homesSection = homeAreas.length ? `
## Homes for sale (NorthstarMLS, updated ${homes.at?.slice(0, 10)})
Every active listing in our communities, with a page per home and pages by price, home type, bedrooms, new construction, lakefront and acreage. Count, median list price:
${homeAreas.map((k) => { const s = stats(k.listings); return `- [${k.area.name}](${url(homesHref(k.path))}): ${s.count} for sale, median ${lMoney(s.median!)}`; }).join('\n')}
` : '';
  const text = `# ${site.name}

> ${site.name} is a Twin Cities (Minneapolis–Saint Paul, Minnesota) real estate team with ${site.brokerage}, founded in 2002 by Jason and Brooke Huerkamp. It helps people buy and sell homes across the seven-county metro and southern Minnesota.

Facts (with sources on ${url('/')}):
- Google rating: ${g.rating.toFixed(1)} stars across ${g.count} Google reviews (Google Business Profile, ${g.asOf.slice(0, 7)}).
- Dave Ramsey Endorsed Local Provider (ELP) for more than 15 years.
- ${team.members.length} agents and staff. Founders: Jason Huerkamp and Brooke Huerkamp.
- Office: ${site.street}, ${site.cityStateZip}. Phone: ${site.phone}. Email: ${site.email}.
- Home search (all NorthstarMLS listings): ${site.searchUrl}
- YouTube channel "${channel.title}" (${channel.url}): weekly videos on Twin Cities neighborhoods, suburbs and the housing market, by Jason Huerkamp.

## Main pages
- [Home](${url('/')}): overview, featured listings, reviews, FAQ
- [Sell a home](${url('/sell')}): free home valuation, cash offer, how listings are marketed
- [Buy a home](${url('/buy')}): buying steps, lender partner
- [Communities](${url('/communities')}): guides to ${communities.length} Minnesota cities
- [Lake homes](${url('/lake-homes')}): lakefront homes for sale on every lake of 10+ acres in our communities (${lakes.length} lakes), with a page per lake
- [Market reports](${url('/market')}): monthly home prices, sales and inventory for the Twin Cities and each city
- [Compare places](${url('/compare')}): ${pairs.length.toLocaleString('en-US')} side-by-side comparisons of nearby cities and neighboring Minneapolis/Saint Paul neighborhoods (e.g. ${url(compareHref(pairs.find((p) => p.path === 'apple-valley-vs-lakeville') ?? pairs[0]))}), and one page per city against every city within 15 miles (e.g. ${url('/compare/lakeville')})
- [Commute times](${url('/commute')}): every community by light-traffic drive time with home prices, to ${DESTS.map((d) => `[${d.name}](${url(commuteHref(d))})`).join(', ')}; one page per city and destination (e.g. ${url('/commute/downtown-minneapolis/lakeville')})
- [Downsizing & 55+](${url('/downsizing')}): guides for selling a longtime home and moving to one-level, 55+ or co-op living: ${dguides.map((g) => `[${g.title}](${url(dguideHref(g))})`).join('; ')}; plus a [printable checklist](${url('/downsizing/checklist')})
- [Calculators](${url('/calculators')}): [seller net proceeds](${url('/calculators/seller-net-proceeds')}) with Minnesota deed tax, [how much house can I afford](${url('/calculators/affordability')}) with each city's property tax rate and the Ramsey 25% guideline, and [rent vs. buy](${url('/calculators/rent-vs-buy')})
- [Twin Cities housing data](${url('/data')}): monthly prices, sales and inventory, mortgage rates since 2000, the metro home price index since 1995 and property tax rates by city, each sourced, with CSV downloads
- [Selling in Minnesota: what's required](${url('/selling-in-minnesota')}): which cities require a Truth in Sale of Housing, time-of-sale or sewer inspection before a sale, and the disclosures every Minnesota seller owes
- [Area guides](${url('/guides')}): Twin Cities places ranked by price, speed of sale, drive time, lakes and age of homes
- [Team](${url('/team')}): every agent and staff member
- [Reviews](${url('/reviews')}): verbatim Google and Zillow reviews
- [Ramsey ELP](${url('/ramsey')}): working with a Ramsey Endorsed Local Provider
- [Videos](${url('/videos')}): every Living in Minneapolis video, by topic
- [Contact](${url('/contact')})

${homesSection}
## Housing market, ${monthLabel(mLatest)}
Source: ${mSource.name} (data from ${mSource.data}), current as of ${mAsOf}. 12 months through ${monthLabel(mLatest)}: median sale price, change from the prior 12 months, homes sold. Full reports: ${url('/market')}. Every past month is archived by area, e.g. ${url('/market/burnsville/2026-03')} and the all-cities table ${url('/market/2026-03')}
- Twin Cities 16-county region: ${money(marketFor(REGION)?.medianPrice?.r12[1])}, ${signed(marketFor(REGION)?.medianPrice?.r12[2])}, ${count(marketFor(REGION)?.closedSales?.r12[1])} sold
${communities.filter((c) => hasMarket(c.slug)).map((c) => { const x = marketFor(c.slug)!; return `- [${c.name}](${url(`/market/${c.slug}`)}): ${money(x.medianPrice?.r12[1])}, ${signed(x.medianPrice?.r12[2])}, ${count(x.closedSales?.r12[1])} sold`; }).join('\n')}

## Area guides
Places ranked by one sourced measure each (never by who lives there); updated with the data.
${guides.map((g) => `- [${g.title}](${url(guideHref(g))}): ${g.rows.slice(0, 3).map((r) => `${r.name} (${r.cells[0]})`).join(', ')}`).join('\n')}

## Lakes (${INDEX_MIN_ACRES}+ acres)
Size from the Minnesota DNR (official acreage); each page links to the lakefront homes for sale on that lake (NorthstarMLS lakefront listings).
${lakes.filter((l) => l.acres >= INDEX_MIN_ACRES).map((l) => `- [${l.name}](${url(lakeHref(l))}): ${l.acres.toLocaleString('en-US')} acres; ${lakeCommunities(l).map((c) => c.name).join(', ')}`).join('\n')}

## Minneapolis and Saint Paul neighborhoods
Each guide has the neighborhood's monthly market report (${mSource.name}), US Census estimates and homes for sale. Median sale price over the 12 months through ${monthLabel(mLatest)}, where reported.
${hoods.map((h) => { const x = hasMarket(hoodKey(h)) ? marketFor(hoodKey(h)) : undefined; return `- [${h.name}, ${CITY_NAME[h.city]}](${url(hoodHref(h))})${x ? `: ${money(x.medianPrice?.r12[1])}, ${signed(x.medianPrice?.r12[2])}, ${count(x.closedSales?.r12[1])} sold` : ''}`; }).join('\n')}

## Agents
Each page has the agent's own bio, Minnesota license number, contact details and complete reviews that mention them.
${members.filter(isAgent).map((m) => `- [${m.name}](${url(agentHref(m))}): ${m.title}${m.license ? `, MN license ${m.license}` : ''}, ${m.phone}${reviewsFor(m).length ? `; ${reviewsFor(m).length} five-star ${reviewsFor(m).length === 1 ? 'review mentions' : 'reviews mention'} them` : ''}`).join('\n')}

## Community guides
Each guide covers homes for sale, home values, population, schools, commute and drive times, using US Census data.
${communities.map((c) => `- [${c.name}, MN](${url(`/communities/${c.slug}`)})`).join('\n')}

## Videos
${watchable.slice(0, 40).map((v) => `- [${v.title}](${url(`/videos/${v.slug}`)}): ${v.summary[0]}`).join('\n')}

## Recent articles
${posts.map((p) => `- [${p.data.title}](${url(postUrl(p))}): ${p.data.description}`).join('\n')}

## Optional
- [All articles](${url('/blog')})
- [Sitemap](${url('/sitemap-index.xml')})
`;
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
