# AI-search optimization log

Daily log of changes that help AI assistants (ChatGPT, Google AI Overviews, Perplexity, Copilot, Claude) understand, trust and quote huerkamphomes.com. One entry per run, newest last.

## 2026-11-04
- **Checked:** robots.txt allows all crawlers (including GPTBot, ClaudeBot, PerplexityBot, Google-Extended) and lists the sitemap. llms.txt is generated from site data and is current. Service-area wording ("seven-county Twin Cities metro, plus Northfield, Dundas, Faribault, Owatonna and Le Sueur") is the same on the home page, Communities page and llms.txt.
- **Changed (structured data, every page):** the business markup's `areaServed` listed only Minneapolis, Saint Paul and the metro. It now lists all 149 cities that have a community guide (read from src/data/communities.json, the same list as /communities) plus the metro area. Code: src/data/schema.ts.
- **Why it helps:** AI assistants and Google read this markup to learn where the team works, so "Who sells homes in Lakeville?" can now match the team.
- **Sources:** the site's own community list; no new facts.
- **Noticed, not fixed:** `node scripts/check-launch.mjs` reports 164 addresses needing attention (e.g. old /home-search/listings/v2/... addresses redirect in a loop to /home-search). Same result without today's change. Worth a separate look.
- **Next ideas:** BlogPosting/VideoObject JSON-LD check (B); internal links between blog posts and community guides (E); verify sameAs profiles (Zillow, Ramsey ELP, Google Business Profile).
