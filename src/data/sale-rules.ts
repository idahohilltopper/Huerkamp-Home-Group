// What a seller has to do before selling, city by city. Every entry is from the city's own website, checked
// 2026-10-27. Only cities whose requirement we confirmed are listed; for every other city the page says to
// confirm with the city. Re-check yearly: cities add and repeal these programs (Hopkins repealed in 2021).

export type RuleKind = 'housing' | 'sewer' | 'repealed';
export interface SaleRule {
  slug: string;
  kind: RuleKind;
  program: string;          // what the city calls it
  summary: string;          // one sentence, plain English
  details: string[];        // short facts
  contact?: string;
  url: string;              // official page
}

export const saleRules: SaleRule[] = [
  {
    slug: 'minneapolis', kind: 'housing', program: 'Truth in Sale of Housing (TISH)',
    summary: 'Sellers must have a full Truth in Sale of Housing report from a licensed evaluator before the home can be shown.',
    details: [
      'Applies to single-family houses, duplexes, townhouses and first-time condominium conversions.',
      'Covers sales by owner or agent, contracts for deed and other title transfers.',
      'The evaluation can lead to required repairs, which are then reinspected.',
      'Not needed if the city has issued a Certificate of Code Compliance (good for a year) or a Certificate of Occupancy for a new home.',
    ],
    contact: 'Minneapolis TISH, 612-673-5840', url: 'https://www.minneapolismn.gov/resident-services/property-housing/buying-selling/tish/',
  },
  {
    slug: 'saint-paul', kind: 'housing', program: 'Truth-in-Sale of Housing (TISH)',
    summary: 'A licensed evaluator’s TISH report is required within three days of listing or advertising a home for sale.',
    details: [
      'Applies to single-family homes, duplexes, condominiums and townhomes; buildings with three or more units are exempt.',
      'The report is for disclosure only. For single-family homes, the one required repair is a working hard-wired smoke alarm.',
      'A report is valid for 365 days and for one sale.',
    ],
    url: 'https://www.stpaul.gov/departments/safety-inspections/rent-buy-sell-property/selling-or-buying-properties/truth-sale-housing',
  },
  {
    slug: 'bloomington', kind: 'housing', program: 'Time-of-Sale Housing Inspection',
    summary: 'A Time-of-Sale evaluation must be completed and filed before the home is listed.',
    details: [
      'Applies to single- and two-family homes, condominiums, townhouses and mobile homes; buildings with four or more units are excluded.',
      'The report goes to the city within 7 days of the evaluation.',
      'Hazards must be corrected, or assumed by the buyer, and city-inspected. The program includes an energy disclosure (since April 2022).',
    ],
    url: 'https://bloomingtonmn.gov/node/5236',
  },
  {
    slug: 'richfield', kind: 'housing', program: 'Point of Sale Inspection',
    summary: 'A city housing inspector must inspect the home before closing.',
    details: [
      'Applies to single-family and two-family homes, including condominiums.',
      'The inspection can be done any time during the sale, but must be finished before title transfers. Apply online, then schedule.',
      'If the buyer takes on repairs, closing proceeds only under the conditions in the city’s brochure.',
    ],
    contact: 'Richfield Inspections, 612-861-9882',
    url: 'https://www.richfieldmn.gov/departments/community_development/permits,_inspections___licenses/point_of_sale_inspections.php',
  },
  {
    slug: 'st-louis-park', kind: 'housing', program: 'Point-of-sale (property maintenance) inspection',
    summary: 'Before listing, sellers apply for a property maintenance inspection permit and have the city inspect the home.',
    details: ['Applies to residential, commercial and industrial property.', 'Code corrections found in the inspection are usually made by the seller.'],
    contact: 'Building and Energy, 952-924-2588', url: 'https://stlouisparkmn.gov/our-city/resident-resources/housing-inspection',
  },
  {
    slug: 'maplewood', kind: 'housing', program: 'Truth in Housing',
    summary: 'A Truth in Housing evaluation by a city-licensed evaluator is required before listing or showing the home.',
    details: ['The evaluation is for disclosure; the sale doesn’t depend on fixing what it lists.'],
    contact: 'City of Maplewood, 651-249-2300', url: 'https://www.maplewoodmn.gov/251/Truth-in-Housing',
  },
  {
    slug: 'new-hope', kind: 'housing', program: 'Point of Sale Inspection',
    summary: 'A city inspector inspects the home and any required repairs are made before the sale.',
    details: ['Applies to all residential sales: single-family homes, condos, townhomes and apartment buildings.', 'The fee covers the inspection and one reinspection.'],
    contact: 'New Hope Inspections, 763-531-5127', url: 'https://newhopemn.gov/live/housing/point_of_sale',
  },
  {
    slug: 'columbia-heights', kind: 'housing', program: 'Time of Sale Program',
    summary: 'Sellers need a Certificate of Property Maintenance before selling, gifting or transferring the home.',
    details: ['Applies to single-, two- and three-family homes, condominiums, townhouses and mobile homes.'],
    contact: 'Community Development, 763-706-3670', url: 'https://columbiaheightsmn.gov/departments/community_development/time_of_sale_program.php',
  },
  {
    slug: 'south-st-paul', kind: 'housing', program: 'Time-of-Sale Housing Inspection',
    summary: 'A Time-of-Sale evaluation report from a city-licensed evaluator must be available when the home is shown.',
    details: ['Applies to single-family, two-family and multiple-family dwellings.', 'Evaluators set their own prices.'],
    url: 'https://www.southstpaulmn.gov/126/Time-of-Sale',
  },
  {
    slug: 'golden-valley', kind: 'sewer', program: 'Inflow and infiltration (I/I) compliance',
    summary: 'A home without a Certificate of I/I Compliance must have its sewer inspected before it can be advertised for sale.',
    details: [
      'The city televises the sewer line from the house to the main and checks the sump pump and roof drains for illegal connections.',
      'Repairs are due within 180 days (one 180-day extension); if they can’t be done before closing, escrow is required.',
      'The certificate stays with the property after the sale.',
    ],
    url: 'https://goldenvalleymn.gov/358/Inflow-Infiltration',
  },
  {
    slug: 'west-st-paul', kind: 'sewer', program: 'Inflow and infiltration (I&I) inspection',
    summary: 'A sewer (I&I) inspection must be completed before a property is sold.',
    details: ['The city schedules the inspection at no charge: a camera inspection of the sewer and a sump check.', 'A compliance letter is good for 10 years (25 if the whole line was lined or replaced).'],
    url: 'https://wspmn.gov/403/Inflow-and-Infiltration',
  },
  {
    slug: 'orono', kind: 'sewer', program: 'Certificate of I/I Compliance',
    summary: 'Properties on city sewer need a Certificate of Inflow and Infiltration Compliance before they’re sold.',
    details: ['The inspection looks for roof drains, foundation drains and sump pumps connected to the sanitary sewer.', 'Residential fee: $250. Homes on private septic systems aren’t part of this program.'],
    contact: 'City of Orono, 952-249-4686', url: 'https://oronomn.gov/501/Inflow-Infiltration',
  },
  {
    slug: 'mounds-view', kind: 'sewer', program: 'Sewer lateral inspection (Ordinance 967)',
    summary: 'Before title transfers, the sewer line from the house to the main must be televised and, if needed, repaired.',
    details: ['Repairs are due within 90 days, and the property can’t transfer until they’re made; closing in escrow is allowed.'],
    url: 'https://www.moundsviewmn.gov/government/city_departments/public_works/hopp.php',
  },
  {
    slug: 'st-anthony', kind: 'sewer', program: 'Inflow and infiltration (I/I) inspection',
    summary: 'Two inspections are required before a property is advertised or sold: a sump pump check and a televised sewer inspection.',
    details: ['Individual condominium sales are exempt.', 'A Certificate of I/I Compliance is valid for 3 years (longer after sewer work).', 'The seller fixes violations before the sale unless the buyer takes them on in writing.'],
    url: 'https://www.savmn.com/622/Inflow-Infiltration',
  },
  {
    slug: 'hopkins', kind: 'repealed', program: 'Truth-in-Housing (repealed)',
    summary: 'Hopkins no longer requires a Truth-in-Housing evaluation to sell a home. The requirement was repealed effective January 14, 2021.',
    details: [],
    url: 'https://hopkinsmn.com/758/Truth-in-Housing',
  },
];

