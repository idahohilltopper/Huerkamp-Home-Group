// "Selling your home by owner" (FSBO) guides: /for-sale-by-owner and /for-sale-by-owner/<guide>. Replaces the team's
// Lovable FSBO site (retired November 2026). Rules: every legal point links the statute or agency (checked 2026-11-02);
// no unsourced numbers (the Lovable site's stats and testimonials were not carried over: they couldn't be verified);
// no contract templates (an attorney or title company prepares the purchase agreement and deed); fair housing applies.
import type { DGuide } from './downsizing';
import { statewide } from './sale-rules';

export const CHECKED = '2026-11-02';
const MN = (cite: string) => `https://www.revisor.mn.gov/statutes/cite/${cite}`;
const NAR_PROFILE = 'https://www.nar.realtor/newsroom/first-time-home-buyer-share-falls-to-historic-low-of-21-median-age-rises-to-40';
const MDH_WELLS = 'https://www.health.state.mn.us/communities/environment/water/wells/disclosures/index.html';
const MDH_RADON = 'https://www.health.state.mn.us/communities/environment/air/radon/radonre.html';
const NOT_LEGAL = '<p class="fnote">General information, not legal or tax advice. A Minnesota real estate attorney or title company should prepare or review your purchase agreement, deed and closing documents.</p>';

