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

## 2026-11-08 — city priority: St. Louis Park (done); next city: mendota-heights
- **Checked:** /communities/st-louis-park already has the title "St. Louis Park, MN Homes for Sale & Real Estate", the H1, and an FAQ (and matching FAQPage markup) that opens with median sale price ($395,050, 738 sales, 12 months through September 2026, NorthstarMLS), days on market (48), property taxes ($4,380 median, Census ACS), median home value, ZIP codes (55426, 55416), commute and the city's point-of-sale inspection rule. Links to the page from the blog sidebar and video pages already say "St. Louis Park, MN homes for sale".
- **Changed (city template, so every city page gets it):** the meta description was 168+ characters for longer city names, so the layout cut it off mid-list ("...schools and commute times, from Huerkamp…"). Dropped the words "current listings" so every city's description (max 156 characters) fits in full and still opens "<City>, MN homes for sale:". Code: src/pages/communities/[slug].astro.
- **Why it helps:** the description is the summary search engines and AI assistants quote; it is now complete and leads with the search phrase for all cities.
- **Sources:** none needed; no new facts.
- **Checked:** build passes (7,794 pages); check-launch reports the same 164 old /home-search/... addresses as before (unrelated).

## 2026-11-09: one job per page (Jason's decision)

Search Console showed each town's two pages splitting "<town> homes for sale" (e.g. "eagan mn homes for sale": the
homes-for-sale page at #18, the community guide at #43). Now:
- `/homes-for-sale/<town>` is the "<Town>, MN homes for sale" page (title "<Town>, MN Homes for Sale (N)").
- `/communities/<town>` is the guide for "living in <town>" searches: title "Living in <Town>, MN: Home Prices,
  Taxes, Commute & Local Guide", H1 "Living in <Town>, MN", and its main button links "See all N <Town> homes for sale".
Don't retitle community pages back to "homes for sale"; strengthen the homes-for-sale pages for those searches.

## 2026-11-09 — city priority: Mendota Heights (done); next city: rosemount
- **Checked:** /communities/mendota-heights uses the "Living in …" title and H1, and its FAQ (with matching FAQPage markup) already opens with median sale price, days on market, property taxes, ZIPs, commute and the point-of-sale rule, all from the site's sourced data.
- **Changed (shared templates, so every city gets it):**
  - /homes-for-sale/<city> meta description now opens "<City>, MN homes for sale: …" before the live count (src/pages/homes-for-sale/[...path].astro).
  - Blog posts and video pages: the "<City>, MN homes for sale" link now goes to /homes-for-sale/<city> (when that page exists), with a separate "Living in <City>, MN" link to the guide. Before, those links labelled "homes for sale" pointed at the guide.
  - Commute, comparison and market pages: the guide link is now worded as the guide ("Living in <City>: prices, taxes and commute" / "<City> community guide"); the market page's "homes for sale" link goes to the homes-for-sale page.
- **Why it helps:** each page now has one job, so "<City> homes for sale" signals point to the homes-for-sale page and the fact searches point to the guide.
- **Sources:** none needed; no new facts.

## 2026-11-10 — city priority: Rosemount (checked, no site change); next city: waconia
- **Checked:** /communities/rosemount has sourced data for every lead answer: 12-month median sale price and sales count and days on market (NorthstarMLS, September 2026), property tax ($3,932 median, Census ACS), ZIP 55068, school districts, commute. FAQ and FAQPage markup come from the same list, so they match.
- **Point-of-sale rule:** the guide says "we haven't confirmed a city inspection requirement for Rosemount". A search of the city's website (ci.rosemount.mn.us) found no time-of-sale inspection program, but not finding one isn't proof, so the wording was left as is. Found: the city's utility policy asks sellers to book a final water-meter reading for closing day (24 hours' notice). Worth adding with Jason's OK once confirmed with Rosemount Community Development (651-322-2020).
- **Changed:** nothing on the site (nothing safe and verified to add). No deploy.

## 2026-11-11 — city priority: Waconia (checked, no site change); next city: inver-grove-heights
- **Checked:** /communities/waconia has sourced data for every lead answer: 12-month median sale price, sales count and days on market (NorthstarMLS, via the Minneapolis Area REALTORS® Local Market Update, September 2026), property tax ($4,392 median on a $431,000 median value, Census ACS 2020-2024), commute, school districts. FAQ and FAQPage markup come from the same list. /homes-for-sale/waconia is titled "Waconia, MN Homes for Sale (N)" and its description opens "Waconia, MN homes for sale:".
- **Point-of-sale rule:** Waconia is not in src/data/sale-rules.ts, so the guide says "we haven't confirmed a city inspection requirement". A web search found no Waconia time-of-sale program, but not finding one isn't proof, so the wording stays. Worth confirming with Waconia city hall before adding a rule.
- **Changed:** nothing on the site. No deploy.

## 2026-11-12 — city priority: Inver Grove Heights (checked, no site change); next city: woodbury
- **Checked:** /communities/inver-grove-heights has sourced data for every lead answer: 12-month median sale price ($398,950), sales count (392) and days on market (56), all NorthstarMLS via the Minneapolis Area REALTORS® Local Market Update, September 2026; property tax ($3,464 median on a $363,400 median value, Census ACS). FAQ and FAQPage markup come from the same list; the shared templates (Living-in title, homes-for-sale title and description, link wording) were set up on Nov 9.
- **Point-of-sale rule:** Inver Grove Heights is not in src/data/sale-rules.ts. The city's code library has a "Compliance Inspection Program" (section 8-5-9-2) with a "Property Transfer/Sale Requirements" part, but the page couldn't be opened here (403), so what it requires (and for which property types, possibly rentals only) is unconfirmed. The city's "Inspection Requirements" handout covers construction inspections only. Worth confirming with Permits & Inspections (651-450-2550) before adding a rule; the guide's "we haven't confirmed" wording stays.
- **Changed:** nothing on the site. No deploy (log-only commit, not built by Netlify).

## 2026-11-14 — where AI answers come from (OpenSEO AI visibility, baseline run of Nov 6)
- **Baseline:** 10 tracked questions × ChatGPT, Gemini, Google AI Overviews, Perplexity = 39 answers. Huerkamp Home
  Group named in 5, huerkamphomes.com cited in 4 (Ramsey ELP question, "best real estate team in the Twin Cities",
  Burnsville prices). The weekly check re-runs it.
- **What the "best realtor in <city>" answers cite:** agent directories, not agents' own sites: Zillow (18 answers),
  Realtor.com (15), Redfin (8), EffectiveAgents (7), HomeLight (7), FastExpert (5), RealTrends (4), Agent Pronto (3),
  Homeia (3), US News (3), Experience.com (3). For "should I sell now or wait" and "inspections to sell in
  Minneapolis": Homes.com, minneapolismn.gov, local agents' blogs. Our /when-to-sell and /selling-in-minnesota pages
  answer both directly; they launched after the baseline.
- **So the next gains are off the site (Jason):** complete team and agent profiles on Zillow, Realtor.com, Redfin,
  FastExpert, Homeia and Experience.com with the same name, Burnsville address and phone, linking to
  www.huerkamphomes.com; redirect huerkamphomegroup.com (the old site still outranks the new one for "huerkamp home
  group"). Once the profile links are confirmed, add them to `sameAs` in src/data/schema.ts (never guessed).
- **Changed:** schema.ts business data now lists the RealTrends team profile in sameAs and a knowsAbout list.
