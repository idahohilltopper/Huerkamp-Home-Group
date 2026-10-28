// Short sale and foreclosure guides (/foreclosure and /foreclosure/<guide>): help for homeowners who are behind
// on payments, how Minnesota foreclosure works, short sales, and buying foreclosures.
// Rules: every legal point cites the Minnesota statute, federal rule or agency it comes from (sources[] on each
// guide), checked 2026-10-28. No invented timelines, stats or promises ("we can stop your foreclosure" is never
// said). Legal and tax points say to talk to an attorney, a HUD/Minnesota Housing-approved counselor or a CPA.
// Reverse mortgages are left out on purpose: the team is a Ramsey Endorsed Local Provider.
import type { DGuide } from './downsizing';
import { site } from './site';
import { homeSearchHref } from './search';

export type FGuide = DGuide & { audience: 'owner' | 'buyer' };

export const CHECKED = '2026-10-28';
const MN = (cite: string) => `https://www.revisor.mn.gov/statutes/cite/${cite}`;
export const HOC = { name: 'Minnesota Homeownership Center', phone: '866-462-6466', local: '651-659-9336', url: 'https://www.hocmn.org/for-homeowners/foreclosure-prevention/' };
// Jason Huerkamp, 2026-10-28 (hundreds of short sales; the partner firm, which agreed to be named). The firm's count is its own published
// figure (mzlawshortsales.com, "Meet the team", checked 2026-10-28); no "most in Minnesota" claim without a source.
export const LAWFIRM = { name: 'Markve, Zweifel & Heinrich, PLLC', url: 'https://www.mzlawshortsales.com/', closed: 'more than 4,000', since: 2009 };
export const EXPERIENCE = `Huerkamp Home Group has handled hundreds of short sales, and we work with ${LAWFIRM.name}, a Minnesota law firm whose short sale team has closed ${LAWFIRM.closed} short sales for Minnesota homeowners since ${LAWFIRM.since}.`;
const NOT_LEGAL = '<p class="fnote">This is general information about Minnesota law, not legal advice. Your notices, your loan and your lender’s rules decide the details; an attorney or a free foreclosure prevention advisor can look at your papers.</p>';

