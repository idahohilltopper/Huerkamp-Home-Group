// Business details used across every page.
export const site = {
  name: 'Huerkamp Home Group',
  brokerage: 'Keller Williams Preferred Realty',
  phone: '(612) 502-7653',
  phoneHref: 'tel:+16125027653',
  email: 'leads@hhgus.com',
  street: '14300 Nicollet Ct, Ste 208',
  cityStateZip: 'Burnsville, MN 55306',
  // Home search (IDX). Points at the team's existing Ylopo search until the IDX decision is final;
  // every "Search homes" button reads this one value.
  searchUrl: 'https://search.huerkamphomegroup.com',
  // The team's recruiting site (agents who want to join).
  joinUrl: 'https://joinhhg.com',
  // Ylopo's map view, about 15 miles around downtown Minneapolis (bbox = north,east,south,west).
  // Minneapolis is named too: on phones, Ylopo's map gets stuck loading when only given an area.
  mapSearchUrl: 'https://search.huerkamphomegroup.com/search/map?s[orderBy]=sourceCreationDate%2Cdesc&s[page]=1&s[locations][0][city]=Minneapolis&s[locations][0][state]=MN&s[bbox]=45.195,-92.9584,44.7606,-93.5716',
  // The website's own privacy policy (src/pages/privacy.astro); the forms and footer link to it.
  // The home search at search.huerkamphomegroup.com (Ylopo) has its own.
  privacyUrl: '/privacy',
  // YouTube leads are tracked with their own phone number and email (shown only on /youtube-form).
  youtubePhone: '(952) 900-3025',
  youtubePhoneHref: 'tel:+19529003025',
  youtubeEmail: 'team@hhgus.com',
  youtubeUrl: 'https://www.youtube.com/@livinginminneapolis',
  facebookUrl: 'https://www.facebook.com/HuerkampHomeGroup/',
  // Google Analytics 4 (the team's own property). Loads only on the live domains, so test sites don't count.
  ga4: 'G-YY1H36L83S',
  // A second GA4 property the site also reports to: "JHMN - Jason Huerkamp in Burnsville MN" (property 340994799), under
  // jr@teamtwincities.com, the Google login Open SEO uses. G-YY1H36L83S isn't visible to that login (Nov 10, 2026).
  ga4Also: 'G-C4MGQLK11M',
  /** Meta (Facebook/Instagram) Pixel for ad measurement; same on/off rules as Google Analytics (src/layouts/Base.astro). */
  metaPixel: '2726990550925323',
  // Track record shown on the home page (hero proof line, red strip, "The record" cards). Update these by hand.
  // Confirmed by Jason 2026-11-05: over $1 billion sold, 341 five-star Zillow reviews (shown as a 5.0★ rating like Google), 3,850 homes sold.
  proof: { soldVolume: '$1 billion+', soldVolumeShort: '$1B+', homesSold: '3,850+', zillowFiveStar: 341, zillowRating: 5.0, asOf: '2026-11' },
  // Third-party rankings, each with its public source (checked 2026-11-06). Shown on the home page and in the business
  // structured data (schema.ts). Re-check when RealTrends publishes new rankings (based on the prior year's sales).
  rankings: {
    realtrends: {
      state: 3, city: 1, cityName: 'Burnsville', year: 2025, sides: 439, volume: '$153.35M',
      text: '#3 real estate team in Minnesota and #1 in Burnsville by sales volume and transactions (RealTrends Verified, 2025 sales)',
      source: 'RealTrends Verified', url: 'https://www.realtrends.com/team-profile/huerkamp-home-group-minnesota-keller-williams/',
    },
    agentPronto: {
      rank: 3, quarters: 'Q1 and Q2 2026',
      text: "#3 on Agent Pronto's Minnesota Top 25 Buyer's Agents and Teams rankings in Q1 and Q2 2026",
      source: 'Agent Pronto', url: 'https://agentpronto.com/resources/minnesota-buy-side-real-estate-market-q2-2026-analysis',
      q1Url: 'https://agentpronto.com/resources/minnesota-buy-side-real-estate-market-q1-2026-analysis',
    },
  },
  mapsUrl: 'https://www.google.com/maps/place/Huerkamp+Home+Group/data=!4m2!3m1!1s0x87f630d14e326791:0x9b132b7aac652a24',
};
