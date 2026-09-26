// Turns dist/index.html into a body-only page for a claude.ai Artifact preview.
// Usage: node scripts/make-preview.mjs <out.html>
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];
const keep = (head.match(/<title>[\s\S]*?<\/title>|<link[^>]*fonts\.g[^>]*>|<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g) || []).join('\n');
writeFileSync(process.argv[2], `${keep}\n${body}\n`);
