"""Batch 2 of the free guides (Nov 26, 2026). Same rules as guides_content.py. "figures" puts a photo after a tip:
{tip number: (file in scripts/guides/photos/, caption)}; photo credits are listed in "photo_credit".
"""
from guides_content import a

GUIDES2 = [
    {
        'slug': 'minnesota-down-payment-assistance',
        'photo_credit': 'Photos: Jakub Żerdzicki (cover), Kelly Sikkema and Tierra Mallorca on Unsplash.',
        'title': 'Minnesota Down Payment Assistance, Explained',
        'sub': 'The programs, the rules and the steps to get help with your down payment and closing costs in Minnesota.',
        'eyebrow': 'Free guide for Minnesota home buyers',
        'intro': [
            'For many buyers, the down payment is the hardest part of buying a home. Minnesota has more help than most '
            'people realize: statewide programs, city and county programs, and loan types built for small down payments.',
            f'This guide explains how the help works, who it\'s for and how to apply, in plain English. Program amounts and '
            f'income limits change, so confirm current numbers with your lender or on our '
            f'{a("/down-payment-assistance-minnesota", "Minnesota down payment assistance page")}. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('How assistance works', [
                ('Assistance is usually a loan, not free money',
                 'Most down payment help in Minnesota comes as a second loan. Some have no monthly payment and are repaid '
                 'when you sell, refinance or pay off your first mortgage (often called deferred loans). Others are paid '
                 'monthly at a low rate. A few programs forgive the loan over time. Ask exactly when and how yours is repaid.'),
                ('It works together with your first mortgage',
                 'You apply for assistance through your mortgage lender, at the same time as your home loan. That means '
                 'the lender you choose matters: many statewide programs work only with participating lenders.'),
                ('Income and price limits apply',
                 'Most programs have household income limits and purchase price limits, which can differ by county and '
                 'household size. Your lender can check whether you qualify before you start shopping, so you know your '
                 'price range.'),
                ('"First-time buyer" may include you',
                 'Many programs use the federal definition: someone who hasn\'t owned a home in the last three years. '
                 'If you owned years ago, you may still count. Some programs are open to repeat buyers too.'),
            ]),
            ('Statewide and local programs', [
                ('Minnesota Housing\'s programs',
                 'Minnesota Housing, the state\'s housing finance agency, offers first mortgages for first-time buyers '
                 '(Start Up) and for repeat buyers (Step Up), along with down payment and closing cost help such as the '
                 'Deferred Payment Loan and the Monthly Payment Loan. Each has its own rules; a participating lender can '
                 'tell you which you qualify for.'),
                ('City and county programs',
                 'Many cities and counties in the Twin Cities run their own down payment programs, sometimes for a '
                 'specific area or type of home. They can often be combined with state help. Ask your lender or agent '
                 'which programs cover the cities you are looking in, and check each city\'s housing department website.'),
                ('Nonprofit and community programs',
                 'Nonprofits and community land trusts offer additional help and lower-cost homes in some areas, often '
                 'paired with homebuyer coaching. The Minnesota Homeownership Center lists programs and counselors '
                 'across the state.'),
                ('Loans built for small down payments',
                 'FHA loans allow 3.5% down with a credit score of 580 or higher. Some conventional loans, including '
                 'Fannie Mae\'s HomeReady and Freddie Mac\'s Home Possible, allow 3% down. VA and USDA loans can require no '
                 'down payment for eligible buyers and homes. Assistance can cover some or all of what\'s left.'),
            ]),
            ('Other ways to cover your costs', [
                ('Gifts from family',
                 'Most loan types allow down payment gifts from family. Lenders will ask for a signed gift letter and '
                 'records showing the money moving from the giver\'s account to yours. Tell your lender before the money '
                 'moves, not after.'),
                ('Seller-paid closing costs',
                 'A seller can agree to pay part of your closing costs, up to limits set by the loan type: up to 6% of '
                 'the price for FHA loans, up to 4% for VA loans (on certain costs), and 3% to 9% for conventional loans '
                 'depending on your down payment. In a busy market a request like this can make an offer less attractive, '
                 'so ask your agent how to use it.'),
                ('Lender credits',
                 'Some lenders will pay part of your closing costs in exchange for a slightly higher interest rate. It '
                 'lowers your cash to close but raises your payment, so compare both on your Loan Estimate.'),
                ('Retirement accounts, carefully',
                 'Some retirement plans allow loans or first-time buyer withdrawals, but taxes, penalties and lost '
                 'growth can make them expensive. Talk to a tax adviser before using retirement money.'),
            ]),
            ('Step by step', [
                ('Take a homebuyer education class',
                 'Many programs require one. In Minnesota, Home Stretch workshops (through the Minnesota Homeownership '
                 'Center network) and Framework\'s online course are widely accepted. Ask your lender which your program '
                 'needs before you sign up.'),
                ('Choose a participating lender',
                 'Ask lenders directly: "Do you offer Minnesota Housing loans and the city and county programs where I '
                 'want to buy?" A lender who uses these programs often will move faster and catch problems early.'),
                ('Get pre-approved with the assistance included',
                 'Your pre-approval should list the assistance program, so your offer shows sellers how the purchase '
                 'will be paid for. Some programs need time to approve funds, so plan a realistic closing date.'),
                ('Read the assistance terms before you sign',
                 'Before closing, read the note and mortgage for the assistance loan: when it is repaid, whether it is '
                 'forgiven, and what happens if you sell, refinance or rent the home. Keep a copy with your records.'),
            ]),
        ],
        'figures': {
            4: ('dpa-1.jpg', 'Down payment help is often a second loan with its own repayment rules.'),
            12: ('dpa-2.jpg', 'Ask your lender which programs can be combined.'),
        },
        'close_h': 'Want to see what help you qualify for?',
        'sources': [
            'Tip 4: U.S. Department of Housing and Urban Development, first-time homebuyer definition, hud.gov',
            'Tip 5: Minnesota Housing, homebuyer programs (Start Up, Step Up, Deferred Payment Loan, Monthly Payment Loan), mnhousing.gov',
            'Tips 7 and 13: Minnesota Homeownership Center, hocmn.org; Framework, frameworkhomeownership.org',
            'Tip 8: HUD (FHA); Fannie Mae (HomeReady); Freddie Mac (Home Possible); U.S. Department of Veterans Affairs; USDA Rural Development',
            'Tip 10: HUD Handbook 4000.1 (FHA, 6%); VA Lenders Handbook (4%); Fannie Mae Selling Guide B3-4.1-02 (interested party contributions)',
        ],
    },
    {
        'slug': 'buying-new-construction',
        'photo_credit': 'Photos: Ernie Journeys (cover), Josh Olalde and Sasun Bughdaryan on Unsplash.',
        'title': 'Buying New Construction in the Twin Cities',
        'sub': 'How to choose a builder, what the base price leaves out and how Minnesota\'s new home warranty protects you.',
        'eyebrow': 'Free guide for new construction buyers',
        'intro': [
            'A brand-new home means modern layouts, new systems and nothing to fix for a while. It also means a different '
            'way of buying: you negotiate with a builder, pick options from a price list and often wait months for the '
            'home to be finished.',
            f'This guide covers what to know before you walk into a model home. See {a("/new-construction", "new construction in the Twin Cities")} '
            f'for current developments. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Before you visit a model', [
                ('Bring your own agent on the first visit',
                 'The salesperson in the model home works for the builder. Many builders require your agent to come '
                 'with you, or register you, on your first visit for your agent to represent you later. Your agent can '
                 'compare builders, review the contract and keep track of the build.'),
                ('Know the three ways to buy new',
                 'A spec home (or inventory home) is already built or under way, so it\'s faster and the options are '
                 'set. A to-be-built home lets you pick the lot, plan and options. A custom home is designed for you, '
                 'usually on your own lot, and takes the longest.'),
                ('Research the builder, not just the house',
                 'Visit homes the builder finished a few years ago, read reviews and ask owners how warranty requests '
                 'were handled. Check that the builder is licensed with the Minnesota Department of Labor and Industry.'),
            ]),
            ('Price and options', [
                ('The base price is a starting point',
                 'Lot premiums, upgraded finishes, appliances, window coverings, landscaping and finished basements can '
                 'add a lot. Ask for the full options price list and what the model home includes; models usually show '
                 'many upgrades.'),
                ('Spend on what\'s hard to change later',
                 'Structural choices (extra windows, a larger garage, a finished lower level rough-in, ceiling height, '
                 'electrical and plumbing) are far harder to add later than paint, lighting or countertops.'),
                ('Look for incentives, and read the conditions',
                 'Builders often offer incentives: help with closing costs, a lower rate through their preferred lender, '
                 'or free upgrades. Compare the total cost with an outside lender too; an incentive may be worth more or '
                 'less than it looks.'),
                ('Ask about association fees and assessments',
                 'New developments often have an HOA, and new streets and utilities may come with special assessments. '
                 'Ask what is paid, what is pending and who pays it.'),
                ('Expect property taxes to rise after the first year',
                 'Minnesota property is valued as of January 2 each year. If your home was a lot or partly built on that '
                 'date, your first tax bill may be low. Budget for the tax on the finished home.'),
            ]),
            ('The contract and the build', [
                ('Read the builder\'s contract carefully',
                 'Builder contracts are written by the builder. Check the deposit and when it becomes non-refundable, '
                 'the completion date and what happens if it slips, how price changes are handled and what you can '
                 'inspect. Your agent or an attorney can review it with you.'),
                ('Get your own inspections, even on a new home',
                 'Inspectors can check a new home before the drywall goes up (so they can see framing, wiring and '
                 'plumbing) and again before closing. Ask the builder in writing to allow both.'),
                ('Keep your financing steady during the build',
                 'If the build takes months, your loan approval may need updating. Don\'t take on new debt or change jobs '
                 'without talking to your lender, and ask how long your rate lock lasts.'),
                ('Walk through with a punch list',
                 'Before closing, walk the home with the builder and list everything that needs fixing or finishing: '
                 'paint touch-ups, trim, doors that stick. Get the list in writing with dates.'),
            ]),
            ('After you move in', [
                ('Know Minnesota\'s new home warranty',
                 'Minnesota law gives new home buyers statutory warranties: one year for faulty workmanship and '
                 'materials, two years for faulty plumbing, electrical, heating and cooling systems, and ten years for '
                 'major construction defects. There are notice requirements, so read the law or ask an attorney.'),
                ('Report problems in writing, right away',
                 'Keep a list of issues and send them to the builder in writing within the warranty periods. Many '
                 'builders schedule a check-in around the one-year mark; don\'t wait for it if something is wrong.'),
                ('Apply for homestead',
                 'Apply for homestead classification with your county assessor once you move in. It can lower your '
                 'property taxes; apply by December 15 for it to count the next year.'),
            ]),
        ],
        'figures': {
            3: ('newcon-1.jpg', 'Visit homes a builder finished a few years ago, not just the model.'),
            10: ('newcon-2.jpg', 'An inspection before drywall shows what will be hidden later.'),
        },
        'close_h': 'Looking at new construction?',
        'sources': [
            'Tip 3: Minnesota Department of Labor and Industry, residential building contractor license lookup, dli.mn.gov',
            'Tip 8: Minnesota Department of Revenue, property tax assessment date (January 2), revenue.state.mn.us',
            'Tip 13: Minnesota Statutes 327A.01 to 327A.08 (statutory new home warranties), revisor.mn.gov',
            'Tip 15: Minnesota Department of Revenue, "Homestead Credit," revenue.state.mn.us',
        ],
    },
    {
        'slug': 'buying-a-lake-home-or-cabin',
        'photo_credit': 'Photos: Josh Hild (cover), Maksym Tymchyk and Jessica Anderson on Unsplash.',
        'title': 'Buying a Lake Home or Cabin in Minnesota',
        'sub': 'Shoreline, septic, wells, water quality and winter roads: what to check before you buy on the water.',
        'eyebrow': 'Free guide for lake home and cabin buyers',
        'intro': [
            'Buying on a lake is different from buying in town. The shoreline, the water, the septic system and the road '
            'in all matter as much as the house, and each comes with its own rules.',
            f'This guide covers what our agents check on every lake property. See {a("/lake-homes", "Twin Cities lake homes")}, '
            f'{a("/lake-homes/brainerd", "Brainerd lakes")} and {a("/cabins-for-sale-mn", "cabins for sale")}. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Choosing the lake', [
                ('Decide how you will use the lake',
                 'Swimming, fishing, boating, quiet paddling or skiing each favor different lakes. Lake size, depth, '
                 'bottom type and boat traffic matter more than the cabin\'s finishes.'),
                ('Look up the lake before you look at houses',
                 'The Minnesota DNR\'s LakeFinder has depth maps, fish surveys, water clarity and public accesses for '
                 'thousands of lakes. Check for aquatic invasive species notes as well.'),
                ('Visit the shoreline, not just the house',
                 'Walk down to the water. Is the bottom sandy or weedy? Is the shoreline steep? How much sun does it '
                 'get? A great house on a weedy, north-facing bay may not be what you pictured.'),
                ('Ask about water levels and flooding',
                 'Lakes rise and fall. Look at the FEMA flood map for the property and ask the seller about past high '
                 'water. Your lender will require flood insurance if the home is in a high-risk flood zone.'),
            ]),
            ('Rules for the shoreline', [
                ('Shoreland rules limit what you can build',
                 'Minnesota requires counties and cities to regulate building near lakes and rivers: setbacks from the '
                 'water, limits on hard surfaces and rules on cutting trees and changing the shoreline. If you plan to '
                 'add on, build a garage or add a beach, check the local rules before you buy.'),
                ('Docks, lifts and shoreline work',
                 'Many docks and lifts don\'t need a permit if they meet DNR standards, but work below the lake\'s '
                 'ordinary high water level, such as dredging or adding sand, often does. Ask the county and DNR before '
                 'you plan changes.'),
                ('Short-term rental rules vary',
                 'If you plan to rent the cabin when you aren\'t using it, check the county, city or township rules '
                 'first. Some require licenses or limit rentals.'),
            ]),
            ('Septic, well and systems', [
                ('Plan for a septic inspection',
                 'Most lake homes have a private septic system. Minnesota sellers must disclose what they know about it, '
                 'and many counties require a compliance inspection when a property sells. A failing system can be '
                 'expensive, so know its status before you commit.'),
                ('Test the well water',
                 'Private wells aren\'t tested by anyone unless you do it. Test for bacteria and nitrate at a minimum; '
                 'the Minnesota Department of Health also recommends testing for arsenic, and others depending on the area.'),
                ('Ask whether it\'s a year-round home',
                 'Some cabins are three-season. Check insulation, heat source, whether pipes are protected from freezing '
                 'and whether the water system is drained in winter.'),
                ('Check the road in winter',
                 'Is the road public and plowed, or private and maintained by an association? Who pays for plowing? Can '
                 'emergency vehicles reach the home year-round?'),
            ]),
            ('Financing and owning', [
                ('Second-home loans have their own rules',
                 'A cabin you use yourself can often be financed as a second home, which usually needs a larger down '
                 'payment than a primary home. If you plan to rent it out, it may be treated as an investment property '
                 'with different terms. Tell your lender your plans up front.'),
                ('Insurance costs more on the water',
                 'Get insurance quotes early: distance from a fire department, wood heat and flood risk can all affect '
                 'the price and availability of coverage.'),
                ('Budget for the extras',
                 'Docks and lifts going in and out each season, boat storage, lake association dues, propane, and '
                 'shoreline maintenance add up. Ask the seller what they paid last year.'),
                ('Think about the property taxes',
                 'A cabin is usually taxed as a seasonal recreational property, not a homestead, and lakeshore is often '
                 'valued highly. Look up the current taxes and ask the county about any recent value changes.'),
            ]),
        ],
        'figures': {
            3: ('lake-1.jpg', 'Walk down to the water: the shoreline matters as much as the house.'),
            11: ('lake-2.jpg', 'Check who plows the road, and whether the cabin is built for winter.'),
        },
        'close_h': 'Dreaming of the lake?',
        'sources': [
            'Tip 2: Minnesota Department of Natural Resources, LakeFinder, dnr.state.mn.us',
            'Tip 4: FEMA Flood Map Service Center, msc.fema.gov',
            'Tips 5 and 6: Minnesota DNR, shoreland management and public waters work permits, dnr.state.mn.us',
            'Tip 8: Minnesota Statutes 115.55 (septic disclosure); Minnesota Pollution Control Agency, septic systems, pca.state.mn.us',
            'Tip 9: Minnesota Department of Health, "Well Water Testing," health.state.mn.us',
            'Tip 15: Minnesota Department of Revenue, property classification (seasonal residential recreational), revenue.state.mn.us',
        ],
    },
    {
        'slug': 'townhome-and-condo-buyers-guide',
        'photo_credit': 'Photos: Samuel Regan-Asante (cover), Bruce Barrow and Vitali Holstinin on Unsplash.',
        'title': 'Townhome & Condo Buyer\'s Guide',
        'sub': 'Association fees, documents, insurance and financing: how to buy a townhome or condo with your eyes open.',
        'eyebrow': 'Free guide for townhome and condo buyers',
        'intro': [
            'Townhomes and condos trade a yard and some maintenance for a monthly association fee and a set of shared '
            'rules. Done right, that\'s a great deal. The difference between a good purchase and a costly one is usually '
            'in the association\'s documents.',
            f'This guide shows what to look for. See {a("/townhomes-for-sale-mn", "townhomes")}, '
            f'{a("/condos-for-sale-mn", "condos")} and {a("/condo-buildings", "condo buildings")} for sale. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Townhome or condo?', [
                ('Know what you actually own',
                 'With most townhomes you own the unit and often the land under it; with a condo you own the space '
                 'inside your walls plus a share of the common areas. It affects what you maintain, what you insure and '
                 'sometimes how you finance.'),
                ('Find out what the association maintains',
                 'Roofs, siding, windows, decks, snow removal, lawn care and utilities may or may not be covered. Two '
                 'homes with the same fee can cover very different things. Get the list in writing.'),
                ('Read the rules before you fall in love',
                 'Rules can limit rentals, pets, parking, grills, exterior changes and even what you can store in the '
                 'garage. If a rule matters to you, find it in the documents.'),
            ]),
            ('The documents to read', [
                ('Ask for the resale disclosure certificate',
                 'Under the Minnesota Common Interest Ownership Act, sellers in most associations must provide a resale '
                 'disclosure certificate with key facts: fees, any unpaid assessments, pending special assessments, '
                 'insurance and lawsuits. Read it before you\'re past your chance to back out.'),
                ('Look at the budget and the reserves',
                 'The reserve fund pays for big future repairs like roofs and parking lots. If reserves are thin, '
                 'owners may face special assessments or sharp fee increases. Ask whether a reserve study has been done.'),
                ('Check the meeting minutes',
                 'Board minutes from the last year often mention coming projects, disputes and problems before they show '
                 'up in the budget.'),
                ('Ask about lawsuits and insurance claims',
                 'Litigation or large claims can affect fees, insurance and whether lenders will finance units in the '
                 'association.'),
            ]),
            ('Money matters', [
                ('Count the fee in your monthly payment',
                 'Lenders include association dues when they figure what you can afford, and so should you. A lower '
                 'price with a high fee can cost more each month than a higher price with a low one.'),
                ('Budget for special assessments',
                 'Even well-run associations sometimes need a one-time payment from owners for a big project. Ask '
                 'whether any are planned, and look at how often they have happened before.'),
                ('Get the right insurance',
                 'Condo owners typically need an HO-6 policy to cover the inside of the unit, belongings and liability, '
                 'alongside the association\'s master policy. Townhome coverage depends on what the association insures. '
                 'Ask your agent and insurer to compare the master policy with yours.'),
            ]),
            ('Financing and buying', [
                ('Check that the project qualifies for your loan',
                 'For FHA financing, a condo project generally needs FHA approval (or a single-unit approval). '
                 'Conventional lenders review the project too, looking at things like owner occupancy, reserves and '
                 'litigation. Ask your lender early.'),
                ('Look at the age and condition of the whole building',
                 'In a condo, the building\'s roof, elevator, parking garage and windows matter as much as your unit. '
                 'Ask when they were last replaced and whether reserves cover the next ones.'),
                ('Still get a home inspection',
                 'An inspector can check your unit\'s systems and visible common elements. You won\'t control '
                 'repairs to common areas, but you will help pay for them, so it\'s worth knowing their condition.'),
                ('Think about resale',
                 'Rental limits, financing approval and fee levels affect how easily you can sell later. A well-run '
                 'association with healthy reserves helps your home hold its value.'),
            ]),
        ],
        'figures': {
            2: ('th-1.jpg', 'Two townhomes with the same fee can cover very different things.'),
            12: ('th-2.jpg', 'In a condo, the whole building\'s condition matters.'),
        },
        'close_h': 'Shopping for a townhome or condo?',
        'sources': [
            'Tip 4: Minnesota Statutes chapter 515B (Minnesota Common Interest Ownership Act), section 515B.4-107 (resale disclosure certificate), revisor.mn.gov',
            'Tip 8: Fannie Mae Selling Guide and FHA guidance on including association dues in housing expenses',
            'Tip 10: Insurance Information Institute, condo insurance (HO-6), iii.org',
            'Tip 11: U.S. Department of Housing and Urban Development, FHA condominium project approval, hud.gov',
        ],
    },
    {
        'slug': 'selling-and-buying-at-the-same-time',
        'photo_credit': 'Photos: Chloë Forbes-Kindlen (cover), Prydumano Design and Andrew Bright on Unsplash.',
        'title': 'Selling and Buying at the Same Time',
        'sub': 'How to time two closings, pay for the next home and move only once.',
        'eyebrow': 'Free guide for move-up and move-down buyers',
        'intro': [
            'Most homeowners need the money from their current home to buy the next one. That makes timing the hardest '
            'part: you don\'t want to own two homes, and you don\'t want to have nowhere to live.',
            f'There is no single right order. This guide lays out the options so you can choose what fits your money, '
            f'your market and your nerves. Start with an {a("/home-estimate", "instant home value estimate")}. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Know your numbers first', [
                ('Find out what your home will net',
                 f'Your equity is your down payment for the next home. Start with a realistic price from recent sales, '
                 f'then subtract the mortgage and costs to sell. Our {a("/calculators/seller-net-proceeds", "seller net proceeds calculator")} '
                 f'does the math.'),
                ('Get pre-approved for both scenarios',
                 'Ask your lender what you can buy if your current home has sold, and whether you could buy before it '
                 'sells (carrying both payments for a while). The answer decides which options below are open to you.'),
                ('Learn how busy your markets are',
                 'If homes in your price range sell quickly where you live, selling first carries less risk. If the '
                 'homes you want to buy go fast, a contingent offer may not win. Your agent can show you both.'),
            ]),
            ('The options', [
                ('Sell first, then buy',
                 'You know exactly what you have to spend and you make a strong, non-contingent offer. The risk is '
                 'needing a place to live in between. A rent-back or a longer closing can close that gap.'),
                ('Buy first, then sell',
                 'You move once, on your schedule, and stage the old home empty. You need to qualify for both payments '
                 'or have another way to fund the down payment.'),
                ('Make an offer contingent on your sale',
                 'A home-sale contingency lets you back out if your home doesn\'t sell by a set date. Sellers accept '
                 'them more readily in slower markets, often with a clause that lets them keep showing their home and '
                 'ask you to remove the contingency if another offer comes in.'),
                ('Line up both closings on the same day',
                 'Many Minnesota buyers close on the sale in the morning and the purchase in the afternoon, using the '
                 'money from one for the other. It takes coordination between both title companies and lenders, and a '
                 'little luck with schedules.'),
            ]),
            ('Ways to bridge the gap', [
                ('Ask to rent back after closing',
                 'A rent-back lets you stay in the home you sold for a few days or weeks after closing. Put it in '
                 'writing in the purchase agreement: dates, any rent or deposit, utilities and the condition you\'ll '
                 'leave it in.'),
                ('Consider a bridge loan',
                 'A bridge loan borrows against your current home\'s equity to fund the next down payment, and is paid '
                 'off when the home sells. It\'s short-term and usually costs more than a regular mortgage, so compare '
                 'the total cost.'),
                ('Open a home equity line before you list',
                 'Some owners open a home equity line of credit on their current home to use for the next down payment. '
                 'Most lenders won\'t open one on a home that\'s already listed for sale, so it has to happen first.'),
                ('Look at "buy before you sell" programs',
                 'Some companies will help you buy first by advancing your equity or making a backup offer on your home. '
                 'Read the fees and terms closely and compare them with a bridge loan.'),
                ('Plan short-term housing as a backup',
                 'A furnished rental, family or a storage-and-stay plan can turn a gap of a few weeks into an '
                 'inconvenience instead of a crisis.'),
            ]),
            ('Making it smooth', [
                ('Get your home ready to list before you shop',
                 'Declutter, make repairs and get photos done before you start touring. When you find the right home, '
                 'you can list within days.'),
                ('Use one team for both sides',
                 'When the same team handles your sale and your purchase, the timelines, contingencies and closing dates '
                 'are planned together instead of by two people who never talk.'),
                ('Know how taxes work on the sale',
                 'If you owned and lived in the home for at least two of the last five years, the IRS lets many owners '
                 'exclude up to $250,000 of gain ($500,000 for most married couples filing jointly). Ask a tax adviser '
                 'how it applies to you.'),
            ]),
        ],
        'figures': {
            3: ('move-1.jpg', 'Know what your home will net before you shop.'),
            12: ('move-2.jpg', 'A rent-back or short-term housing can bridge a gap of a few weeks.'),
        },
        'close_h': 'Planning your next move?',
        'sources': [
            'Tip 15: Internal Revenue Service, Publication 523, "Selling Your Home," irs.gov',
        ],
    },
]
