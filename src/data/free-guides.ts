// Free guides (/free-guides), each behind a short form (name, email, phone; Jason, Nov 26, 2026). The form sends a
// "free-guide" lead to Follow Up Boss tagged "Free guide" and "Guide: <tag>" (src/lib/lead.mjs), then shows the download.
// The PDFs are made from scripts/guides/*.html with node scripts/guides/make-pdf.cjs and kept out of Google
// (public/_headers), so the guide is reached through the form.
export interface FreeGuide {
  slug: string;
  title: string;
  /** Follow Up Boss tag: "Guide: <tag>" */
  tag: string;
  audience: 'Buyers' | 'Sellers' | 'Everyone';
  /** "buy" or "sell": also tags the lead as a buyer or seller lead */
  interest: 'buy' | 'sell' | '';
  blurb: string;
  points: string[];
  pages: number;
  pdf: string;
  /** public/free-guides/<cover>-{600,1200}.webp and -1200.jpg, square */
  cover: string;
  added: string;
}

export const freeGuides: FreeGuide[] = [
  {
    slug: '25-insider-secrets-on-home-buying',
    title: '25 Insider Secrets on Home Buying',
    tag: '25 Insider Secrets on Home Buying',
    audience: 'Buyers',
    interest: 'buy',
    blurb: 'Realtors have the inside scoop. Learn 25 real tips from experienced agents to help you buy your next home in the Twin Cities.',
    points: [
      'What to line up before you shop: pre-approval, cash to close and down payment help',
      'What to check on every home: HOA papers, taxes and assessments, city sale reports',
      'How to write an offer that stands out, and plan for a low appraisal',
      'Minnesota inspection must-dos, including radon, and how to avoid closing-day wire fraud',
    ],
    pages: 7,
    pdf: '/free-guides/25-insider-secrets-on-home-buying.pdf',
    cover: '/free-guides/25-insider-secrets',
    added: '2026-11-26',
  },
];
