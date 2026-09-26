// Turns dist/ into a claude.ai Artifact preview: a body-only page plus its images.
// Usage: node scripts/make-preview.mjs <out-dir>   (writes <out-dir>/index.html and copies team/ and hero/)
import { readFileSync, writeFileSync, cpSync, mkdirSync } from 'node:fs';

const out = process.argv[2];
mkdirSync(out, { recursive: true });
const html = readFileSync('dist/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];
const keep = (head.match(/<title>[\s\S]*?<\/title>|<link[^>]*fonts\.g[^>]*>|<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g) || []).join('\n');
// Artifact files are served next to the page, so make image paths relative.
const page = `${keep}\n${body}\n`.replace(/(["\s,])\/(team|hero)\//g, '$1$2/');
writeFileSync(`${out}/index.html`, page);
for (const dir of ['team', 'hero']) cpSync(`dist/${dir}`, `${out}/${dir}`, { recursive: true });
