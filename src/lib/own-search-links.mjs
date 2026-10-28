// Blog posts written before the site had its own search link to the Ylopo search (search.huerkamphomegroup.com).
// Once the site's own search is on (src/data/search.ts), those links point to /home-search instead; the posts'
// words stay as written. A remark plugin, so it runs on every Markdown post at build time.
import { mlsMode } from './mls-feed.mjs';

const own = () => {
  const fixture = !!process.env.MLS_FIXTURE && process.env.NETLIFY !== 'true';
  return (mlsMode() !== 'off' || fixture) && (!!(process.env.REPLIERS_API_KEY ?? '').trim() || fixture);
};

export function remarkOwnSearchLinks() {
  return (tree) => {
    if (!own()) return;
    const walk = (node) => {
      if ((node.type === 'link' || node.type === 'definition') && /^https?:\/\/search\.huerkamphomegroup\.com/i.test(node.url ?? '')) node.url = '/home-search';
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
