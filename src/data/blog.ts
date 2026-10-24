// Helpers shared by the blog pages.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;
export const PAGE_SIZE = 12;

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', (p: Post) => !p.data.draft);
  return posts.sort((a: Post, b: Post) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const postUrl = (p: Post) => `/blog/${p.data.path}`;
export const catSlug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const catUrl = (c: string) => `/blog/category/${catSlug(c)}`;

/** Categories with post counts, most-used first. */
export function categoriesOf(posts: Post[]) {
  const counts = new Map<string, number>();
  posts.forEach((p) => p.data.categories.forEach((c: string) => counts.set(c, (counts.get(c) ?? 0) + 1)));
  return [...counts].map(([name, count]) => ({ name, count, href: catUrl(name) })).sort((a, b) => b.count - a.count);
}

export const formatDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

/** About 230 words a minute. */
export const readingMinutes = (markdown = '') =>
  Math.max(1, Math.round(markdown.replace(/<[^>]+>|[#*_>\[\]()!-]/g, ' ').split(/\s+/).filter(Boolean).length / 230));

/** Up to n other posts, preferring ones about the same town, then ones that share a category. */
export function related(post: Post, posts: Post[], n = 3) {
  const cats = new Set(post.data.categories);
  const towns = new Set(post.data.communities);
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, score: 10 * p.data.communities.filter((c: string) => towns.has(c)).length + p.data.categories.filter((c: string) => cats.has(c)).length }))
    .sort((a, b) => b.score - a.score || b.p.data.date.valueOf() - a.p.data.date.valueOf())
    .slice(0, n)
    .map((x) => x.p);
}

/** Posts about one community (frontmatter `communities`), newest first. */
export const postsAbout = (slug: string, posts: Post[]) => posts.filter((p) => p.data.communities.includes(slug));
