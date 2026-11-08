// Selling and buying guides (/selling/<guide>): plain answers to the questions lead aggregators (HomeLight, Clever,
// Opendoor, FastExpert) rank on, with Minnesota numbers. Same shape and rules as the downsizing guides
// (src/data/downsizing.ts): every figure names its source; legal and tax points say "ask your attorney or CPA".
import { MN } from './calculators';
import { CONTINGENCIES } from './mls';
import type { Section } from './downsizing';
import { marketFor, REGION, latest, monthLabel } from './market';

const metroDays = (marketFor(REGION) as any)?.daysOnMarket?.r12?.[1] as number | undefined;

export interface SGuide {
  slug: string; title: string; seo: string; description: string; answer: string;
  sections: Section[]; faq: { q: string; a: string }[]; sources: { name: string; url: string }[];
  lead: 'seller-guide' | 'buyer-guide'; topic: string; eyebrow: string;
}
const pct = (x: number) => `${(x * 100).toFixed(2)}%`;
const DEED = pct(MN.deedTax), ERF = pct(MN.erf), DEED_ERF = pct(MN.deedTax + MN.erf);

export const sguides: SGuide[] = [
  {
    slug: 'cost-to-sell-a-house-in-minnesota',
    eyebrow: 'Selling in Minnesota',
    title: 'How much does it cost to sell a house in Minnesota?',
    seo: 'Cost to Sell a House in Minnesota: Deed Tax, Commission, Fees',
    description: `What it costs to sell a home in Minnesota: the ${DEED} state deed tax, real estate commissions after the 2024 rule changes, title and closing fees, payoff and property tax proration, with a free net proceeds calculator.`,
    answer: `Selling a Minnesota home costs the seller the state deed tax of ${DEED} of the price (${DEED_ERF} in Hennepin and Ramsey counties), any commission you agree to pay, title and closing fees, your mortgage payoff, and your share of the year's property taxes. Commissions are negotiable and not set by law, so the biggest cost is the one you decide.`,
    topic: 'Cost to sell a house in Minnesota',
    lead: 'seller-guide',
    sections: [
      { h: 'The Minnesota deed tax', html: `<p>Minnesota charges a deed tax of <strong>${DEED} of the sale price</strong> when the deed is recorded, plus a ${ERF} Environmental Response Fund tax in Hennepin and Ramsey counties (${DEED_ERF} in all). On a $400,000 sale that's $1,320, or $1,360 in Hennepin or Ramsey County. The seller usually pays it, but the purchase agreement decides. (<a href="${MN.deedTaxUrl}" rel="noopener">Minnesota Department of Revenue</a>)</p>` },
      { h: 'Real estate commission after the 2024 changes', html: `<p>Commission is <strong>negotiable and not set by law</strong>. Since August 17, 2024, buyers sign a written agreement with their agent before touring homes, and offers to pay the buyer's agent can no longer be posted on the MLS (National Association of REALTORS® settlement). Sellers can still choose to pay some or all of the buyer's agent's fee, or offer a credit, and it's part of the negotiation on each offer.</p><p>What you pay your listing agent should buy you something: pricing based on real sales, preparation, marketing that reaches buyers, and a negotiator. Ask any agent, including us, exactly what you get for the fee.</p>` },
      { h: 'Title, closing and other costs', html: `<ul><li><strong>Title and closing fees:</strong> the title company's closing fee and the seller's title charges, set by the title company you use.</li><li><strong>Mortgage payoff:</strong> every loan and line of credit on the home is paid off at closing.</li><li><strong>Property taxes:</strong> Minnesota property taxes are split between buyer and seller by the closing date.</li><li><strong>City requirements:</strong> some cities require a point-of-sale inspection or certificate before you sell; see <a href="/selling-in-minnesota">what's required to sell in Minnesota</a>.</li><li><strong>Concessions:</strong> repair credits or closing-cost help you agree to give a buyer.</li></ul>` },
      { h: 'See your own numbers', html: `<p>Our <a href="/calculators/seller-net-proceeds">seller net proceeds calculator</a> works out your deed tax by county, your property tax proration and what you'd walk away with, using the commission and costs you enter. For a real number, get a <a href="/sell#value">free home valuation</a> and we'll show you a net sheet before you decide anything.</p>` },
    ],
    faq: [
      { q: 'Who pays the deed tax in Minnesota, buyer or seller?', a: `The seller usually pays Minnesota's deed tax (${DEED} of the price, ${DEED_ERF} in Hennepin and Ramsey counties), but the purchase agreement decides. The buyer typically pays the mortgage registration tax on a new loan.` },
      { q: 'What is the average realtor commission in Minnesota?', a: 'There is no set or standard commission: it is negotiable and not set by law. Since August 2024, the seller and listing agent agree on the listing fee, and the buyer and their agent agree on the buyer’s agent fee in a written agreement; sellers may still offer to pay part of it.' },
      { q: 'How much will I net from selling my house?', a: 'Sale price minus your mortgage payoff, the deed tax, the commission you agree to, title and closing fees, any concessions, and your share of property taxes. Our seller net proceeds calculator works it out with Minnesota’s deed tax by county.' },
    ],
    sources: [
      { name: 'Minnesota Department of Revenue, deed tax rates', url: MN.deedTaxUrl },
      { name: 'National Association of REALTORS®, consumer guide to written buyer agreements', url: 'https://www.nar.realtor/the-facts/consumer-guide-to-written-buyer-agreements' },
      { name: 'National Association of REALTORS®, settlement FAQs', url: 'https://www.nar.realtor/the-facts/nar-settlement-faqs' },
    ],
  },
  {
    slug: 'cash-offer-vs-listing',
    eyebrow: 'Selling in the Twin Cities',
    title: 'Cash offer or list your home? How to decide',
    seo: 'Cash Offer vs. Listing Your Home in the Twin Cities',
    description: 'Should you take a cash offer (from an investor or an iBuyer like Opendoor) or list your Twin Cities home? How cash offers are priced, what they cost you, and how to compare them with listing, net to net.',
    answer: 'A cash offer trades price for speed and certainty: investors and iBuyers build repairs, holding costs, resale costs and profit into their number, so an offer is usually below what the same home would bring on the open market. It can still be the right choice when timing, condition or certainty matter more than the last dollar. The only fair comparison is net to net: what you walk away with from each.',
    topic: 'Cash offer vs. listing',
    lead: 'seller-guide',
    sections: [
      { h: 'How cash offers are priced', html: `<p>A cash buyer starts from what the home could resell for, then subtracts the repairs they'd make, the months they'd hold it (taxes, insurance, utilities, interest), their costs to resell (commission, deed tax, closing), and their profit. Some iBuyers also charge a service fee and may deduct for repairs found at inspection, so the first number isn't always the final one.</p>` },
      { h: 'When a cash offer makes sense', html: `<ul><li>You need to close on a set date, or quickly.</li><li>The home needs work you can't or don't want to do.</li><li>You're handling an estate or a home from out of state (<a href="/downsizing/selling-a-house-in-probate-minnesota">selling a house in probate</a>).</li><li>You want to skip showings and the chance a buyer's financing falls through.</li></ul>` },
      { h: 'When listing usually nets more', html: `<p>When the home is in reasonable shape and you have a few weeks, listing puts it in front of every buyer at once, and competition sets the price. ${metroDays ? `Across the Twin Cities, homes that sold in the 12 months through ${monthLabel(latest)} spent ${metroDays} days on the market (Minneapolis Area REALTORS®); see our <a href="/market">market reports</a> for each city.` : 'See our <a href="/market">market reports</a> for how fast homes are selling in each city.'}</p>` },
      { h: 'Compare them side by side', html: `<p>We'll get you the best cash offer we can find and, next to it, what you'd likely net by listing, after commission, the Minnesota deed tax and closing costs. Then you choose; there's no obligation either way. <a href="/cash-offer">Request a cash offer and a net comparison</a>, or run your own numbers in the <a href="/calculators/seller-net-proceeds">net proceeds calculator</a>.</p>` },
    ],
    faq: [
      { q: 'Is a cash offer lower than market value?', a: 'Usually, yes: a cash buyer has to cover repairs, holding costs, resale costs and a profit, so their offer is typically below what the home would sell for on the open market. The gap is smaller for homes that need a lot of work.' },
      { q: 'Are iBuyers like Opendoor worth it?', a: 'They can be for sellers who value speed and certainty over price. Compare the offer after all fees and repair deductions with what you would net by listing, and get the final number in writing before you commit.' },
      { q: 'How fast can I close with a cash offer?', a: 'Often within a couple of weeks, since there is no lender, appraisal or financing contingency; the title company still needs time to clear title and prepare closing.' },
    ],
    sources: [
      { name: 'Minneapolis Area REALTORS®, Local Market Update (days on market by city)', url: 'https://maar.stats.10kresearch.com/reports/lmu' },
      { name: 'Minnesota Department of Revenue, deed tax rates', url: MN.deedTaxUrl },
    ],
  },
  {
    slug: 'listing-status-meanings',
    eyebrow: 'Buying in the Twin Cities',
    title: 'What does pending, contingent or coming soon mean?',
    seo: 'Pending vs. Contingent vs. Coming Soon: Listing Statuses Explained',
    description: 'What listing statuses mean when you are house hunting in Minnesota: active, coming soon, contingent (with each NorthstarMLS contingency type), pending, temporarily not available, sold, and whether you can still make an offer.',
    answer: 'Pending means the seller has accepted an offer and the sale is moving toward closing, usually with no conditions left. Contingent means an offer has been accepted but something still has to happen first, such as an inspection or the buyer selling their home, and in NorthstarMLS a contingent home is still available for showings and back-up offers. Coming soon means the home will be listed shortly but isn’t active yet.',
    topic: 'Listing statuses',
    lead: 'buyer-guide',
    sections: [
      { h: 'The statuses you’ll see', html: `<ul><li><strong>Active:</strong> for sale and taking offers.</li><li><strong>Coming soon:</strong> the seller plans to list shortly; ask the listing agent when showings and offers start.</li><li><strong>Contingent:</strong> an offer was accepted with conditions still open (types below). You can usually still see it and make a back-up offer.</li><li><strong>Pending:</strong> under contract and heading to closing. Back-up offers are possible but rarely needed.</li><li><strong>Temporarily not available:</strong> off the market for now, often for repairs or a seller's move; it may come back.</li><li><strong>Sold:</strong> closed. The sale price is public once recorded.</li><li><strong>Canceled or expired:</strong> the listing ended without a sale; the owner may relist or sell another way.</li></ul>` },
      { h: 'NorthstarMLS contingency types', html: `<p>In the Twin Cities MLS (NorthstarMLS), a contingent listing says which condition is open:</p><ul>${Object.entries(CONTINGENCIES).filter(([k]) => k !== 'Application Received').map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}</ul>` },
      { h: 'Can I still make an offer?', html: `<p>On a contingent home, yes: a back-up offer moves into first place if the first deal falls apart. On a pending home it's possible but rarely pays off. On coming soon, ask when the seller will look at offers. Our <a href="/home-search">home search</a> shows each home's status and contingency type, and we can set an alert so you hear the moment a home you like comes back on the market.</p>` },
    ],
    faq: [
      { q: 'What does pending mean in real estate?', a: 'The seller accepted an offer and the sale is under contract and moving toward closing, usually with the conditions already met. It is still possible for a pending sale to fall through before closing.' },
      { q: 'What is the difference between contingent and pending?', a: 'Both mean an offer was accepted. Contingent means a condition is still open (an inspection, the buyer selling their home, association document review, third-party approval), and in NorthstarMLS the home is still available for showings and back-up offers. Pending means it is further along, heading to closing.' },
      { q: 'What does under contract mean?', a: 'The seller and buyer have signed a purchase agreement. In listing terms it shows as contingent (conditions still open) or pending (heading to closing).' },
      { q: 'What does TNAS mean on a listing?', a: 'Temporarily not available for showings: the home is off the market for now, for example for repairs or the seller’s schedule, and may come back on the market.' },
    ],
    sources: [
      { name: 'NorthstarMLS contingency definitions, as shown on Twin Cities listings', url: 'https://www.northstarmls.com/' },
    ],
  },
];
export const sguideHref = (g: SGuide) => `/selling/${g.slug}`;