export const fguides: FGuide[] = [
  {
    slug: 'behind-on-your-mortgage',
    audience: 'owner',
    title: 'Behind on your mortgage? Your options in Minnesota',
    seo: 'Behind on Your Mortgage in Minnesota? Options to Avoid Foreclosure',
    description: 'What to do when you’ve missed mortgage payments in Minnesota: free counseling, forbearance, repayment plans, loan modification, selling, short sales and deeds in lieu, and how to avoid foreclosure scams.',
    short: 'Free help, ways to keep the home, ways to leave on your terms, and scams to avoid.',
    answer: 'Act early. Call your loan servicer and a free foreclosure prevention advisor at the Minnesota Homeownership Center (866-462-6466) as soon as you know you’ll miss a payment. Federal rules generally keep a servicer from starting foreclosure until you’re more than 120 days behind, and that time is your best window to keep the home or sell it on your terms.',
    topic: 'Behind on mortgage',
    sections: [
      { h: '1. Open the mail and call your servicer', html: `<p>The company you send payments to (your servicer) has to work with you on options, but only if you ask. Call, explain what happened (job loss, illness, divorce, a payment jump) and ask what <strong>loss mitigation</strong> options your loan has. Write down who you spoke with and when, and keep copies of everything you send.</p><p>Under federal mortgage servicing rules, a servicer generally can’t make the first foreclosure filing until the loan is <strong>more than 120 days delinquent</strong> (12 CFR 1024.41(f)). If you send a <strong>complete</strong> application for help more than 37 days before a foreclosure sale, the servicer generally can’t hold the sale while it reviews it (12 CFR 1024.41(g)).</p>` },
      { h: '2. Get a free foreclosure prevention advisor', html: `<p>Minnesota has free, nonprofit foreclosure prevention advisors through the <a href="${HOC.url}" rel="noopener">${HOC.name}</a>: call <a href="tel:+18664626466">${HOC.phone}</a> (toll free) or ${HOC.local}. Before a Minnesota foreclosure starts, the lender has to send you a notice that this counseling is available and pass your contact information to an approved agency (Minn. Stat. 580.021). An advisor can help you apply to your servicer and explain your loan’s options. It costs nothing.</p>` },
      { h: '3. Ways to keep the home', html: `<ul><li><strong>Reinstatement:</strong> pay the past-due amount plus allowed costs. In Minnesota you can reinstate any time before the sheriff’s sale, and the lender has to give you the figure within three days of asking (Minn. Stat. 580.30).</li><li><strong>Repayment plan:</strong> catch up over several months on top of your regular payment.</li><li><strong>Forbearance:</strong> a temporary pause or reduction in payments; the skipped amount still has to be repaid or added to the loan later.</li><li><strong>Loan modification:</strong> a permanent change to the loan (rate, term or balance) meant to lower the payment.</li></ul><p>Which of these you can get depends on who owns or insures your loan (for example Fannie Mae, Freddie Mac, FHA, VA or USDA) and your income. See the CFPB’s <a href="https://www.consumerfinance.gov/housing/housing-insecurity/help-for-homeowners/avoid-foreclosure/" rel="noopener">guide to avoiding foreclosure</a>.</p>` },
      { h: '4. Ways to leave on your terms', html: `<ul><li><strong>Sell the home.</strong> If you have equity, a regular sale usually leaves you the most money and does less harm to your credit than a foreclosure, short sale or deed in lieu (CFPB). Start early: a sale has to close before the sheriff’s sale or within the redemption period. Our <a href="/calculators/seller-net-proceeds">net proceeds calculator</a> shows what you might walk away with, and we can give you a free <a href="/sell#value">home value</a>.</li><li><strong>Short sale.</strong> If you owe more than the home will sell for, your lender can agree to accept less. See <a href="/foreclosure/short-sale">how a short sale works</a>; our team has handled hundreds of them.</li><li><strong>Deed in lieu of foreclosure.</strong> You give the home back to the lender instead of going through foreclosure; ask in writing whether any remaining balance will be forgiven.</li></ul>` },
      { h: '5. Watch out for foreclosure “rescue” scams', html: `<p>People facing foreclosure get letters, calls and knocks on the door. Minnesota law protects you:</p><ul><li>A paid <strong>foreclosure consultant</strong> must give you a written contract, can’t collect any fee until the promised services are fully done, and can’t take a deed, lien or mortgage on your home. You can cancel until midnight of the third business day after you sign (Minn. Stat. 325N.02 to 325N.04).</li><li>If someone offers to buy your home and let you rent or buy it back later, that is an <strong>equity purchase</strong>. Minnesota requires a written contract and gives you at least five business days to cancel (Minn. Stat. 325N.13), and the buyer must check that you can actually afford to buy it back (325N.17).</li></ul><p>Never sign over your deed or pay an upfront fee to “stop” a foreclosure. Free help is available at the number above.</p>` },
      { h: '6. If you can’t catch up', html: `<p>Even after a sheriff’s sale, Minnesota homeowners usually have <strong>six months</strong> to sell or redeem the home and can live there during that time (Minn. Stat. 580.23). See <a href="/foreclosure/minnesota-foreclosure-process">the Minnesota foreclosure process</a> for each step and deadline. Bankruptcy can also pause a foreclosure; that is a question for a bankruptcy attorney.</p>${NOT_LEGAL}` },
    ],
    faq: [
      { q: 'How many payments can I miss before foreclosure starts in Minnesota?', a: 'Federal servicing rules generally keep a servicer from making the first foreclosure filing until the loan is more than 120 days delinquent (12 CFR 1024.41(f)). Late fees and credit reporting can start much sooner, so call your servicer and a free advisor right away.' },
      { q: 'Is there free foreclosure help in Minnesota?', a: 'Yes. The Minnesota Homeownership Center connects homeowners with free foreclosure prevention advisors statewide: 866-462-6466 (toll free) or 651-659-9336.' },
      { q: 'Can I sell my house if I’m behind on payments?', a: 'Yes. You can sell before the sheriff’s sale and, in most Minnesota foreclosures, during the redemption period after it. If the sale covers what you owe, the loan is paid off at closing. If it doesn’t, the lender has to approve a short sale.' },
      { q: 'Do foreclosure consultants charge upfront fees?', a: 'They aren’t allowed to in Minnesota. A foreclosure consultant can’t collect any compensation until the contracted services are fully performed, and you can cancel the contract until midnight of the third business day after signing (Minn. Stat. 325N.02 to 325N.04).' },
    ],
    sources: [
      { name: 'CFPB, 12 CFR 1024.41 (loss mitigation; 120-day and 37-day rules)', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1024/41/' },
      { name: 'CFPB, Avoid foreclosure', url: 'https://www.consumerfinance.gov/housing/housing-insecurity/help-for-homeowners/avoid-foreclosure/' },
      { name: 'Minnesota Homeownership Center, foreclosure prevention', url: HOC.url },
      { name: 'Minn. Stat. 580.021 (foreclosure prevention counseling notice)', url: MN('580.021') },
      { name: 'Minn. Stat. 580.30 (reinstatement before sale)', url: MN('580.30') },
      { name: 'Minn. Stat. 580.23 (redemption period)', url: MN('580.23') },
      { name: 'Minn. Stat. chapter 325N (foreclosure consultants and equity purchasers)', url: 'https://www.revisor.mn.gov/statutes/cite/325N/full' },
    ],
    posts: ['2022/10/27/notice-of-intent-to-foreclose-know-your-options', '2022/10/27/how-to-properly-deal-with-the-threat-of-foreclosure', '2023/6/9/what-is-the-difference-between-short-sales-and-foreclosures'],
  },
  {
    slug: 'minnesota-foreclosure-process',
    audience: 'owner',
    title: 'How foreclosure works in Minnesota, step by step',
    seo: 'Minnesota Foreclosure Process and Timeline, Step by Step',
    description: 'The Minnesota foreclosure timeline in plain English: notices, the six-week published notice, the sheriff’s sale, the six-month redemption period, moving out, deficiency rules and tenants’ rights.',
    short: 'Every notice and deadline, from missed payments to the end of redemption.',
    answer: 'Most Minnesota home foreclosures are done “by advertisement,” without a court case. After you’re more than 120 days behind, the lender publishes a notice of sale for six weeks and serves it on you at least four weeks before the sheriff’s sale. After the sale you usually have six months to redeem or sell, and you can stay in the home until that period ends (Minn. Stat. 580.03, 580.23).',
    topic: 'Minnesota foreclosure process',
    sections: [
      { h: '1. Missed payments and the 120-day window', html: `<p>Under federal rules, a servicer generally can’t make the first foreclosure filing until you’re more than 120 days behind (12 CFR 1024.41(f)). Use this time: apply for help, talk to a free advisor (<a href="tel:+18664626466">${HOC.phone}</a>), or get your home’s value so you know whether selling is an option.</p>` },
      { h: '2. The counseling notice', html: `<p>Before the foreclosure is recorded, the lender must tell you in writing that free foreclosure prevention counseling is available, and send your name and contact information to an approved counseling agency (Minn. Stat. 580.021).</p>` },
      { h: '3. Notice of sale: six weeks in the newspaper, served on you', html: `<p>The notice of the sheriff’s sale is published for <strong>six weeks</strong> in a legal newspaper and served on the people living in the home at least <strong>four weeks before the sale</strong> (Minn. Stat. 580.03). It lists the amount claimed, the sale date and place, the redemption period, and, for an owner-occupied single-family home, the date you must move out if you don’t reinstate or redeem (Minn. Stat. 580.04).</p>` },
      { h: '4. Before the sale: reinstate or postpone', html: `<ul><li><strong>Reinstate:</strong> paying what’s past due plus allowed costs any time before the sale stops the foreclosure (Minn. Stat. 580.30).</li><li><strong>Postpone:</strong> the owner of a one-to-four-unit homestead can postpone the sale once, by about five months, by recording a sworn affidavit at least 15 days before the sale. The trade-off: the redemption period after the postponed sale drops to <strong>five weeks</strong> (Minn. Stat. 580.07, subd. 2). It buys time before the sale, not after it.</li></ul>` },
      { h: '5. The sheriff’s sale', html: `<p>The county sheriff auctions the home at the date and place in the notice. The lender usually bids first; the winning bidder gets a <strong>sheriff’s certificate of sale</strong>, not the keys (<a href="https://www.hennepinsheriff.org/services/foreclosure-sales/Slide-out-group/foreclosure-sale-process" rel="noopener">Hennepin County Sheriff</a>). You still own and live in the home during the redemption period.</p>` },
      { h: '6. The redemption period', html: `<p>After the sale, you can <strong>redeem</strong> (pay the sale amount plus interest and allowed costs) or <strong>sell the home</strong> and pay off the certificate at closing. The usual period is:</p><ul><li><strong>Six months</strong> for most homes (Minn. Stat. 580.23, subd. 1).</li><li><strong>Twelve months</strong> in some cases, for example when the amount claimed is less than two-thirds of the original loan amount, or for larger acreage (580.23, subd. 2).</li><li><strong>Five weeks</strong> if the sale was postponed by the owner (580.07) or a court finds the home abandoned (Minn. Stat. 582.032).</li></ul><p>Your notice and the sheriff’s certificate state your exact period. If the home has equity, selling during redemption can let you keep that equity instead of losing it.</p>` },
      { h: '7. When redemption ends', html: `<p>If you don’t redeem, the buyer at the sheriff’s sale owns the home when the period ends, and you have to be out by 11:59 p.m. on the date in your notice (Minn. Stat. 580.04). <strong>Tenants</strong> with a lease get at least 90 days’ written notice after redemption ends, and a bona fide lease can run longer in some cases (Minn. Stat. 504B.285, subd. 1a).</p>` },
      { h: '8. Will I owe the rest?', html: `<p>For a foreclosure by advertisement with a six-month or five-week redemption period, Minnesota doesn’t allow a <strong>deficiency judgment</strong> for the shortfall (Minn. Stat. 582.30, subd. 2). Other cases (foreclosure through a court case, 12-month redemption, second mortgages or home equity lines) can be different: ask an attorney. Forgiven debt can also have tax consequences; see <a href="/foreclosure/short-sale#s6">taxes on forgiven debt</a>.</p>${NOT_LEGAL}` },
    ],
    faq: [
      { q: 'How long does foreclosure take in Minnesota?', a: 'There is no single number. A servicer generally can’t start until you’re more than 120 days behind; the notice of sale then runs for six weeks before the sheriff’s sale; and most homeowners then have a six-month redemption period (12 months in some cases, five weeks in others). Postponements and loss-mitigation reviews can add time.' },
      { q: 'Can I stay in my house after a sheriff’s sale in Minnesota?', a: 'Yes, during the redemption period, usually six months. You must move out by 11:59 p.m. on the last day if you don’t redeem or sell (Minn. Stat. 580.23 and 580.04).' },
      { q: 'Can I sell my house during the redemption period?', a: 'Yes. A sale during redemption pays off the sheriff’s certificate at closing, and if the home sells for more than is owed, the difference is yours. The sale has to close before the period ends.' },
      { q: 'Does Minnesota allow deficiency judgments after foreclosure?', a: 'Not after a foreclosure by advertisement with a six-month or five-week redemption period (Minn. Stat. 582.30, subd. 2). Other situations can differ, so have an attorney look at yours.' },
    ],
    sources: [
      { name: 'Minn. Stat. 580.03 (published and served notice)', url: MN('580.03') },
      { name: 'Minn. Stat. 580.04 (contents of the notice; move-out date)', url: MN('580.04') },
      { name: 'Minn. Stat. 580.07 (postponing the sale)', url: MN('580.07') },
      { name: 'Minn. Stat. 580.23 (redemption periods)', url: MN('580.23') },
      { name: 'Minn. Stat. 582.032 (five-week redemption for abandoned homes)', url: MN('582.032') },
      { name: 'Minn. Stat. 582.30 (deficiency judgments)', url: MN('582.30') },
      { name: 'Minn. Stat. 504B.285 (tenants after foreclosure)', url: MN('504B.285') },
      { name: 'Hennepin County Sheriff, foreclosure sale process', url: 'https://www.hennepinsheriff.org/services/foreclosure-sales/Slide-out-group/foreclosure-sale-process' },
      { name: 'CFPB, 12 CFR 1024.41', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1024/41/' },
    ],
    posts: ['2022/10/27/notice-of-intent-to-foreclose-know-your-options', '2022/10/27/how-to-properly-deal-with-the-threat-of-foreclosure'],
  },
  {
    slug: 'short-sale',
    audience: 'owner',
    title: 'How a short sale works in Minnesota',
    seo: 'Short Sales in Minnesota: How They Work, Step by Step',
    description: 'How to sell your home for less than you owe in Minnesota: lender approval, the paperwork, deficiency waivers, taxes on forgiven debt in 2026, and how a short sale compares with foreclosure.',
    short: 'Selling for less than you owe: approval, paperwork, deficiency and taxes.',
    answer: 'A short sale is when your lender agrees to let you sell the home for less than you owe and accept the sale proceeds as payment. It needs the lender’s written approval, a hardship explanation and your financial paperwork. Before you sign, get in writing whether the lender forgives the remaining balance, and ask a CPA about taxes: the federal exclusion for forgiven mortgage debt on a main home ended for debt forgiven after 2025.',
    topic: 'Short sale',
    sections: [
      { h: '1. Is a short sale right for you?', html: `<p>A short sale fits when you owe more than the home would sell for after costs, you can’t keep up the payments, and a loan modification or repayment plan won’t work. If you have equity, a regular sale is usually better. Our <a href="/calculators/seller-net-proceeds">net proceeds calculator</a> and a free <a href="/sell#value">home value</a> tell you which side of the line you’re on.</p>` },
      { h: '2. What the lender asks for', html: `<p>Every lender has its own package, but expect to provide:</p><ul><li>a <strong>hardship letter</strong> explaining what changed (job loss, illness, divorce, a move);</li><li>recent pay stubs or proof of income, bank statements and tax returns;</li><li>the listing agreement and, once you have a buyer, the signed purchase agreement;</li><li>authorization for us to talk with your servicer.</li></ul><p>If you have a second mortgage, a home equity line or other liens, each lien holder has to agree too.</p>` },
      { h: '3. Listing, offers and approval', html: `<p>We list and market the home like any other, and tell buyers the sale is subject to lender approval. When a buyer signs, we send the offer to the lender, which orders its own valuation and decides whether to approve, counter or decline. Lender review adds time to the sale, so start well before any sheriff’s sale date and keep your servicer’s foreclosure deadlines in writing.</p>` },
      { h: '4. Get the deficiency answer in writing', html: `<p>The <strong>deficiency</strong> is the gap between what you owe and what the lender receives. Some approvals forgive it; others reserve the right to collect it or ask you to sign a note. Read the approval letter before you close, and have an attorney review it if the deficiency isn’t clearly waived. (After a Minnesota foreclosure by advertisement with a six-month redemption period, a deficiency judgment isn’t allowed, Minn. Stat. 582.30. A short sale is a negotiated deal, so its terms are what you agree to.)</p>` },
      { h: '5. Short sale vs. foreclosure vs. deed in lieu', html: `<ul><li><strong>Short sale:</strong> you sell; the lender approves the price and the terms for any shortfall.</li><li><strong>Foreclosure:</strong> the home is sold at a sheriff’s sale and you have a redemption period (<a href="/foreclosure/minnesota-foreclosure-process">see the process</a>).</li><li><strong>Deed in lieu:</strong> you sign the home over to the lender.</li></ul><p>The CFPB notes that a regular sale is usually better for your finances and credit than any of the three. Among them, which is best depends on your lender’s terms, your equity, your timeline and your tax situation, so compare them with a free advisor (<a href="tel:+18664626466">${HOC.phone}</a>) before you choose.</p>` },
      { h: '6. Taxes on forgiven debt', html: `<p>Forgiven debt is generally taxable income, and the lender may send you a Form 1099-C. The federal exclusion for forgiven debt on a main home (qualified principal residence indebtedness) applied to debt forgiven <strong>before January 1, 2026</strong>, or under a written agreement made before then; it doesn’t cover new short sales or foreclosures after 2025 (<a href="https://www.irs.gov/publications/p4681" rel="noopener">IRS Publication 4681</a>). Other exclusions can still apply, most often <strong>insolvency</strong> (when your debts were more than your assets right before the debt was forgiven). Talk to a CPA before you agree to the terms.</p>` },
      { h: '7. Our short sale experience', html: `<p>${EXPERIENCE} We list and sell the home and keep the buyer on track; the firm’s short sale team handles the lender negotiation and has an attorney review the final approval letter (<a href="${LAWFIRM.url}" rel="noopener">how their process works</a>). Call <a href="${site.phoneHref}">${site.phone}</a> to talk it through privately.</p>${NOT_LEGAL}` },
    ],
    faq: [
      { q: 'What is a short sale?', a: 'A sale where the lender agrees to accept less than the full loan balance so the home can be sold. It needs the lender’s written approval, and any other lien holders have to agree too.' },
      { q: 'Will I owe the difference after a short sale in Minnesota?', a: 'It depends on the lender’s approval letter. Some forgive the shortfall and some reserve the right to collect it, so get the answer in writing before closing and have an attorney review it if it isn’t clear.' },
      { q: 'Is forgiven mortgage debt taxable in 2026?', a: 'Generally yes. The federal exclusion for forgiven debt on a main home covered debt forgiven before January 1, 2026, or under a written agreement made before then (IRS Publication 4681). The insolvency exclusion may still apply; ask a CPA.' },
      { q: 'Can I do a short sale after the sheriff’s sale?', a: 'Not in the usual sense: after the sheriff’s sale the mortgage has been foreclosed. During the redemption period you can still sell, but the sale has to pay off the sheriff’s certificate unless the certificate holder agrees in writing to accept less (Minn. Stat. 580.23, subd. 1(c)).' },
    ],
    sources: [
      { name: 'CFPB, Avoid foreclosure (short sales and deeds in lieu)', url: 'https://www.consumerfinance.gov/housing/housing-insecurity/help-for-homeowners/avoid-foreclosure/' },
      { name: 'IRS Publication 4681 (canceled debts, foreclosures, abandonments)', url: 'https://www.irs.gov/publications/p4681' },
      { name: 'Minn. Stat. 582.30 (deficiency judgments)', url: MN('582.30') },
      { name: 'Minn. Stat. 580.23 (redemption; accepting a lesser sum)', url: MN('580.23') },
      { name: 'Minnesota Homeownership Center', url: HOC.url },
      { name: `${LAWFIRM.name}, short sale team (firm’s published short sale count)`, url: LAWFIRM.url },
    ],
    posts: ['2023/6/9/what-is-the-difference-between-short-sales-and-foreclosures', '2022/10/27/how-to-find-the-best-agent-for-a-short-sale', '2022/10/27/top-qualities-to-look-for-in-a-short-sales-agent'],
  },
  {
    slug: 'buying-foreclosures',
    audience: 'buyer',
    title: 'Buying a foreclosure or short sale in the Twin Cities',
    seo: 'Buying Foreclosures and Short Sales in the Twin Cities',
    description: 'How to buy a short sale, a bank-owned (REO) home or a home at a Minnesota sheriff’s sale: the redemption period, what you can and can’t inspect, financing and title.',
    short: 'Short sales, bank-owned homes and sheriff’s sales: how each one works.',
    answer: 'There are three ways to buy a distressed home in Minnesota. A short sale is bought from the owner with the lender’s approval. A bank-owned (REO) home is bought from the lender after the redemption period, usually through an agent like any listing. A sheriff’s sale is an auction where you pay in full that day and receive a certificate, not the house, and then wait out the owner’s redemption period, usually six months.',
    topic: 'Buying foreclosures',
    sections: [
      { h: '1. Short sales', html: `<p>You make an offer to the owner, and the sale depends on the lender’s approval. You can inspect and use normal financing, but expect to wait for the lender’s answer and possibly a counteroffer. Keep your loan approval current while you wait.</p>` },
      { h: '2. Bank-owned (REO) homes', html: `<p>When nobody redeems after a sheriff’s sale and the lender owns the home, it usually lists it with an agent. You can tour it, make an offer and use financing. Expect the lender’s own contract addendums and an <strong>as-is</strong> sale: the seller has never lived there, so it typically won’t make repairs or give the usual disclosures. Get a full inspection, and check the utilities, the water and heating systems, and any winterization.</p>` },
      { h: '3. Sheriff’s sales', html: `<p>At a sheriff’s sale the lender bids first, then anyone else may bid. In Hennepin County, a winning outside bidder pays the full bid at the sale, plus a $200 fee, with a cashier’s check or cash, and receives a <strong>sheriff’s certificate of sale</strong> to record (<a href="https://www.hennepinsheriff.org/services/foreclosure-sales/Slide-out-group/foreclosure-sale-process" rel="noopener">Hennepin County Sheriff</a>). Other counties have their own procedures.</p><ul><li>You can’t get a mortgage for the bid, and you usually can’t see inside the home.</li><li>The owner keeps the home during the <strong>redemption period</strong>, usually six months (Minn. Stat. 580.23). If they redeem, you get your money back with interest, not the house.</li><li>Tenants with a lease get at least 90 days’ notice after redemption ends (Minn. Stat. 504B.285).</li></ul><p>Sheriff’s sales are for experienced cash buyers who have checked title with an attorney or title company first.</p>` },
      { h: '4. Title, taxes and liens', html: `<p>Ask a title company to check for unpaid property taxes, assessments, association dues and other liens before you commit. On REO and short sales, title insurance at closing protects you. At a sheriff’s sale, what you get depends on the mortgage being foreclosed and what was recorded ahead of it.</p>` },
      { h: '5. How we help buyers', html: `<p>We track short sales and bank-owned listings across the Twin Cities, write offers that fit each lender’s process, and set up the inspections that as-is homes need. Start with a <a href="${homeSearchHref}">home search</a> or tell us what you’re looking for below.</p>${NOT_LEGAL}` },
    ],
    faq: [
      { q: 'Can I get a mortgage to buy a foreclosure in Minnesota?', a: 'For short sales and bank-owned (REO) homes, usually yes, as long as the home meets the loan’s condition rules. At a sheriff’s sale, no: the winning bid is paid in full at the sale (in Hennepin County, by cashier’s check or cash).' },
      { q: 'Do I get the house right after a sheriff’s sale?', a: 'No. You receive a sheriff’s certificate, and the owner usually has six months to redeem (12 months or five weeks in some cases). If they don’t, the home becomes yours when the period ends.' },
      { q: 'Are bank-owned homes sold as-is?', a: 'Usually. The lender has never lived in the home, so it typically won’t make repairs. A full inspection before your contingency ends is essential.' },
    ],
    sources: [
      { name: 'Hennepin County Sheriff, foreclosure sale process', url: 'https://www.hennepinsheriff.org/services/foreclosure-sales/Slide-out-group/foreclosure-sale-process' },
      { name: 'Minn. Stat. 580.23 (redemption periods)', url: MN('580.23') },
      { name: 'Minn. Stat. 504B.285 (tenants after foreclosure)', url: MN('504B.285') },
    ],
    posts: ['2022/10/27/turning-foreclosure-homes-into-profit', '2023/6/9/what-is-the-difference-between-short-sales-and-foreclosures'],
  },
];

export const fguideHref = (g: FGuide) => `/foreclosure/${g.slug}`;
