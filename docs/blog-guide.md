# Blog guide

The blog lives in `src/content/blog/`. Each post is one Markdown file (plain text with light formatting).

## Add a post

1. Copy any file in `src/content/blog/` and rename it, e.g. `lakeville-market-update-2026.md`.
2. Change the details at the top (between the `---` lines):

```yaml
---
title: "Lakeville Market Update: Spring 2026"
description: "What Lakeville home prices did this spring and what it means for buyers and sellers."   # ~150 characters, shown on Google
path: "lakeville-market-update-2026"      # the address: huerkamphomegroup.com/blog/lakeville-market-update-2026
date: 2026-04-15
author: "Jason Huerkamp"                  # or leave out for "Huerkamp Home Group"
categories: ["Seller", "Buyer"]
youtube: "https://www.youtube.com/watch?v=VIDEO_ID"   # optional: video shown at the top of the post
cover: { src: "/blog/lakeville-market-update-2026/cover.webp", width: 1200, height: 675 }   # optional
---
```

3. Write the post underneath. `## Heading` for section headings, `**bold**`, `- ` for bullet lists, `[link text](https://...)` for links.
4. **YouTube:** paste a YouTube link on a line by itself and it becomes a video player. It shows the thumbnail and loads YouTube only when someone presses play, so the page stays fast. Google also learns the post has a video.
5. Cover image: save it as `public/blog/<path>/cover.webp`, then run `python3 scripts/make-blog-thumbs.py` to make the small card version.

## What the blog does automatically

- Post pages, category pages (`/blog/category/seller`), page numbers (`/blog/page/2`) and an RSS feed (`/blog/rss.xml`).
- Google structured data: BlogPosting (headline, dates, author, image), breadcrumbs, and VideoObject when the post has a video.
- Related articles, author box, and "get your home's value / search homes / call" buttons under every post.
- Newest three posts appear on the home page.

## The imported posts (October 2026)

- All 361 posts from the Squarespace blog were copied with their exact addresses (`/blog/2022/10/27/...`), so Google rankings and old links keep working. Old category and tag pages redirect to the new ones.
- 2,339 images were downloaded from Squarespace (they disappear when that account closes) and saved as compressed WebP under `public/blog/`.
- 353 of the 361 posts were written by Ylopo's automatic blog service, not by the team. Similar articles appear on many agents' sites, so they carry little weight with Google on their own. Over time, the posts that will do the most for search are original, local ones (market updates, neighborhood guides, videos), like Jason's 8 posts.
- Text was kept as written. One post (`buy-a-home-minnesota-2026`) lists the older phone number (612) 502-7653.
- Re-run the import: `scripts/import-squarespace-blog.py` (instructions at the top of that file).

## Posts from the Luxury Presence site (October 2026)

- 46 posts existed only on the old Luxury Presence site (huerkamphomes.com). They were copied with their text as written, and their images were saved under `public/blog/`. Their addresses stay the same (`/blog/<slug>`).
- 44 of them are local Twin Cities stories and guides, listed under the "Neighborhoods" category.
- Re-run the copy: `scripts/import-luxury-presence-blog.py` (instructions at the top of that file).
