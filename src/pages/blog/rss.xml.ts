// RSS feed of the blog for feed readers, email newsletters and search engines.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postUrl } from '../../data/blog';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: 'Huerkamp Home Group blog',
    description: 'Real estate advice for Twin Cities home buyers, sellers and homeowners.',
    site: context.site!,
    items: posts.slice(0, 50).map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postUrl(p),
      categories: p.data.categories,
    })),
  });
}
