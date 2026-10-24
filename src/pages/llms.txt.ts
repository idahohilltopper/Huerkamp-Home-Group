// /llms.txt: a plain-text guide to this site for AI assistants (llmstxt.org format).
// Built from the same data as the pages, so it never drifts from what visitors see.
import type { APIContext } from 'astro';
import { site } from '../data/site';
import { communities } from '../data/areas';
import team from '../data/team.json';
import reviews from '../data/reviews.json';
import { getPosts, postUrl } from '../data/blog';

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

## Main pages
- [Home](${url('/')}): overview, featured listings, reviews, FAQ
- [Sell a home](${url('/sell')}): free home valuation, cash offer, how listings are marketed
- [Buy a home](${url('/buy')}): buying steps, lender partner
- [Communities](${url('/communities')}): guides to ${communities.length} Minnesota cities
- [Lake homes](${url('/lake-homes')}): homes on Twin Cities lakes
- [Team](${url('/team')}): every agent and staff member
- [Reviews](${url('/reviews')}): verbatim Google and Zillow reviews
- [Ramsey ELP](${url('/ramsey')}): working with a Ramsey Endorsed Local Provider
- [Contact](${url('/contact')})

## Community guides
Each guide covers homes for sale, home values, population, schools, commute and drive times, using US Census data.
${communities.map((c) => `- [${c.name}, MN](${url(`/communities/${c.slug}`)})`).join('\n')}

## Recent articles
${posts.map((p) => `- [${p.data.title}](${url(postUrl(p))}): ${p.data.description}`).join('\n')}

## Optional
- [All articles](${url('/blog')})
- [Sitemap](${url('/sitemap-index.xml')})
`;
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
