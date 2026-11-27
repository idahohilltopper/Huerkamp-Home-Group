// Free guides (/free-guides), each behind a short form (name, email, phone; Jason, Nov 26, 2026). The form sends a
// "free-guide" lead to Follow Up Boss tagged "Free guide" and "Guide: <tag>" (src/lib/lead.mjs), then shows the download.
// The PDFs are made from scripts/guides/*.html with node scripts/guides/make-pdf.cjs and kept out of Google
// (public/_headers), so the guide is reached through the form.
import data from './free-guides.json';

export interface FreeGuide {
  slug: string;
  title: string;
  /** Follow Up Boss tag: "Guide: <tag>" */
  tag: string;
  audience: 'Buyers' | 'Sellers' | 'Everyone';
  /** "buy" or "sell": also tags the lead as a buyer or seller lead */
  interest: 'buy' | 'sell' | 'buy and sell' | '';
  blurb: string;
  points: string[];
  pages: number;
  pdf: string;
  /** public/free-guides/<cover>-{600,1200}.webp and -1200.jpg, square */
  cover: string;
  added: string;
  /** Not on the site until Jason approves it (the PDF is made, the page isn't). */
  draft?: boolean;
}

// The guides themselves are in free-guides.json, so the lead function can read them too (it emails each person
// their guide: netlify/functions/lead.mjs). Add a guide there.
export const freeGuides = data as FreeGuide[];

/** The guides on the site (drafts wait for Jason's approval). */
export const publishedGuides = freeGuides.filter((g) => !g.draft);
