"""Content of the free guides made by make-html.py (the first guide, 25-insider-secrets.html, is hand-written).
Rules (CLAUDE.md): no invented figures (every fact names its source in "sources"); fair housing (no schools, no "safe",
nothing about who lives where); links go to huerkamphomes.com pages that exist.
"""
SITE = 'https://www.huerkamphomes.com'


def a(path, text):
    return f'<a href="{SITE}{path}">{text}</a>'


GUIDES = [
    {
        'slug': 'selling-your-home-in-minnesota',
        'photo_credit': 'Cover photo: Collov Home Design; inside: Spacejoy and Jessica Anderson, all on Unsplash.',
        'figures': {7: ('sell-1.jpg', 'Fresh paint, clean floors and good light usually pay off more than a big remodel.'), 14: ('sell-2.jpg', 'Homes sell all year in Minnesota; keep walks clear and the home bright.')},
        'title': 'Selling Your Home in Minnesota: 20 Ways to Net More',
        'sub': 'How Twin Cities sellers price right, prepare smart, meet Minnesota\'s rules and keep more at closing.',
        'eyebrow': 'Free guide for Twin Cities home sellers',
        'intro': [
            'Selling a home is a project with a deadline, a budget and a lot of rules. The sellers who net the most usually '
            'aren\'t the ones who spent the most; they\'re the ones who priced it right, fixed the right things and had '
            'their paperwork ready before the first showing.',
            'This guide walks through what our agents do with every seller, in order, with the Minnesota rules that '
            'catch people by surprise. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Before you list', [
                ('Know your number before you pick a price',
                 f'Start with what you would walk away with, not the list price. Subtract your mortgage payoff, agent '
                 f'commissions, Minnesota deed tax, title and closing fees, and any repairs or credits. Our '
                 f'{a("/calculators/seller-net-proceeds", "seller net proceeds calculator")} does the math, and '
                 f'{a("/selling/cost-to-sell-a-house-in-minnesota", "what it costs to sell in Minnesota")} explains each cost.'),
                ('Get a pricing opinion from recent sales',
                 'Online estimates can\'t see your updates, your lot or your layout. Ask an agent for a market analysis '
                 'built from homes like yours that sold nearby in the last few months, and the ones that are for sale '
                 'now (your competition). Pricing within the range buyers are already paying draws the most showings in '
                 'the first two weeks, when interest is highest.'),
                ('Check your city\'s time-of-sale rules early',
                 f'Some Minnesota cities, including Minneapolis, Saint Paul and Bloomington, require a city housing '
                 f'evaluation before you list, and some items it flags must be fixed. Order it early so a surprise '
                 f'doesn\'t delay your listing date. See {a("/selling-in-minnesota", "what your city requires before you sell")}.'),
                ('Gather the paperwork buyers will ask for',
                 'Pull together utility costs, the age of the roof, furnace, air conditioning and water heater, permits '
                 'and receipts for updates, warranties, and HOA documents if you have an association. Organized records '
                 'answer buyer questions before they become worries, and make your disclosures easier to fill out.'),
                ('Fill out the seller disclosure honestly and completely',
                 'Minnesota law requires sellers to disclose material facts they know of that could significantly '
                 'affect a buyer\'s use or enjoyment of the home. There are separate Minnesota disclosures for private '
                 'wells, septic systems and radon. When in doubt, disclose: a problem a buyer learns about up front is '
                 'a negotiating point; one they discover later can become a legal claim.'),
            ]),
            ('Preparing the home', [
                ('Fix what an inspector will find',
                 'Dripping faucets, missing outlet covers, a running toilet, stained ceiling tiles and peeling paint '
                 'each look small, but a long list of small items on an inspection report makes buyers wonder what else '
                 'was ignored. Spend a weekend on the easy fixes before you list.'),
                ('Spend on what buyers see, not what you would want',
                 'Fresh neutral paint, clean carpets or refinished floors, updated light fixtures and a tidy yard '
                 'usually return more than a big remodel finished right before you sell. Ask your agent what buyers in '
                 'your price range are comparing your home with before you spend money.'),
                ('Declutter like you are already moving',
                 'Pack the things you won\'t use in the next two months: extra furniture, collections, out-of-season '
                 'clothes, most of the photos. Clear closets and counters show buyers how much space there is. Rent a '
                 'storage unit if you need to; you have to pack anyway.'),
                ('Consider a pre-listing inspection',
                 'An inspection before you list lets you fix problems on your own schedule and price, rather than '
                 'negotiating them under a deadline. It also helps you fill out the disclosure statement accurately. '
                 'Anything it finds that you don\'t fix will need to be disclosed.'),
                ('Test for radon before a buyer does',
                 'The Minnesota Department of Health estimates about 2 in 5 Minnesota homes have radon levels that pose '
                 'a significant health risk, and Minnesota\'s radon law requires sellers to disclose what they know '
                 'about radon in the home. If a test comes back high, a mitigation system can be installed before you '
                 'list instead of becoming a last-minute negotiation.'),
            ]),
            ('Marketing and showings', [
                ('Insist on professional photos',
                 'Most buyers decide which homes to see from the photos. Bright, wide, professional photos (and a floor '
                 'plan or video tour where it fits) earn more showings than phone pictures. Ask any agent you interview '
                 'exactly how they will market your home.'),
                ('Make showings easy',
                 'Every showing you turn down is a buyer who may buy something else. Keep the home ready, leave during '
                 'showings, put away valuables and medications, and plan for pets. A lockbox and a showing service let '
                 'buyers see the home when they are ready.'),
                ('Read the feedback in the first two weeks',
                 'If showings are steady but there are no offers, buyers are telling you something about price or '
                 'condition. If there are few showings, the price or the photos aren\'t getting attention. Adjusting '
                 'early usually costs less than waiting.'),
                ('Plan for winter selling in Minnesota',
                 'Homes sell all year here. In winter, keep walks and the driveway clear, the home warm and well lit, '
                 'and have summer photos of the yard ready. Fewer homes are for sale in winter, and the buyers who are '
                 'out looking are often serious.'),
            ]),
            ('Offers to closing', [
                ('Compare the whole offer, not just the price',
                 'Look at the financing type and pre-approval, the down payment, the earnest money, the inspection and '
                 'appraisal terms, the closing date and any requests for help with closing costs. A slightly lower '
                 'offer with strong financing and fewer conditions may net you more and close more surely.'),
                ('Negotiate repairs with a plan',
                 'After the inspection, buyers may ask for repairs or a credit. Focus on safety and major systems, and '
                 'consider offering a credit or a price change instead of doing repairs under a deadline. Your agent can '
                 'tell you what is typical for your market.'),
                ('Prepare for the appraisal',
                 'If the buyer is financing, the lender orders an appraisal. Give your agent a list of updates and '
                 'recent sales that support your price to share with the appraiser. If the appraisal comes in low, your '
                 'options depend on the terms of the purchase agreement.'),
                ('Don\'t forget the deed tax and the payoff',
                 'In Minnesota the seller typically pays the state deed tax, which is 0.33% of the sale price. Your '
                 'title company will also order the exact payoff of your mortgage and any home equity line; make sure a '
                 'line of credit is closed, not just paid down.'),
                ('Know how the sale affects your taxes',
                 'If you owned and lived in the home as your main home for at least two of the last five years, you may '
                 'be able to exclude up to $250,000 of gain from income ($500,000 for most married couples filing '
                 'jointly), according to the IRS. Ask a tax adviser how the rules apply to you.'),
                ('Plan your move around the closing',
                 'Decide early whether you will buy first, sell first or ask to stay after closing for a few days. '
                 'Leave the home clean and empty, with keys, garage openers and manuals, and transfer utilities on the '
                 'closing date. Final walk-throughs go smoothly when nothing is left behind.'),
            ]),
        ],
        'close_h': 'Thinking about selling?',
        'sources': [
            'Tip 3: City of Minneapolis (Truth in Sale of Housing), City of Saint Paul (Truth-in-Sale of Housing) and City of Bloomington (Time-of-Sale program) official websites',
            'Tips 5 and 10: Minnesota Statutes 513.52 to 513.60 (seller disclosure), 103I.235 (wells), 115.55 (septic systems), 144.496 (radon), revisor.mn.gov',
            'Tip 10: Minnesota Department of Health, "Radon in Homes," health.state.mn.us',
            'Tip 18: Minnesota Statutes 287.21 (deed tax rate) and Minnesota Department of Revenue, "Deed Tax," revenue.state.mn.us',
            'Tip 19: Internal Revenue Service, Publication 523, "Selling Your Home," irs.gov',
        ],
    },
    {
        'slug': 'first-time-home-buyer-guide-minnesota',
        'photo_credit': 'Cover photo: Jakub Żerdzicki; inside: Puscas Adryan and Victor Meza, all on Unsplash.',
        'figures': {13: ('ftb-1.jpg', 'Paint and furniture are easy to change; layout and systems are not.'), 15: ('ftb-2.jpg', 'Go to the inspection and ask questions.')},
        'title': 'First-Time Home Buyer\'s Guide to Minnesota',
        'sub': 'From your first budget to your first set of keys: the steps, the costs and the help available in Minnesota.',
        'eyebrow': 'Free guide for first-time buyers',
        'intro': [
            'Buying your first home is exciting and a little overwhelming. There are new words, new costs and a lot of '
            'people involved. This guide puts every step in order, so you always know what comes next and what to ask.',
            'You may count as a "first-time buyer" for many programs even if you have owned before: the common '
            'definition is someone who hasn\'t owned a home in the last three years. Questions? Call or text us at '
            '(612) 502-7653.',
        ],
        'parts': [
            ('Getting ready', [
                ('Decide what you can afford, by month',
                 f'Lenders look at your debts compared with your income, but the number that matters is a monthly '
                 f'payment you are comfortable with: principal, interest, property taxes, insurance, mortgage insurance '
                 f'and any HOA fee. Try our {a("/calculators/affordability", "affordability calculator")} and '
                 f'{a("/calculators/rent-vs-buy", "rent vs. buy calculator")}.'),
                ('Check your credit early',
                 'Get your free credit reports (annualcreditreport.com is the official site), fix any errors and pay '
                 'every bill on time. Paying down credit card balances can raise your score. Starting a few months '
                 'before you shop gives changes time to show up.'),
                ('Learn the loan types',
                 'FHA loans allow as little as 3.5% down for borrowers with a credit score of 580 or higher. Some '
                 'conventional loans allow 3% down. VA loans for eligible veterans and service members and USDA loans in '
                 'eligible rural areas can require no down payment. Ask a lender which fits you; the lowest down payment '
                 'isn\'t always the lowest monthly cost.'),
                ('Understand mortgage insurance',
                 'With less than 20% down on a conventional loan you will usually pay private mortgage insurance (PMI). '
                 'Under federal law it ends automatically when your balance reaches 78% of the home\'s original value, '
                 'and you can ask to remove it at 80%. FHA mortgage insurance works differently, so ask how long it lasts.'),
                ('Find out what help you qualify for',
                 f'Minnesota Housing, along with many cities, counties and nonprofits, offers down payment and closing '
                 f'cost help for first-time buyers, usually with income and purchase price limits. Some require a '
                 f'homebuyer education class. See our {a("/down-payment-assistance-minnesota", "Minnesota down payment assistance guide")} '
                 f'and {a("/first-time-home-buyer-minnesota", "first-time buyer programs")}.'),
                ('Take a homebuyer education class',
                 'Many assistance programs require one, and it is worth taking even if yours doesn\'t. Classes cover '
                 'budgeting, loans and the buying process, and are offered online and in person across Minnesota.'),
            ]),
            ('Getting approved', [
                ('Talk to more than one lender',
                 'Ask two or three lenders for a Loan Estimate on the same day for the same loan. The lender must send '
                 'it within three business days of your application. Compare the rate, the lender fees and the cash '
                 'needed to close, line by line.'),
                ('Get a full pre-approval',
                 'A pre-approval means the lender has checked your income, assets and credit. It tells you your price '
                 'range and shows sellers you can close. Have pay stubs, W-2s or tax returns, and bank statements ready.'),
                ('Save for more than the down payment',
                 'Plan for closing costs, prepaid property taxes and insurance, the inspection and appraisal, moving '
                 'costs and a cushion for the first repairs. Keep the money in your accounts; lenders need to see where '
                 'large deposits came from.'),
            ]),
            ('House hunting', [
                ('Choose an agent who explains things',
                 'Since August 17, 2024, agents who belong to a multiple listing service need a written agreement with '
                 'you before touring homes. Read it, ask how your agent is paid and choose someone who answers your '
                 'questions patiently. That\'s most of the job for a first-time buyer.'),
                ('Make a must-have list and a nice-to-have list',
                 'Bedrooms, commute, yard, garage, one level or two: decide what you can\'t live without and what you '
                 'could add later. It keeps you focused when you see a home with a great kitchen and a bad commute.'),
                ('Compare homes by their monthly cost',
                 f'Property taxes and HOA fees can make two homes with the same price very different each month. Look '
                 f'up the taxes on the listing or the county website, and see {a("/property-taxes", "property taxes by county")}.'),
                ('Look past paint and furniture',
                 'Paint, carpet and light fixtures are easy to change. The roof, foundation, windows, furnace and '
                 'layout are not. A first home with good bones and dated finishes is often a better buy than a '
                 'flipped home with hidden problems.'),
            ]),
            ('Offer to keys', [
                ('Write an offer with your agent',
                 'Your agent will look at recent sales to choose a price, and help you decide on earnest money, the '
                 'closing date and contingencies for financing and inspection. The purchase agreement is a binding '
                 'contract, so read it and ask about anything you don\'t understand.'),
                ('Inspect, and test for radon',
                 'Go to the home inspection and ask questions. The Minnesota Department of Health estimates about 2 in 5 '
                 'Minnesota homes have radon levels that pose a significant health risk, so test during your inspection '
                 'period. For older homes, consider a sewer line camera inspection.'),
                ('Lock your rate and keep your finances steady',
                 'Ask your lender when to lock your interest rate. Until closing, don\'t open new credit, make large '
                 'purchases or change jobs without talking to your lender.'),
                ('Read your Closing Disclosure',
                 'You must receive your Closing Disclosure at least three business days before closing. Compare it with '
                 'your Loan Estimate and ask your lender about any change. Confirm wiring instructions by calling the '
                 'title company at a number you looked up yourself.'),
                ('Apply for homestead after you move in',
                 'In Minnesota, your home can be classified as a homestead, which can lower your property taxes. You '
                 'must apply with your county assessor; to count for the following year\'s taxes, apply by December 15.'),
            ]),
        ],
        'close_h': 'Ready to take the first step?',
        'sources': [
            'Intro: U.S. Department of Housing and Urban Development, first-time homebuyer definition (no ownership in the past three years), hud.gov',
            'Tip 2: Federal Trade Commission, "Free Credit Reports," consumer.ftc.gov',
            'Tip 3: HUD, FHA loan requirements; Fannie Mae HomeReady and Freddie Mac Home Possible; U.S. Department of Veterans Affairs; USDA Rural Development',
            'Tip 4: Homeowners Protection Act of 1998, as explained by the Consumer Financial Protection Bureau, consumerfinance.gov',
            'Tip 5: Minnesota Housing, mnhousing.gov',
            'Tips 7 and 17: Consumer Financial Protection Bureau, Loan Estimate and Closing Disclosure explainers, consumerfinance.gov',
            'Tip 10: National Association of REALTORS®, practice changes effective August 17, 2024, nar.realtor',
            'Tip 15: Minnesota Department of Health, "Radon in Homes," health.state.mn.us',
            'Tip 18: Minnesota Department of Revenue, "Homestead Credit" and county assessor homestead applications, revenue.state.mn.us',
        ],
    },
    {
        'slug': 'moving-to-the-twin-cities',
        'photo_credit': 'Cover photo: Guywelch2000, Wikimedia Commons, CC BY 4.0 (power lines removed); inside: Point3D Commercial Imaging Ltd. and Jessica Anderson on Unsplash.',
        'figures': {4: ('mov-1.jpg', 'Know which home style you want: it narrows the search.'), 14: ('mov-2.jpg', 'Check your city\'s snow rules before the first storm.')},
        'title': 'Moving to the Twin Cities: A Relocation Guide',
        'sub': 'How to choose where to live, buy from out of state and settle in to Minneapolis, Saint Paul and the suburbs.',
        'eyebrow': 'Free guide for people moving to Minnesota',
        'intro': [
            'The Twin Cities area covers two central cities and dozens of suburbs across seven core counties, each with '
            'its own taxes, home styles and feel. Choosing the right place is the hardest part of moving here, and the '
            'part most worth doing carefully.',
            f'This guide helps you narrow the map, buy with confidence from a distance and get settled once you arrive. '
            f'Questions? Call or text us at (612) 502-7653. You can also explore {a("/communities", "our community guides")}.',
        ],
        'parts': [
            ('Choosing where to live', [
                ('Start with your commute',
                 f'Where you work, and how often you go in, narrows the map faster than anything else. Drive times '
                 f'change a lot at rush hour, especially across the rivers. Compare places with our '
                 f'{a("/commute", "commute tool")} before you look at homes.'),
                ('Decide city, close-in suburb or outer suburb',
                 f'Minneapolis and Saint Paul offer older homes, walkable neighborhoods and transit. Close-in suburbs '
                 f'mix older homes with shorter drives. Outer suburbs tend to have newer homes and larger lots. '
                 f'{a("/minneapolis-suburbs", "Minneapolis suburbs compared")} lays out the trade-offs.'),
                ('Compare property taxes, not just prices',
                 f'Minnesota property taxes vary by city, county and school district, so two homes at the same price '
                 f'can have very different tax bills. See {a("/property-taxes", "property taxes by county")} and '
                 f'{a("/cost-of-living-minnesota", "the cost of living in Minnesota")}.'),
                ('Look at the home styles each area offers',
                 'Older areas have bungalows, Tudors and Victorians with character and older systems; postwar suburbs '
                 'have ramblers and split-levels; newer suburbs have two-stories and townhomes with modern layouts. '
                 'Knowing which style you want narrows the search.'),
                ('Think about lakes, parks and trails',
                 f'The metro has hundreds of lakes and a large regional park and trail system. If you want to live near '
                 f'water or trails, start there. See {a("/lake-homes", "lake homes")} and our community guides.'),
                ('Visit before you commit, if you can',
                 'Spend a weekend driving the areas on your list at different times of day. If you can\'t, ask your '
                 'agent for video walk-throughs of the neighborhoods as well as the homes.'),
            ]),
            ('Buying from a distance', [
                ('Get pre-approved before you travel',
                 'A pre-approval lets you write an offer the same day you see the right home. If your income is '
                 'changing with the move, tell your lender up front; an offer letter from your new employer may be '
                 'needed.'),
                ('Use video tours and a local agent',
                 'Many relocating buyers tour by live video first and visit only the finalists. Ask your agent to point '
                 'out what a camera hides: road noise, smells, slopes and the condition of the neighbors\' yards.'),
                ('Understand winter in a house',
                 'Ask about the furnace\'s age and service history, insulation, windows and ice dams on the roof. In '
                 'winter, check how the driveway faces and how long it is: you or a service will be clearing it.'),
                ('Sign and close from anywhere',
                 'Most of the paperwork can be signed electronically, and many title companies can arrange remote or '
                 'mail-away closings. Ask early what your lender and title company allow. Confirm wiring instructions '
                 'by phone, never by email alone.'),
                ('Plan for a rent-back or short-term rental',
                 'If your move date and closing don\'t line up, a short-term rental or a rent-back from the seller can '
                 'bridge the gap. Your agent can ask for one in the offer.'),
            ]),
            ('Settling in', [
                ('Transfer your license and vehicle registration',
                 'Minnesota Driver and Vehicle Services handles driver\'s licenses and vehicle registration. New '
                 'residents should switch both over soon after moving; check DVS for the current requirements.'),
                ('Apply for homestead',
                 'If the home is your main residence, apply for homestead classification with your county assessor. It '
                 'can lower your property taxes; apply by December 15 for it to count the next year.'),
                ('Get ready for snow',
                 'Many cities have winter parking rules and snow emergency routes, and expect sidewalks to be cleared '
                 'after a snowfall. Check your city\'s website for its rules before the first storm.'),
                ('Set up your utilities and services',
                 'Electricity and natural gas providers depend on where you live, and many cities run their own water '
                 'and sewer billing and organize trash and recycling. Your city\'s website lists what to set up.'),
            ]),
        ],
        'close_h': 'Planning a move to the Twin Cities?',
        'sources': [
            'Intro: Metropolitan Council (seven-county metropolitan area), metrocouncil.org',
            'Tip 5: Metropolitan Council, Regional Parks System, metrocouncil.org',
            'Tip 12: Minnesota Driver and Vehicle Services, dps.mn.gov/divisions/dvs',
            'Tip 13: Minnesota Department of Revenue, "Homestead Credit," revenue.state.mn.us',
        ],
    },
    {
        'slug': 'downsizing-made-simple',
        'photo_credit': 'Cover photo: Alicia Christin Gerald; inside: Kara Eads and Matt Adams, all on Unsplash.',
        'figures': {2: ('down-1.jpg', 'Compare your options side by side before you choose.'), 13: ('down-2.jpg', 'Ask which repairs will pay for themselves.')},
        'title': 'Downsizing Made Simple',
        'sub': 'A calm, step-by-step plan for selling the family home, choosing what\'s next and moving with less stress.',
        'eyebrow': 'Free guide for homeowners ready to downsize',
        'intro': [
            'Downsizing is rarely just a real estate decision. It means sorting through years of belongings, deciding '
            'where you want to live next and timing a sale and a purchase so you only move once.',
            f'This guide breaks it into steps you can take at your own pace. See also our {a("/downsizing", "downsizing page")} '
            f'and {a("/downsizing/selling-a-parents-home", "selling a parent’s home")}. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Deciding what\'s next', [
                ('Write down why you are moving',
                 'Less upkeep, fewer stairs, being near family, lower costs, travel: your reasons decide what kind of '
                 'home fits next. Keep the list handy when you tour; it keeps a beautiful but impractical home from '
                 'pulling you off course.'),
                ('Compare your options side by side',
                 f'A smaller single-family home, a one-level townhome, a condo, an age-restricted (55+) community, renting, '
                 f'or senior living with services each come with different costs and freedoms. See '
                 f'{a("/townhomes-for-sale-mn", "townhomes")} and {a("/condos-for-sale-mn", "condos")} for sale.'),
                ('Look closely at association fees and rules',
                 'With a townhome or condo, the monthly fee may cover snow removal, lawn care, exterior maintenance, '
                 'insurance on the building and some utilities. Read what it covers, the rules, and the reserve fund, '
                 'and ask about upcoming special assessments.'),
                ('Estimate what you will walk away with',
                 f'Your home\'s value, minus the mortgage and costs of selling, sets your budget for what\'s next. Our '
                 f'{a("/home-estimate", "instant home value estimate")} and '
                 f'{a("/calculators/seller-net-proceeds", "seller net proceeds calculator")} give you a starting point.'),
                ('Ask about taxes before you sell',
                 'The IRS lets many owners exclude up to $250,000 of gain on the sale of a main home ($500,000 for most '
                 'married couples filing jointly) if they owned and lived in it for two of the last five years. A tax '
                 'adviser can tell you how it applies to you.'),
            ]),
            ('Timing the move', [
                ('Decide: buy first, sell first or both at once',
                 'Buying first means one move but may require a bridge loan or enough cash. Selling first frees your '
                 'money but may mean a short-term rental. Your agent can write offers that line the two closings up, '
                 'or ask the buyer to let you stay a few days after closing.'),
                ('Look at older-adult financing options',
                 'Homeowners 62 and older can use a reverse mortgage for purchase (an FHA Home Equity Conversion '
                 'Mortgage) to buy their next home with a smaller down payment and no monthly mortgage payment. It has '
                 'costs and rules, and federal law requires counseling with a HUD-approved counselor first.'),
                ('Give yourself more time than you think',
                 'Sorting a home you have lived in for decades takes months, not weekends. Start with rooms you use '
                 'least, and set a target date for each room.'),
            ]),
            ('Sorting and letting go', [
                ('Measure your next home first',
                 'Know the room sizes and closet space before you decide what furniture comes along. A simple floor '
                 'plan with your furniture drawn to scale prevents moving pieces that won\'t fit.'),
                ('Sort into keep, give, sell and donate',
                 'Decide on one room at a time. Offer family items early and set a date for pickups. Things that don\'t '
                 'fit your next home are easier to let go of when they go to someone who will use them.'),
                ('Consider an estate sale or a senior move manager',
                 'Estate sale companies price, sell and clear what you leave behind for a share of the sales. Senior '
                 'move managers help plan, sort, pack and set up the new home. Ask for references and a written '
                 'agreement.'),
                ('Keep important papers together',
                 'Set aside the deed, mortgage statements, tax records, insurance, receipts for updates and anything '
                 'you will need for the sale or your taxes, in one box that moves with you.'),
            ]),
            ('Selling the family home', [
                ('Make the few repairs that matter',
                 'Homes that have been lived in for decades often need updated paint, flooring or fixtures. Ask your '
                 'agent which updates will pay for themselves and which buyers would rather do themselves.'),
                ('Complete Minnesota\'s required disclosures',
                 'Minnesota sellers must disclose material facts they know about the home, and there are separate '
                 'disclosures for wells, septic systems and radon. If you have lived there a long time, write down what '
                 'you have replaced and when; it helps buyers and makes the forms easier.'),
                ('Check your city\'s time-of-sale rules',
                 f'Some cities, including Minneapolis, Saint Paul and Bloomington, require a city evaluation before you '
                 f'sell. See {a("/selling-in-minnesota", "what your city requires")}.'),
                ('Consider a cash offer',
                 f'If repairs or showings feel like too much, a cash sale can close quickly with fewer showings, usually '
                 f'at a lower price. Compare both paths: {a("/selling/cash-offer-vs-listing", "cash offer or list?")}'),
                ('If you are selling for a parent or an estate',
                 f'Someone needs legal authority to sign: a power of attorney, a trustee, or a personal representative '
                 f'named by the probate court. Start that paperwork early. See '
                 f'{a("/downsizing/selling-a-house-in-probate-minnesota", "selling a house in probate in Minnesota")}.'),
            ]),
        ],
        'close_h': 'Ready to talk about your next move?',
        'sources': [
            'Tip 5: Internal Revenue Service, Publication 523, "Selling Your Home," irs.gov',
            'Tip 7: U.S. Department of Housing and Urban Development, Home Equity Conversion Mortgage (HECM) for Purchase, hud.gov',
            'Tip 14: Minnesota Statutes 513.52 to 513.60, 103I.235, 115.55 and 144.496, revisor.mn.gov',
            'Tip 15: City of Minneapolis, City of Saint Paul and City of Bloomington official websites',
        ],
    },
]
