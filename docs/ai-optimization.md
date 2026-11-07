# AI-search optimization log

Daily log of changes that help AI assistants (ChatGPT, Google AI Overviews, Perplexity, Copilot, Claude) understand, trust and quote huerkamphomes.com. One entry per run, newest last.

## 2026-11-04
- **Checked:** robots.txt allows all crawlers (including GPTBot, ClaudeBot, PerplexityBot, Google-Extended) and lists the sitemap. llms.txt is generated from site data and is current. Service-area wording ("seven-county Twin Cities metro, plus Northfield, Dundas, Faribault, Owatonna and Le Sueur") is the same on the home page, Communities page and llms.txt.
- **Changed (structured data, every page):** the business markup's `areaServed` listed only Minneapolis, Saint Paul and the metro. It now lists all 149 cities that have a community guide (read from src/data/communities.json, the same list as /communities) plus the metro area. Code: src/data/schema.ts.
- **Why it helps:** AI assistants and Google read this markup to learn where the team works, so "Who sells homes in Lakeville?" can now match the team.
- **Sources:** the site's own community list; no new facts.
- **Noticed, not fixed:** `node scripts/check-launch.mjs` reports 164 addresses needing attention (e.g. old /home-search/listings/v2/... addresses redirect in a loop to /home-search). Same result without today's change. Worth a separate look.
- **Next ideas:** BlogPosting/VideoObject JSON-LD check (B); internal links between blog posts and community guides (E); verify sameAs profiles (Zillow, Ramsey ELP, Google Business Profile).

## 2026-11-06
- **Checked (structured data, B):** built the site and read every JSON-LD block in dist (about 7,760 pages). All parse. Blog posts (530 BlogPosting) all have headline, description, image, author, published and modified dates. Video pages (147 VideoObject) all have name, description, thumbnail and upload date; community pages carry Place, guide pages FAQPage/Dataset, every page BreadcrumbList.
- **Changed:** nothing. No errors found that were safe and worth changing.
- **Noticed, not changed:** 3 video pages have no duration (e.g. /videos/minneapolis-home-sellers-have-a-decision-to-make); the video data has no length for them and we won't guess. 2 old posts have headlines over 110 characters (e.g. /blog/2022/10/27/a-homeowners-guide-on-the-average-life-expectancy-of-major-appliances); Google may truncate, harmless.
- **Next ideas:** verify sameAs profiles (D); internal links between blog posts, community guides and tools (E); a weekly visibility spot check (G).

## 2026-11-07 — city priority: Eagan (done); next city: st-louis-park
- **Changed (city template, so every city page gets it; Eagan is the city checked):** /communities/eagan
  - Title now leads with the search words: "Eagan, MN Homes for Sale & Real Estate | Huerkamp Home Group"; the meta description opens "Eagan, MN homes for sale: ...".
  - The FAQ (and its FAQPage markup, built from the same list so they match) now opens with three factual questions: "How much do homes cost in Eagan, MN?" (12-month median sale price and sales count, NorthstarMLS), "How long do homes take to sell in Eagan?" (median days on market, NorthstarMLS) and "What are property taxes in Eagan, MN?" (median real estate tax paid, Census ACS 2020-2024; already in src/data/property-tax.json). ZIP codes, commute and point-of-sale rule answers were already there.
  - Internal links to the city page now say "<City> homes for sale" (blog post sidebar, video pages, market report, commute and comparison pages) instead of just the city name or "community guide".
- **Why it helps:** AI assistants and Google quote the first sentence of a section; these answers carry the figure, the period and the source.
- **Sources:** src/data/market.json (NorthstarMLS via Minneapolis Area REALTORS® Local Market Update), src/data/property-tax.json (Census ACS). No new facts.
- **Checked:** build passes; Eagan FAQ JSON-LD parses (14 questions). check-launch still reports the same 164 old /home-search/... addresses as on 2026-11-04 (unrelated).
