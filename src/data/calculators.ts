// Numbers behind the /calculators pages. Every default here has a public source; anything a person
// should replace with their own number (commission, title fees, insurance quote) starts blank.
import communities from './communities.json';
import tax from './property-tax.json';
import rates from './rates.json';
import hpi from './hpi.json';

// Minnesota Department of Revenue (checked 2026-10-27):
//   Deed tax: 0.0033 of net consideration (revenue.state.mn.us/deed-tax-rate)
//   Mortgage registry tax: 0.0023 of the debt secured (revenue.state.mn.us/mortgage-tax-rate)
//   Hennepin and Ramsey counties add an Environmental Response Fund tax of 0.0001 to each.
export const MN = {
  deedTax: 0.0033,
  mortgageTax: 0.0023,
  erf: 0.0001,
  erfCounties: ['Hennepin', 'Ramsey'],
  deedTaxUrl: 'https://www.revenue.state.mn.us/deed-tax-rate',
  mortgageTaxUrl: 'https://www.revenue.state.mn.us/mortgage-tax-rate',
};

export interface CalcCity { slug: string; name: string; rate: number; tax: number; value: number; erf: boolean; topCoded: boolean }

// Effective property tax rate per city = Census median real estate taxes paid ÷ median home value
// (ACS 2020-2024). Where the Census tops out the median tax at $10,000+, the rate would be understated,
// so those cities fall back to the statewide rate.
export const calcCities: CalcCity[] = communities.communities
  .map((c) => {
    const t = (tax.cities as Record<string, { medianTax: number; medianValue: number; rate: number; topCoded?: boolean }>)[c.slug];
    return {
      slug: c.slug, name: c.name,
      rate: t && !t.topCoded ? t.rate : tax.stateRate,
      tax: t?.medianTax ?? tax.stateMedianTax, value: t?.medianValue ?? tax.stateMedianValue,
      erf: c.counties.some((k) => MN.erfCounties.includes(k)), topCoded: !!t?.topCoded,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const taxSource = tax.source;
export const stateTaxRate = tax.stateRate;
export const rate = rates.latest;              // { date, rate30, rate15 }
export const rateSource = { name: rates.source, url: rates.url };
export const appreciation = { ...hpi.annualized, latest: hpi.latest.q, source: hpi.source, area: hpi.area, url: hpi.url };

export const fmtDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export const calculators = [
  { slug: 'seller-net-proceeds', title: 'Seller net proceeds calculator', short: 'What you could walk away with after the mortgage payoff, Minnesota deed tax, commission and closing costs.' },
  { slug: 'affordability', title: 'How much house can I afford?', short: 'Your price range from income, debts and down payment, with real Twin Cities property tax rates, plus the Ramsey 25% guideline.' },
  { slug: 'rent-vs-buy', title: 'Rent vs. buy calculator', short: 'Compare your wealth after renting or buying in the Twin Cities, year by year, using the metro home price index.' },
];
