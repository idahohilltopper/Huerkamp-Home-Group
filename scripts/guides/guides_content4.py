"""Batch 4 of the free guides (Nov 26, 2026). Same rules as guides_content.py. The VA guide uses the facts on the site's
veterans page (src/data/sellguides.ts, 'veterans-and-military-home-buyers-minnesota'); the Ramsey guide states Ramsey
Solutions' published guidance as theirs.
"""
from guides_content import a

GUIDES4 = [
    {
        'slug': 'the-ramsey-way-to-buy-a-home',
        'photo_credit': 'Photos: 2H Media (cover), charlesdeluvio and Avi Werde on Unsplash.',
        'title': 'The Ramsey Way to Buy a Home',
        'sub': 'How to buy a home you can afford, with a payment that fits your budget, from a Ramsey Endorsed Local Provider.',
        'eyebrow': 'Free guide from a Ramsey Endorsed Local Provider',
        'intro': [
            'Huerkamp Home Group has been a Dave Ramsey Endorsed Local Provider for more than 15 years. Many of our '
            'clients follow Ramsey\'s plan, and buying a home the Ramsey way looks a little different: the goal is a '
            'home that builds wealth instead of stress.',
            f'This guide lays out Ramsey Solutions\' published guidance for buying a home and how we put it into practice '
            f'in the Twin Cities. See {a("/ramsey", "our Ramsey ELP page")}. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Before you buy', [
                ('Be debt-free and have an emergency fund first',
                 'Ramsey\'s plan puts buying a home after paying off all consumer debt and saving a full emergency fund '
                 'of three to six months of expenses. Owning a home brings surprise repairs; the emergency fund keeps them '
                 'from turning into new debt.'),
                ('Save a real down payment',
                 'Ramsey Solutions recommends putting down at least 10%, and ideally 20% or more so you avoid private '
                 'mortgage insurance. First-time buyers may choose 5% to 10% under their guidance, as long as the '
                 'payment still fits.'),
                ('Keep the payment to 25% of take-home pay',
                 'Ramsey\'s rule of thumb: your total monthly housing payment, including principal, interest, property '
                 'taxes, insurance and any HOA fee, should be no more than 25% of your take-home pay on a 15-year fixed '
                 'mortgage.'),
                ('Choose a 15-year fixed-rate mortgage',
                 'Ramsey recommends a 15-year fixed-rate loan: a higher monthly payment than a 30-year loan, but far '
                 'less interest over the life of the loan and a paid-off home much sooner. Run both on our '
                 f'{a("/calculators/mortgage", "mortgage calculator")}.'),
                ('Budget for the cost of owning',
                 'Property taxes, insurance, utilities, maintenance and repairs come on top of the payment. In Minnesota, '
                 f'property taxes vary a lot by city; see {a("/property-taxes", "property taxes by county")} before you choose where to look.'),
            ]),
            ('Shopping the Ramsey way', [
                ('Set your price from your budget, not the lender',
                 'A lender may approve you for more than fits a 25% payment. Decide your top price from your budget '
                 'first, and shop below it so you have room for the unexpected.'),
                ('Separate needs from wants',
                 'Write down what you truly need (bedrooms, location, commute) and what would be nice. A smaller or older '
                 'home with a payment you can manage beats a dream home that strains every month.'),
                ('Look at the total monthly cost of each home',
                 'Two homes at the same price can cost very different amounts each month because of property taxes, HOA '
                 'fees and utilities. Compare the full monthly cost, not just the price.'),
                ('Don\'t skip the inspection to save money',
                 'A few hundred dollars on an inspection, a radon test and, for older homes, a sewer scope can save '
                 'thousands. It also protects your emergency fund.'),
            ]),
            ('After you buy', [
                ('Rebuild the emergency fund',
                 'Closing often uses a lot of cash. Rebuild your emergency fund quickly, because the first year in a home '
                 'is when surprises show up.'),
                ('Pay the house off early',
                 'Once you are debt-free otherwise, extra payments toward principal shorten the loan and save interest. '
                 'Ask your lender how to make principal-only payments.'),
                ('Apply for homestead',
                 'In Minnesota, apply with your county assessor for homestead classification to lower your property '
                 'taxes; apply by December 15 for it to count the next year.'),
            ]),
            ('Selling the Ramsey way', [
                ('Know what you will walk away with',
                 f'Before listing, figure out your net after the payoff and selling costs with our '
                 f'{a("/calculators/seller-net-proceeds", "seller net proceeds calculator")}, so your next home fits '
                 f'the same budget rules.'),
                ('Price from the market, not from hope',
                 'An honest price, set from recent sales, sells faster and avoids the cost of carrying the home while it '
                 'sits. We price from local sales and explain every number.'),
            ]),
        ],
        'figures': {
            6: ('ramsey-1.jpg', 'Decide your price from your budget before you shop.'),
            10: ('ramsey-2.jpg', 'Rebuild your emergency fund soon after closing.'),
        },
        'close_h': 'Buying or selling the Ramsey way?',
        'sources': [
            'Tips 1 to 4: Ramsey Solutions, "How Much House Can I Afford?" and "The Ramsey Baby Steps," ramseysolutions.com',
            'Tip 12: Minnesota Department of Revenue, "Homestead Credit," revenue.state.mn.us',
        ],
    },
    {
        'slug': 'investing-in-a-duplex-or-rental',
        'photo_credit': 'Photos: Phil Desforges (cover), Ferdinand Asakome and Tazz Anderson on Unsplash.',
        'title': 'Investing in a Duplex or Rental Property in Minnesota',
        'sub': 'House hacking, financing, the numbers to run and the Minnesota rules every landlord needs to know.',
        'eyebrow': 'Free guide for Twin Cities investors',
        'intro': [
            'A rental property can build wealth through rent, loan paydown and appreciation. It is also a small business, '
            'with tenants, repairs, rules and taxes. The investors who do well run the numbers before they fall for a '
            'property.',
            f'This guide covers the most common starting point, a duplex you live in, and the rules for Minnesota '
            f'landlords. See {a("/invest", "investment property")} and {a("/duplexes-for-sale-mn", "duplexes for sale")}. '
            f'Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Getting started', [
                ('Consider living in one unit',
                 'Buying a duplex, triplex or fourplex and living in one unit (often called house hacking) lets the '
                 'rent from the other units help with the payment, and it opens owner-occupant financing.'),
                ('Owner-occupant loans need less down',
                 'FHA loans can be used for two- to four-unit homes you live in, with as little as 3.5% down for '
                 'qualified borrowers. Conventional loans also allow low down payments on owner-occupied two- to four-unit '
                 'homes. Investment property loans for homes you won\'t live in usually require more down and cost more.'),
                ('Ask your lender how rent is counted',
                 'Lenders may count part of the expected rent from the other units toward your income, usually based on '
                 'an appraiser\'s rent estimate or existing leases. Ask early; it changes what you qualify for.'),
            ]),
            ('Running the numbers', [
                ('Start with real rents',
                 'Use the current leases and what similar units nearby actually rent for, not the listing\'s estimate. '
                 'Ask for a rent roll and copies of the leases.'),
                ('Count every expense',
                 'Property taxes, insurance, utilities the owner pays, repairs, capital replacements (roof, furnace, '
                 'appliances), vacancy, property management if you use it, and snow and lawn care. Get the seller\'s '
                 'actual utility and repair history.'),
                ('Look at cash flow and cash on cash',
                 'Rent minus all expenses and the mortgage payment is your cash flow. Divide a year of cash flow by the '
                 'cash you put in to see your return on that cash, and compare it with other uses of your money.'),
                ('Remember property taxes work differently',
                 'In Minnesota, homestead classification applies to the home you live in. In a duplex you live in, only '
                 'your unit usually qualifies; the rental unit is taxed as rental property. Ask the county assessor.'),
            ]),
            ('Inspecting a rental', [
                ('Inspect every unit',
                 'Look at each unit, each furnace and water heater, the separate meters if any, and the common areas. '
                 'Older two- to four-unit buildings often need electrical, plumbing and egress updates.'),
                ('Check city rental licensing',
                 'Many Twin Cities cities, including Minneapolis, require a rental license or registration and '
                 'inspections before you can rent. Check the city\'s requirements, and any time-of-sale inspection, '
                 'before you buy.'),
            ]),
            ('Being a Minnesota landlord', [
                ('Know Minnesota landlord-tenant law',
                 'The Minnesota Attorney General publishes "Landlords and Tenants: Rights and Responsibilities," a free '
                 'handbook that covers leases, repairs, entry, deposits and evictions. Read it before your first lease.'),
                ('Handle security deposits by the rules',
                 'Minnesota law requires landlords to return the deposit with interest, or give a written explanation '
                 'of any amount kept, within 21 days after the tenancy ends and the tenant gives a forwarding address.'),
                ('Follow fair housing laws in every step',
                 'Advertising, screening, rents and rules must treat every applicant the same under federal, Minnesota '
                 'and local fair housing laws. Use the same written screening criteria for everyone.'),
                ('Insure it as a rental',
                 'A rental needs a landlord or dwelling policy, not a regular homeowners policy, and you may want an '
                 'umbrella policy. Require tenants to carry renters insurance in the lease.'),
                ('Keep good records for taxes',
                 'Rental income, expenses and depreciation are reported on your tax return. Keep every receipt and talk '
                 'to a tax adviser about how depreciation and a future sale will be taxed.'),
            ]),
        ],
        'figures': {
            3: ('invest-1.jpg', 'Living in one unit can help with the payment and the financing.'),
            9: ('invest-2.jpg', 'Check the city\'s rental licensing rules before you buy.'),
        },
        'close_h': 'Looking for your first rental?',
        'sources': [
            'Tip 2: HUD (FHA, one- to four-unit owner-occupied homes), hud.gov; Fannie Mae Selling Guide (two- to four-unit principal residences)',
            'Tip 7: Minnesota Department of Revenue, property classification and homestead, revenue.state.mn.us',
            'Tip 9: City of Minneapolis, rental licensing, minneapolismn.gov',
            'Tip 10: Minnesota Attorney General, "Landlords and Tenants: Rights and Responsibilities," ag.state.mn.us',
            'Tip 11: Minnesota Statutes 504B.178 (security deposits), revisor.mn.gov',
            'Tip 12: Fair Housing Act (42 U.S.C. 3601 and following); Minnesota Human Rights Act (Minnesota Statutes chapter 363A)',
        ],
    },
    {
        'slug': 'va-loans-in-minnesota',
        'photo_credit': 'Photos: Debby Hudson (cover), Roger Starnes Sr and Francesca Tosolini on Unsplash.',
        'title': 'VA Loans in Minnesota: A Guide for Veterans and Service Members',
        'sub': 'How VA loans work, how to write a VA offer that wins, and Minnesota\'s property tax help for disabled veterans.',
        'eyebrow': 'Free guide for veterans and service members',
        'intro': [
            'A VA home loan is one of the best benefits of service: no down payment for many buyers and no private '
            'mortgage insurance. Using it well takes a lender and an agent who know the program.',
            f'This guide explains the loan, the offer and Minnesota\'s tax help for disabled veterans. See also '
            f'{a("/buying/veterans-and-military-home-buyers-minnesota", "buying a home in Minnesota as a veteran")}. '
            f'Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('How a VA loan works', [
                ('No down payment, in many cases',
                 'According to VA, there is no down payment as long as the sale price isn\'t higher than the appraised '
                 'value. The loan comes from a private lender, such as a bank, credit union or mortgage company, and VA '
                 'guarantees part of it.'),
                ('No private mortgage insurance',
                 'VA loans don\'t require PMI or MIP, which can make the monthly payment lower than other low-down-payment '
                 'loans.'),
                ('The funding fee',
                 'A VA funding fee may apply. Some borrowers, such as many with a service-connected disability, don\'t '
                 'pay it. Your lender can tell you whether it applies and whether it can be added to the loan.'),
                ('Your Certificate of Eligibility',
                 'You need a Certificate of Eligibility (COE), which your lender can usually get for you. You must plan '
                 'to live in the home, and VA loans can be used more than once.'),
                ('Lenders add their own requirements',
                 'VA sets the program rules, and each lender sets its own credit and income requirements on top of them. '
                 'Compare a few lenders who close VA loans often.'),
            ]),
            ('Choosing your team', [
                ('You don\'t need a "VA realtor"',
                 'VA doesn\'t assign, approve or certify real estate agents, so you can work with any licensed agent. '
                 'What matters is an agent who has closed VA purchases and knows how to make a VA offer as strong as a '
                 'conventional one.'),
                ('Bank and credit union agent programs',
                 'Programs such as USAA Agent Connection (powered by HomeStory) can give members a credit at closing '
                 'when they use an agent in that network. Compare the credit with what an agent will do for you on '
                 'price and terms.'),
            ]),
            ('Writing a VA offer that wins', [
                ('Get pre-approved with an experienced VA lender',
                 'Sellers and their agents feel more confident when the lender closes VA loans regularly.'),
                ('Plan for the appraisal',
                 'If the VA appraisal comes in below your price, you can renegotiate, pay the difference in cash or '
                 'cancel under the VA clause in your purchase agreement. In a competitive situation, decide ahead of '
                 'time how much of a gap you could cover.'),
                ('Ask for seller-paid closing costs when the market allows',
                 'VA allows the seller to pay some closing costs and concessions, which keeps more cash in your pocket. '
                 'In a busy market, your agent can help you weigh this against making your offer stand out.'),
                ('Watch the home\'s condition',
                 'A VA appraiser also checks that the home is safe and sound. A home that needs major repairs can be '
                 'harder to buy with a VA loan, so we flag those before you write an offer.'),
            ]),
            ('Minnesota benefits', [
                ('Disabled Veterans\' Market Value Exclusion',
                 'Minnesota lowers the taxable value of a qualifying veteran\'s homestead: $150,000 excluded for a '
                 'service-connected disability rating of 70% or more, and $300,000 for a 100% total and permanent '
                 'disability rating. A surviving spouse, and in some cases a primary family caregiver, can also qualify.'),
                ('How to apply',
                 'The home must be your homestead, and you apply to your county assessor; applications are due by '
                 'December 31 for taxes payable the next year. Check the Minnesota Department of Revenue for the current '
                 'rules and form.'),
                ('Apply for homestead too',
                 'Apply for homestead classification with your county assessor after you move in (by December 15 to '
                 'count for the next year); it lowers property taxes and is required for the veterans\' exclusion.'),
            ]),
        ],
        'figures': {
            2: ('va-1.jpg', 'No private mortgage insurance can mean a lower monthly payment.'),
            11: ('va-2.jpg', 'A VA appraiser also checks that the home is safe and sound.'),
        },
        'close_h': 'Buying with a VA loan?',
        'sources': [
            'Tips 1 to 5 and 8 to 11: U.S. Department of Veterans Affairs, "Purchase loan," va.gov/housing-assistance/home-loans',
            'Tip 7: USAA, "Agent Connection, powered by HomeStory," usaa.com',
            'Tips 12 and 13: Minnesota Department of Revenue, "Disabled Veterans\' Market Value Exclusion," revenue.state.mn.us',
            'Tip 14: Minnesota Department of Revenue, "Homestead Credit," revenue.state.mn.us',
        ],
    },
    {
        'slug': 'first-year-homeowner-checklist',
        'photo_credit': 'Photos: Erik Mclean (cover), Shutter Speed and Aleksi Partanen on Unsplash.',
        'title': 'Your First-Year Homeowner Checklist',
        'sub': 'What to do the week you move in, before your first Minnesota winter, and all through your first year.',
        'eyebrow': 'Free guide for new Twin Cities homeowners',
        'intro': [
            'Congratulations on your new home. The first year is when you learn how the house works, and when a little '
            'attention prevents the most expensive problems.',
            'Work through this checklist season by season. Keep the receipts and notes in one folder: they help with '
            'warranties, insurance claims and, someday, selling. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('The first week', [
                ('Change the locks and codes',
                 'Rekey or replace exterior locks and change garage door and keypad codes. You don\'t know how many keys '
                 'are out there.'),
                ('Find the shut-offs',
                 'Learn where the main water shut-off, gas shut-off and electrical panel are, and label the breakers. In '
                 'an emergency, minutes matter.'),
                ('Test smoke and carbon monoxide alarms',
                 'Minnesota law requires working carbon monoxide alarms within 10 feet of every sleeping room. Test every '
                 'alarm, replace batteries and replace alarms past their expiration date.'),
                ('Apply for homestead',
                 'Apply with your county assessor for homestead classification; it can lower your property taxes. Apply '
                 'by December 15 for it to count the next year.'),
                ('Set up your files',
                 'Keep the closing papers, inspection report, warranties, manuals and paint colors together, paper or '
                 'digital.'),
            ]),
            ('Before your first winter', [
                ('Service the furnace and change the filter',
                 'Have the furnace cleaned and checked, and change the filter on the schedule its maker recommends. Keep '
                 'a few spare filters on hand.'),
                ('Shut off outdoor faucets',
                 'Disconnect hoses, close the inside shut-off valves to outdoor faucets and drain them so they don\'t '
                 'freeze and burst.'),
                ('Clean gutters and check downspouts',
                 'Clear leaves after they fall and make sure downspouts carry water well away from the foundation.'),
                ('Watch for ice dams',
                 'Icicles and ice ridges at the roof edge can mean heat is escaping into the attic. Attic insulation and '
                 'ventilation are the long-term fix; ask a roofer or insulation contractor.'),
                ('Know your city\'s snow rules',
                 'Many cities have winter parking rules, snow emergency routes and sidewalk clearing rules. Check your '
                 'city\'s website before the first storm.'),
            ]),
            ('Spring and summer', [
                ('Test the sump pump',
                 'If you have one, pour water into the pit to make sure it turns on and drains outside, before the spring '
                 'melt and rains.'),
                ('Check the grading',
                 'Soil should slope away from the foundation. Fill low spots so water doesn\'t pool against the house.'),
                ('Service the air conditioning',
                 'Clean around the outdoor unit and have it serviced so it is ready for the first hot week.'),
                ('Clean the dryer vent',
                 'Clean the lint out of the dryer duct and outside vent; lint buildup is a fire risk.'),
            ]),
            ('All year', [
                ('Test for radon if it wasn\'t done',
                 'The Minnesota Department of Health estimates about 2 in 5 Minnesota homes have radon levels that pose '
                 'a significant health risk. Test kits are inexpensive; test the lowest lived-in level.'),
                ('Know when property taxes are due',
                 'Minnesota property taxes are paid in two halves, generally due May 15 and October 15. If your lender '
                 'pays them from an escrow account, check your annual escrow statement.'),
                ('Review your insurance',
                 'Make sure your coverage reflects the cost to rebuild, and ask about water backup coverage, which many '
                 'policies leave out.'),
                ('Save for repairs',
                 'Set aside money each month for maintenance and repairs, so a new water heater or roof repair doesn\'t '
                 'go on a credit card.'),
                ('Keep receipts for improvements',
                 'Records of improvements can add to your home\'s tax basis when you sell. Keep them with your closing papers.'),
            ]),
        ],
        'figures': {
            5: ('fy-1.jpg', 'Keep your home\'s papers and manuals together.'),
            8: ('fy-2.jpg', 'Clean gutters after the leaves fall.'),
        },
        'close_h': 'Questions about your home?',
        'sources': [
            'Tip 3: Minnesota Statutes 299F.51 (carbon monoxide alarms), revisor.mn.gov',
            'Tip 4: Minnesota Department of Revenue, "Homestead Credit," revenue.state.mn.us',
            'Tip 15: Minnesota Department of Health, "Radon in Homes," health.state.mn.us',
            'Tip 16: Minnesota Department of Revenue, property tax due dates, revenue.state.mn.us',
            'Tip 19: Internal Revenue Service, Publication 523, "Selling Your Home," irs.gov',
        ],
    },
    {
        'slug': 'real-estate-terms-explained',
        'photo_credit': 'Cover photo: Masjid MABA on Unsplash.',
        'title': 'Real Estate Terms, Explained',
        'sub': 'Plain-English definitions of the words you will hear when buying or selling a home in Minnesota.',
        'eyebrow': 'Free guide for Twin Cities buyers and sellers',
        'intro': [
            'Real estate has its own vocabulary, and some of it is specific to Minnesota. This guide explains the terms '
            'you are most likely to hear, in the order you are likely to hear them.',
            f'For listing statuses like "pending" and "contingent," see {a("/buying/listing-status-meanings", "what listing statuses mean")}. '
            f'Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Getting ready', [
                ('Pre-approval',
                 'A lender\'s written statement, after checking your income, assets and credit, of how much it is willing '
                 'to lend you. Stronger than a pre-qualification, which is an estimate.'),
                ('Loan Estimate',
                 'A standard three-page form a lender must give you within three business days of your loan application, '
                 'showing the rate, payment and closing costs.'),
                ('Buyer agreement',
                 'A written agreement between you and your agent that sets out the agent\'s services, how they are paid '
                 'and how long it lasts. Since August 17, 2024, MLS agents need one before touring homes with you.'),
                ('Private mortgage insurance (PMI)',
                 'Insurance that protects the lender, usually required on conventional loans with less than 20% down. It '
                 'can be removed once you have enough equity.'),
            ]),
            ('Making an offer', [
                ('Purchase agreement',
                 'The contract between buyer and seller that sets the price, terms, contingencies and closing date.'),
                ('Earnest money',
                 'A deposit that shows the buyer is serious, usually held by a title company or brokerage and applied to '
                 'the buyer\'s costs at closing.'),
                ('Contingency',
                 'A condition in the purchase agreement that must be met for the sale to go forward, such as financing, '
                 'inspection, appraisal or the sale of the buyer\'s current home.'),
                ('Comparable sales (comps)',
                 'Recent sales of similar nearby homes, used to set a price and by appraisers to judge value.'),
                ('Dual agency',
                 'When one brokerage represents both buyer and seller. Minnesota allows it only with both parties\' '
                 'written consent, and the agents can\'t advocate for one side against the other.'),
            ]),
            ('Before closing', [
                ('Appraisal',
                 'A licensed appraiser\'s opinion of the home\'s value, ordered by the lender to make sure the home is '
                 'worth at least the loan amount.'),
                ('Seller\'s disclosure',
                 'The seller\'s written statement of material facts they know about the home. Minnesota also requires '
                 'separate disclosures for wells, septic systems and radon.'),
                ('Time-of-sale inspection',
                 'A city-required housing evaluation or sewer inspection before a home is listed or sold, required in '
                 'some Minnesota cities, such as Minneapolis\' Truth in Sale of Housing.'),
                ('Title insurance',
                 'Insurance against problems with ownership, such as old liens or errors in records. A lender\'s policy '
                 'protects the lender; an owner\'s policy protects you.'),
                ('Special assessment',
                 'A charge from a city for a public improvement that benefits the property, such as a new street or '
                 'sewer. The purchase agreement says who pays assessments that are pending or levied.'),
            ]),
            ('Closing and after', [
                ('Closing Disclosure',
                 'The final statement of your loan terms and closing costs, which you must receive at least three '
                 'business days before closing.'),
                ('Deed tax',
                 'A Minnesota tax on the transfer of property, usually paid by the seller: 0.33% of the price, plus 0.01% '
                 'in Hennepin and Ramsey counties.'),
                ('Mortgage registry tax',
                 'A Minnesota tax on a new mortgage, usually paid by the buyer, based on the loan amount.'),
                ('Escrow account',
                 'An account your lender may set up to collect part of your property taxes and insurance each month and '
                 'pay the bills when due.'),
                ('Homestead',
                 'The Minnesota property tax classification for a home you own and live in, which can lower your taxes. '
                 'You apply with your county assessor.'),
                ('Contract for deed',
                 'A way to buy where the seller finances the purchase and keeps the title until the buyer pays in full. '
                 'Minnesota has specific rules for these contracts; have an attorney review one before you sign.'),
            ]),
        ],
        'close_h': 'Still have a question?',
        'sources': [
            'Loan Estimate and Closing Disclosure: Consumer Financial Protection Bureau, consumerfinance.gov',
            'Buyer agreement: National Association of REALTORS®, practice changes effective August 17, 2024, nar.realtor',
            'Dual agency: Minnesota Statutes 82.67 (agency disclosure), revisor.mn.gov',
            'Disclosures: Minnesota Statutes 513.52 to 513.60, 103I.235, 115.55 and 144.496, revisor.mn.gov',
            'Deed tax and mortgage registry tax: Minnesota Department of Revenue, revenue.state.mn.us',
            'Contract for deed: Minnesota Statutes 559.21 and 559.202, revisor.mn.gov',
        ],
    },
]