export const ruleFor = (slug: string) => saleRules.find((r) => r.slug === slug);
export const CHECKED = '2026-10-27';

// Statewide requirements for every Minnesota home sale (Minnesota Statutes, revisor.mn.gov).
export const statewide = [
  { title: 'Seller’s disclosure', text: 'Sellers must disclose material facts they know about that could significantly affect the buyer’s use or enjoyment of the property, using a written disclosure or an inspection report, or both sides can agree in writing to waive it.', cite: 'Minn. Stat. 513.52–513.60', url: 'https://www.revisor.mn.gov/statutes/cite/513.55' },
  { title: 'Wells', text: 'Before signing a purchase agreement, the seller must disclose in writing whether there are any wells on the property and their status; a well disclosure certificate is filed with the deed.', cite: 'Minn. Stat. 103I.235', url: 'https://www.revisor.mn.gov/statutes/cite/103I.235' },
  { title: 'Septic systems', text: 'Sellers must disclose whether the home has a septic (subsurface sewage treatment) system and where it is. Many counties also require a compliance inspection before the sale, for example Dakota County.', cite: 'Minn. Stat. 115.55, subd. 6', url: 'https://www.revisor.mn.gov/statutes/cite/115.55' },
  { title: 'Radon', text: 'Before the purchase agreement, sellers must disclose what they know about radon testing, levels and any mitigation system, include the state’s radon warning statement and give the buyer the Minnesota Department of Health publication “Radon in Real Estate Transactions.”', cite: 'Minn. Stat. 144.496', url: 'https://www.revisor.mn.gov/statutes/cite/144.496' },
  { title: 'Lead-based paint', text: 'For homes built before 1978, federal law requires a lead-based paint disclosure and pamphlet, and gives buyers a chance to test.', cite: '42 U.S.C. 4852d', url: 'https://www.epa.gov/lead/real-estate-disclosures-about-potential-lead-hazards' },
  { title: 'Methamphetamine production', text: 'Sellers must disclose in writing if they know methamphetamine was produced on the property.', cite: 'Minn. Stat. 152.0275', url: 'https://www.revisor.mn.gov/statutes/cite/152.0275' },
  { title: 'Condos and townhomes', text: 'In most common-interest communities, the seller provides the association’s resale disclosure information. Unless the buyer had it more than 10 days before signing, the buyer can cancel within 10 days of receiving it.', cite: 'Minn. Stat. 515B.4-107 and 515B.4-108', url: 'https://www.revisor.mn.gov/statutes/cite/515B.4-107' },
  { title: 'Deed tax', text: 'A state deed tax of 0.33% of the sale price (plus 0.01% in Hennepin and Ramsey counties) is due when the deed is recorded; sellers usually pay it.', cite: 'Minnesota Department of Revenue', url: 'https://www.revenue.state.mn.us/deed-tax-rate' },
];
