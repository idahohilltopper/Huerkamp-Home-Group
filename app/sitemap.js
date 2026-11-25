import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const SITE = 'https://joinhhg.com';
const pages = [
  ['', 1.0],
  ['/join-a-real-estate-team-twin-cities', 0.9],
  ['/become-a-real-estate-agent-minnesota', 0.9],
  ['/real-estate-agent-jobs-twin-cities', 0.9],
  ['/real-estate-coaching-training-twin-cities', 0.8],
  ['/real-estate-career-quiz', 0.8],
  ['/is-real-estate-a-good-career', 0.8],
  ['/part-time-real-estate-agent', 0.7],
  ['/how-do-real-estate-agents-get-paid', 0.8],
  ['/day-in-the-life-of-a-real-estate-agent', 0.6],
  ['/real-estate-commission-splits', 0.7],
  ['/how-to-find-a-real-estate-mentor', 0.6],
  ['/why-hhg', 0.8],
  ['/income-guarantee', 0.8],
  ['/agent-plus', 0.7],
  ['/value', 0.7],
  ['/how-it-works', 0.7],
  ['/our-team', 0.6],
  ['/faq', 0.6],
  ['/apply', 0.8],
  ['/terms', 0.3],
  ['/privacy', 0.3],
];

// Each page's real last-changed date: the last commit that touched its folder under app/.
// Google re-reads pages whose date moved, so a date that changes on every build (or never) is worse than none.
// Hosts like Vercel build from a shallow clone. There, a file older than the clone shows the clone's oldest
// commit instead of its own, which would be a made-up date, so those pages are listed without one.
const git = (...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};
const shallowRoots = new Set(
  existsSync('.git/shallow') ? readFileSync('.git/shallow', 'utf8').split('\n').filter(Boolean) : []
);

function lastChanged(path) {
  const file = path ? `app${path}/page.js` : 'app/page.js';
  const [hash, date] = git('log', '-1', '--format=%H %cI', '--', file).split(' ');
  if (!hash || shallowRoots.has(hash)) return undefined;
  return new Date(date);
}

export default function sitemap() {
  return pages.map(([path, priority]) => {
    const lastModified = lastChanged(path);
    return { url: SITE + path, ...(lastModified && { lastModified }), priority };
  });
}
