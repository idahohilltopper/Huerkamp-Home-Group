"""Builds the Minneapolis and Saint Paul neighborhood data:
  src/data/neighborhoods.json       names, cities, market-report names, neighbors and Census estimates
  src/data/geo/neighborhoods.geojson simplified outlines for the maps

Inputs (one download folder, argument 1):
  mpls.geojson   Minneapolis neighborhoods, City of Minneapolis (opendata.minneapolismn.gov):
                 https://services.arcgis.com/afSMGVsC7QlRK1kZ/arcgis/rest/services/Minneapolis_Neighborhoods/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson
  stp.geojson    Saint Paul planning districts, City of Saint Paul (information.stpaul.gov):
                 https://services1.arcgis.com/9meaaHE3uiba0zr8/arcgis/rest/services/District_Councils/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson
  bg/            TIGER/Line 2024 block groups for Minnesota (tl_2024_27_bg)
  acs/<table>.txt ACS 2020-2024 5-year block-group rows for Hennepin (27053) and Ramsey (27123) counties, from
                 https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-<table>.dat
                 (header line plus lines starting 1500000US27053 or 1500000US27123)
Usage: python3 scripts/build-neighborhoods.py <download-folder>

Census method: each block group is counted in the neighborhood that holds most of its area. Counts are added
up; medians (home value, household income) are estimated from the added-up ranges by linear interpolation,
the usual way to combine areas. Block-group estimates have wide margins of error, so pages round them.
"""
import json
import re
import sys
from pathlib import Path

import shapefile
from pyproj import Transformer
from shapely.geometry import mapping, shape
from shapely.ops import transform, unary_union
from shapely.validation import make_valid

SRC = Path(sys.argv[1])
ROOT = Path(__file__).resolve().parent.parent
ACRE = 4046.8564224
utm = Transformer.from_crs('EPSG:4326', 'EPSG:26915', always_xy=True).transform
utm83 = Transformer.from_crs('EPSG:4269', 'EPSG:26915', always_xy=True).transform

# Minneapolis neighborhoods by the community (planning area) the market reports group them in.
MPLS_COMMUNITY = {
    'Calhoun-Isles': ['Bryn Mawr', 'Cedar - Isles - Dean', 'East Bde Maka Ska', 'East Isles', 'Kenwood', 'Lowry Hill', 'Lowry Hill East', 'South Uptown', 'West Maka Ska'],
    'Camden': ['Cleveland', 'Folwell', 'Lind - Bohanon', 'McKinley', 'Shingle Creek', 'Victory', 'Webber - Camden'],
    'Central': ['Downtown East – Mpls', 'Downtown West – Mpls', 'Elliot Park', 'Loring Park', 'North Loop', 'Stevens Square - Loring Heights'],
    'Longfellow': ['Cooper', 'Hiawatha', 'Howe', 'Longfellow', 'Seward'],
    'Near North': ['Harrison', 'Hawthorne', 'Jordan Neighborhood', 'Near North', 'Sumner - Glenwood', 'Willard-Hay'],
    'Nokomis': ['Diamond Lake', 'Ericsson', 'Field', 'Hale', 'Keewaydin', 'Minnehaha', 'Morris Park', 'Northrop', 'Page', 'Regina', 'Wenonah'],
    'Northeast': ['Audubon Park', 'Beltrami', 'Bottineau', 'Columbia Park', 'Holland', 'Logan Park', 'Marshall Terrace', 'Northeast Park', 'Sheridan', 'St Anthony East', 'St Anthony West', 'Waite Park', 'Windom Park'],
    'Phillips': ['East Phillips', 'Midtown Phillips', 'Phillips West', 'Ventura Village'],
    'Powderhorn': ['Bancroft', 'Bryant', 'Central', 'Corcoran Neighborhood', 'Lyndale', 'Powderhorn Park', 'Standish', 'Whittier'],
    'Southwest': ['Armatage', 'East Harriet', 'Fulton', 'Kenny', 'King Field', 'Linden Hills', 'Lynnhurst', 'Tangletown', 'Windom'],
    'University': ['Cedar - Riverside', 'Marcy Holmes', 'Nicollet Island - East Bank', 'Prospect Park - East River Road', 'Southeast Como', 'University of Minnesota'],
}
# City map name -> market report name, where they differ.
MPLS_ALIAS = {'Bryn - Mawr': 'Bryn Mawr', 'Cedar Riverside': 'Cedar - Riverside', 'Como': 'Southeast Como', 'Corcoran': 'Corcoran Neighborhood',
              'Downtown East': 'Downtown East – Mpls', 'Downtown West': 'Downtown West – Mpls', 'Jordan': 'Jordan Neighborhood',
              'Near - North': 'Near North', 'St. Anthony East': 'St Anthony East', 'St. Anthony West': 'St Anthony West',
              "Steven's Square - Loring Heights": 'Stevens Square - Loring Heights', 'Willard - Hay': 'Willard-Hay'}
