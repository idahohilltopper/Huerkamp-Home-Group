# Huerkamp Home Group — New Website Plan

_Status: Step 3 — home page approved 2026-09-26; Buy, Sell, Invest, Ramsey ELP, Contact, 30 community pages and Lake Homes built 2026-09-27, awaiting review._

## Decisions so far

| Topic | Decision |
|---|---|
| Existing sites | Keep huerkamphomegroup.com, huerkamphomes.com and findmyminnesotahouse.com live for now. The new site is built on a preview address and replaces nothing until approved. |
| CRM | Follow Up Boss. Every form, home inquiry and saved search is sent to FUB with its source. |
| Home search (IDX) | Replace the current search with a new one built on the NorthstarMLS data feed. |
| Budget | Up to $500/month, aiming well below that to protect profitability. |
| Look and feel | Since 2026-10-22: modeled on markzproperties.com (Mark Z, Detroit) with Huerkamp Home Group branding. Earlier versions followed nevadarealestategroup.com; community pages keep that section structure. |

## Business facts (confirm before launch)

- Use 2002 as the founding year (the year Jason and Brooke joined forces; Jason started in 2001). Confirmed by Jason, 2026-09-26; Keller Williams Preferred Realty
- 14300 Nicollet Ct, Ste 208, Burnsville, MN 55306 · (612) 843-9620 (main number on the new site, matches Google)
- Serves Minneapolis, St. Paul, the 13-county Twin Cities metro and Western Wisconsin
- Dave Ramsey Endorsed Local Provider (15+ years)
- Agent count, closings, sales volume and review count: **need current numbers**

## Pages

1. **Home** — skyline hero, home search bar, trust stats, reviews, featured communities, buy/sell/invest paths
2. **Search Homes** — map and list search of all NorthstarMLS listings
3. **Listing pages** — one page per home, with photos, details, a map and an inquiry form
4. **Communities** — one page per city or suburb, with live listings and local info
5. **Buy** / **Sell** (with a home value request) / **Invest**
6. **Dave Ramsey ELP**
7. **Team** and individual **agent profiles**
8. **Reviews**
9. **Careers** (agent recruiting)
10. **Contact**

## Tech stack

| Piece | Choice | Why |
|---|---|---|
| Site framework | Astro | Fast pages that Google indexes well |
| Hosting | Netlify or Vercel | Free to about $20/month, with automatic preview links |
| Listings | NorthstarMLS feed via MLS Grid | Listing pages live on our own domain, which helps SEO |
| Lead routing | Follow Up Boss Events API | Leads arrive in FUB tagged by source |
| Images | Your own photography, or licensed stock photos | Avoids copyright problems |

## Estimated monthly cost

| Item | Estimate |
|---|---|
| Hosting | $0–20 |
| MLS data feed (NorthstarMLS/MLS Grid fees — to confirm) | TBD |
| Maps (Mapbox/Google, free tiers) | $0–50 |
| Domain | ~$2 |
| **Target total** | **Under $250, well below the $500 cap** |

## Build order

1. Plan (this document)
2. Design: homepage look and feel, colors, fonts, skyline hero
3. Core pages: home, buy, sell, invest, ELP, contact
4. Lead forms connected to Follow Up Boss
5. Team and agent profiles, reviews
6. Community pages
7. IDX: NorthstarMLS feed, search and listing pages
8. SEO, speed, accessibility and legal checks (MLS display rules, KW branding, Fair Housing)
9. Preview review, then decide which domain the new site launches on

## Progress notes (hand-off)

**Step 2 approved.** Jason's answers:
- Skyline photo: source a free-license stock photo (Unsplash candidates: `HkIS3OvACYM` aerial daytime, `yLUM5exvsMA` night, `xEvtxQrmh-s` fog). Confirm the free Unsplash License (not Unsplash+) before using.
- Team: pull the full roster (names, titles, photos, bios) from huerkamphomegroup.com/team-page.
- Reviews: use real, verbatim reviews from Google and Zillow (Huerkamp Home Group). Never paraphrase or invent reviews.

**Team found so far via search (incomplete, since the team is 26–38 people):**

| Name | Phone | Email |
|---|---|---|
| Jason Huerkamp (founder) | (612) 324-2357 | jason@hhgus.com |
| Brooke Huerkamp | (612) 509-4409 | |
| Kim Lindgren | (651) 661-3028 | kim@hhgus.com |
| Zac Bidelman | (612) 712-9936 | zac@hhgus.com |
| Jason Oliver | (612) 416-0493 | joliver@hhgus.com |
| Michele Meredith | (612) 662-1095 | michele@hhgus.com |
| Bryce Pap | (651) 615-3345 | bryce@hhgus.com |
| Hannah Hunter | (651) 661-1739 | hhunter@hhgus.com |
| Brian Todd | (651) 369-8082 | brian@hhgus.com |
| Lisa Price | (651) 386-3147 | |
| Freddy Juarez | | |

**Review counts found (verify):** Google 775+ (their site) vs. 560+ (another listing); Zillow 320+; Birdeye 1,141 at 5.0 stars.

