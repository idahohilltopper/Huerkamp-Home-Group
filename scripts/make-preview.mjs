// Turns dist/ into a claude.ai Artifact preview.
// Usage: node scripts/make-preview.mjs <out-dir>
//
// <out-dir>/index.html is the artifact's main page (body only; the artifact adds
// the document skeleton). Every page, the home page included, is also written as a
// full document (home.html, buy.html, ...) so links between pages work.
import { readFileSync, writeFileSync, cpSync, mkdirSync, readdirSync, existsSync } from 'node:fs';

const out = process.argv[2];
mkdirSync(out, { recursive: true });

const pages = readdirSync('dist', { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(`dist/${d.name}/index.html`))
  .map((d) => d.name);

// Site paths -> preview files. Images become relative; page links point at <name>.html.
const rewrite = (html) =>
  html
    .replace(/, \/hero\/minneapolis-skyline-3840.jpg 3840w/g, '')
    .replace(/(["\s,])\/(team|hero)\//g, '$1$2/')
    .replace(/href="\/(#[\w-]+)?"/g, (_, hash = '') => `href="home.html${hash}"`)
    .replace(new RegExp(`href="/(${pages.join('|')})"`, 'g'), 'href="$1.html"');

const home = rewrite(readFileSync('dist/index.html', 'utf8'));
writeFileSync(`${out}/home.html`, home);
for (const p of pages) writeFileSync(`${out}/${p}.html`, rewrite(readFileSync(`dist/${p}/index.html`, 'utf8')));

const head = home.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = home.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];
const keep = (head.match(/<title>[\s\S]*?<\/title>|<link[^>]*fonts\.g[^>]*>|<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g) || []).join('\n');
writeFileSync(`${out}/index.html`, `${keep}\n${body}\n`);

cpSync('dist/team', `${out}/team`, { recursive: true });
mkdirSync(`${out}/hero`, { recursive: true });
cpSync('dist/hero/minneapolis-skyline-1920.jpg', `${out}/hero/minneapolis-skyline-1920.jpg`);
console.log(['index.html', 'home.html', ...pages.map((p) => `${p}.html`)].join('\n'));
