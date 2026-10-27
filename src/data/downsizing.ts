// Downsizing and 55+ guides (/downsizing and /downsizing/<guide>): for people selling a longtime home, moving to
// one-level living, a 55+ community or a co-op, or helping a parent sell.
// Rules: every figure names its source (sources[] on each guide); guides describe homes, money and steps,
// never which places suit which people (fair housing). Tax and legal points say "talk to your CPA or attorney".
// Reverse mortgages are left out on purpose: the team is a Ramsey Endorsed Local Provider.

export interface Section { h: string; html: string }
export interface DGuide {
  slug: string;
  title: string;          // h1
  seo: string;            // <title>, under 70 characters
  description: string;
  short: string;          // card text on the hub
  answer: string;         // the first, direct answer (also the hero lede)
  sections: Section[];
  faq: { q: string; a: string }[];
  sources?: { name: string; url: string }[];
  posts?: string[];       // blog post paths to suggest
  videos?: string[];      // YouTube video ids
  topic: string;          // sent with the lead form
}

const CPA = 'Every situation is different: confirm the details with your CPA or tax preparer before you sell.';

export const dguides: DGuide[] = [
  {
    slug: 'how-to-downsize',
    title: 'How to downsize your home in the Twin Cities, step by step',
    seo: 'How to Downsize Your Home in Minnesota: A Step-by-Step Plan',
    description: 'A plain, step-by-step plan for downsizing in the Twin Cities: deciding, sorting, pricing your home, finding the next one, and timing the move so you only move once.',
    short: 'The whole plan, from the first conversation to moving day.',
    answer: 'Downsizing goes best in this order: decide what your next home needs, learn what your current home is worth, sort your belongings early, line up the money for the next home, then time the sale and purchase so you move once. Most people need three to six months from first conversation to moving day; it can be done faster.',
    topic: 'Downsizing plan',
    sections: [
      { h: '1. Decide what the next home has to do for you', html: `<p>Start with how you want to live, not square footage. Write down:</p><ul><li>Must-haves: a main-floor bedroom and laundry, no stairs at the entry, an attached garage, room for the grandkids to visit, a yard or no yard.</li><li>Where you need to be close to: family, your church, your doctors, the cabin, the airport.</li><li>What you're done doing: mowing, shoveling, roofs, steps.</li><li>A monthly budget that includes association fees, taxes and insurance, not just the price.</li></ul><p>That list tells you whether you're looking for a one-level house, a townhome, a condo, a 55+ community or a senior co-op. See <a href="/downsizing/one-level-living">one-level living</a> and <a href="/downsizing/55-plus-communities">55+ communities</a>.</p>` },
      { h: '2. Find out what your home is worth today', html: `<p>Your equity is the down payment, or the whole purchase price, of your next home. A free, no-obligation home value from a local agent who walks through the house beats an online estimate, because it accounts for updates, condition and what's selling on your street right now. <a href="/sell#value">Request your home's value</a>, or look up your city in our <a href="/market">monthly market reports</a>.</p>` },
      { h: '3. Sort early, a room at a time', html: `<p>Decades of belongings is the hardest part for most people, so start before the house is listed. Sort each room into keep, give to family, sell or donate, and toss. Measure your next home's rooms before deciding which furniture comes along. Offer family the things they want first and set a date for them to pick it up. Senior move managers, estate sale companies and junk-removal crews can do much of the heavy lifting; ask us for names we trust.</p>` },
      { h: '4. Line up the money for the next home', html: `<p>Decide whether you'll pay cash from your sale, keep a smaller mortgage, or need to buy before your current home sells. If you'll borrow, talk to a lender before you shop; a retirement-income mortgage works differently than one based on a paycheck. See <a href="/downsizing/buy-before-you-sell">buy before you sell</a> and <a href="/downsizing/pay-cash-for-your-next-home">paying cash for your next home</a>.</p>` },
      { h: '5. Get the house ready to sell, without overdoing it', html: `<p>You rarely need to remodel. The work that pays off is usually cleaning, decluttering, fresh paint in dated colors, fixing what an inspector will flag, and good photos. If repairs or a big cleanout feel like too much, a cash offer or an as-is sale trades some price for speed and simplicity. See <a href="/downsizing/selling-a-longtime-home">selling a home you've owned for decades</a>.</p>` },
      { h: '6. Time the sale and the purchase', html: `<p>The goal is one move. The usual ways to get there: buy first with a contingency or bridge financing, sell first and negotiate extra time after closing to stay in the home, or move into a short-term rental between homes. Your agent writes these timing terms into the contracts.</p>` },
      { h: '7. Moving day and after', html: `<p>Book movers early (spring and summer fill fast in Minnesota), forward your mail, update your address with Social Security, Medicare and your banks, and transfer utilities. Keep your closing papers: you'll want the settlement statement at tax time.</p>` },
    ],
    faq: [
      { q: 'How long does it take to downsize?', a: 'Most people need three to six months from the first conversation to moving day, and sorting belongings usually takes the longest. How fast the home sells depends on price, condition and season; our monthly market reports show the current days on market for each city, and closing usually takes about another month.' },
      { q: 'Should I sell first or buy first when downsizing?', a: 'If you need the money from your sale to buy, selling first with extra time to stay after closing is the safest. If you can buy with savings, bridge financing or a contingent offer, buying first means one move and no rush. An agent can show you which works with your numbers.' },
      { q: 'Is it better to downsize or renovate?', a: 'If the house no longer fits how you live (stairs, upkeep, too much space), downsizing usually costs less than remodeling a home you will still have to maintain. If the home fits and only needs updates, staying can make sense. Compare the cost of the work with what a move would cost.' },
    ],
    posts: ['2022/10/27/is-downsizing-right-for-you-5-questions-to-ask-yourself-before-making-the-move', 'empty-nester-downsizing-selling-twin-cities-questions', '2022/10/27/a-3-step-decluttering-guide-for-empty-nesters-looking-to-downsize', '2022/10/27/tips-for-empty-nesters-on-downsizing'],
    videos: ['LbWw1DCYNns'],
  },
  {
    slug: 'selling-a-longtime-home',
    title: 'Selling a home you’ve owned for decades',
    seo: 'Selling a Home You’ve Owned for Decades in Minnesota',
    description: 'What to fix and what to leave, what buyers notice in older homes, as-is and cash-offer options, and the paperwork that saves you money at tax time.',
    short: 'What to fix, what to leave, and the paperwork that saves you money.',
    answer: 'Selling a home you’ve owned for a long time is mostly about three things: fixing what a buyer’s inspector will flag, presenting the home cleanly rather than remodeling it, and gathering the records of what you paid and improved, which can lower your taxes. If you’d rather skip repairs and showings, an as-is sale or a cash offer is an option.',
    topic: 'Selling a longtime home',
    sections: [
      { h: 'What buyers and inspectors look at in older homes', html: `<p>In homes that have been loved for 20 or 30 years, inspections usually focus on the roof, the furnace and water heater, the electrical panel, windows, signs of water in the basement, and anything that looks like deferred upkeep. Fixing small, obvious items before you list, or getting a pre-listing inspection, avoids surprises once you have a buyer.</p>` },
      { h: 'Update, or sell it as it is?', html: `<p>Big remodels rarely return what they cost right before a sale. What usually pays: cleaning, decluttering, neutral paint where colors are dated, light fixtures, and repairs. Dated kitchens and baths can be priced for rather than replaced; many buyers want to choose their own finishes.</p><p>If you would rather not do any of it, selling as-is or taking a <a href="/sell#cash">cash offer</a> trades some price for speed and certainty. We'll show you both numbers side by side so you can choose.</p>` },
      { h: 'The paperwork worth finding now', html: `<ul><li>Your purchase closing statement (what you paid).</li><li>Receipts or permits for improvements: additions, a new roof, windows, a finished basement. These can raise your cost basis and lower any taxable gain.</li><li>Your survey, any association documents, and warranties for the furnace, roof or appliances.</li></ul><p>See <a href="/downsizing/taxes-when-you-sell">taxes when you sell</a> for how these are used.</p>` },
      { h: 'Showings when you’ve lived there a long time', html: `<p>We schedule showings in blocks so you're not leaving the house every afternoon, and we can photograph and list the home after you've moved if that's easier. Let us know about pets, medical equipment or anything that needs planning around.</p>` },
    ],
    faq: [
      { q: 'Do I need to update my house before selling?', a: 'Usually not. Cleaning, decluttering, paint and repairs return the most. Full kitchen or bath remodels right before a sale rarely pay for themselves; pricing the home for its condition usually works better.' },
      { q: 'Can I sell my house as-is in Minnesota?', a: 'Yes. You can list as-is, where the buyer accepts the home’s condition, or take a cash offer from an investor. Minnesota’s seller-disclosure law (Minn. Stat. §§ 513.52–513.60) still applies to an as-is sale unless the buyer and seller agree in writing to waive it, so ask us or your attorney how it works for your sale.' },
    ],
    posts: ['2022/10/27/empty-nesters-top-5-reasons-why-it-could-be-wiser-to-sell-than-to-renovate', '2023/3/9/sellers-heres-everything-you-need-to-know-about-home-staging', '2022/10/27/which-real-estate-documents-should-you-keep-after-closing'],
  },
  {
    slug: 'taxes-when-you-sell',
    title: 'Taxes when you sell your home after many years',
    seo: 'Taxes When You Sell a Long-Owned Home: The $250K/$500K Rule',
    description: 'How the IRS home-sale exclusion works ($250,000, or $500,000 for married couples), how improvements raise your basis, and what heirs should know.',
    short: 'The $250,000 / $500,000 exclusion, your basis, and what heirs should know.',
    answer: 'If you owned and lived in the home as your main home for at least two of the five years before you sell, you can usually exclude up to $250,000 of gain from federal income tax, or up to $500,000 if you’re married and file jointly (IRS Topic 701 and Publication 523). Gain above that may be taxable, and records of improvements can reduce it.',
    topic: 'Taxes on selling a home',
    sections: [
      { h: 'The home-sale exclusion', html: `<p>Under the IRS rules (Topic 701, Publication 523), you can usually exclude up to <strong>$250,000</strong> of gain, or <strong>$500,000</strong> on a joint return, when you sell your main home if:</p><ul><li>you owned it for at least 2 of the 5 years before the sale (ownership test),</li><li>you lived in it as your main home for at least 2 of those 5 years (use test), and</li><li>you haven't excluded gain on another home sale in the two years before.</li></ul><p>For married couples, either spouse can meet the ownership test, but both must meet the use test for the full $500,000.</p>` },
      { h: 'Your gain is price minus basis', html: `<p>Gain is roughly the sale price, minus selling costs, minus your <em>basis</em>: what you paid plus the cost of improvements (an addition, a new roof, windows, a finished basement). Repairs and upkeep don't count. In a home bought decades ago, improvements can make a real difference, so gather the receipts.</p>` },
      { h: 'If a spouse has passed away', html: `<p>Surviving spouses may still qualify for the $500,000 exclusion if the home is sold within two years of the spouse's death and other conditions are met, and part of the home's basis may be stepped up. These rules have details that matter: ask your CPA before you list.</p>` },
      { h: 'Inherited homes', html: `<p>Heirs generally receive the home at its value on the date of death (a "stepped-up" basis), so selling soon after inheriting often produces little taxable gain. See <a href="/downsizing/selling-a-parents-home">selling a parent's home</a>.</p>` },
      { h: 'A note on advice', html: `<p>${CPA} We'll give your CPA the sale numbers they need.</p>` },
    ],
    faq: [
      { q: 'How much can I make selling my house without paying taxes?', a: 'Usually up to $250,000 of gain, or $500,000 for married couples filing jointly, if you owned and lived in the home as your main home for at least two of the five years before the sale (IRS Topic 701). Confirm with your tax preparer.' },
      { q: 'Do home improvements reduce capital gains tax?', a: 'Improvements that add value or extend the home’s life, like an addition, new roof or windows, increase your basis and reduce your gain. Ordinary repairs and maintenance do not.' },
    ],
    sources: [
      { name: 'IRS Topic No. 701, Sale of Your Home', url: 'https://www.irs.gov/taxtopics/tc701' },
      { name: 'IRS Publication 523, Selling Your Home', url: 'https://www.irs.gov/publications/p523' },
    ],
  },
  {
    slug: 'one-level-living',
    title: 'One-level living: ramblers, townhomes and condos',
    seo: 'One-Level Homes in the Twin Cities: Ramblers, Townhomes, Condos',
    description: 'What to look for in a one-level home, the kinds of one-level homes in the Twin Cities, and the questions to ask about association fees and maintenance.',
    short: 'Ramblers, one-level townhomes and condos: what to look for.',
    answer: 'One-level living means your bedroom, bathroom, kitchen and laundry are all on the main floor, so daily life needs no stairs. In the Twin Cities you’ll find it in ramblers (one-story houses), one-level townhomes and twin homes, and condos in buildings with elevators. The details that matter most are a no-step entry, a main-floor laundry and who handles snow and lawn.',
    topic: 'One-level homes',
    sections: [
      { h: 'The kinds of one-level homes', html: `<ul><li><strong>Ramblers (one-story houses):</strong> common in suburbs built from the 1950s through the 1970s and again in newer developments; many have a basement, so check that everything you need is upstairs.</li><li><strong>One-level townhomes and twin homes:</strong> often in associations that handle snow removal, lawn care and sometimes exterior maintenance.</li><li><strong>Condos:</strong> single-floor living in buildings with elevators, underground parking and no exterior upkeep.</li><li><strong>New construction:</strong> several Twin Cities builders offer main-floor-living plans, sometimes in association-maintained neighborhoods.</li></ul>` },
      { h: 'A checklist for touring', html: `<ul><li>Can you get from the garage or driveway to the kitchen without steps?</li><li>Primary bedroom and a full bath on the main floor? A walk-in shower?</li><li>Laundry on the main floor?</li><li>Doorways and halls wide enough if you ever need a walker or wheelchair?</li><li>Attached garage (a big deal in a Minnesota winter)?</li><li>Lever handles, good lighting, a place to sit by the door?</li><li>Who clears snow from the driveway and walks, and how fast?</li></ul>` },
      { h: 'Association fees: what to ask', html: `<p>An association fee can replace a lot of your current costs, but compare carefully:</p><ul><li>What it covers: snow, lawn, exterior, roof, insurance, water, trash?</li><li>How much is in the reserve fund, and are any special assessments planned?</li><li>Rules on rentals, pets, parking and exterior changes.</li></ul><p>We review association documents with you before you commit.</p>` },
    ],
    faq: [
      { q: 'What is a rambler home?', a: 'In Minnesota, a rambler is a one-story house with the main living space on one floor, often with a basement below. It is the most common kind of one-level house in Twin Cities suburbs.' },
      { q: 'Are townhomes good for downsizing?', a: 'Many people downsize into townhomes because associations often handle snow removal and lawn care. Look for one-level or main-floor-living plans and compare the association fee with what you spend on upkeep today.' },
    ],
    posts: ['downsizing-to-low-maintenance-living-in-minnetonka', '2022/10/27/how-to-find-the-best-retirement-home-for-you'],
    videos: ['6Ag_UjGAD9w'],
  },
  {
    slug: '55-plus-communities',
    title: '55+ communities in the Twin Cities: how they work',
    seo: '55+ Communities in the Twin Cities: How They Work and What to Ask',
    description: 'What makes a community 55+ under federal law, the kinds of 55+ housing in Minnesota (owned, co-op, rental), and the questions to ask before you buy.',
    short: 'Owned, co-op and rental 55+ housing, and the rules behind them.',
    answer: 'A 55+ community is housing that legally limits residents by age under the federal Housing for Older Persons Act: at least 80% of occupied homes must have at least one resident 55 or older, and the community must publish and follow policies showing that intent. In the Twin Cities you’ll find owned 55+ townhomes and condos, senior housing cooperatives, and 55+ rental apartments.',
    topic: '55+ communities',
    sections: [
      { h: 'The legal side, briefly', html: `<p>Fair housing law generally doesn't allow age limits in housing, but the Housing for Older Persons Act (HOPA) makes an exception. A "55 or older" community qualifies when at least 80% of occupied units have at least one person 55 or older, it publishes and follows policies showing it's intended for older persons, and it verifies ages. There are also "62 or older" communities, where generally every resident must be 62 or older.</p><p>Each community's own rules decide details like younger spouses, adult children and guests, so read the declaration or bylaws.</p>` },
      { h: 'Kinds of 55+ housing', html: `<ul><li><strong>Owned townhomes, twin homes and condos</strong> in 55+ associations: you buy the home; an association handles exterior work.</li><li><strong>Senior housing cooperatives:</strong> you buy a share of the building and pay a monthly fee. Minnesota has many of these. See <a href="/downsizing/senior-housing-cooperatives">senior co-ops</a>.</li><li><strong>55+ rental apartments:</strong> no purchase; a lease and monthly rent.</li><li><strong>Independent living, assisted living and memory care</strong> are services-based housing; we can help you sell your home to move into one, and coordinate the timing.</li></ul>` },
      { h: 'Questions to ask before you buy', html: `<ul><li>What does the monthly fee cover, and how much has it gone up in recent years?</li><li>How healthy is the reserve fund? Any planned assessments?</li><li>What are the rules on age, guests, pets, rentals and resale?</li><li>Is there a waiting list, and how do resales work?</li><li>Underground or attached parking? Elevator? Guest suite?</li></ul>` },
    ],
    faq: [
      { q: 'What does 55+ community mean?', a: 'It is housing that qualifies under the federal Housing for Older Persons Act: at least 80% of occupied units have at least one resident 55 or older, and the community publishes and follows policies showing it is intended for older persons.' },
      { q: 'Can someone younger than 55 live in a 55+ community?', a: 'Often yes, within limits. The law requires 80% of occupied homes to have at least one resident 55 or older, so a younger spouse or partner may be allowed. Each community’s rules decide, so read its governing documents.' },
    ],
    sources: [{ name: '24 CFR § 100.305, housing for persons 55 years of age or older (80 percent occupancy)', url: 'https://www.ecfr.gov/current/title-24/section-100.305' }],
    videos: ['Ju_gAUwFTdc'],
  },
  {
    slug: 'senior-housing-cooperatives',
    title: 'Senior housing cooperatives in Minnesota',
    seo: 'Senior Housing Co-ops in Minnesota: How Buying a Share Works',
    description: 'How senior housing co-ops work in Minnesota: buying a share instead of a unit, the monthly fee, equity and limited-equity co-ops, and what to ask.',
    short: 'Buying a share instead of a home: how co-ops work.',
    answer: 'In a senior housing cooperative you don’t buy your unit; you buy a share in the corporation that owns the building, which gives you the right to live in your home. You pay a share price up front and a monthly fee that covers your part of the building’s mortgage, property taxes, maintenance and services. When you move, you sell your share back under the co-op’s rules.',
    topic: 'Senior co-ops',
    sections: [
      { h: 'How the money works', html: `<ul><li><strong>Share price:</strong> paid up front. It is usually lower than the price of a comparable condo because the co-op carries a mortgage on the building.</li><li><strong>Monthly fee:</strong> your share of the building's mortgage, property taxes, insurance, maintenance, staff and amenities.</li><li><strong>Taxes:</strong> members may be able to deduct their share of the co-op's mortgage interest and property taxes; ask your CPA.</li></ul>` },
      { h: 'Equity vs. limited-equity co-ops', html: `<p>In a market-rate (equity) co-op, your share's price moves with the market. In a limited-equity co-op, the bylaws cap how much the share can grow, which keeps prices lower for the next member but limits your gain. Know which one you're buying.</p>` },
      { h: 'Questions to ask', html: `<ul><li>How much of the monthly fee is the building's mortgage, and when does that loan mature?</li><li>How have monthly fees changed over the last five years?</li><li>How are shares resold, and how long does it usually take?</li><li>What happens to the share if a member passes away?</li><li>Is there a waiting list? Are pets allowed? Guest suites, parking, activities?</li></ul><p>Have the bylaws and financial statements reviewed before you commit; we'll go through them with you.</p>` },
    ],
    faq: [
      { q: 'How does a senior co-op work in Minnesota?', a: 'You buy a share in the corporation that owns the building, which gives you the right to occupy your unit, then pay a monthly fee for your part of the building’s mortgage, taxes, maintenance and services. When you leave, the share is sold under the co-op’s bylaws.' },
      { q: 'Is a co-op the same as a condo?', a: 'No. With a condo you own your unit outright and pay association dues. With a co-op you own a share of the whole building, and the monthly fee usually includes your part of the building’s mortgage and property taxes.' },
    ],
  },
  {
    slug: 'buy-before-you-sell',
    title: 'Buy your next home before you sell: your options',
    seo: 'Buy Before You Sell: How to Move Once When Downsizing',
    description: 'The ways to buy your next home before your current one sells: savings, bridge financing, contingent offers, and staying after closing, with the trade-offs of each.',
    short: 'Move once: contingencies, bridge financing and staying after closing.',
    answer: 'You can buy before you sell by paying with savings or investments, using short-term bridge financing against your current home, making an offer that depends on your home selling, or selling first and arranging to stay in your home for a while after closing. Each trades cost against certainty, and the right one depends on your numbers.',
    topic: 'Buy before you sell',
    sections: [
      { h: 'The main options', html: `<ul><li><strong>Pay from savings or investments,</strong> then repay yourself from the sale. Simplest, if you have the money and your advisor agrees.</li><li><strong>Bridge financing:</strong> a short-term loan or home-equity line against your current home. It costs interest and fees, and you carry two homes until yours sells.</li><li><strong>A home-sale contingency:</strong> your offer depends on selling your current home. Sellers may accept it in a slower market or with a strong offer; it's harder when homes are selling fast.</li><li><strong>Sell first, stay after closing:</strong> negotiate to stay in your home for a few weeks after closing (often with a rent-back), giving you time to buy and move once.</li><li><strong>New construction:</strong> a build timeline can give you months to sell.</li></ul>` },
      { h: 'How to choose', html: `<p>Start with three numbers: what your home will likely sell for, what you'll owe on it, and what you'll need for the next home. With those, we and your lender can show which option costs least for the certainty you want.</p>` },
    ],
    faq: [
      { q: 'Can I buy a new house before selling mine?', a: 'Yes, with savings, bridge financing, or a home-sale contingency in your offer, or by selling first and negotiating time to stay after closing. Which works best depends on your equity, your income and how fast homes are selling.' },
    ],
    posts: ['2022/10/27/getting-a-mortgage-after-retirement'],
  },
  {
    slug: 'pay-cash-for-your-next-home',
    title: 'Downsizing to a paid-for home',
    seo: 'Downsizing to a Debt-Free, Paid-for Home in Minnesota',
    description: 'How downsizing can let you buy your next home with cash and retire without a mortgage payment, and the numbers to run first. From a Ramsey Endorsed Local Provider.',
    short: 'Use your equity to retire without a mortgage payment.',
    answer: 'For many longtime homeowners, the equity in a larger home is enough to buy a smaller one outright. Selling, paying cash for the next home and keeping the rest means no mortgage payment in retirement. Run the numbers with your sale price, payoff, selling costs, the next home’s price and its monthly costs before you decide.',
    topic: 'Paying cash for the next home',
    sections: [
      { h: 'Run your numbers', html: `<ol><li>Likely sale price of your home (we'll give you a free, detailed estimate).</li><li>Minus your mortgage payoff, if any.</li><li>Minus selling costs and moving costs.</li><li>Equals what you'll have to spend.</li><li>Compare that with the price of the homes you're considering, plus their taxes, insurance and any association fee.</li></ol><p>If there's a gap, options include a less expensive next home, a short mortgage you pay off quickly, or waiting until you've saved the difference.</p>` },
      { h: 'Why it appeals', html: `<p>A paid-for home lowers what you need each month in retirement, protects you if income drops, and makes the home a source of security instead of a payment. As a <a href="/ramsey">Ramsey Endorsed Local Provider</a> for more than 15 years, we help clients do this every year.</p>` },
    ],
    faq: [
      { q: 'Should I pay cash for my retirement home?', a: 'If your equity covers it without draining your emergency savings, paying cash means no mortgage payment in retirement. Compare the home’s ongoing costs (taxes, insurance, association fees) with your retirement income, and talk to your financial advisor.' },
    ],
  },
  {
    slug: 'minnesota-property-tax-help-for-seniors',
    title: 'Minnesota property tax help for seniors',
    seo: 'Minnesota Property Tax Help for Seniors: Deferral and Refunds',
    description: 'Minnesota’s Senior Citizens’ Property Tax Deferral Program ($96,000 income limit, age 65+) and the Homestead Credit Refund, explained with official sources.',
    short: 'The senior deferral program and the homestead credit refund.',
    answer: 'Minnesota has two main programs. The Senior Citizens’ Property Tax Deferral Program lets homeowners 65 or older with household income of $96,000 or less defer part of their property taxes as a loan from the state, repaid with interest when the home is sold. The Homestead Credit Refund pays homeowners back part of their property taxes based on income; for 2025 income, household income must be under $142,490.',
    topic: 'Minnesota property tax help',
    sections: [
      { h: 'Senior Citizens’ Property Tax Deferral Program', html: `<p>Per the Minnesota Department of Revenue:</p><ul><li>You must be 65 or older in the year you apply (or, if married, one spouse 65 or older and the other at least 62).</li><li>Total household income of $96,000 or less.</li><li>You must have owned and lived in the home for the last 5 years, with homestead status.</li><li>Apply by November 1 to defer taxes payable the following year.</li><li>The deferred amount is a loan from the state with a lien on the home; it's repaid with interest, and payment is due within 90 days if the home is sold or the homeowner dies.</li></ul><p>When you sell, the deferred taxes are paid off at closing like any other lien, so plan for it in your numbers.</p>` },
      { h: 'Homestead Credit Refund (property tax refund)', html: `<p>Minnesota homeowners may get back part of their property taxes with Form M1PR. For the 2025 refund (filed in 2026), household income must be under $142,490 and you must have owned and lived in the home on January 2, 2026, per the Department of Revenue's M1PR instructions. A separate Special Refund, for homeowners whose net property tax rose sharply, has no income limit.</p>` },
      { h: 'Before you sell', html: `<p>If you're on the deferral program, ask the Department of Revenue for the payoff so we can include it in your net sheet. ${CPA}</p>` },
    ],
    faq: [
      { q: 'Do seniors get a property tax break in Minnesota?', a: 'Minnesota offers the Senior Citizens’ Property Tax Deferral Program (age 65+, household income $96,000 or less, owned and lived in the home 5 years) and the income-based Homestead Credit Refund, available to homeowners of any age who qualify.' },
      { q: 'What happens to deferred property taxes when I sell?', a: 'The deferred taxes, interest and fees are a lien on the home and must be paid when it is sold, within 90 days according to the Minnesota Department of Revenue. They are usually paid from your proceeds at closing.' },
    ],
    sources: [
      { name: 'Minnesota Department of Revenue, Property Tax Deferral for Senior Citizens', url: 'https://www.revenue.state.mn.us/property-tax-deferral-senior-citizens' },
      { name: 'Minnesota Department of Revenue, Property Tax Deferral for Senior Citizens FAQ', url: 'https://www.revenue.state.mn.us/property-tax-deferral-senior-citizens-faq' },
      { name: 'Minnesota Department of Revenue, 2025 Form M1PR instructions', url: 'https://www.revenue.state.mn.us/sites/default/files/2026-06/m1pr-inst-25.pdf' },
    ],
  },
  {
    slug: 'selling-a-parents-home',
    title: 'Selling a parent’s home in Minnesota',
    seo: 'Selling a Parent’s Home in Minnesota: Probate, Timing, Cleanout',
    description: 'Selling a parent’s house while they’re living or after they’ve passed: power of attorney, probate and transfer-on-death deeds in Minnesota, cleanout and selling as-is.',
    short: 'Power of attorney, probate, transfer-on-death deeds and cleanout.',
    answer: 'Who can sell a parent’s home depends on whose name is on the title and whether your parent is living. While they’re living, they sign, or someone with a valid power of attorney signs for them. After they pass, the home goes through probate unless it passes another way, such as a transfer-on-death deed or joint ownership. Minnesota’s small-estate affidavit does not cover real estate.',
    topic: 'Selling a parent’s home',
    sections: [
      { h: 'If your parent is living', html: `<p>Your parent signs the listing and sale documents, or an agent under a valid power of attorney signs for them. The title company will review the power of attorney before closing, so get a copy to us early. If your parent is moving to assisted living or memory care, we can time the sale around the move.</p>` },
      { h: 'If your parent has passed away', html: `<ul><li><strong>Transfer-on-death deed:</strong> Minnesota allows these (Minn. Stat. § 507.071). The named beneficiary records an affidavit of survivorship and can then sell without probate.</li><li><strong>Joint tenancy:</strong> the surviving owner usually becomes the sole owner.</li><li><strong>Trust:</strong> the trustee sells under the trust's terms.</li><li><strong>Probate:</strong> otherwise, the court appoints a personal representative who can sell the home. Minnesota's small-estate affidavit (Minn. Stat. § 524.3-1201) is for personal property and can't be used to transfer real estate.</li></ul><p>A probate attorney tells you which applies; we work alongside them.</p>` },
      { h: 'Cleanout, repairs and selling as-is', html: `<p>Many families sell a parent's home as-is rather than coordinating repairs from a distance. We can coordinate estate-sale companies, cleanout crews and contractors, handle showings when family lives out of state, and compare an as-is listing with a <a href="/sell#cash">cash offer</a>.</p>` },
      { h: 'Taxes for heirs', html: `<p>Heirs generally receive a "stepped-up" basis equal to the home's value at the date of death, so a prompt sale often has little taxable gain. See <a href="/downsizing/taxes-when-you-sell">taxes when you sell</a>, and confirm with the estate's CPA.</p>` },
    ],
    faq: [
      { q: 'Can I sell my parent’s house with power of attorney?', a: 'Usually yes, if the power of attorney gives authority over real estate and is still valid. The title company reviews it before closing. A power of attorney ends when the parent dies; after that, the home is sold through probate, a trust or a transfer-on-death deed.' },
      { q: 'Do you have to go through probate to sell a house in Minnesota?', a: 'Not always. A home that passes by transfer-on-death deed, joint tenancy or a trust can usually be sold without probate. Otherwise a personal representative appointed through probate sells it. Minnesota’s small-estate affidavit does not cover real estate.' },
    ],
    sources: [
      { name: 'Minnesota Statutes § 507.071, transfer-on-death deeds', url: 'https://www.revisor.mn.gov/statutes/cite/507.071' },
      { name: 'Minnesota Statutes § 524.3-1201, collection of personal property by affidavit', url: 'https://www.revisor.mn.gov/statutes/cite/524.3-1201' },
    ],
  },
  {
    slug: 'retiring-in-the-twin-cities',
    title: 'Retiring in the Twin Cities: stay, downsize or go?',
    seo: 'Retiring in the Twin Cities: Stay, Downsize or Move Away?',
    description: 'Jason Huerkamp’s take on retiring in Minneapolis–Saint Paul: staying put, downsizing locally, splitting time with a winter home, or leaving Minnesota, and the housing math of each.',
    short: 'Stay, downsize, split the year, or leave: the housing math.',
    answer: 'Most Twin Cities retirees choose one of four paths: stay and adapt the house, downsize nearby to one-level or maintenance-free living, keep a smaller home here and winter somewhere warm, or sell and move to be near family. The right one comes down to stairs and upkeep, your monthly budget, and where the people you want to be near live.',
    topic: 'Retiring in the Twin Cities',
    sections: [
      { h: 'Stay and adapt', html: `<p>Staying works when the home already has, or can get, a main-floor bedroom and bath, and the upkeep is manageable or affordable to hire out. Get quotes for grab bars, a walk-in shower, a ramp or a main-floor laundry before deciding.</p>` },
      { h: 'Downsize nearby', html: `<p>Selling a larger home and buying a one-level house, townhome, condo or co-op keeps you near family, doctors and friends while cutting stairs and upkeep. See <a href="/downsizing/one-level-living">one-level living</a> and our <a href="/compare">city comparisons</a> for prices and drive times.</p>` },
      { h: 'Split the year', html: `<p>Some keep a low-maintenance home here and spend winters away. Association-maintained homes make that easier: someone else watches the snow and the exterior while you're gone.</p>` },
      { h: 'Move to be near family', html: `<p>If family is elsewhere, we sell your home here and, through Keller Williams' national network, introduce you to a trusted agent where you're going.</p>` },
    ],
    faq: [
      { q: 'Is Minneapolis a good place to retire?', a: 'It depends on what you value. Jason Huerkamp covers the pros and cons in his Living in Minneapolis videos: winters and property taxes on one side; health care, parks and lakes, and staying near family on the other.' },
    ],
    videos: ['qYUMQZRD3t8', 'DW90Dkg8BFk', 'zS_yO26Uoqc', 'Hm-YytFklQk'],
  },
];

export const dguideHref = (g: DGuide) => `/downsizing/${g.slug}`;