# Names people use for the page (the report names carry suffixes like "– Mpls").
MPLS_DISPLAY = {'Downtown East – Mpls': 'Downtown East', 'Downtown West – Mpls': 'Downtown West', 'Jordan Neighborhood': 'Jordan',
                'Corcoran Neighborhood': 'Corcoran', 'St Anthony East': 'St. Anthony East', 'St Anthony West': 'St. Anthony West',
                'Southeast Como': 'Southeast Como', 'Cedar - Riverside': 'Cedar-Riverside', 'Stevens Square - Loring Heights': 'Stevens Square-Loring Heights'}
NOT_RESIDENTIAL = {'Camden Industrial', 'Humboldt Industrial Area', 'Mid - City Industrial'}
# Saint Paul planning district number -> (page name, market report name)
STP = {
    1: ('Battle Creek–Highwood', 'Saint Paul – Battle Creek - Highwood'), 2: ('Greater East Side', 'Saint Paul – Greater East Side'),
    3: ('West Side', 'Saint Paul – West Side'), 4: ("Dayton's Bluff", 'Saint Paul – Daytons Bluff'), 5: ('Payne-Phalen', 'Saint Paul – Payne - Phalen'),
    6: ('North End', 'Saint Paul – North End'), 7: ('Frogtown', 'Saint Paul – Thomas - Dale (Frogtown)'),
    8: ('Summit-University', 'Saint Paul – Summit - University'), 9: ('West Seventh', 'Saint Paul – West Seventh'),
    10: ('Como Park', 'Saint Paul – Como Park'), 11: ('Hamline-Midway', 'Saint Paul – Hamline - Midway'),
    12: ('St. Anthony Park', 'Saint Paul – St Anthony Park'), 13: ('Union Park', 'Saint Paul – Merriam Park / Lexington - Hamline'),
    14: ('Macalester-Groveland', 'Saint Paul – Macalester - Groveland'), 15: ('Highland Park', 'Saint Paul – Highland Park'),
    16: ('Summit Hill', 'Saint Paul – Summit Hill'), 17: ('Downtown', 'Saint Paul – Downtown'),
}


def slugify(s):
    s = s.lower().replace("'", '').replace('st. ', 'st-').replace('–', '-')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


# ---------- ACS ----------
def read_table(name):
    rows = {}
    with open(SRC / 'acs' / f'{name}.txt') as f:
        header = f.readline().strip().split('|')
        for line in f:
            vals = line.strip().split('|')
            rows[vals[0][9:]] = dict(zip(header, vals))  # key: 12-digit block group GEOID
    return rows


TABLES = {t: read_table(t) for t in ['b01003', 'b01001', 'b11001', 'b25003', 'b25024', 'b25034', 'b25075', 'b19001', 'b15003', 'b08301', 'b08303']}


def val(t, geoid, col):
    v = TABLES[t].get(geoid, {}).get(f'{t.upper()}_E{col:03d}')
    try:
        return max(float(v), 0)
    except (TypeError, ValueError):
        return 0


