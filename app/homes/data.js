// SAMPLE DATA ONLY. Fictional listings used to build and review the design.
// Replace with a licensed MLS/IDX feed before launch. Do not publish sample listings as real homes.
export const LISTINGS = [
  {
    id: 'sample-1', sample: true, status: 'For sale',
    price: 489900, beds: 4, baths: 3, sqft: 2480, lot: '0.28 acres', year: 2004, type: 'Single family residence',
    hoa: null, taxAnnual: 5320, insuranceAnnual: 1650,
    address: '1234 Sample Ridge Rd', city: 'Burnsville', state: 'MN', zip: '55337',
    tag: 'Three car garage', daysOn: 12, views: 318, saves: 21, updated: 'November 6, 2026',
    listedBy: 'Sample Agent, Huerkamp Home Group', source: 'SAMPLE DATA', mls: 'SAMPLE-0001',
    description: 'SAMPLE LISTING TEXT. This is placeholder copy written to show the layout. A bright two story home on a quiet cul-de-sac with a vaulted living room, updated kitchen with a large island, and a finished lower level with a family room and fourth bedroom. The fenced backyard has a deck for outdoor dining. Close to parks, trails and shopping. Replace this with the real listing remarks from the MLS feed.',
    facts: {
      Interior: [
        ['Bedrooms and bathrooms', ['Bedrooms: 4', 'Bathrooms: 3', 'Full bathrooms: 2', 'Main level bedrooms: 1']],
        ['Heating and cooling', ['Heating: Forced air', 'Cooling: Central air']],
        ['Features', ['Vaulted ceilings', 'Kitchen island', 'Finished lower level', 'Number of fireplaces: 1']],
        ['Interior area', ['Total interior livable area: 2,480 sqft', 'Finished area above ground: 1,780', 'Finished area below ground: 700']],
      ],
      Property: [
        ['Parking', ['Total spaces: 3', 'Attached garage spaces: 3', 'Driveway: Concrete']],
        ['Lot', ['Size: 0.28 acres', 'Fenced yard: Yes', 'Features: Cul-de-sac, mature trees']],
        ['Details', ['Parcel number: SAMPLE-000-00', 'Zoning: Residential']],
      ],
      Construction: [
        ['Type and style', ['Home type: Single family', 'Style: Two story', 'Property subtype: Single family residence']],
        ['Materials', ['Exterior: Vinyl and stone', 'Foundation: Poured concrete']],
        ['Condition', ['Year built: 2004']],
      ],
    },
    priceHistory: [
      ['11/06/2026', 'Price change', 489900, ''],
      ['10/25/2026', 'Listed for sale', 499900, ''],
      ['06/14/2019', 'Sold', 372000, ''],
    ],
    taxHistory: [['2025', 5320, 401000], ['2024', 5104, 389500], ['2023', 4890, 372000]],
    schools: [['Sample Elementary School', 'K-5', 'Assigned'], ['Sample Middle School', '6-8', 'Assigned'], ['Sample High School', '9-12', 'Assigned']],
  },
  {
    id: 'sample-2', sample: true, status: 'For sale',
    price: 359000, beds: 3, baths: 2, sqft: 1820, lot: '0.19 acres', year: 1996, type: 'Single family residence',
    hoa: null, taxAnnual: 4180, insuranceAnnual: 1400,
    address: '5678 Sample Lane', city: 'Lakeville', state: 'MN', zip: '55044',
    tag: 'Updated kitchen', daysOn: 4, views: 142, saves: 9, updated: 'November 5, 2026',
    listedBy: 'Sample Agent, Huerkamp Home Group', source: 'SAMPLE DATA', mls: 'SAMPLE-0002',
    description: 'SAMPLE LISTING TEXT. Placeholder remarks for layout review only.',
    facts: { Interior: [['Bedrooms and bathrooms', ['Bedrooms: 3', 'Bathrooms: 2']]], Property: [['Parking', ['Total spaces: 2']]], Construction: [['Condition', ['Year built: 1996']]] },
    priceHistory: [['10/31/2026', 'Listed for sale', 359000, '']],
    taxHistory: [['2025', 4180, 330000]],
    schools: [],
  },
];

export const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
export function payment({ price, down = 0.2, rate = 6.75, years = 30, taxAnnual = 0, insuranceAnnual = 0, hoa = 0 }) {
  const loan = price * (1 - down);
  const r = rate / 100 / 12, n = years * 12;
  const pi = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));
  return { loan, pi, tax: taxAnnual / 12, ins: insuranceAnnual / 12, hoa, total: pi + taxAnnual / 12 + insuranceAnnual / 12 + hoa };
}
