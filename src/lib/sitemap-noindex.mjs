// After the build, drop every page marked noindex (YouTube form, profiles without a bio, the 404 page) from
// the sitemap. Listing a page we ask Google not to index is a Search Console error.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? htmlFiles(join(dir, e.name)) : e.name.endsWith('.html') ? [join(dir, e.name)] : []);
}

export default function sitemapNoindex(site) {
  return {
    name: 'sitemap-noindex',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const hidden = new Set(htmlFiles(root)
          .filter((f) => /<meta name="robots" content="noindex/.test(readFileSync(f, 'utf8')))
          .map((f) => `${site}/${relative(root, f).replace(/\\/g, '/').replace(/(index)?\.html$/, '')}`.replace(/\/$/, '')));
        for (const f of readdirSync(root).filter((n) => /^sitemap-\d+\.xml$/.test(n))) {
          const xml = readFileSync(join(root, f), 'utf8');
          const out = xml.replace(/<url><loc>([^<]+)<\/loc>.*?<\/url>/g, (m, loc) => (hidden.has(loc.replace(/\/$/, '')) ? '' : m));
          writeFileSync(join(root, f), out);
          logger.info(`${f}: removed ${(xml.match(/<url>/g) ?? []).length - (out.match(/<url>/g) ?? []).length} noindex page(s)`);
        }
      },
    },
  };
}
