// The team's YouTube channel (Living in Minneapolis Minnesota), built by scripts/build-youtube.py.
import data from './youtube.json';

export interface Video {
  id: string;
  kind: 'long' | 'short';
  title: string;
  published: string | null;
  seconds: number | null;
  views: number | null;
  summary: string[];
  chapters: { t: number; label: string }[];
  topic: string;
  order: number;
  slug?: string;
}

export const channel = data.channel;
export const videos = data.videos as Video[];
export const longVideos = videos.filter((v) => v.kind === 'long');
export const shorts = videos.filter((v) => v.kind === 'short');
/** Videos that have their own watch page on this site. */
export const watchable = longVideos.filter((v) => v.slug);
export const topics = ['Market updates', 'Suburbs & neighborhoods', 'Home tours', 'Living in Minnesota'];

export const youtubeUrl = (v: Video) => (v.kind === 'short' ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`);
export const videoHref = (v: Video) => (v.slug ? `/videos/${v.slug}` : youtubeUrl(v));

export const clock = (s: number | null) => {
  if (s == null) return '';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + `:${String(sec).padStart(2, '0')}`;
};
export const isoDuration = (s: number | null) => (s ? `PT${Math.floor(s / 60)}M${s % 60}S` : undefined);
export const views = (n: number | null) => (n == null ? '' : n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K views` : `${n} views`);

// Names that are also everyday words or people (Dave Ramsey, "grant", "independence") only count
// when written as "<name>, MN" or "<name> Minnesota".
const AMBIGUOUS = new Set(['ramsey', 'grant', 'independence', 'columbus', 'lexington', 'mendota', 'hilltop', 'woodland',
  'empire', 'dayton', 'victoria', 'hanover', 'greenwood', 'medina', 'hugo', 'landfall', 'coates', 'vermillion', 'nowthen']);
const norm = (s: string) => s.toLowerCase().replace(/\bst\.?\s/g, 'saint ').replace(/[’']/g, '');
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Videos about a city: its name in the title first, then in the description. */
export function videosAbout(names: string[], limit = 6) {
  const pats = names.map((n) => {
    const name = esc(norm(n));
    return new RegExp(AMBIGUOUS.has(norm(n)) ? `\\b${name},? (mn|minnesota)\\b` : `\\b${name}\\b`);
  });
  const hit = (s: string) => pats.some((p) => p.test(norm(s)));
  return videos
    .map((v) => ({ v, score: hit(v.title) ? 2 : v.kind === 'long' && hit(v.summary.join(' ')) ? 1 : 0 }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (b.v.views ?? 0) - (a.v.views ?? 0))
    .slice(0, limit)
    .map((x) => x.v);
}
