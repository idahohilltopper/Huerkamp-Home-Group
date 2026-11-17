// Golf course homes for sale (/golf-course-homes-for-sale-mn and /golf-course-homes-for-sale-mn/<course>), from the live
// MLS feed and the course list in golf-courses.json (Google Business Profile data via Open SEO, Nov 17, 2026).
// Open SEO, Nov 17, 2026: "golf course homes for sale mn" 20 searches a month, keyword difficulty 12, with page one held by
// small brokers and golfhomes.com rather than Zillow or Realtor.com. Each course's own search ("stonebridge golf course
// homes for sale", "homes for sale on deer run golf course victoria mn", "tpc twin cities homes for sale") is about 10.
// A home belongs to a course when it's within a mile of the course's map pin, or its listing names the course. It counts as
// a golf course home (the hub page) only when the listing's own description says it sits on or overlooks a course,
// never for "close to golf courses". Fair housing: listing facts and the course's own public facts only.
import { listingsData, median, type Listing } from './listings';
import data from './golf-courses.json';

export interface Course { slug: string; name: string; city: string; state: string; lat: number; lng: number; url: string | null; access: string | null }
export const courses = data.courses as Course[];
export const MILE_KM = 1.609;
export const MIN_INDEX = 3;

/** Listing wording for a home on or overlooking a course (not "near golf"). */
export const ON_COURSE = /\b(on (the|a) (golf )?course|golf[- ]course (lot|home|views?|frontage|setting|living|community|property)|(overlook(s|ing)?|views? of|backs? (up )?(to|onto)|borders?|abuts?|adjacent to|sits? on|located on) (the |a )?(beautiful |scenic |private )?(golf course|fairways?|golf|course|\d+(st|nd|rd|th) (hole|fairway|green|tee))|fairway (views?|lot|frontage)|on the \d+(st|nd|rd|th) (hole|fairway|green|tee)|golf views?)\b/i;

const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};
const core = (n: string) => n.replace(/^The /, '').replace(/\s+(Golf (&|and) Country Club|Golf Club( & Event Center)?|Golf Course( and Event Center)?|Country Club|Golf and Event Center|Golf)$/i, '').trim();
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/&/g, '(&|and)').replace(/\\\./g, '\\.?').replace(/^St\\\.\?/, '(St\\.?|Saint)');
/** The listing names the course: "Crystal Lake Golf", "Hazeltine National", the full name. */
const namePattern = (c: Course) => new RegExp(`\\b(${esc(c.name)}|${esc(core(c.name))}\\s+(golf|country club|national|links|club))\\b`, 'i');

export interface CourseHomes extends Course { homes: Listing[]; onCourse: Set<string>; community: string | null; median: number | null; index: boolean }

export const golfData = (async () => {
  const feed = await listingsData;
  const pats = new Map(courses.map((c) => [c.slug, namePattern(c)]));
  const byCourse = new Map<string, Listing[]>(courses.map((c) => [c.slug, []]));
  const onCourse = new Set<string>();
  const golfHomes: { l: Listing; course: Course | null }[] = [];
  for (const l of feed.listings) {
    if (!l.lat || !l.lng || !(l.price > 1000) || l.type === 'land') continue;
    const text = `${l.description ?? ''} ${l.subdivision ?? ''}`;
    const named = courses.filter((c) => pats.get(c.slug)!.test(text) && km(l, c) < 8);
    const near = courses.map((c) => ({ c, d: km(l, c) })).filter((x) => x.d <= MILE_KM).sort((a, b) => a.d - b.d);
    const home = named[0] ?? near[0]?.c ?? null;
    const isOn = ON_COURSE.test(l.description ?? '') || named.length > 0;
    if (home) byCourse.get(home.slug)!.push(l);
    if (isOn) { onCourse.add(l.mls); golfHomes.push({ l, course: home ?? courses.map((c) => ({ c, d: km(l, c) })).filter((x) => x.d <= 3).sort((a, b) => a.d - b.d)[0]?.c ?? null }); }
  }
  const list: CourseHomes[] = courses.map((c) => {
    const homes = byCourse.get(c.slug)!.slice().sort((a, b) => Number(onCourse.has(b.mls)) - Number(onCourse.has(a.mls)) || a.price - b.price);
    const counts = new Map<string, number>(); homes.forEach((h) => h.community && counts.set(h.community, (counts.get(h.community) ?? 0) + 1));
    const community = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return { ...c, homes, onCourse, community, median: median(homes.map((h) => h.price)), index: !feed.preview && homes.length >= MIN_INDEX };
  }).filter((c) => c.homes.length > 0);
  return { at: feed.at, preview: feed.preview, mode: feed.mode, list, golfHomes, onCourse };
})();