export const fsboGuides: DGuide[] = [
  {
    slug: 'how-to-sell-your-home-by-owner',
    title: 'How to sell your home by owner in Minnesota, step by step',
    seo: 'How to Sell Your Home by Owner (FSBO) in Minnesota: Step by Step',
    description: 'A plain-English FSBO plan for Minnesota: pricing, city inspections, required disclosures, marketing, showings, offers, the purchase agreement and closing.',
    short: 'Pricing, prep, disclosures, marketing, offers and closing, in order.',
    answer: 'To sell your own home in Minnesota: price it from recent sales, get any city inspection your city requires, prepare the disclosures every Minnesota seller owes, market it and run showings, then have a real estate attorney or title company handle the purchase agreement, deed and closing. Fair housing laws apply to you just as they do to agents.',
    topic: 'FSBO plan',
    sections: [
      { h: '1. Price it from real sales', html: `<p>Price is the biggest decision you'll make. Start with what homes like yours have actually sold for, not list prices or online estimates. Our <a href="/market">monthly market reports</a> show median prices, days on market and inventory for every city we cover, and the <a href="/calculators/seller-net-proceeds">net proceeds calculator</a> shows what you'd keep after the Minnesota deed tax and closing costs. We'll also give you a free, no-obligation <a href="/sell#value">home value</a>, even if you sell it yourself.</p>` },
      { h: '2. Check your city’s rules', html: `<p>Some Twin Cities cities require a housing evaluation (Truth in Sale of Housing, time of sale or point of sale) or a sewer inspection before you list, show or close. Minneapolis, for example, requires a Truth in Sale of Housing report before the home can be shown. See <a href="/selling-in-minnesota">which cities require what</a>, with each city’s own link.</p>` },
      { h: '3. Prepare the disclosures', html: `<p>Every Minnesota seller owes the buyer certain written disclosures before a purchase agreement is signed: known material facts (or an agreed waiver), wells, septic systems, radon, lead-based paint for homes built before 1978, methamphetamine production, and association documents for condos and townhomes. Our <a href="/for-sale-by-owner/fsbo-paperwork">FSBO paperwork checklist</a> lists each one with the law and the official form or publication.</p>` },
      { h: '4. Get the house ready', html: `<p>Clean, declutter, fix what an inspector will flag, and take bright, wide photos on a sunny day; most buyers decide whether to visit from the photos. See <a href="/downsizing/selling-a-longtime-home">what to fix and what to leave</a>.</p>` },
      { h: '5. Market it', html: `<p>A yard sign, an online listing and an open house are the basics. The MLS, which feeds most home-search sites, accepts listings only from licensed brokers. Write the ad about the home, not about who should live in it: the federal Fair Housing Act and the Minnesota Human Rights Act apply to private sellers too, so avoid phrases about the kind of buyer you want (<a href="https://www.hud.gov/program_offices/fair_housing_equal_opp" rel="noopener">HUD fair housing</a>).</p>` },
      { h: '6. Showings and safety', html: `<p>Schedule showings by appointment, ask for the buyer’s name and phone number beforehand, put away valuables and prescription medicines, and have a second person at home. Many buyers will want proof of a loan pre-approval or funds before a showing.</p>` },
      { h: '7. Offers and the purchase agreement', html: `<p>Minnesota has no state-required purchase agreement form. The standard forms agents use are licensed to them, so for a by-owner sale have a real estate attorney draft or review the agreement, including contingencies (financing, inspection, appraisal), earnest money, the closing date and who pays which costs. Buyers working with an agent now sign a written agreement with that agent, and you decide whether to offer anything toward the buyer’s agent (<a href="https://www.nar.realtor/the-facts" rel="noopener">NAR</a>); settle that in writing before you sign.</p>` },
      { h: '8. Closing', html: `<p>A title company or attorney orders the title work, prepares the deed and your settlement statement, gets your loan payoff, files the electronic Certificate of Real Estate Value (<a href="https://www.revenue.state.mn.us/mndor-pp/356?type=html" rel="noopener">eCRV</a>) and collects the state deed tax (<a href="https://www.revenue.state.mn.us/deed-tax-rate" rel="noopener">Minnesota Department of Revenue</a>). If there are wells on the property, a Well Disclosure Certificate is filed at closing (<a href="${MDH_WELLS}" rel="noopener">Minnesota Department of Health</a>).</p>${NOT_LEGAL}` },
    ],
    faq: [
      { q: 'Can I sell my house without a real estate agent in Minnesota?', a: 'Yes. Minnesota does not require an agent. You still owe the buyer the required disclosures (Minn. Stat. 513.52–513.60 and others), any inspection your city requires, and a proper deed and closing, usually handled by a title company or attorney.' },
      { q: 'What does a for-sale-by-owner seller have to disclose in Minnesota?', a: 'Known material facts about the property (or a written waiver both sides sign), wells, septic systems, radon information with the Minnesota Department of Health publication, lead-based paint for homes built before 1978, known methamphetamine production, and association resale documents for condos and townhomes.' },
      { q: 'Do I need a lawyer to sell my house by owner?', a: 'Minnesota doesn’t require one, but a real estate attorney or title company should prepare or review the purchase agreement and deed, since mistakes there are expensive to fix.' },
      { q: 'Can I list my home on the MLS without an agent?', a: 'Not directly. The MLS accepts listings only from licensed brokers. Some brokerages offer limited-service MLS entry for a fee.' },
    ],
    sources: [
      { name: 'Minn. Stat. 513.52–513.60 (seller disclosure)', url: MN('513.55') },
      { name: 'Minnesota Department of Health, well disclosure at property transfer', url: MDH_WELLS },
      { name: 'Minnesota Department of Health, radon in real estate', url: MDH_RADON },
      { name: 'Minnesota Department of Revenue, deed tax', url: 'https://www.revenue.state.mn.us/deed-tax-rate' },
      { name: 'HUD, fair housing', url: 'https://www.hud.gov/program_offices/fair_housing_equal_opp' },
      { name: 'NAR, what the 2024 settlement changed for buyers and sellers', url: 'https://www.nar.realtor/the-facts' },
    ],
    posts: ['2025/2/27/7-reasons-why-fsbos-dont-actually-work', '2022/10/27/the-3-things-you-must-do-before-listing-your-home-for-sale', '2022/10/27/common-closing-costs-to-prepare-for-when-selling-your-home'],
  },
  {
    slug: 'fsbo-paperwork',
    title: 'FSBO paperwork checklist for Minnesota',
    seo: 'FSBO Paperwork Checklist for Minnesota Home Sellers',
    description: 'Every document in a Minnesota by-owner home sale: required disclosures, city inspection reports, the purchase agreement, deed, eCRV and closing papers, with the official sources.',
    short: 'Every disclosure and document, with the law and the official source.',
    answer: 'A Minnesota by-owner sale needs the seller’s disclosures (material facts, wells, septic, radon, lead paint for pre-1978 homes, meth, and association documents for condos and townhomes), any city inspection report, a purchase agreement, and the closing documents a title company or attorney prepares: the deed, the eCRV and the settlement statement.',
    topic: 'FSBO paperwork',
    sections: [
      { h: '1. Disclosures you give the buyer', html: `<p>Before the purchase agreement is signed:</p><ul>${statewide.filter((s) => s.title !== 'Deed tax').map((s) => `<li><strong>${s.title}.</strong> ${s.text} <a href="${s.url}" rel="noopener">${s.cite}</a></li>`).join('')}</ul><p>The Minnesota Department of Health publishes the required radon booklet (<a href="${MDH_RADON}" rel="noopener">MDH radon in real estate</a>) and the well disclosure rules and forms (<a href="${MDH_WELLS}" rel="noopener">MDH well disclosure</a>). There is no state-issued seller disclosure form; the law lists what must be disclosed.</p>` },
      { h: '2. City inspection reports', html: `<p>If your city requires a Truth in Sale of Housing, time-of-sale or sewer inspection, the report or certificate is part of your paperwork, often before the first showing. <a href="/selling-in-minnesota">See your city</a>.</p>` },
      { h: '3. The purchase agreement and addenda', html: `<p>The contract between you and the buyer: price, earnest money, contingencies, closing date, what stays with the house and who pays which costs, plus any addenda (for example, an inspection or financing addendum). Have a Minnesota real estate attorney draft or review it.</p>` },
      { h: '4. What the title company or attorney prepares', html: `<ul><li>Title commitment and payoff statement for your mortgage.</li><li>The deed, including the well certification or Well Disclosure Certificate.</li><li>The electronic Certificate of Real Estate Value (<a href="https://www.revenue.state.mn.us/mndor-pp/356?type=html" rel="noopener">eCRV</a>), required to record the deed.</li><li>The settlement statement showing the deed tax (<a href="https://www.revenue.state.mn.us/deed-tax-rate" rel="noopener">0.33% of the price, plus 0.01% in Hennepin and Ramsey counties</a>), prorated property taxes and your net proceeds.</li></ul>` },
      { h: '5. Keep for your records', html: `<p>Keep the signed purchase agreement, disclosures, inspection reports and settlement statement. You’ll want the settlement statement at tax time; see <a href="/downsizing/taxes-when-you-sell">taxes when you sell</a>.</p>${NOT_LEGAL}` },
    ],
    faq: [
      { q: 'Is there an official Minnesota seller disclosure form?', a: 'No. Minnesota law (Minn. Stat. 513.52–513.60) says what must be disclosed, not which form to use. A written disclosure statement, an inspection report that meets the law, or a signed waiver can satisfy it.' },
      { q: 'Who files the Well Disclosure Certificate?', a: 'It is filed at closing when there are wells on the property, usually by the title company or attorney (Minnesota Department of Health). If there are no wells, the seller certifies that on the deed.' },
      { q: 'What is an eCRV?', a: 'The electronic Certificate of Real Estate Value, filed with the Minnesota Department of Revenue when property is sold. The county won’t record the deed without it; title companies usually file it.' },
    ],
    sources: [
      ...statewide.map((s) => ({ name: `${s.cite} (${s.title.toLowerCase()})`, url: s.url })),
      { name: 'Minnesota Department of Health, well disclosure', url: MDH_WELLS },
      { name: 'Minnesota Department of Health, radon in real estate', url: MDH_RADON },
      { name: 'Minnesota Department of Revenue, eCRV', url: 'https://www.revenue.state.mn.us/mndor-pp/356?type=html' },
    ],
    posts: ['2022/10/27/common-closing-costs-to-prepare-for-when-selling-your-home', '2022/10/27/which-real-estate-documents-should-you-keep-after-closing'],
  },
  {
    slug: 'should-you-sell-by-owner',
    title: 'Should you sell by owner? An honest comparison',
    seo: 'FSBO vs. Listing With an Agent: An Honest Comparison',
    description: 'What you take on when you sell your own home in Minnesota, what an agent does, how commission works now, and a middle path: a free pricing and paperwork second opinion.',
    short: 'What you take on, what you save, and a free second opinion.',
    answer: 'Selling by owner can save the listing commission, but you take on pricing, marketing, showings, negotiation and the paperwork, and most sellers still hire an agent: 91% of sellers in NAR’s 2025 survey used one. If you want to try it yourself, we’ll give you a free home value and a second opinion on your price, paperwork and offers, with no obligation.',
    topic: 'Should I sell by owner',
    sections: [
      { h: '1. What you take on', html: `<ul><li><strong>Pricing:</strong> too high and the home sits; too low and you leave money on the table.</li><li><strong>Exposure:</strong> no MLS listing unless you pay a broker for one.</li><li><strong>Showings and screening buyers:</strong> scheduling, safety, and checking pre-approvals.</li><li><strong>Negotiation:</strong> price, repairs after the inspection, and the appraisal.</li><li><strong>Paperwork:</strong> disclosures, city inspections and an attorney-reviewed contract (<a href="/for-sale-by-owner/fsbo-paperwork">checklist</a>).</li></ul>` },
      { h: '2. What most sellers do', html: `<p>In the National Association of REALTORS® 2025 Profile of Home Buyers and Sellers, covering sales from July 2024 to June 2025, 91% of sellers used an agent (<a href="${NAR_PROFILE}" rel="noopener">NAR</a>).</p>` },
      { h: '3. How commission works now', html: `<p>Commission is negotiable, and since August 2024 buyers who work with an agent sign a written agreement with that agent; as a seller you decide whether to offer anything toward the buyer’s agent (<a href="https://www.nar.realtor/the-facts" rel="noopener">NAR</a>). Run your own numbers in the <a href="/calculators/seller-net-proceeds">net proceeds calculator</a>, with and without a commission.</p>` },
      { h: '4. A middle path', html: `<p>If you’re selling yourself, we’ll still help for free: a home value based on recent sales, a look at your price and your paperwork list, and a second opinion on any offer. If it isn’t working after a few weeks, you’ll know who to call. No pressure, and no obligation.</p>${NOT_LEGAL}` },
    ],
    faq: [
      { q: 'How many home sellers use an agent?', a: '91% of sellers used an agent in the National Association of REALTORS® 2025 Profile of Home Buyers and Sellers, which covers sales from July 2024 to June 2025.' },
      { q: 'Will you help me if I sell my own home?', a: 'Yes. We’ll give you a free home value and a second opinion on your price, paperwork and offers, with no obligation to list with us.' },
    ],
    sources: [
      { name: 'NAR, 2025 Profile of Home Buyers and Sellers (news release)', url: NAR_PROFILE },
      { name: 'NAR, what the 2024 settlement changed', url: 'https://www.nar.realtor/the-facts' },
    ],
    posts: ['2025/2/27/7-reasons-why-fsbos-dont-actually-work', '2022/10/27/5-things-you-save-when-you-hire-a-real-estate-agent-to-sell-your-home', '2022/10/27/5-risky-moves-homeowners-usually-make-when-selling-their-house'],
  },
];

export const fsboHref = (g: DGuide) => `/for-sale-by-owner/${g.slug}`;
