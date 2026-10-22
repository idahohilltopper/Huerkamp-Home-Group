import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Blog posts live in src/content/blog/ as Markdown files. To add a post, copy an existing file,
// change the frontmatter (title, description, path, date) and write the body in Markdown.
// A YouTube link on a line by itself becomes a fast-loading video player.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    /** One or two sentences for Google results and social shares (about 150 characters). */
    description: z.string(),
    /** Address after /blog/, e.g. "first-time-buyer-guide" → /blog/first-time-buyer-guide */
    path: z.string().regex(/^[a-z0-9][a-z0-9\-/]*$/i),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string().default('Huerkamp Home Group'),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    /** Banner image (public/blog/<slug>/cover.webp); thumb is the small card version from scripts/make-blog-thumbs.py. */
    cover: z.object({ src: z.string(), width: z.number(), height: z.number(), alt: z.string().optional(), thumb: z.string().optional() }).optional(),
    /** YouTube video ID or URL to feature at the top of the post. */
    youtube: z.string().optional(),
    draft: z.boolean().default(false),
    importedFrom: z.string().optional(),
  }),
});

export const collections = { blog };
