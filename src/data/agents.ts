// Team members' own pages (/team/<slug>, the same addresses the old site used).
// Everything shown comes from src/data/team.json (verbatim from their profiles) and verbatim reviews.
import team from './team.json';
import reviewData from './reviews.json';
import { communities } from './areas';

export type Member = (typeof team.members)[number];
type Review = (typeof reviewData.reviews)[number];

export const members: Member[] = team.members;
export const slugOf = (m: Member) => m.profileUrl.split('/').pop()!;
export const agentHref = (m: Member) => `/team/${slugOf(m)}`;
export const isAgent = (m: Member) => /realtor|broker/i.test(m.title ?? '');
export const firstName = (m: Member) => m.name.split(' ')[0];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// First names shared by two people on the team (Jason, Johnson...) can't identify someone on their own.
const firstCounts = new Map<string, number>();
members.forEach((m) => firstCounts.set(firstName(m), (firstCounts.get(firstName(m)) ?? 0) + 1));

/** Complete, verbatim reviews that name this person: Zillow reviews of their own profile, or reviews
 *  that use their full name (or their first name, when no one else on the team shares it). */
export function reviewsFor(m: Member): Review[] {
  const names = [m.name];
  if (firstCounts.get(firstName(m)) === 1) names.push(firstName(m));
  const re = new RegExp(`\\b(${names.map(esc).join('|')})\\b`);
  // Other people's full names come out first, so "Brian Todd" never counts as a review of Todd Johnson.
  const others = new RegExp(`\\b(${members.filter((x) => x !== m).map((x) => esc(x.name)).join('|')})\\b`, 'g');
  return reviewData.reviews.filter((r) => r.textComplete && r.rating === 5 && ((r as any).agent === m.name || re.test(r.text.replace(others, ''))));
}

/** Community guides for towns named in the person's own bio (where they live or work). */
export function bioTowns(m: Member) {
  if (!m.bio) return [];
  return communities.filter((c) => new RegExp(`\\b${esc(c.name).replace('St\\.', '(St\\.?|Saint)')}\\b`).test(m.bio!))
    .sort((a, b) => b.name.length - a.name.length)
    .filter((c, i, all) => !all.slice(0, i).some((x) => x.name.includes(c.name)));
}
