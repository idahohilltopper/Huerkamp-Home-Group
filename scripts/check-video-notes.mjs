// Checks src/data/video-notes/*.json: every id is a real video with a page, every place is a community
// slug, and every link points at a page that exists in dist/ (run after a build).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
const vids = JSON.parse(readFileSync('src/data/youtube.json', 'utf8')).videos;
const comms = new Set(JSON.parse(readFileSync('src/data/communities.json', 'utf8')).communities.map((c) => c.slug));
let bad = 0, n = 0;
const seen = new Set();
for (const f of readdirSync('src/data/video-notes')) {
  for (const note of JSON.parse(readFileSync(`src/data/video-notes/${f}`, 'utf8'))) {
    n++;
    const v = vids.find((x) => x.id === note.id);
    if (!v?.slug) { bad++; console.log(`${f}: ${note.id} has no video page`); }
    if (seen.has(note.id)) { bad++; console.log(`${f}: ${note.id} appears twice`); }
    seen.add(note.id);
    for (const p of note.places ?? []) if (!comms.has(p)) { bad++; console.log(`${f}: ${note.id} unknown place ${p}`); }
    for (const [, h] of note.links ?? []) if (!existsSync(`dist${h}.html`) && !existsSync(`dist${h}/index.html`)) { bad++; console.log(`${f}: ${note.id} link not found ${h}`); }
    if (!note.takeaways?.length) { bad++; console.log(`${f}: ${note.id} has no takeaways`); }
  }
}
console.log(`${n} notes, ${bad} problems`);
process.exit(bad ? 1 : 0);