**Next: Step 3.** Study nevadarealestategroup.com's look and feel, then build the home page (skyline hero, search bar, stats, reviews, team) and share a preview link.

## Step 3 progress (2026-09-26)

**Built:** Astro home page (`src/pages/index.astro`), styled after nevadarealestategroup.com (espresso `#2B221A`, cream `#F7F4EE`, gold `#D4B27C`; Cormorant Garamond / Fraunces headings, Barlow body, Mulish buttons). Preview: `npm run build`, then `node scripts/make-preview.mjs <dir>`.

**Team (`src/data/team.json`):** all 39 people from /team-page, with name, title, phone, email and license number copied from each profile. 26 bios are verbatim; the other 13 profiles have no bio. Headshots are saved in `public/team/`.

**Reviews (`src/data/reviews.json`):**
- Google: 5.0 stars, 841 reviews (Maps listing, 2026-09-26). Collected 78 verbatim; 55 have full text. The rest were cut off by Google's "More" link and are flagged `textComplete: false`, so they never display.
- Zillow: 54 verbatim 5-star reviews, taken from huerkamphomegroup.com/testimonials, which imports them from Zillow with each review's URL. zillow.com blocks automated access, so these haven't been re-checked on Zillow directly. The site template adds "…" to every review; that was removed and flagged.
- The home page shows 4 Google and 2 Zillow reviews: complete text, 5 stars, short enough to fit a card.