VALUE_BINS = [0, 10e3, 15e3, 20e3, 25e3, 30e3, 35e3, 40e3, 50e3, 60e3, 70e3, 80e3, 90e3, 100e3, 125e3, 150e3, 175e3, 200e3,
              250e3, 300e3, 400e3, 500e3, 750e3, 1e6, 1.5e6, 2e6, None]  # B25075 _E002.._E027
INCOME_BINS = [0, 10e3, 15e3, 20e3, 25e3, 30e3, 35e3, 40e3, 45e3, 50e3, 60e3, 75e3, 100e3, 125e3, 150e3, 200e3, None]  # B19001 _E002.._E017


def median(counts, bins):
    """Median from range counts by linear interpolation; (value, is_top_coded)."""
    total = sum(counts)
    if total < 30:
        return None, False
    half, run = total / 2, 0
    for i, n in enumerate(counts):
        if run + n >= half and n > 0:
            lo, hi = bins[i], bins[i + 1]
            if hi is None:
                return lo, True
            return round(lo + (half - run) / n * (hi - lo), -3), False
        run += n
    return None, False


def stats(bgs):
    s = lambda t, cols: sum(val(t, g, c) for g in bgs for c in cols)
    pop = s('b01003', [1])
    tenure_total = s('b25003', [1])
    units = s('b25024', [1])
    built = s('b25034', [1])
    edu = s('b15003', [1])
    work = s('b08301', [1])
    travel = s('b08303', [1])
    pct = lambda a, b: round(100 * a / b) if b else None
    value_counts = [s('b25075', [c]) for c in range(2, 28)]
    income_counts = [s('b19001', [c]) for c in range(2, 18)]
    mv, mv_top = median(value_counts, VALUE_BINS)
    mi, mi_top = median(income_counts, INCOME_BINS)
    under18 = s('b01001', [3, 4, 5, 6, 27, 28, 29, 30])
    a18_34 = s('b01001', [7, 8, 9, 10, 11, 12, 31, 32, 33, 34, 35, 36])
    a35_64 = s('b01001', [13, 14, 15, 16, 17, 18, 19, 37, 38, 39, 40, 41, 42, 43])
    a65 = s('b01001', list(range(20, 26)) + list(range(44, 50)))
    return {
        'population': round(pop, -1), 'households': round(s('b11001', [1]), -1),
        'ownerPct': pct(s('b25003', [2]), tenure_total), 'renterPct': pct(s('b25003', [3]), tenure_total),
        'medianHomeValue': mv, 'medianHomeValueTop': mv_top, 'medianIncome': mi, 'medianIncomeTop': mi_top,
        'ages': {'under18': pct(under18, pop), '18to34': pct(a18_34, pop), '35to64': pct(a35_64, pop), '65plus': pct(a65, pop)},
        'housing': {'singleFamily': pct(s('b25024', [2]), units), 'townhomeDuplex': pct(s('b25024', [3, 4, 5]), units),
                    'smallApartment': pct(s('b25024', [6, 7, 8]), units), 'largeApartment': pct(s('b25024', [9]), units)},
        'builtBefore1940Pct': pct(s('b25034', [11]), built), 'built2000onPct': pct(s('b25034', [2, 3, 4]), built),
        'bachelorsPct': pct(s('b15003', [22, 23, 24, 25]), edu),
        'commute': {'droveAlone': pct(s('b08301', [3]), work), 'transit': pct(s('b08301', [10]), work), 'bike': pct(s('b08301', [18]), work),
                    'walk': pct(s('b08301', [19]), work), 'fromHome': pct(s('b08301', [21]), work)},
        'commuteUnder20Pct': pct(s('b08303', [2, 3, 4, 5]), travel),
    }


# ---------- Shapes ----------
def load(path):
    return json.loads((SRC / path).read_text())['features']


