import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { remarkYoutube } from './src/lib/youtube.mjs';

export default defineConfig({
  site: 'https://www.huerkamphomegroup.com',
  // Pages are built as /team.html and served at /team — the same no-slash
  // addresses the old Squarespace site used, so existing Google rankings carry over.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],
  // Blog posts are Markdown; a YouTube link on its own line becomes a fast video player.
  markdown: { processor: unified({ remarkPlugins: [remarkYoutube] }) },
});
