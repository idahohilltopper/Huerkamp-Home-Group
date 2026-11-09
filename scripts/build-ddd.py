"""Twin Cities restaurants featured on Food Network's "Diners, Drive-Ins and Dives" -> src/data/ddd.json.

Sources (checked Nov 9, 2026):
  - which restaurants, their addresses and when their episode first aired: Flavortown USA's episode guide
    (https://www.flavortownusa.com/states/minnesota);
  - still open or closed: Overture Maps places (operating status at the address) and local news for every closure
    or move (listed in NOTES below). Re-check every few months with the quarterly places refresh.
Each spot gets the community (and Minneapolis/Saint Paul neighborhood) it sits in, from our boundary files.
Usage: python3 scripts/build-ddd.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# name, street, lat, lng, first aired, status, note (status: open | closed | unconfirmed)
SPOTS = [
    ("Al's Breakfast", "413 14th Ave SE, Minneapolis", 44.98101, -93.23554, "December 2008", "open", ""),
    ("Andale Taqueria y Mercado", "7700 Nicollet Ave S, Richfield", 44.86336, -93.27868, "November 2015", "open", ""),
    ("Broders' Cucina Italiana", "2308 W 50th St, Minneapolis", 44.91247, -93.30913, "April 2012", "open", ""),
    ("Broders' Pasta Bar", "5000 Penn Ave S, Minneapolis", 44.91209, -93.30917, "April 2012", "open", ""),
    ("Bryant-Lake Bowl", "810 W Lake St, Minneapolis", 44.94845, -93.29011, "February 2009", "open", ""),
    ("Buster's on 28th", "4204 S 28th Ave, Minneapolis", 44.92662, -93.23234, "September 2015", "open", ""),
    ("Colossal Cafe", "1340 Grand Ave, Saint Paul", 44.93991, -93.15704, "June 2010", "open", ""),
    ("Donatelli's", "2692 County Road E E, White Bear Lake", 45.04982, -92.98698, "January 2009", "open", ""),
    ("Emily's Lebanese Deli", "641 University Ave NE, Minneapolis", 44.99563, -93.26147, "January 2009", "open", ""),
    ("George and the Dragon", "813 W 50th St, Minneapolis", 44.91225, -93.29034, "November 2015", "open", ""),
    ("Gandhi Mahal", "3025 E Franklin Ave, Minneapolis", 44.96249, -93.22715, "August 2016", "open", "Moved here after its 27th Avenue building burned in 2020."),
    ("Hai Hai", "2121 University Ave NE, Minneapolis", 45.00988, -93.26285, "November 2024", "open", ""),
    ("Holy Land", "2513 Central Ave NE, Minneapolis", 45.01366, -93.24718, "August 2016", "open", ""),
    ("Kramarczuk's Sausage Co.", "215 E Hennepin Ave, Minneapolis", 44.98781, -93.25719, "June 2010", "open", ""),
    ("Northbound Smokehouse & Brewpub", "2716 E 38th St, Minneapolis", 44.93426, -93.23243, "November 2015", "open", ""),
    ("OG Zaza Pizza Trailer", "861 E Hennepin Ave, Minneapolis", 44.99159, -93.24414, "February 2025", "open", ""),
    ("Oro by Nixta", "1222 NE 2nd St, Minneapolis", 45.00064, -93.26627, "November 2024", "open", ""),
    ("Pizzeria Lola", "5557 Xerxes Ave S, Minneapolis", 44.90181, -93.31872, "April 2012", "open", ""),
    ("Q Fanatic BBQ & Grill", "180 Miller Rd, Champlin", 45.18804, -93.3953, "December 2010", "open", ""),
    ("Red Wagon Pizza Co.", "5416 Penn Ave S, Minneapolis", 44.90451, -93.30882, "July 2018", "open", ""),
    ("Smack Shack", "603 N Washington Ave, Minneapolis", 44.98681, -93.27641, "March 2012", "open", "Featured at its first home on Marshall Street NE; now in the North Loop."),
    ("Surly Brewing Co.", "520 Malcolm Ave SE, Minneapolis", 44.97293, -93.20982, "August 2016", "open", ""),
    ("The Blue Door Pub", "1811 Selby Ave, Saint Paul", 44.94664, -93.17675, "June 2010", "open", ""),
    ("The Nook", "492 Hamline Ave S, Saint Paul", 44.92657, -93.15674, "February 2013", "open", ""),
    ("Union Hmong Kitchen North Loop", "520 N 4th St, Minneapolis", 44.98493, -93.27708, "November 2024", "open", ""),
    ("Victor's 1959 Cafe", "3756 Grand Ave S, Minneapolis", 44.93421, -93.2846, "January 2009", "open", ""),
    ("The Wienery", "414 Cedar Ave S, Minneapolis", 44.9696, -93.24744, "January 2009", "open", ""),
    ("Bayport BBQ", "328 5th Ave N, Bayport", 45.02168, -92.7816, "September 2015", "unconfirmed", "We couldn't confirm it is still open; call before you go."),
    ("Dari-Ette Drive-In", "1440 Minnehaha Ave E, Saint Paul", 44.96288, -93.03982, "December 2008", "closed", "Closed in October 2021 after about 70 years (Star Tribune)."),
    ("Guacaya Bistreaux", "337 N Washington Ave, Minneapolis", 44.98512, -93.27382, "November 2024", "closed", ""),
    ("Marla's Caribbean Cuisine", "3761 Bloomington Ave, Minneapolis", 44.93424, -93.25227, "April 2012", "closed", "Closed in 2019."),
    ("Modern Cafe", "337 13th Ave NE, Minneapolis", 45.00101, -93.26273, "January 2009", "closed", ""),
    ("Nye's Polonaise Room", "112 E Hennepin Ave, Minneapolis", 44.98732, -93.25805, "February 2012", "closed", "The original closed; a smaller Nye's Bar later opened on the site."),
    ("Prairie Dogs", "610 W Lake St, Minneapolis", 44.94859, -93.28727, "May 2016", "closed", ""),
    ("Psycho Suzi's Motor Lounge", "1900 Marshall St NE, Minneapolis", 45.00752, -93.27225, "December 2008", "closed", "Closed in August 2023."),
    ("Smalley's Caribbean Barbeque", "423 Main St S, Stillwater", 45.05387, -92.80444, "December 2011", "closed", ""),
    ("Stepchld", "24 University Ave NE, Minneapolis", 44.98871, -93.25739, "October 2024", "closed", "Closed in August 2025."),
    ("The Herbivorous Butcher", "507 1st Ave NE, Minneapolis", 44.99025, -93.25367, "May 2016", "closed", "Closed after a kitchen fire in May 2025."),
    ("Town Talk Diner", "2701 1/2 E Lake St, Minneapolis", 44.94833, -93.23316, "January 2009", "closed", "The building burned in 2020."),
    ("Unideli", "2015 E 24th St, Minneapolis", 44.95914, -93.24308, "November 2015", "closed", "Closed in 2020."),
]

def inside(pt, ring):
    x, y = pt; c = False
    for i in range(len(ring)):
        x1, y1 = ring[i]; x2, y2 = ring[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c

def where(path, pt):
    for f in json.loads((ROOT / path).read_text())['features']:
        g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        if any(inside(pt, p[0]) and not any(inside(pt, h) for h in p[1:]) for p in polys): return f['properties']['slug']
    return None

out = []
for name, street, lat, lng, aired, status, note in SPOTS:
    pt = (lng, lat)
    out.append({'name': name, 'street': street, 'lat': lat, 'lng': lng, 'aired': aired, 'status': status, 'note': note,
                'community': where('src/data/geo/communities.geojson', pt), 'hood': where('src/data/geo/neighborhoods.geojson', pt)})
(ROOT / 'src/data/ddd.json').write_text(json.dumps({'checked': '2026-11-09', 'spots': out}, indent=1) + '\n')
for o in out: print(o['status'], o['name'], '->', o['community'], o['hood'])
