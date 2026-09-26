# Huerkamp Home Group — New Website Plan

_Status: Step 3 (design + home page) — built with real team, reviews and photo; awaiting review_

## Decisions so far

| Topic | Decision |
|---|---|
| Existing sites | Keep huerkamphomegroup.com, huerkamphomes.com and findmyminnesotahouse.com live for now. The new site is built on a preview address and replaces nothing until approved. |
| CRM | Follow Up Boss. Every form, home inquiry and saved search is sent to FUB with its source. |
| Home search (IDX) | Replace the current search with a new one built on the NorthstarMLS data feed. |
| Budget | Up to $500/month, aiming well below that to protect profitability. |
| Look and feel | Modeled on nevadarealestategroup.com, with a Minneapolis skyline photo in the hero. |

## Business facts (confirm before launch)

- Use 2002 as the founding year (the year Jason and Brooke joined forces; Jason started in 2001). Confirmed by Jason, 2026-09-26; Keller Williams Preferred Realty
- 14300 Nicollet Ct, Ste 208, Burnsville, MN 55306 · (612) 502-7653
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

**Hero photo:** Unsplash blocks automated browsers (BotStopper at difficulty 16), so its free license couldn't be confirmed. Used instead: "Minneapolis Moonlight Skyline" by Tony Webster, CC BY 2.0, from Wikimedia Commons, credited in the footer (details in `public/hero/CREDITS.md`). To switch to an Unsplash photo, send the photo link or an Unsplash API access key.

**Confirmed by Jason (2026-09-26):** founding year 2002; main phone (612) 502-7653 (612-502-SOLD); hero photo approved; roster of 39 (32 agents, 7 staff) confirmed accurate.

**Open questions:**
- Confirm 15+ years as a Ramsey ELP.
- The Google Business Profile lists +1 612-843-9620; update it to (612) 502-7653 if that is the main line.
