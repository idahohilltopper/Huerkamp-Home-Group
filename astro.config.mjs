import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { remarkYoutube } from './src/lib/youtube.mjs';
import { lastmods } from './src/lib/lastmod.mjs';
import sitemapNoindex from './src/lib/sitemap-noindex.mjs';

const changed = lastmods();

export default defineConfig({
  site: 'https://www.huerkamphomegroup.com',
  // Pages are built as /team.html and served at /team — the same no-slash
  // addresses the old Squarespace site used, so existing Google rankings carry over.
  trailingSlash: 'never',
  build: { format: 'file' },
  // The sitemap carries each page's real last-changed date (src/lib/lastmod.mjs).
  integrations: [sitemap({
    serialize(item) {
      const date = changed.get(new URL(item.url).pathname.replace(/\/$/, '') || '/');
      return date ? { ...item, lastmod: new Date(date).toISOString() } : item;
    },
  }), sitemapNoindex('https://www.huerkamphomegroup.com')],
  // Blog posts are Markdown; a YouTube link on its own line becomes a fast video player.
  markdown: { processor: unified({ remarkPlugins: [remarkYoutube] }) },
});
