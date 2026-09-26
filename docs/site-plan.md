# Huerkamp Home Group — New Website Plan

_Status: Step 2 (plan) — awaiting approval_

## Decisions so far

| Topic | Decision |
|---|---|
| Existing sites | Keep huerkamphomegroup.com, huerkamphomes.com and findmyminnesotahouse.com live for now. The new site is built on a preview address and replaces nothing until approved. |
| CRM | Follow Up Boss. Every form, home inquiry and saved search is sent to FUB with its source. |
| Home search (IDX) | Replace the current search with a new one built on the NorthstarMLS data feed. |
| Budget | Up to $500/month, aiming well below that to protect profitability. |
| Look and feel | Modeled on nevadarealestategroup.com, with a Minneapolis skyline photo in the hero. |

## Business facts (confirm before launch)

- Team founded 2002 by Jason Huerkamp; Keller Williams Preferred Realty
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