hoods = []
for f in load('mpls.geojson'):
    raw = f['properties']['BDNAME'].strip()
    if raw in NOT_RESIDENTIAL:
        continue
    report = MPLS_ALIAS.get(raw, raw)
    community = next(k for k, v in MPLS_COMMUNITY.items() if report in v)
    name = MPLS_DISPLAY.get(report, report.replace(' - ', '-'))
    hoods.append({'city': 'minneapolis', 'name': name, 'report': report, 'community': community, 'geom': make_valid(shape(f['geometry']))})
for f in load('stp.geojson'):
    n = int(f['properties']['districtnumber'])
    name, report = STP[n]
    hoods.append({'city': 'saint-paul', 'name': name, 'report': report, 'district': n,
                  'councilName': f['properties'].get('councilname'), 'geom': make_valid(shape(f['geometry']))})
for h in hoods:
    h['slug'] = slugify(h['name'])
    h['utm'] = transform(utm, h['geom'])
assert len({(h['city'], h['slug']) for h in hoods}) == len(hoods), 'duplicate slugs'

# Block groups -> neighborhood with the largest share of their area.
r = shapefile.Reader(str(SRC / 'bg' / 'tl_2024_27_bg'))
fields = [x[0] for x in r.fields[1:]]
assigned = {id(h): [] for h in hoods}
for sr in r.iterShapeRecords():
    rec = dict(zip(fields, sr.record))
    if rec['COUNTYFP'] not in ('053', '123'):
        continue
    g = transform(utm83, make_valid(shape(sr.shape.__geo_interface__)))
    best, share = None, 0
    for h in hoods:
        if not h['utm'].intersects(g):
            continue
        a = h['utm'].intersection(g).area / g.area
        if a > share:
            best, share = h, a
    if best and share >= 0.5:
        assigned[id(best)].append(rec['GEOID'])

out, features = [], []
for h in hoods:
    bgs = assigned[id(h)]
    neighbors = sorted({(o['city'], o['slug']) for o in hoods if o is not h and h['utm'].buffer(5).intersects(o['utm'])})
    c = h['geom'].representative_point()
    minx, miny, maxx, maxy = h['geom'].bounds
    out.append({
        'city': h['city'], 'slug': h['slug'], 'name': h['name'], 'report': h['report'],
        **({'community': h['community']} if 'community' in h else {'district': h['district'], 'councilName': h['councilName']}),
        'acres': round(h['utm'].area / ACRE), 'center': [round(c.x, 5), round(c.y, 5)], 'bbox': [round(v, 5) for v in (minx, miny, maxx, maxy)],
        'neighbors': [f'{a}/{b}' for a, b in neighbors], 'blockGroups': len(bgs),
        'census': stats(bgs) if bgs else None,
    })
    features.append({'type': 'Feature', 'properties': {'slug': f"{h['city']}/{h['slug']}"},
                     'geometry': mapping(h['geom'].simplify(0.00008, preserve_topology=True))})

out.sort(key=lambda x: (x['city'], x['name']))
(ROOT / 'src/data/neighborhoods.json').write_text(json.dumps({
    'sources': {
        'boundaries': 'City of Minneapolis neighborhoods (opendata.minneapolismn.gov); City of Saint Paul planning districts (information.stpaul.gov)',
        'census': 'US Census Bureau, American Community Survey 2020-2024 5-year estimates for the block groups mostly inside each neighborhood (tables B01001, B01003, B08301, B08303, B11001, B15003, B19001, B25003, B25024, B25034, B25075); medians estimated from ranges',
    },
    'neighborhoods': out,
}, ensure_ascii=False, indent=1) + '\n')
(ROOT / 'src/data/geo/neighborhoods.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, separators=(',', ':')))
none = [f"{x['city']}/{x['slug']}" for x in out if not x['census']]
print(f'{len(out)} neighborhoods ({sum(x["city"] == "minneapolis" for x in out)} Minneapolis, {sum(x["city"] == "saint-paul" for x in out)} Saint Paul); '
      f'{sum(x["blockGroups"] for x in out)} block groups assigned; no block group: {none}')
