"""Batch 3 of the free guides (Nov 26, 2026). Same rules as guides_content.py. The time-of-sale guide is built from
the site's own city rules (src/data/sale-rules.ts, each checked on the city's website), exported to sale-rules.json by
make-html.py's caller: node --experimental-strip-types scripts/guides/export-sale-rules.mjs
"""
import json
from pathlib import Path

from guides_content import a

HERE = Path(__file__).resolve().parent
RULES = json.loads((HERE / 'sale-rules.json').read_text())
CHECKED = RULES[0].get('checked', '') if RULES else ''


def city(slug):
    special = {'st-louis-park': 'St. Louis Park', 'saint-paul': 'Saint Paul', 'south-st-paul': 'South St. Paul',
               'west-st-paul': 'West St. Paul', 'st-anthony': 'St. Anthony'}
    return special.get(slug, ' '.join(w.capitalize() for w in slug.split('-')))


def rule_tip(r):
    details = ' '.join(r['details'])
    contact = f' Contact: {r["contact"]}.' if r.get('contact') else ''
    return (f'{city(r["slug"])}: {r["program"]}', f'{r["summary"]} {details}{contact}')


housing = [rule_tip(r) for r in RULES if r['kind'] == 'housing']
sewer = [rule_tip(r) for r in RULES if r['kind'] == 'sewer']
repealed = [rule_tip(r) for r in RULES if r['kind'] == 'repealed']
n_housing, n_sewer = len(housing), len(sewer)

