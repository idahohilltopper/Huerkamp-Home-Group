// Business details used across every page.
export const site = {
  name: 'Huerkamp Home Group',
  brokerage: 'Keller Williams Preferred Realty',
  phone: '(612) 843-9620',
  phoneHref: 'tel:+16128439620',
  email: 'leads@hhgus.com',
  street: '14300 Nicollet Ct, Ste 208',
  cityStateZip: 'Burnsville, MN 55306',
  // Home search (IDX). Points at the team's existing Ylopo search until the IDX decision is final;
  // every "Search homes" button reads this one value.
  searchUrl: 'https://search.huerkamphomegroup.com',
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
  mapsUrl: 'https://www.google.com/maps/place/Huerkamp+Home+Group/data=!4m2!3m1!1s0x87f630d14e326791:0x9b132b7aac652a24',
};