**Hero photo:** "Downtown Minneapolis skyline across the Mississippi River" (August 2026) by Guywelch2000, CC BY 4.0, from Wikimedia Commons. It replaced the 2009 "Minneapolis Moonlight Skyline" in October 2026 because it is much sharper. In October 2026 the power lines crossing the skyline were removed (at Jason's request) with `scripts/remove-power-lines.py`; the unaltered original is in `photos/`. It is credited in the footer (noting the edit, as CC BY requires), with details in `public/hero/CREDITS.md`. `scripts/make-hero.py` makes the site sizes. Unsplash and Pexels block automated access, so their photos can only be used if someone sends the photo link.

**Confirmed by Jason (2026-09-26):** founding year 2002; main phone (612) 843-9620, the Google listing number (2026-09-27; replaces 612-502-SOLD on the new site); hero photo approved; roster of 39 (32 agents, 7 staff) confirmed accurate; Ramsey ELP 15+ years confirmed.


## Step 3 core pages (2026-09-27)

- Shared layout `src/layouts/Base.astro` (header, footer, form handling) and business details in `src/data/site.ts`.
- Pages: `/buy`, `/sell`, `/invest`, `/ramsey`, `/contact`. Text sources are listed in `docs/content-sources.md`.
- Every form shows "Online forms are still being connected" plus the phone and email until step 4 connects Follow Up Boss.

**Questions for Jason:**
- Ken Rife's "Learn More" link on the current site goes to mutualmortgage.com/loan-officer/jhuerkamp/. Which link should the new site use?
- Office hours for the Contact page (blank on the current site).
- Ramsey may have rules for how Endorsed Local Providers describe the program; please have the Ramsey page checked against them.
- Review the new text on Invest and Ramsey ELP.

## Communities and Lake Homes (2026-09-27)

Jason asked for the top 30 Twin Cities communities and a Lake Homes page that work like nevadarealestategroup.com, with the same mapping. Decisions: the proposed 30 (his 12 current community pages plus the 18 largest remaining metro cities), MapTiler maps, Netlify previews.

**How Nevada does it (studied 2026-09-27):** MapLibre GL maps with MapTiler imagery. The communities hub has a hover-to-highlight map plus a full directory. Each community page has a location map beside an "at a glance" panel (MLS market numbers and local facts), followed by about 25 data sections. We rebuilt the same features with our own code and text.

**Built:**
- `/communities`: hover map of all 30 (click opens the city), directory by area with a name filter, and a Lake Homes band.
- `/communities/<city>` × 30: map zoomed to the city (others clickable), at-a-glance panel, distance tiles, new-listing alert form, "by the numbers", nearby communities, verbatim reviews that name the city, and a contact form.
- `/lake-homes`: map of 8 lakes (Minnetonka, White Bear, Waconia, Forest, Prior, Crystal, Marion, Orchard), a card per lake (acres, county, shoreline cities linked to community pages), and a lake-listing form.
- Data (public domain, rebuildable): `scripts/build-communities.py`, `scripts/build-lakes.sh`. Census 2024 boundaries, water areas and population estimates.

**Waiting on:**
- MapTiler key: the Flex plan (about $30/month; the free plan is non-commercial only). Until then maps use free OpenFreeMap imagery. Set `PUBLIC_MAPTILER_KEY` in Netlify.
- Netlify: connect the GitHub repo (`netlify.toml` is ready). Maps don't show in the claude.ai preview, which blocks outside map imagery.
- MLS feed (step 7) for median price, active listings, price per square foot, days on market and live listings.
- The rest of Nevada's sections (schools, crime, builders, ZIP-code market tables) need data providers; decide which to pay for.
- The DNR LakeFinder site is blocked from this build environment, so lake depth and official DNR acreage are linked, not shown.

## Community pages rebuilt to match Nevada's city pages (2026-09-27)

Nevada's Henderson page has 30 sections. Ours now follows the same order:

| Nevada section | Ours | Data |
|---|---|---|
| Hero with byline and update date | Yes | — |
| Key takeaways | Yes | Census |
| Homes for sale, price ranges, browse by type | Layout built, waiting on MLS | MLS (step 7) |
| New-listing alerts | Yes (form) | — |
| Living in: answer, map, at a glance, drive tiles | Yes | Census, OSRM |
| Who lives here (vs county and state) | Yes | ACS 2020–2024 |
| How fast is it growing | Yes (chart) | Census estimates 2020–2024 |
| Schools, crime | Yes | TIGER school districts; MDE and FBI links |
| Market by ZIP code | Yes (MLS columns pending) | Census ZCTA, ACS |
| Outdoor amenities | Lakes only | TIGER water |
| Getting around | Yes | ACS, OSRM |
| Economy | Yes (where residents work) | ACS C24050, B23025 |
| Compare with nearby cities | Yes (3 nearest by drive) | Census, OSRM |
| Monthly cost | Yes (calculator; visitor enters rate, tax, insurance) | ACS median value as starting price |
| Who should buy, verify before moving | Yes | Minnesota disclosure and point-of-sale items |
| Open houses | Call-to-action until MLS | MLS |
| Closing time, FAQ, people also ask | Combined FAQ with schema.org markup | Census and general guidance |
| Client reviews | Yes, when a review names the city | Verbatim Google and Zillow |
| Why us, talk to an expert, nearby communities | Yes | Team data, OSRM |

**Not built, and why:** submarket comparison, top builders, weekend guide, and neighborhoods A–Z need MLS data or local knowledge we don't have verified. Parks and trail totals were left out because the Census landmark files are too incomplete (for example, no parks listed for Burnsville).

**For Jason to review:** the FAQ answer on closing time (30–45 days financed) and the "verify before moving" list.

Data build: `scripts/build-community-details.py` (ACS 2024 5-year, TIGER 2024, 2020 ZCTA relationship file, OSRM). Chart color validated with the dataviz palette checker: #a36c16 light, #bd8730 dark.

## All metro cities plus southern Minnesota (2026-09-27)

Jason asked for every city in the seven-county metro plus Owatonna, Dundas, Le Sueur, Faribault and Northfield.

- **149 community pages**: every incorporated city (not townships) with any part in Anoka, Carver, Dakota, Hennepin, Ramsey, Scott or Washington County (145, including Northfield), plus Owatonna, Dundas, Faribault and Le Sueur. The list comes straight from Census data in `scripts/build-communities.py`, so none are hand-picked.
- **Areas**: Minneapolis & Saint Paul; North, East, South and West Metro by compass direction from a point between the downtowns; Southern Minnesota for Northfield, Dundas, Faribault, Owatonna and Le Sueur.
- **Drive times**: `scripts/fetch-drive-times.py` (light-traffic times to the four landmarks, and to each city's six closest cities).
- **Census reporting caps** shown as "+" (e.g. Minnetonka Beach median home value $2,000,000+), with no percentage comparison. Cities under 2,500 people carry a note that survey figures have wide margins of error.
- Credit River and Empire became cities after 2020, so the 2020 ZIP relationship file doesn't cover them; their ZIP section is hidden.
- The map outlines load from one shared file so the 149 pages stay light.

Rebuild order: `build-communities.py` → `fetch-drive-times.py` → `build-community-details.py` → `npm run build`.

## Rebrand after markzproperties.com (2026-10-22)

Jason asked to model the site on markzproperties.com, replace that team's branding with Huerkamp Home Group's, and push hard on SEO, speed, IDX, blog and YouTube.

**Findings:** Mark Z's site and Huerkamp Home Group's current site both run on **Ylopo**. HHG already has Ylopo home search at search.huerkamphomegroup.com. IDX decision pending (Ylopo vs. our own MLS Grid search); meanwhile every "Search homes" button reads `site.searchUrl` in `src/data/site.ts`, set to the Ylopo search.

**Done (step 1 of the new plan):**
- Brand: HHG logo from the current site (`public/brand/`: logo, header mark, light-on-dark versions, favicon). Colors from the logo: crimson #D11241, charcoal #4C4D4F, on cream #F9F6F1 / sand #F2EBE3 with near-black bands. Cormorant Garamond (matches the logo serif) and Figtree. Light theme only, like Mark Z.
- Header: dark utility bar (Ramsey ELP, brokerage, phone), cream header with logo, drop-down menus, red "Free Home Valuation" button, **phone menu**. Large footer with link columns and legal lines.
- Home page in Mark Z's order: hero with Jason & Brooke, "the record" stat cards (each with a source), home search, seven-county map, seller programs, marketing, reviews, team preview, Ramsey, FAQ, contact. RealEstateAgent + FAQ structured data, canonical and Open Graph tags on every page.
- New `/team` page with all 39 people, titles and bios.

**Still needed from Jason:** hero-quality photos (Jason/Brooke, office, team), real homes-sold and sales-volume figures and any rankings (with sources), which seller programs HHG offers (cash offer confirmed on the current site; guaranteed sale?), YouTube channel link, IDX decision.

**Next steps:** IDX hookup, technical SEO (sitemap, robots, structured data everywhere, 301 redirect map from the current site), speed work, blog (with migration of current posts), YouTube section.

## SEO and speed (2026-10-22)

**Speed** (Lighthouse, phone settings, local build): home 55 → 98, Burnsville 79 → 98, Team 88 → 99; layout shift 0 on all three. Accessibility, best practices and SEO all 100.
- Skyline photo served as WebP at 640–2560 px wide, so a phone downloads ~25 KB instead of 400 KB (`src/components/Skyline.astro`).
- Team headshots served as 320/500 px WebP (`src/components/TeamPhoto.astro`; originals kept as fallback).
- Map library (~1 MB plus its stylesheet) now loads only when a map scrolls near the screen (`src/scripts/area-map.ts`).
- Fonts self-hosted from npm (@fontsource) instead of Google Fonts; the four used at the top of pages are preloaded so headings don't jump.
- Page CSS is now a cached file instead of copied into all 159 pages (pages dropped from ~210 KB to ~100 KB).
- Long-term caching headers for built files and photos (`public/_headers` for Netlify, `headers` in `vercel.json`).

**SEO**
- **Same addresses as the current site**: pages build as `team.html` and are served at `/team` (no trailing slash), matching Squarespace, so existing rankings carry over. Canonical tags use that form.
- `sitemap-index.xml` (all 159 pages) and `robots.txt` (everyone, including AI assistants, may read the site).
- **301 redirects** for every old page that changed address, e.g. `/testimonials` → `/reviews`, `/team-page` → `/team`, `/communities/burnsville-real-estate` → `/communities/burnsville`. The list lives in `redirects.json`; after editing it run `node scripts/write-redirects.mjs` to update `public/_redirects` (Netlify) and `vercel.json`.
- Structured data on every page: business (RealEstateAgent with address, phone, logo, Google listing, Facebook) and WebSite; breadcrumb trail on every inner page; FAQ on home and community pages; team members on /team. No review-star markup: Google ignores (and can penalize) star ratings a business publishes about itself.
- New `/reviews` page: all 109 complete reviews (55 Google, 54 Zillow), verbatim.
- Branded share image (`public/brand/og-default.jpg`, 1200×630) for Facebook, texts and LinkedIn.

**Before launch (DNS switch):**
- **Blog**: the current site has 382 posts at `/blog/YYYY/MM/DD/slug`. They must be migrated at the same addresses before launch or they'll 404. This is the next step.
- Submit `https://www.huerkamphomegroup.com/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
- Update the website link on the Google Business Profile if it changes.

## Blog (2026-10-22)

All 361 Squarespace posts imported at their exact old addresses with 2,339 images (WebP, 80 MB in `public/blog/`). New blog: list with categories and page numbers, post pages with author box, call-to-action and related posts, RSS feed, BlogPosting/VideoObject structured data, fast YouTube players, newest posts on the home page, "Blog" in the menu. Every one of the 406 addresses in the old sitemap now resolves (page or 301). Lighthouse (phone): blog list 97, posts 97–100. How to add posts: `docs/blog-guide.md`.

## IDX decision: Ylopo (2026-10-24)

Jason chose to keep the team's **Ylopo** home search (search.huerkamphomegroup.com) as the IDX for now. A custom search on our own NorthstarMLS feed can replace it later; every link is built in one file, `src/data/ylopo.ts`.

- **Deep links** (format read from the search site's own URLs): `s[locations][i][city]` + `[state]=MN`, or `s[locations][i][postalCode]`; filters `s[minPrice]`, `s[maxPrice]`, `s[beds]` (minimum), `s[propertyTypes][0]` = house | townhouse | condo; sorted newest first.
- **City names** in `src/data/ylopo-cities.json`, checked against Ylopo's autocomplete: "St." towns are "Saint …" in the MLS (West Saint Paul, etc.). Deephaven, Tonka Bay, Woodland, Lexington, Landfall, Birchwood Village, Coates and Miesville have no listings under their own name (homes use a neighbor's mailing city), so they link to their ZIP codes with a note. Empire, Minnetonka Beach and Credit River get a "tell us and we'll set up a search" note instead.
- **Community pages**: "See all homes for sale" button, price-range cards, home type and bedroom shortcuts, at-a-glance link, and a "Homes for sale" link per ZIP. The MLS placeholders (list price, days on market) were removed; Ylopo doesn't provide those figures to embed.
- **Lake Homes**: each lake links to a search across its shoreline cities.
- **Buy page search box**: a typed city name or ZIP goes straight to those listings; anything else opens the search home page.
- The old Squarespace site also linked "Get Cash Offer", "Sell Your Home" and "Home Valuation" to Fello landing pages (huerkamphomegroup.hifello.com). Ask Jason whether the new site's seller forms should feed Fello or Follow Up Boss.
- Link check (2026-10-24): all 146 city/ZIP links open the right search. Ten very small cities (Dellwood, Hilltop, Lake Saint Croix Beach, Lakeland Shores, Lilydale, Medicine Lake, New Trier, Pine Springs, Spring Lake Park, Saint Marys Point) had 0 homes for sale that day; their links are still correct and let visitors save the search for alerts.

## Forms → Follow Up Boss (2026-10-24)

All nine website forms post to `/api/lead` (`netlify/functions/lead.mjs`), which sends a Follow Up Boss **event** (`POST /v1/events`, the endpoint FUB recommends for website leads, so lead routing and action plans run). The key is the Netlify secret `FUB_API_KEY` (Production, Deploy Previews, Branch deploys).
- Form types, FUB event types and tags are in one table at the top of `src/lib/lead.mjs`. Every lead is tagged "Website"; seller forms (and any form where the visitor picks "Sell…") are **Seller Inquiry** events tagged "Seller lead" for Fello to pick up; community forms add the city name; Ramsey, lake, investor and lender (Ken Rife) forms add their own tag.
- Test leads (first name "Test" or an @example.com email) are tagged "TEST – website".
- Spam: hidden honeypot field and a minimum time on page; bots get a silent "OK".
- Jason's decision: website forms go to Follow Up Boss; Fello receives sellers through its existing Follow Up Boss integration. Confirm which tag/stage Fello imports and add it to the seller forms if it isn't "Seller lead".
- Netlify only. (Vercel would need its own function; we're not using Vercel.)

## Closer to Mark Z, Ferrari red, live listings (2026-10-24)

- **Ferrari red** (Rosso Corsa #D40000) everywhere, including the logo files; #FF5A4F for small red text on dark sections (5.5:1).
- **Live MLS listings** with Ylopo's official results widget (`src/components/YlopoListings.astro`), the same one Mark Z uses: the team's own listings ("Homes we're proud to represent", sideways scroll) and "Homes for sale in our markets" on the home page, and the newest 12 listings on each community page. The widget script loads only when listings scroll near view, so speed scores held (home 96, Burnsville 98, Team 99). Listings swipe sideways on phones.
- **Red facts strip** under the hero (scrolls slowly; stops for people who turn off motion).
- Home page order now follows Mark Z: hero → red strip → the record → featured listings → map → homes for sale → seller programs → marketing → reviews → team → Ramsey → FAQ → blog → contact.
- **/llms.txt**: plain-text guide for AI assistants, built from the site's data.
- The widget checks the site's address; it works on www.huerkamphomegroup.com. If it shows "Loading listings…" on the Netlify preview address, that's Ylopo limiting it to the real domain.

## YouTube: Living in Minneapolis (2026-10-24)

Channel: **Living in Minneapolis Minnesota**, https://www.youtube.com/@livinginminneapolis (channel ID UCQrRaA9zK3E-NhBLgXVSGhg), 155 videos + 147 Shorts at import. Data: `src/data/youtube.json`.
- **/videos**: library by topic (market updates, suburbs & neighborhoods, home tours, living in Minnesota) plus Shorts that play on the page.
- **/videos/<slug>**: a watch page for each long video that has a description (60 at import). The video is the main content, with the cleaned description (the contact and subscribe text repeated on every video is removed), chapters, and VideoObject structured data with chapters as "key moments" (Clip), the cities it covers, upload date, length and views.
- **Community pages**: "Watch: <city> on video" when a video names the city (39 of 149 at import). Names that are also common words (Ramsey, Grant, Independence…) must appear as "<name>, MN".
- **Home page**: latest 3 videos and 10 Shorts. Menu: Videos (with Blog under it). YouTube added to the business's `sameAs` and to /llms.txt.
- **Import**: `scripts/build-youtube.py` built the set (channel lists from yt-dlp; descriptions for 297 of 302 videos from vidIQ). **144 watch pages.** vidIQ's tool rejects 5 videos (a date-format bug on its side): -eypwoixOBQ, qWZbTfdJu8k, qMx9zng5gK8, gtP3DUawegc, vQ3IvV_1oOI; they show in the library and play from YouTube. Videos titled with "(delete)" are skipped. Long videos whose description is only contact/subscribe text have no watch page.
- **Weekly**: `python3 scripts/update-youtube.py` reads the channel's public feed (newest 15 uploads, with full descriptions), adds new videos and watch pages, and refreshes view counts. The daily website refresh routine (below) runs it every morning and publishes the update.
- **Tracking numbers (Jason, 2026-10-24)**: YouTube uses (952) 900-3025 and team@hhgus.com on purpose, to track YouTube leads. The website strips them from video descriptions so website leads keep the website's number. Google Business Profile, directories and the website stay on (612) 843-9620.

## Retiring the Luxury Presence site (huerkamphomes.com, ends December)

- **Which site is which:** huerkamphomes.com is the Luxury Presence site. www.huerkamphomegroup.com was the Ylopo-made Squarespace site, which this site replaces, and search.huerkamphomegroup.com is Ylopo home search (it stays).
- **Why it matters:** every Living in Minneapolis video description links to huerkamphomes.com/youtube-form or /webinarsignup. Those links would break in December.
- **The fix:** keep the huerkamphomes.com domain, then add it (and www.huerkamphomes.com) to this Netlify site as a domain alias. `public/_redirects` already sends every old address to its new page with a permanent (301) redirect:
  - /youtube-form and the webinar pages go to /youtube-form. That page is not shown in Google. Its leads land in Follow Up Boss with the source "YouTube - Living in Minneapolis" and the tag "YouTube", and it shows the YouTube tracking phone (952) 900-3025 and team@hhgus.com.
  - The 27 neighborhood pages go to their community guides.
  - All 387 old blog posts go to the same post here, matched by address or by title.
  - Agent pages go to /team, and listing pages go to Ylopo search.
  - Anything else goes to the home page.
- **Blog posts copied over (October 2026):** 46 posts existed only on Luxury Presence. They were copied with their text as written and the same address (/blog/<slug>), along with their 75 images. Most are local stories, now in the new "Neighborhoods" category. The other 51 Luxury Presence-only addresses were posts already on this blog under a different address, so they redirect to those posts. To re-run the copy: `scripts/import-luxury-presence-blog.py`.
- **Domain:** the team controls huerkamphomes.com. When the new site launches, add huerkamphomes.com and www.huerkamphomes.com in Netlify under Domain management, then point the domain's DNS at Netlify. Do both before Luxury Presence shuts off in December.
- **To rebuild the rules:** `python3 scripts/build-lp-redirects.py <saved LP sitemaps>` and then `node scripts/write-redirects.mjs`.
- **Text-message consent:** every form now has an unchecked, optional text-message consent box and a privacy-policy link. Checking the box adds the "SMS consent" tag in Follow Up Boss.

## Keeping the whole site current (automatic routines)

Google and AI search favor sites that keep adding real, useful, accurate information. Faking freshness, like changing dates or shuffling words without adding anything, is treated as spam. So every scheduled run either makes a real change or does nothing.

| Routine | When (Central time) | What it does | Publishes? |
|---|---|---|---|
| Daily website refresh | Every day, 6:38 am | Adds new YouTube videos and Shorts, plus their watch pages. Tags new blog posts to their towns. Checks links, the sitemap and llms.txt. Does nothing if nothing changed. | Yes, straight to the live branch |
| Weekly local story (for approval) and SEO upgrade | Wednesdays, 7:53 am | Writes one new local story about a core town, with every fact linked to a public source and fact-checked. Also makes one small SEO/AI improvement for the whole site. Both go on a review branch (claude/story-DATE), and Jason gets the full text and sources in a notification. | Only after Jason replies "publish" in that routine's conversation |
| Monthly backlinks and citations | 15th of the month, 7:32 am | Checks that every listing (Google, Bing, Apple, Zillow, Realtor.com, KW, Ramsey, chambers and more) shows the same name, address and phone and links to this site. Finds new links and mentions, lists 5-10 real link opportunities, and drafts outreach emails for Jason to send. White-hat only: never buys links or posts on his behalf. | No. The report goes on a backlinks branch. |
| Monthly SEO checkup | 1st of the month, 7:39 am | Full check of speed, links, schema, listings and data freshness. Writes a report in docs/checkups/. | No. Fixes wait on a checkup branch for approval. |

- Each page's "Updated" date and its sitemap date come from real changes only (src/lib/lastmod.mjs).
- The routines need this repository attached in claude.ai, under Routines, then each routine's settings.

## Market reports (/market) and agent pages (/team/<name>)

**Market reports**
- **Source:** Minneapolis Area REALTORS® "Local Market Update", one report per city per month (https://maar.stats.10kresearch.com/reports/lmu). The data is from NorthstarMLS and the reports are produced by ShowingTime Plus. New months come out around the 7th to 10th.
- **Script:** `scripts/update-market.py` keeps only the numbers, in `src/data/market.json`.
  - It covers the 16-county region and 143 community guides. Owatonna, Le Sueur, Dundas and Landfall have no report.
  - Credit River and Empire are listed as "Township".
  - The first run backfilled 12 months, which gives 24 months of monthly history.
- **Pages:**
  - /market: the region plus a table of every city.
  - /market/<city>: the 12-month and single-month tables, a comparison with the region, charts, a plain-English summary built only from the numbers, quick answers, and Dataset and FAQ schema.
  - Each community guide shows a "home prices and sales" box linking to its report.
  - llms.txt lists every city's median price, change and homes sold.
- **Rules:**
  - Every page names the source, the month and the "current as of" date, and links to the original report.
  - The 12-month numbers lead, because single months swing when few homes sell. A warning appears under 10 sales.
- **Updates:** the daily website refresh runs the script every morning. It does nothing until a new month is published, then updates every city that day.

**Agent pages**
- Every team member has a page at /team/<name>, the same address their profile had on the old site.
- Each page shows their bio, title, license and contact details word for word from their profile. It also shows complete, word-for-word reviews that name them (`src/data/agents.ts` matches full names, or first names no one else on the team shares) and the community guides for towns named in their bio.
- The contact form tags the lead "Agent page" and "Asked for <name>" in Follow Up Boss.
- Pages with no bio and no reviews stay out of Google until a bio is added to `src/data/team.json`.

## Minneapolis and Saint Paul neighborhood pages (/communities/minneapolis/<name>, /communities/saint-paul/<name>)

- **What's covered:** 84 Minneapolis neighborhoods (the city's official map, leaving out 3 industrial areas) and Saint Paul's 17 planning districts. Saint Paul's market reports and district councils use the districts. Both city guides have a "Neighborhoods" section with a map and a list. /market has a table for each city.
- **Market:** each neighborhood has its own Minneapolis Area REALTORS® Local Market Update, with the same numbers, rules and source as the city reports. `scripts/update-market.py` includes neighborhoods, keyed like `minneapolis/linden-hills`, and the daily refresh updates them with the cities.
- **Census:** US Census ACS 2020–2024 estimates for the block groups mostly inside each neighborhood. Counts are added up, and medians are estimated from ranges. The pages say these are approximate. Built by `scripts/build-neighborhoods.py`; its header explains the inputs.
  - The Minneapolis neighborhoods add up to 421,790 residents against the city's ACS total of 427,246.
- **Homes for sale:** 77 neighborhoods match a Ylopo neighborhood exactly, so they get the listings widget and a neighborhood search. The other 24 link to Ylopo's map, zoomed to the neighborhood. Run `scripts/match-ylopo-neighborhoods.py` to redo the matching.
- **Videos and stories:** a neighborhood shows a video or post only when it names the neighborhood. Names that are also ordinary words (Field, Page, Central, Downtown…) must appear with the city's name.

## Lake homes (/lake-homes and /lake-homes/<lake>), rebuilt October 2026

- **Which lakes:** every named Minnesota DNR lake of 10 acres or more touching one of our community guides: 442 lakes in 108 communities.
  - Outlines, acreage, shoreline miles and DNR lake numbers come from the DNR's lake map (DNR Hydrography), so the figures match the DNR. A lake the DNR splits into bays (Lake Minnetonka, 14,206 acres) is one lake; Upper and Lower Prior Lake are two, as the DNR counts them.
  - Everyday names ("Lake Minnetonka", "Bde Maka Ska") come from the Census water map where they match the DNR name.
  - Rivers, creeks and ponds are left out.
  - Rebuild: `python3 scripts/fetch-dnr-lakes.py <dnr.geojson>`, then `scripts/build-lake-list.py <dnr.geojson> <tiger folder>`, then `scripts/build-lake-shores.py`. The script headers explain the inputs.
- **Lakefront homes:** Ylopo's MLS "Lakefront" filter (`s[amenities][0]=sa_has_waterfront_lake`).
  - **Each lake's search:** a map around the lake (400 m margin) with its main shoreline city named, because Ylopo's map stalls on phones without a city. It works on phones and desktop.
  - **"Every lakefront home":** a list search across all 101 lake communities, because a map that large stalls on phones. About 235 homes when tested.
  - **Listings widget:** it accepts the lakefront filter, but not a map area, so it shows lakefront homes in the lake's shoreline communities.
- **Pages:**
  - The hub has the lakefront search, newest lakefront listings, a map of all 442 lakes, the 22 lakes of 500+ acres, and a searchable directory grouped by area.
  - Each lake page has its map, lakefront search and listings, shoreline communities with their median sale price, nearby lakes, quick answers, LakeBodyOfWater schema and a lead form tagged with the lake.
  - Lakes under 50 acres have pages but stay out of Google.
- Community guides list every lake touching the city and link to its page.

## MLS listings from Repliers (preview, October 2026)

Ylopo stays the main home search, ads and follow-up. Repliers (NorthstarMLS data) adds listings shown on our own pages.

- **Key:** `REPLIERS_API_KEY` in Netlify (secret, set for Production, Deploy Previews and Branch deploys). Never in the repo or chat.
- **`/api/listings`** (netlify/functions/listings.mjs, trimming in src/lib/repliers.mjs), cached 15 minutes:
  - `?lake=<slug>`: active homes for sale inside the lake's shoreline zone (Repliers is asked for a plain rectangle around the zone, since a detailed outline returned too few homes, and the function keeps the map points inside the zone itself) (200 m out from the water, src/data/geo/lake-shores.json from scripts/build-lake-shores.py), kept only when the MLS marks them lakefront.
  - `?mls=<number>`: one listing.
  - `&debug=1&key=<report passcode>`: counts per shoreline zone, the MLS's total, photos, and the MLS's water fields (to check the lakefront filter).
- **Go-live switch:** listings are served to the site only when `MLS_PUBLIC=yes` is set in Netlify. Set it only after the NorthstarMLS IDX license is approved; until then the lake sections stay hidden.
- **Lake pages:** a "Homes for sale on <lake>" section above the Ylopo widget. It stays hidden if the feed isn't working; add `?mls-debug` to the page address to see why ("not-authorized" usually means the NorthstarMLS license isn't approved yet).
- **Listing page:** /homes/listing?mls=<number> (noindex for now) with photos, facts, listing brokerage and a "Listing page form" lead to Follow Up Boss.
- **Display rules:** the notice in src/data/mls.ts and "Listing courtesy of <brokerage>" on every card and listing. Confirm the exact wording and any required logo with the broker's NorthstarMLS IDX license.
- **Next:** listing pages at their own addresses (/homes/<address>) that search engines can read, and listings inside each Minneapolis and Saint Paul neighborhood boundary.

## Area guides (/guides and /guides/<guide>), October 2026

- **What they are:** lists that answer the questions buyers ask Google and AI assistants, each ranking our community guides (and, for market lists, Minneapolis and Saint Paul neighborhoods) by one sourced measure:
  - homes under $400K, highest-priced markets, fastest-selling, rising prices, most homes to choose from (Minneapolis Area REALTORS® / NorthstarMLS market reports)
  - closest to downtown Minneapolis and to downtown Saint Paul (OpenStreetMap drive times, Census commute)
  - most lakes (Minnesota DNR lakes)
  - newest homes (Census median year built)
- **Fair housing:** places are ranked only by facts about the homes, the market and the location, never by who lives there (no "best for families", "safest", schools rankings or demographics). Keep it that way when adding guides.
- **Small samples:** market lists need 30+ sales in 12 months for a city and 20+ for a neighborhood (rising prices: 50+ and cities only).
- **Updates:** built from the same data files as the rest of the site (src/data/guides.ts), so they change when the monthly market data or the community data changes. Each page has ItemList and FAQPage schema, a "Area guide form" lead to Follow Up Boss, and is listed in llms.txt.

## Results report (/report), October 2026

A private page (noindex, not linked, left out of the sitemap) showing what the site and channels do for the business:
- **Leads and Google search (live):** loaded from `/api/report` (netlify/functions/report.mjs, logic in src/lib/report.mjs) after the passcode. Only counts leave the server.
  - Leads: Follow Up Boss people whose source is the website or the YouTube form (last 7/30/90 days, per week, by form tag). Uses the existing `FUB_API_KEY`.
  - Google: Search Console clicks, impressions, top searches and pages (28 days vs the 28 before, 16 weeks). Needs a Google service account added to the Search Console property.
  - Netlify settings: `REPORT_KEY` (the passcode), `GSC_CLIENT_EMAIL`, `GSC_PRIVATE_KEY`, optional `GSC_SITE` (default `sc-domain:huerkamphomegroup.com`).
- **Weekly data** in src/data/report.json, appended by the "Weekly results report" routine:
  - `visibility`: the same 10 buyer/seller searches each week; does our site come up, are we named elsewhere, who ranks first. Never edit past entries.
  - `social`: follower/view/post counts per platform (YouTube from vidIQ; other platforms once their handles are known).
- **Us vs. the portals** (`rankings` in report.json): the same 15 "homes for sale", "housing market" and "real estate" searches each week, with the position of our first result and of Zillow, Homes.com, Realtor.com and Redfin (first 10 results). Baseline 2026-10-26: Redfin ranks first on most "homes for sale" searches with narrow pages per city (price bands, townhouses, new construction, waterfront); the new site isn't live yet.
- **The website:** page counts by type and pages with a real change in the last 7/30 days (the sitemap's dates).

## Agent sites (/team/<agent>, /team/<agent>/sell, /team/<agent>/buy), October 2026

Every licensed agent (32) has a site inside the main site, like Sierra Interactive's agent subsites, so every link to an agent also strengthens huerkamphomegroup.com.
- **Home** (/team/<agent>, indexed when the agent has a bio or reviews): photo, bio, license, verbatim reviews, the areas they serve with this month's market numbers, newest listings there, contact form, and links to their Sell and Buy pages.
- **Sell** (/team/<agent>/sell) and **Buy** (/team/<agent>/buy): home-value form and new-listing alerts with searches in their areas. Noindex: they're near-identical for every agent.
- **Areas:** `src/data/agent-sites.json` (`areas`, community slugs) if set; else towns named in their bio (plus the nearest communities when the bio names only one or two); else the team's core south-metro areas (`defaultAreas`).
- **Lead routing:** forms on an agent's pages send `agentSlug`. A visitor who opens an agent's pages (or any link with `?agent=<slug>`) is "working with" that agent for 30 days: a bar shows the agent at the top of every page, and every form anywhere on the site carries the agent. `src/lib/lead.mjs` then assigns the lead to that agent in Follow Up Boss (`person.assignedTo`, the agent's name or `fubName` in agent-sites.json) and tags it "Team lead" and "Agent site: <name>". Only licensed agents on the team can be assigned. Visitors can dismiss the bar (×), which clears it.
- **Share links:** agents share huerkamphomegroup.com/team/<their-slug>. For any other page, add `?agent=<their-slug>` (e.g. /lake-homes?agent=jason-oliver).
