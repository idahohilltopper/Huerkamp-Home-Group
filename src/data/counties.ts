// The metro counties with their own property tax page (/property-taxes/<county>-county-mn). Each county's official
// property tax pages, checked Nov 10, 2026 (a few county sites turn away automated checks; these are their published
// addresses). FIPS codes match src/data/community-details.json and src/data/property-tax.json.
// homestead: the county assessor's homestead page (application deadline Dec 31; checked Nov 10, 2026).
export interface County { name: string; fips: string; payNote: string; links: [string, string][]; homestead: string; homesteadNote: string }

export const COUNTIES: County[] = [
  { name: 'Hennepin', fips: '053', homestead: 'https://www.hennepincounty.gov/homestead', homesteadNote: 'Apply online, by mail or in person; Hennepin County handles homestead for every city in the county.', payNote: 'Hennepin County takes payments online (e-check, card, PayPal or Venmo), by mail, by phone and in person at its service centers. Its property information search shows each property\'s taxes and statements.',
    links: [['Pay property taxes', 'https://www.hennepincounty.gov/services/property/property-taxes/pay-property-taxes'], ['Property information search', 'https://www.hennepincounty.gov/services/property/property-information-search']] },
  { name: 'Ramsey', fips: '123', homestead: 'https://www.ramseycountymn.gov/residents/property-home/taxes-values/homestead', homesteadNote: 'Apply online (the county\'s SmartFile portal) or by mail to the Assessor\'s Office Homestead Unit.', payNote: 'Ramsey County takes payments online, by mail and in person; its property tax pages also show values and statements.',
    links: [['Pay property tax', 'https://www.ramseycountymn.gov/residents/property-home/taxes-values/pay-property-tax']] },
  { name: 'Washington', fips: '163', homestead: 'https://www.washingtoncountymn.gov/708/Homestead', homesteadNote: 'Apply online or mail the printed application to Property Records in Stillwater; the county says online applications take 2 to 3 weeks.', payNote: 'Washington County takes payments online, by mail, through your bank\'s bill pay (payee: Washington County Taxpayer Services) and in person at its service centers and the Government Center in Stillwater.',
    links: [['Property tax information', 'https://washingtoncountymn.gov/680']] },
  { name: 'Dakota', fips: '037', homestead: 'https://dakotacountymn.gov/residents/home-property/tax-relief-programs/homestead', homesteadNote: 'Apply online (signed through DocuSign) or on a paper form.', payNote: 'Dakota County takes payments online, by mail and in person (cash, check or card).',
    links: [['Pay property taxes', 'https://dakotacountymn.gov/residents/home-property/paying-property-taxes']] },
  { name: 'Anoka', fips: '003', homestead: 'https://www.anokacountymn.gov/4278/Homesteading', homesteadNote: 'Apply through the county\'s online portal or mail a printed application to Property Records & Taxation.', payNote: 'Anoka County takes payments online at PayAnokaCounty (bank account, card, Apple Pay or Google Pay), by mail with a paper check and in person; search by the parcel number on your statement.',
    links: [['Pay online (PayAnokaCounty)', 'https://pay.anokacountymn.gov'], ['Payment options', 'https://anokacountymn.gov/4435']] },
  { name: 'Scott', fips: '139', homestead: 'https://www.scottcountymn.gov', homesteadNote: 'Look for Homestead on the county assessor\'s pages; apply online or with the paper application.', payNote: 'Scott County takes payments online (look for "Pay Property Tax" on the county\'s home page), by mail and in person.',
    links: [['Scott County website', 'https://www.scottcountymn.gov']] },
  { name: 'Carver', fips: '019', homestead: 'https://www.carvercountymn.gov/departments/property-finance/property-assessment/homestead-information', homesteadNote: 'Send the homestead application (Form CR-H) as a PDF by email, or by mail or fax; the county can\'t accept photos of the form.', payNote: 'Carver County takes payments online through its property tax pages, by mail and in person in Chaska.',
    links: [['Property tax', 'https://www.carvercountymn.gov/departments/property-finance/property-tax']] },
  { name: 'Wright', fips: '171', homestead: 'https://www.wrightcountymn.gov', homesteadNote: 'Look for Homestead on the county assessor\'s pages; own, live in the home and apply by December 31.', payNote: 'Wright County takes payments online (search by property ID or address, then "Pay Taxes"), by mail and in person in Buffalo.',
    links: [['Wright County website', 'https://www.wrightcountymn.gov']] },
];

export const countyHref = (k: County) => `/property-taxes/${k.name.toLowerCase()}-county-mn`;
