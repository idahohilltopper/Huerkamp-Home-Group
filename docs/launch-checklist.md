# Launch checklist: www.huerkamphomegroup.com

The new site replaces the Ylopo-built Squarespace site at www.huerkamphomegroup.com. Ylopo home search stays at
search.huerkamphomegroup.com. Later, the Luxury Presence site (huerkamphomes.com) points here too.

**Dry run (October 2026).** Every old address was run through the new site's redirect rules:
- all 406 old Squarespace pages and all 557 Luxury Presence pages (on both huerkamphomes.com and www) end on a real page
- `node scripts/check-launch.mjs` repeats the test, and `--live` tests the real site after the switch
- Google's page test scores 99–100 for speed, 100 for accessibility and 100 for SEO on every page type

## What we found

| Item | Today | What it means |
|---|---|---|
| huerkamphomegroup.com | Registered at **GoDaddy**; DNS at GoDaddy | The switch happens in GoDaddy's DNS settings |
| Its renewal date | **December 30, 2026** | Turn on auto-renew now. If it lapses, the site and email stop |
| Website records | `@` A → 198.185.159.144 / .145, 198.49.23.144 / .145; `www` CNAME → ext-cust.squarespace.com | These change at launch; keep this list to undo |
| Email records | MX → smtp.secureserver.net, mailstore1.secureserver.net | **Do not touch.** Email keeps working |
| search.huerkamphomegroup.com | CNAME → widget-portal.com (Ylopo) | **Do not touch.** Home search keeps working |
| huerkamphomes.com | Registered at GoDaddy (renews Sept 17, 2027); DNS at **Cloudflare**, likely Luxury Presence's account | You'll need Cloudflare access from Luxury Presence, or to move DNS back to GoDaddy |
| Tracking on the old Squarespace site | None found (no Google Analytics or Ads tags) | Nothing to lose at launch |
| Tracking on the Luxury Presence site | Google Analytics G-2BPB1VVGWK, Google Ads AW-962410994, Tag Manager GTM-T9SFQGHZ and GTM-N6RZMBSV | Add your own Analytics ID and Ads conversion label to the new site before launch |

## 1. Before launch day (Jason)

- [ ] **GoDaddy:** turn on auto-renew for huerkamphomegroup.com (expires Dec 30, 2026) and huerkamphomes.com.
- [ ] **Google Analytics:** send the GA4 Measurement ID (starts with `G-`) for a property you own. Check whether G-2BPB1VVGWK is yours or Luxury Presence's.
- [ ] **Google Ads:** send the conversion label for account AW-962410994, so website leads count as conversions.
- [ ] **Follow Up Boss test:** submit Test / Seller / test@example.com on the preview's Sell page and confirm it arrives.
- [ ] **Read-through:** look over the "New" text listed in docs/content-sources.md.
- [ ] **Pick the date:** a weekday morning, not right before a weekend. Allow about an hour.
- [ ] **Tell Ylopo:** the Squarespace "branded site" is being replaced and search.huerkamphomegroup.com stays. Ask them not to change the search subdomain's DNS, and to keep the Squarespace site running for two weeks as a fallback.

## 2. Before launch day (Claude)

- [ ] Add the Google Analytics and Ads tags once the IDs arrive, so form leads report as conversions.
- [ ] Run a final build, `node scripts/check-launch.mjs` and a full link check.

## 3. Launch day, in order (about 15 minutes of changes, then checks)

1. **Netlify:** Site configuration → Build & deploy → Branches → set **Production branch** to `claude/real-estate-website-build-9itecr`. That's the branch every routine publishes to. Wait for the production deploy to finish.
2. **Netlify:** Domain management → Add a domain → `www.huerkamphomegroup.com`. Set it as the **primary domain**, then add `huerkamphomegroup.com` as well (Netlify redirects it to www). Netlify shows the exact records to use.
3. **GoDaddy DNS for huerkamphomegroup.com:**
   - `www`: change the CNAME from ext-cust.squarespace.com to your Netlify address (`<site-name>.netlify.app`, shown in step 2).
   - `@`: replace the four Squarespace A records with Netlify's load balancer, **75.2.60.5**.
   - Leave MX, `search` and everything else alone.
4. **Netlify:** Domain management → HTTPS → wait until the certificate shows as issued (usually minutes, up to an hour).
5. **Claude:** run `node scripts/check-launch.mjs --live`. Every old address should end on a working page. Also send a test lead from the live site.

## 4. Right after launch (same day)

- [ ] **Google Search Console:** add a Domain property for huerkamphomegroup.com (verified with a TXT record in GoDaddy), submit `https://www.huerkamphomegroup.com/sitemap-index.xml`, and request indexing of the home page.
- [ ] **Bing Webmaster Tools:** import the site from Google Search Console and submit the same sitemap. ChatGPT search and Microsoft Copilot use Bing.
- [ ] **IndexNow (automatic):** after the first production deploy on the live domain, Netlify → Logs → Functions → `deploy-succeeded` should say "IndexNow: 4,7xx of 4,7xx submitted". From then on every deploy sends only the pages whose last-changed date moved. Bing Webmaster Tools → IndexNow shows what arrived. To pause it, set `INDEXNOW=off` in Netlify's environment variables. Key file: `/56ee55cf631cd22cfd6bfd56e35556fa.txt` (public by design).
- [ ] **Google Business Profile:** set the website to https://www.huerkamphomegroup.com.
- [ ] Update the website link on Facebook, the YouTube channel's About page, Zillow, Realtor.com, KW and the Ramsey ELP listing. The monthly backlinks routine will check these.

## 5. Luxury Presence site (huerkamphomes.com), before it shuts off in December

1. **Netlify:** add `huerkamphomes.com` and `www.huerkamphomes.com` as domain aliases. The redirect rules for every old Luxury Presence address are already in place.
2. **DNS (Cloudflare, or GoDaddy if you move it back):** point `@` and `www` to Netlify, using the records Netlify shows. Keep the `google-site-verification` TXT record.
3. **Claude:** run `node scripts/check-launch.mjs --live`. This covers every YouTube-description link (/youtube-form, /webinarsignup).
4. **Google Search Console:** in the huerkamphomes.com property, use **Settings → Change of address** to tell Google it moved to www.huerkamphomegroup.com.

## 6. If something goes wrong (undo)

Put the Squarespace records back in GoDaddy:
- `@` A: 198.185.159.144, 198.185.159.145, 198.49.23.144, 198.49.23.145
- `www` CNAME: ext-cust.squarespace.com

DNS changes take minutes to a few hours to reach everyone. Keep the Squarespace subscription for two weeks after launch before canceling.
