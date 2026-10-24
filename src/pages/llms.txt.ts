// /llms.txt: a plain-text guide to this site for AI assistants (llmstxt.org format).
// Built from the same data as the pages, so it never drifts from what visitors see.
import type { APIContext } from 'astro';
import { site } from '../data/site';
import { communities } from '../data/areas';
import team from '../data/team.json';
import { hoods, hoodHref, hoodKey, CITY_NAME } from '../data/neighborhoods';
import { members, agentHref, isAgent, reviewsFor } from '../data/agents';
import { source as mSource, latest as mLatest, asOf as mAsOf, REGION, marketFor, hasMarket, monthLabel, money, signed, count } from '../data/market';
import reviews from '../data/reviews.json';
import { getPosts, postUrl } from '../data/blog';
import { watchable, channel } from '../data/youtube';

export async function GET(context: APIContext) {
  const url = (p: string) => new URL(p, context.site).href;
  const g = reviews.summary.google;
  const posts = (await getPosts()).slice(0, 25);
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
- [Lake homes](${url('/lake-homes')}): homes on Twin Cities lakes
- [Market reports](${url('/market')}): monthly home prices, sales and inventory for the Twin Cities and each city
- [Team](${url('/team')}): every agent and staff member
- [Reviews](${url('/reviews')}): verbatim Google and Zillow reviews
- [Ramsey ELP](${url('/ramsey')}): working with a Ramsey Endorsed Local Provider
- [Videos](${url('/videos')}): every Living in Minneapolis video, by topic
- [Contact](${url('/contact')})

## Housing market, ${monthLabel(mLatest)}
Source: ${mSource.name} (data from ${mSource.data}), current as of ${mAsOf}. 12 months through ${monthLabel(mLatest)}: median sale price, change from the prior 12 months, homes sold. Full reports: ${url('/market')}
- Twin Cities 16-county region: ${money(marketFor(REGION)?.medianPrice?.r12[1])}, ${signed(marketFor(REGION)?.medianPrice?.r12[2])}, ${count(marketFor(REGION)?.closedSales?.r12[1])} sold
${communities.filter((c) => hasMarket(c.slug)).map((c) => { const x = marketFor(c.slug)!; return `- [${c.name}](${url(`/market/${c.slug}`)}): ${money(x.medianPrice?.r12[1])}, ${signed(x.medianPrice?.r12[2])}, ${count(x.closedSales?.r12[1])} sold`; }).join('\n')}

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
