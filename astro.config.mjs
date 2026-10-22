import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.huerkamphomegroup.com',
  // Pages are built as /team.html and served at /team — the same no-slash
  // addresses the old Squarespace site used, so existing Google rankings carry over.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],
});
