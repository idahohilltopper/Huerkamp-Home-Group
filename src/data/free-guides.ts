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
  {
    slug: 'selling-your-home-in-minnesota',
    title: 'Selling Your Home in Minnesota: 20 Ways to Net More',
    tag: 'Selling Your Home in Minnesota',
    audience: 'Sellers', interest: 'sell',
    blurb: 'How Twin Cities sellers price right, prepare smart, meet Minnesota\'s rules and keep more at closing.',
    points: [
      'How to find your real number: what you will walk away with, before you pick a price',
      'Which repairs and updates pay off, and which to skip',
      'Minnesota\'s seller disclosures, radon and city time-of-sale rules, explained',
      'How to compare offers, handle the inspection and appraisal, and plan your move',
    ],
    pages: 7, pdf: '/free-guides/selling-your-home-in-minnesota.pdf', cover: '/free-guides/selling-your-home-in-minnesota',
    added: '2026-11-26',
  },
  {
    slug: 'first-time-home-buyer-guide-minnesota',
    title: 'First-Time Home Buyer\'s Guide to Minnesota',
    tag: 'First-Time Buyer Guide',
    audience: 'Buyers', interest: 'buy',
    blurb: 'From your first budget to your first set of keys: the steps, the costs and the help available to first-time buyers in Minnesota.',
    points: [
      'What you can afford by month, and how to get your credit ready',
      'FHA, conventional, VA and USDA loans, and how mortgage insurance works',
      'Down payment help in Minnesota and homebuyer education',
      'Every step from pre-approval to closing day, plus Minnesota\'s homestead application',
    ],
    pages: 7, pdf: '/free-guides/first-time-home-buyer-guide-minnesota.pdf', cover: '/free-guides/first-time-home-buyer-guide-minnesota',
    added: '2026-11-26',
  },
  {
    slug: 'moving-to-the-twin-cities',
    title: 'Moving to the Twin Cities: A Relocation Guide',
    tag: 'Relocation Guide',
    audience: 'Buyers', interest: 'buy',
    blurb: 'How to choose where to live, buy a home from out of state and settle in to Minneapolis, Saint Paul and the suburbs.',
    points: [
      'How to narrow the map by commute, property taxes and home style',
      'City, close-in suburb or outer suburb: the trade-offs',
      'Buying from a distance: video tours, remote closings and timing your move',
      'Settling in: licenses, homestead, snow rules and utilities',
    ],
    pages: 6, pdf: '/free-guides/moving-to-the-twin-cities.pdf', cover: '/free-guides/moving-to-the-twin-cities',
    added: '2026-11-26',
  },
  {
    slug: 'downsizing-made-simple',
    title: 'Downsizing Made Simple',
    tag: 'Downsizing Guide',
    audience: 'Sellers', interest: 'sell',
    blurb: 'A calm, step-by-step plan for selling the family home, choosing what\'s next and moving with less stress.',
    points: [
      'Townhome, condo, 55+ community or renting: comparing what\'s next',
      'Buy first or sell first, and how to line up both closings',
      'Sorting a lifetime of belongings, room by room',
      'Selling the family home, including for a parent or an estate',
    ],
    pages: 6, pdf: '/free-guides/downsizing-made-simple.pdf', cover: '/free-guides/downsizing-made-simple',
    added: '2026-11-26',
  },
  {
    slug: 'minnesota-down-payment-assistance',
    title: 'Minnesota Down Payment Assistance, Explained',
    tag: 'Down Payment Assistance Guide',
    audience: 'Buyers', interest: 'buy',
    blurb: 'How down payment and closing cost help works in Minnesota: the programs, who qualifies and the steps to apply.',
    points: [
      "How assistance loans work, and when they're repaid",
      'Minnesota Housing, city, county and nonprofit programs',
      'Gifts, seller-paid closing costs and lender credits, with the limits for each loan type',
      'The step-by-step path from homebuyer class to closing',
    ],
    pages: 7, pdf: '/free-guides/minnesota-down-payment-assistance.pdf', cover: '/free-guides/minnesota-down-payment-assistance',
    added: '2026-11-26', draft: true,
  },
  {
    slug: 'buying-new-construction',
    title: 'Buying New Construction in the Twin Cities',
    tag: 'New Construction Guide',
    audience: 'Buyers', interest: 'buy',
    blurb: "How to choose a builder, what the base price leaves out and how Minnesota's new home warranty protects you.",
    points: [
      'Spec, to-be-built or custom: the three ways to buy new',
      'Lot premiums, options and builder incentives, decoded',
      'Builder contracts and inspections before drywall and before closing',
      "Minnesota's 1-, 2- and 10-year new home warranties",
    ],
    pages: 6, pdf: '/free-guides/buying-new-construction.pdf', cover: '/free-guides/buying-new-construction',
    added: '2026-11-26', draft: true,
  },
  {
    slug: 'buying-a-lake-home-or-cabin',
    title: 'Buying a Lake Home or Cabin in Minnesota',
    tag: 'Lake Home Guide',
    audience: 'Buyers', interest: 'buy',
    blurb: 'Shoreline, septic, wells, water quality and winter roads: what to check before you buy on the water.',
    points: [
      'How to research a lake before you look at houses',
      'Minnesota shoreland rules, docks and short-term rentals',
      'Septic, well water and year-round living',
      'Second-home financing, insurance and the costs of lake life',
    ],
    pages: 6, pdf: '/free-guides/buying-a-lake-home-or-cabin.pdf', cover: '/free-guides/buying-a-lake-home-or-cabin',
    added: '2026-11-26', draft: true,
  },
  {
    slug: 'townhome-and-condo-buyers-guide',
    title: "Townhome & Condo Buyer's Guide",
    tag: 'Townhome and Condo Guide',
    audience: 'Buyers', interest: 'buy',
    blurb: 'Association fees, documents, insurance and financing: how to buy a townhome or condo with your eyes open.',
    points: [
      'What the association covers, and the rules to read first',
      'The resale disclosure certificate, budget and reserves',
      'Fees, special assessments and condo insurance',
      'Financing approval and what helps resale',
    ],
    pages: 6, pdf: '/free-guides/townhome-and-condo-buyers-guide.pdf', cover: '/free-guides/townhome-and-condo-buyers-guide',
    added: '2026-11-26', draft: true,
  },
  {
    slug: 'selling-and-buying-at-the-same-time',
    title: 'Selling and Buying at the Same Time',
    tag: 'Sell and Buy Guide',
    audience: 'Everyone', interest: 'buy and sell',
    blurb: 'How to time two closings, pay for the next home and move only once.',
    points: [
      'What your home will net, and pre-approval for both scenarios',
      'Sell first, buy first, contingent offers or same-day closings',
      'Rent-backs, bridge loans and home equity lines',
      'How to make the move smooth, and the tax rules on your sale',
    ],
    pages: 6, pdf: '/free-guides/selling-and-buying-at-the-same-time.pdf', cover: '/free-guides/selling-and-buying-at-the-same-time',
    added: '2026-11-26', draft: true,
  },
];

/** The guides on the site (drafts wait for Jason's approval). */
export const publishedGuides = freeGuides.filter((g) => !g.draft);
