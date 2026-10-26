# Pre-launch check (October 26, 2026)

Run against a clean build of 1,537 pages (1,306 open to search engines).

| Check | Result |
|---|---|
| Build | Clean. One size warning for the map library (MapLibre), which loads only when a map scrolls into view. |
| Internal links | 0 broken (2 fixed: area guides linked to market reports for Hilltop and Mendota, which have no sales). |
| Old addresses | All 406 Squarespace and 557 Luxury Presence addresses land on a real page (`node scripts/check-launch.mjs`). |
| Forms | 14 form types, 903 forms on the site; every type builds a valid Follow Up Boss event; spam traps work. |
| Structured data | Every JSON-LD block parses. |
| Titles and descriptions | Every indexable page has a title, description, canonical and one h1. Titles over 70 characters drop " \| Huerkamp Home Group"; descriptions over 160 are cut at a word. Remaining long titles are the blog posts' own titles. |
| Images | None missing alt text; blog covers now use the post title. Empty alt only on logos and thumbnails beside their own text. |
| Private pages | /report, /homes/listing, /youtube-form and the 404 page are noindex and not in the sitemap. robots.txt allows everyone and points to the sitemap. |
| Browser pass | 22 key pages on phone (390 px) and desktop (1366 px): no sideways scrolling, no script errors, no missing files. Fixed: the Lake Homes map stopped on one lake (Lost Lake) whose DNR outline came with stray lines. |
| Lighthouse (phone) | Performance 94–100, Accessibility 100, Best practices 100 (96 only where blocked map tiles in the test setup log errors), SEO 100 on home, community, neighborhood, market, lake, guide, agent and blog pages. Fixed: a red link on dark bands (contrast) and imported posts that skipped heading levels. |

Left as is: two "Part 1 / Part 2" blog posts share a description; 34 old posts link to other sites over http.

# Second full check (October 26, 2026, after the comparison, market archive and homes-for-sale pages)

Run with `node scripts/audit-site.mjs` on three builds:
- the site as it is today: 7,027 pages, 4,265 open to search engines;
- the site with sample MLS listings in preview mode: 11,825 pages;
- the same in live mode: 6,277 open to search engines.

| Check | Result |
|---|---|
| Internal links | 861,755 checked; 0 broken. Fixed: 301 "previous/next month" links on the market archive pointed at months with no sales (no page). They now skip to the nearest month that has one. |
| Titles, descriptions, canonicals, h1 | Every indexable page has all four and exactly one h1, and no two pages share a title. Fixed: 396 comparison titles, 108 video titles and 1 lake title over 75 characters are now shortened. Left as is: 77 blog posts whose own headlines are long, and the two "Part 1 / Part 2" posts that share a description. |
| Headings | No skipped levels on any indexable page. |
| Structured data | Every JSON-LD block parses. |
| Images | None missing alt text. |
| Sitemap | 4,265 entries, all real and all indexable. Noindex pages are left out. |
| Old addresses | All 406 Squarespace and 557 Luxury Presence addresses still land on a real page. |
| Browser pass | 20 pages covering every new page type, on phone (390 px) and desktop (1366 px): no sideways scrolling, no script errors, no missing pages. |
| Lighthouse (phone) | Comparison, comparison table, monthly archive, monthly all-cities, homes-for-sale and listing pages: Performance 99–100, Accessibility 100, Best practices 100, SEO 100. |
