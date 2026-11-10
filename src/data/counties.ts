// The metro counties with their own property tax page (/property-taxes/<county>-county-mn). Each county's official
// property tax pages, checked Nov 10, 2026 (a few county sites turn away automated checks; these are their published
// addresses). FIPS codes match src/data/community-details.json and src/data/property-tax.json.
export interface County { name: string; fips: string; payNote: string; links: [string, string][] }

export const COUNTIES: County[] = [
  { name: 'Hennepin', fips: '053', payNote: 'Hennepin County takes payments online (e-check, card, PayPal or Venmo), by mail, by phone and in person at its service centers. Its property information search shows each property\'s taxes and statements.',
    links: [['Pay property taxes', 'https://www.hennepincounty.gov/services/property/property-taxes/pay-property-taxes'], ['Property information search', 'https://www.hennepincounty.gov/services/property/property-information-search']] },
  { name: 'Ramsey', fips: '123', payNote: 'Ramsey County takes payments online, by mail and in person; its property tax pages also show values and statements.',
    links: [['Pay property tax', 'https://www.ramseycountymn.gov/residents/property-home/taxes-values/pay-property-tax']] },
  { name: 'Washington', fips: '163', payNote: 'Washington County takes payments online, by mail, through your bank\'s bill pay (payee: Washington County Taxpayer Services) and in person at its service centers and the Government Center in Stillwater.',
    links: [['Property tax information', 'https://washingtoncountymn.gov/680']] },
  { name: 'Dakota', fips: '037', payNote: 'Dakota County takes payments online, by mail and in person (cash, check or card).',
    links: [['Pay property taxes', 'https://dakotacountymn.gov/residents/home-property/paying-property-taxes']] },
  { name: 'Anoka', fips: '003', payNote: 'Anoka County takes payments online at PayAnokaCounty (bank account, card, Apple Pay or Google Pay), by mail with a paper check and in person; search by the parcel number on your statement.',
    links: [['Pay online (PayAnokaCounty)', 'https://pay.anokacountymn.gov'], ['Payment options', 'https://anokacountymn.gov/4435']] },
  { name: 'Scott', fips: '139', payNote: 'Scott County takes payments online (look for "Pay Property Tax" on the county\'s home page), by mail and in person.',
    links: [['Scott County website', 'https://www.scottcountymn.gov']] },
  { name: 'Carver', fips: '019', payNote: 'Carver County takes payments online through its property tax pages, by mail and in person in Chaska.',
    links: [['Property tax', 'https://www.carvercountymn.gov/departments/property-finance/property-tax']] },
  { name: 'Wright', fips: '171', payNote: 'Wright County takes payments online (search by property ID or address, then "Pay Taxes"), by mail and in person in Buffalo.',
    links: [['Wright County website', 'https://www.wrightcountymn.gov']] },
];

export const countyHref = (k: County) => `/property-taxes/${k.name.toLowerCase()}-county-mn`;