GUIDES3 = [
    {
        'slug': 'home-staging-on-a-budget',
        'photo_credit': 'Photos: Minh Pham (cover), Quilia and Christopher Jolly on Unsplash.',
        'title': 'Home Staging on a Budget',
        'sub': 'Room-by-room ways to make your home look its best in photos and showings, without a big bill.',
        'eyebrow': 'Free guide for Twin Cities home sellers',
        'intro': [
            'Buyers decide which homes to see from the photos, and decide how they feel about a home in the first few '
            'minutes inside. Staging is simply helping them picture living there. Most of it costs more effort than money.',
            f'This guide goes room by room, starting with the spaces buyers care about most. When you are ready, our '
            f'{a("/sell", "selling page")} explains how we market homes. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Start everywhere', [
                ('Declutter first, decorate later',
                 'Clear counters, tabletops, closets and floors before you buy a single pillow. Pack about half of what is '
                 'on shelves and in closets. Empty space reads as "plenty of room"; full space reads as "not enough".'),
                ('Depersonalize, gently',
                 'Put away most family photos, collections, kids\' art and anything with names on it. Buyers should '
                 'picture their life here, not yours. Keep a few neutral pieces so the home still feels warm.'),
                ('Clean like the inspector is coming',
                 'Windows, baseboards, light fixtures, grout and appliances. A deep clean, inside and out, is the '
                 'cheapest improvement there is, and buyers notice when it hasn\'t been done.'),
                ('Let in the light',
                 'Open every blind and curtain, replace burned-out bulbs, and use the same warm-white bulbs throughout. '
                 'Add a lamp to any dark corner. Bright rooms photograph larger.'),
                ('Paint where it counts',
                 'Cover bold or dated colors, scuffed walls and smoke or water stains with a soft neutral. Paint is '
                 'usually the best-returning thing you can spend on before listing.'),
            ]),
            ('Room by room', [
                ('Living room: float the furniture',
                 'Pull furniture away from the walls into a conversation group, remove extra pieces and open a clear '
                 'path through the room. Fewer, well-placed pieces make a room feel bigger.'),
                ('Kitchen: clear the counters',
                 'Leave out no more than two or three items. Clean the stovetop and oven, empty the sink, and organize '
                 'the inside of cabinets and the pantry; buyers open them.'),
                ('Primary bedroom: hotel-simple',
                 'Crisp bedding, matching nightstands and lamps, nothing under the bed and half-empty closets. The goal '
                 'is calm and spacious.'),
                ('Bathrooms: spa basics',
                 'New white towels, a fresh shower curtain, clean grout and caulk, and nothing on the counters but soap. '
                 'Replace a worn toilet seat or dated faucet if the budget allows.'),
                ('Give every room one clear job',
                 'A spare room with boxes and a treadmill is "storage". Stage it as an office, guest room or nursery so '
                 'buyers count it.'),
                ('Lower level: show the space',
                 'Clear storage into one corner or a storage unit, light the space well and stage a sitting area. In '
                 'Minnesota a finished lower level is valuable living space; show it that way.'),
            ]),
            ('Outside and the first impression', [
                ('Curb appeal sets the price in buyers\' heads',
                 'Mow, edge, trim shrubs, pull weeds and add a few potted plants by the door. Power-wash the walk and '
                 'driveway. A tidy outside tells buyers the inside was cared for too.'),
                ('Freshen the front door',
                 'Clean or paint the door, polish or replace the hardware and house numbers, add a new mat and make '
                 'sure the light works. It\'s where every showing starts.'),
                ('Plan for winter showings',
                 'Keep the drive and walks clear and salted, add a boot tray and mat inside the door, keep the home '
                 'warm and every light on. Have summer photos of the yard and gardens ready for the listing.'),
            ]),
            ('Photos and showings', [
                ('Stage for the camera',
                 'Photographers shoot wide, so everything shows. Hide trash cans, cords, pet bowls, fridge magnets and '
                 'toiletries before photo day. Turn on all the lights and open the blinds.'),
                ('Keep a showing-ready routine',
                 'A 15-minute checklist (beds made, counters clear, trash out, lights on) makes it easy to say yes to '
                 'every showing. A bin for last-minute items helps.'),
                ('Mind the senses',
                 'Air out the home, clean pet areas and skip strong air fresheners and cooking smells before showings. '
                 'Set the temperature for comfort.'),
                ('Know when to call a professional',
                 'A stager can be worth it for vacant homes, unusual layouts or higher price points. Ask your agent '
                 'what is typical in your price range before you spend.'),
            ]),
        ],
        'figures': {
            4: ('stage-1.jpg', 'Bright, uncluttered rooms photograph larger.'),
            8: ('stage-2.jpg', 'Simple, hotel-style bedrooms feel calm and spacious.'),
        },
        'close_h': 'Getting ready to sell?',
        'sources': ['General staging advice from Huerkamp Home Group; no statistics are used in this guide.'],
    },
    {
        'slug': 'pricing-your-home-right',
        'photo_credit': 'Photos: charlesdeluvio (cover), Collov Home Design and GoodLifeConstruction on Unsplash.',
        'title': 'Pricing Your Home Right',
        'sub': 'How Twin Cities homes are really priced, why the first two weeks matter, and what to do if offers don\'t come.',
        'eyebrow': 'Free guide for Twin Cities home sellers',
        'intro': [
            'Price is the most important decision you make as a seller. Priced right, a home draws showings and offers '
            'while it is new. Priced too high, it often sits, and ends up selling for less than it would have.',
            f'This guide explains how agents and appraisers arrive at a price and how to read the market once you\'re '
            f'listed. For a starting point, try our {a("/home-estimate", "instant home value estimate")}. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('How value is set', [
                ('Buyers and appraisers look at sold homes',
                 'Value comes from what buyers recently paid for similar homes nearby: same style, size, age, condition '
                 'and location. It doesn\'t come from what you paid, what you put into it or what a neighbor is asking.'),
                ('The best comparisons are recent and close',
                 'Sales from the last three to six months within your neighborhood or subdivision tell the most. Older '
                 'or farther sales need adjusting for how the market has moved.'),
                ('Active and pending listings show the competition',
                 'Homes for sale now are what buyers will compare yours to this week. Pending sales hint at where the '
                 'market is going before those prices are public.'),
                ('Online estimates are a starting point',
                 'Automated estimates can\'t see condition, updates, layout or views, so they can be far off in either '
                 'direction for a single home. Use them as a rough range, not a price.'),
            ]),
            ('Choosing the number', [
                ('Price for the first two weeks',
                 'A new listing gets the most attention in its first days. Buyers who have been waiting see it at once. '
                 'If the price is right, that\'s when the strongest offers come.'),
                ('Mind the search brackets',
                 'Buyers search in round ranges: up to $400,000, up to $500,000. A home priced just above a bracket '
                 'misses everyone searching below it. Your agent can show where your buyers are searching.'),
                ('Account for condition honestly',
                 'If comparable homes were updated and yours wasn\'t, the price has to reflect it, or the repairs need '
                 'to happen first. Buyers and appraisers will make the adjustment either way.'),
                ('Think about the appraisal',
                 'Most buyers finance, and the lender\'s appraisal has to support the price. A price far above the '
                 'recent sales may win an offer and then fall apart at appraisal.'),
            ]),
            ('After you list', [
                ('Read the activity in the first two weeks',
                 'Lots of showings but no offers usually points to price compared with the competition, or condition. '
                 'Few showings usually points to price or the photos. Your agent should report feedback each week.'),
                ('Adjust early rather than often',
                 'One meaningful price change, made early, usually does more than several small cuts spread over '
                 'months, which can make buyers wait for the next one.'),
                ('Watch the market around you',
                 'New listings, price changes and sales near you change your home\'s position week to week. Ask for an '
                 'update on what sold and what came on.'),
                ('Consider terms as well as price',
                 'Help with a buyer\'s closing costs, a flexible closing date or including some items can attract '
                 'buyers without a price change. Compare what each option nets you.'),
            ]),
            ('When offers arrive', [
                ('Compare offers by what you net',
                 f'Look at price, financing, contingencies, closing date and any requests for help with closing costs. '
                 f'Run each through our {a("/calculators/seller-net-proceeds", "seller net proceeds calculator")}.'),
                ('Multiple offers: set a clear deadline',
                 'If several buyers are interested, your agent can ask for best offers by a set time, which gives every '
                 'buyer the same chance and you a clean comparison.'),
                ('A low offer is still a conversation',
                 'Counter with your reasoning and the recent sales behind your price. Many good sales start with an '
                 'offer that felt low.'),
            ]),
        ],
        'figures': {
            4: ('price-1.jpg', 'Online estimates are a starting point, not a price.'),
            11: ('price-2.jpg', 'Check what sold and what came on near you each week.'),
        },
        'close_h': 'Want to know what your home is worth?',
        'sources': ['General pricing practice from Huerkamp Home Group; no statistics are used in this guide.'],
    },
    {
        'slug': 'minnesota-time-of-sale-inspections',
        'photo_credit': 'Cover photo: Sasun Bughdaryan on Unsplash.',
        'title': 'Minnesota Time-of-Sale Inspections, City by City',
        'sub': 'Which Twin Cities cities require a housing or sewer inspection before you sell, and what each one involves.',
        'eyebrow': 'Free guide for Twin Cities home sellers',
        'intro': [
            'Some Minnesota cities require a housing evaluation, a sewer inspection or both before a home can be listed '
            'or sold. Others require nothing. Knowing your city\'s rule early keeps a surprise from delaying your sale.',
            f'This guide lists the cities where we confirmed a requirement on the city\'s own website, plus two that '
            f'repealed theirs. If your city isn\'t listed, confirm with the city: programs change. The same list is at '
            f'{a("/selling-in-minnesota", "what’s required to sell in Minnesota")}. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Housing evaluations', housing),
            ('Sewer inspections', sewer),
            ('Programs that were repealed', repealed),
            ('Statewide rules for every seller', [
                ('Seller\'s disclosure',
                 'Minnesota sellers must disclose material facts they know about that could significantly affect the '
                 'buyer\'s use or enjoyment of the property, using a written disclosure or an inspection report, or both '
                 'sides can agree in writing to waive it.'),
                ('Wells, septic systems and radon',
                 'Separate Minnesota disclosures cover private wells, septic systems and radon. Many counties also '
                 'require a septic compliance inspection before a sale.'),
                ('Lead-based paint in homes built before 1978',
                 'Federal law requires a lead-based paint disclosure and pamphlet, and gives buyers a chance to test.'),
            ]),
        ],
        'close_h': 'Selling in one of these cities?',
        'sources': [f'Cities: each city\'s official website, as linked at huerkamphomes.com/selling-in-minnesota (checked by Huerkamp Home Group in October 2026).']
                   + [f'{city(r["slug"])}: {r["url"]}' for r in RULES]
                   + ['Statewide: Minnesota Statutes 513.52 to 513.60, 103I.235, 115.55 and 144.496 (revisor.mn.gov); 42 U.S.C. 4852d and EPA lead disclosure rule (epa.gov)'],
    },
    {
        'slug': 'selling-an-inherited-or-probate-home',
        'photo_credit': 'Photos: Wesley Tingey (cover), Franco Debartolo and Francesca Tosolini on Unsplash.',
        'title': 'Selling an Inherited or Probate Home in Minnesota',
        'sub': 'Who can sign, what probate involves, and how to prepare and sell a family home with less stress.',
        'eyebrow': 'Free guide for families and personal representatives',
        'intro': [
            'Selling a home after a loved one dies is a legal process and an emotional one, often at the same time. '
            'The first question is usually the hardest: who has the authority to sell?',
            f'This guide explains the common paths in Minnesota in plain English. It isn\'t legal advice: an estate '
            f'attorney can tell you exactly what applies. See also {a("/downsizing/selling-a-house-in-probate-minnesota", "selling a house in probate in Minnesota")}. '
            f'Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Who can sell the home', [
                ('Find out how the home was titled',
                 'The deed decides the path. A home held in joint tenancy usually passes to the surviving owner. A home '
                 'with a recorded transfer on death deed passes to the named beneficiary. A home in a trust is handled '
                 'by the trustee. A home in the person\'s name alone usually goes through probate.'),
                ('Transfer on death deeds',
                 'Minnesota allows a transfer on death deed, which passes the home to the named beneficiary without '
                 'probate. The beneficiary usually records documents with the county to take title before selling.'),
                ('Homes held in a trust',
                 'If the home was in a living trust, the successor trustee can usually sell it under the trust\'s terms, '
                 'without probate. The title company will ask to see the trust documents.'),
                ('Probate and the personal representative',
                 'When probate is needed, the court appoints a personal representative (an executor). Their court '
                 'papers, called letters, give them authority to sell. Minnesota allows informal probate through the '
                 'court\'s registrar in many cases, which is usually faster than formal probate.'),
            ]),
            ('The probate timeline', [
                ('Creditors get a window to file claims',
                 'After notice to creditors is published, Minnesota generally gives creditors four months to present '
                 'claims. Ask your attorney how this affects when the home can be sold and when money can be paid out.'),
                ('Talk to the other heirs early',
                 'Agree on whether to sell, roughly when and at what price range, and who will handle the house in the '
                 'meantime. Disagreements are the most common cause of delay.'),
                ('Keep the home insured and secured',
                 'Tell the insurance company the home is vacant; many policies change or limit coverage for vacant '
                 'homes. Keep the heat on in winter, check on the home regularly and keep up with utilities and taxes.'),
            ]),
            ('Preparing the home', [
                ('Sort belongings before you list',
                 'Give family time to choose keepsakes, then consider an estate sale company, donation and a junk '
                 'removal service. Keep important papers aside for the estate.'),
                ('Decide how much to fix',
                 'An estate can sell a home as-is, make a few repairs or update it before listing. Your agent can compare '
                 'what each would likely net after costs and time.'),
                ('Disclosures for an estate sale',
                 'Minnesota\'s seller disclosure covers what the seller knows. A personal representative who never lived '
                 'in the home may know little; say so honestly, and consider a pre-listing inspection so buyers have '
                 'facts. City time-of-sale rules still apply.'),
                ('Check the city\'s time-of-sale rules',
                 f'Some cities require an evaluation or sewer inspection before any sale, including estate sales. See '
                 f'{a("/selling-in-minnesota", "what your city requires")}.'),
            ]),
            ('Selling and taxes', [
                ('Know the stepped-up basis',
                 'Inherited property generally takes a tax basis equal to its fair market value on the date of death, '
                 'which can reduce or eliminate gain if the home is sold soon after. A date-of-death appraisal helps '
                 'document it. Ask a tax adviser.'),
                ('Property taxes may change',
                 'If the home was the owner\'s homestead, that classification can end, which can change the tax. Ask the '
                 'county assessor how it applies.'),
                ('Consider a cash sale if time matters',
                 f'If the home needs a lot of work or the heirs live far away, a cash buyer can close quickly with fewer '
                 f'steps, usually at a lower price. Compare both: {a("/selling/cash-offer-vs-listing", "cash offer or list?")}'),
            ]),
        ],
        'figures': {
            4: ('probate-1.jpg', 'Gather the deed, the will or trust and the court papers before you list.'),
            8: ('probate-2.jpg', 'Give family time to choose keepsakes before an estate sale.'),
        },
        'close_h': 'Need help with a family home?',
        'sources': [
            'Tip 2: Minnesota Statutes 507.071 (transfer on death deeds), revisor.mn.gov',
            'Tip 4: Minnesota Statutes 524.3-301 and following (informal probate), revisor.mn.gov; Minnesota Judicial Branch, "Probate," mncourts.gov',
            'Tip 5: Minnesota Statutes 524.3-801 (notice to creditors), revisor.mn.gov',
            'Tip 10: Minnesota Statutes 513.52 to 513.60, revisor.mn.gov',
            'Tip 12: Internal Revenue Service, Publication 551, "Basis of Assets," irs.gov',
        ],
    },
    {
        'slug': 'home-inspection-guide',
        'photo_credit': 'Photos: Mika Baumeister (cover), GN Group and Toolmash Expo on Unsplash.',
        'title': 'The Home Inspection Guide for Minnesota Buyers',
        'sub': 'How to choose an inspector, what to test for in Minnesota, and how to turn a report into a fair request.',
        'eyebrow': 'Free guide for Twin Cities home buyers',
        'intro': [
            'The home inspection is your best chance to learn what you are really buying. It also sets up the most '
            'important negotiation after the price.',
            'This guide covers choosing an inspector, the add-on tests that matter in Minnesota, and how to respond to '
            'what the report finds. Questions? Call or text us at (612) 502-7653.',
        ],
        'parts': [
            ('Before the inspection', [
                ('Choose your inspector carefully',
                 'Minnesota doesn\'t license home inspectors, so ask about experience, professional association '
                 'membership, insurance and a sample report. A clear report with photos is worth more than a cheap one.'),
                ('Know your inspection deadline',
                 'Your purchase agreement sets how many days you have to inspect and respond. Book the inspector as soon '
                 'as your offer is accepted so you have time for add-on tests and quotes.'),
                ('Read the seller\'s disclosures first',
                 'Go through the seller\'s disclosure, the well, septic and radon disclosures and any city time-of-sale '
                 'report before the inspection, and give your inspector the list of things to look at closely.'),
            ]),
            ('What to test in Minnesota', [
                ('Radon',
                 'The Minnesota Department of Health estimates about 2 in 5 Minnesota homes have radon levels that pose '
                 'a significant health risk. A test during your inspection period is the only way to know.'),
                ('Sewer line camera inspection',
                 'In older neighborhoods, roots and aging pipes are common in the line from the house to the street, '
                 'which is usually the owner\'s to repair. A camera scope shows its condition.'),
                ('Well water and septic',
                 'For homes on a private well, test for bacteria and nitrate at a minimum, and ask about arsenic. For a '
                 'septic system, check whether the county requires a compliance inspection and ask for pumping records.'),
                ('Stucco moisture testing',
                 'Some stucco homes can hide water damage behind the surface. If the home has stucco, ask an inspector '
                 'who specializes in it whether moisture testing is recommended.'),
                ('Lead paint in older homes',
                 'For homes built before 1978, federal law gives buyers the chance to test for lead-based paint hazards. '
                 'It matters most for homes with young children or planned renovations.'),
            ]),
            ('During the inspection', [
                ('Be there and ask questions',
                 'Walk the home with the inspector. Ask what is a safety issue, what is a repair to plan for soon and '
                 'what is normal wear. Learn where the water shut-off, gas shut-off and electrical panel are.'),
                ('Look hard at the big systems',
                 'Roof, foundation, drainage, furnace, air conditioning, water heater, electrical panel and windows are '
                 'the expensive items. Ask the inspector to estimate each one\'s age.'),
                ('Check for winter wear',
                 'Ask about attic insulation and ventilation, signs of past ice dams, gutters and downspouts, and how '
                 'water drains away from the foundation in spring.'),
            ]),
            ('After the report', [
                ('Sort the findings',
                 'Group the report into safety issues, major defects, items to repair soon and routine maintenance. Most '
                 'reports are long; only the first two usually belong in a request to the seller.'),
                ('Get quotes for big items',
                 'If the roof, furnace or foundation needs work, get a contractor\'s quote before you negotiate. A real '
                 'number makes your request specific and fair.'),
                ('Ask for repairs, a credit or a price change',
                 'Sellers may repair, give a credit at closing or lower the price. A credit or price change lets you '
                 'choose your own contractor; repairs by the seller should be done by licensed contractors with receipts.'),
                ('Know when to walk away',
                 'If you find a serious problem the seller won\'t address, your inspection contingency may let you '
                 'cancel by the deadline. Follow the purchase agreement\'s notice rules exactly.'),
            ]),
        ],
        'figures': {
            9: ('insp-1.jpg', 'Ask the inspector about the age of each major system.'),
            10: ('insp-2.jpg', 'The furnace, water heater and electrical panel are worth a close look.'),
        },
        'close_h': 'Buying a home soon?',
        'sources': [
            'Tip 1: Minnesota Department of Commerce and Department of Labor and Industry (Minnesota does not license home inspectors)',
            'Tip 3: Minnesota Statutes 513.52 to 513.60, 103I.235, 115.55 and 144.496, revisor.mn.gov',
            'Tip 4: Minnesota Department of Health, "Radon in Homes," health.state.mn.us',
            'Tip 6: Minnesota Department of Health, "Well Water Testing"; Minnesota Pollution Control Agency, septic systems',
            'Tip 8: 42 U.S.C. 4852d and EPA, "Real Estate Disclosures about Potential Lead Hazards," epa.gov',
        ],
    },
]
