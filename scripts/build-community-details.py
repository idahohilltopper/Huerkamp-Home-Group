"""Builds src/data/community-details.json: the per-community facts behind each community page.

Run after build-communities.py. Inputs live in one download folder (argument 1):
  acs/<table>.txt        ACS 2020-2024 5-year tables, Minnesota rows only, from
                         https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/
                         (keep the header plus lines starting 0100000US|, 0400000US27|, 0500000US27, 1600000US27, 860Z200US5)
  geo/place/             TIGER 2024 places (see build-communities.py)
  geo/water/wCCC/        TIGER 2024 area water for counties 003 019 037 053 123 131 139 163
  geo2/unsd/             TIGER 2024 unified school districts (tl_2024_27_unsd)
  geo2/zcta_place.txt    2020 ZCTA-to-place relationship file, Minnesota rows
  geo2/osrm.json         drive times from scripts/fetch-drive-times.py

Usage: python3 scripts/build-community-details.py <download-folder>
"""
import glob
import json
import sys
from collections import defaultdict
from pathlib import Path

import shapefile
from pyproj import Transformer
from shapely.geometry import shape
from shapely.ops import transform
from shapely.validation import make_valid

SRC = Path(sys.argv[1])
ACRE = 4046.8564224
utm = Transformer.from_crs('EPSG:4269', 'EPSG:26915', always_xy=True).transform  # NAD83 / UTM 15N, metres

communities = json.load(open('src/data/communities.json'))['communities']
by_geoid = {c['geoid']: c for c in communities}


# ---------- ACS ----------
def read_table(name):
    rows = {}
    with open(SRC / 'acs' / f'{name}.txt') as f:
        header = f.readline().strip().split('|')
        for line in f:
            vals = line.strip().split('|')
            rows[vals[0]] = dict(zip(header, vals))
    return rows


tables = {t: read_table(t) for t in ['b01002', 'b01003', 'b08013', 'b08301', 'b08303', 'b11001', 'b15003', 'b19013',
                                     'b19301', 'b23025', 'b25003', 'b25024', 'b25035', 'b25064', 'b25077', 'c24050']}

INDUSTRIES = {
    '002': 'Agriculture, forestry and mining', '003': 'Construction', '004': 'Manufacturing', '005': 'Wholesale trade',
    '006': 'Retail trade', '007': 'Transportation, warehousing and utilities', '008': 'Information',
    '009': 'Finance, insurance and real estate', '010': 'Professional, scientific and management services',
    '011': 'Education, health care and social assistance', '012': 'Arts, entertainment, recreation, lodging and food',
    '013': 'Other services', '014': 'Public administration',
}


def num(t, geo, col):
    v = tables[t].get(geo, {}).get(f'{t.upper()}_E{col}')
    try:
        x = float(v)
        return None if x < 0 else x  # the ACS uses negative codes for suppressed values
    except (TypeError, ValueError):
        return None


def pct(a, b):
    return None if a is None or not b else round(100 * a / b, 1)


def acs_profile(geo):
    def e(t, col): return num(t, geo, col)
    commuters = e('b08303', '001')
    workers = e('b08301', '001')
    industry_total = e('c24050', '001')
    industries = sorted(
        ({'name': n, 'pct': pct(e('c24050', k), industry_total)} for k, n in INDUSTRIES.items()),
        key=lambda x: -(x['pct'] or 0))
    return {
        'population': e('b01003', '001'),
        'medianAge': e('b01002', '001'),
        'households': e('b11001', '001'),
        'medianHouseholdIncome': e('b19013', '001'),
        'perCapitaIncome': e('b19301', '001'),
        'ownerOccupiedPct': pct(e('b25003', '002'), e('b25003', '001')),
        'medianHomeValue': e('b25077', '001'),
        'medianGrossRent': e('b25064', '001'),
        'medianYearBuilt': e('b25035', '001'),
        'singleFamilyPct': pct((e('b25024', '002') or 0) + (e('b25024', '003') or 0), e('b25024', '001')),
        'bachelorsOrHigherPct': pct(sum(e('b15003', c) or 0 for c in ['022', '023', '024', '025']), e('b15003', '001')),
        'meanCommuteMinutes': round(e('b08013', '001') / commuters, 1) if commuters and e('b08013', '001') else None,
        'droveAlonePct': pct(e('b08301', '003'), workers),
        'publicTransitPct': pct(e('b08301', '010'), workers),
        'workFromHomePct': pct(e('b08301', '021'), workers),
        'unemploymentPct': pct(e('b23025', '005'), e('b23025', '003')),
        'industries': industries,
    }


# ---------- geometry helpers ----------
def load(path, keep=None):
    r = shapefile.Reader(str(path))
    out = []
    for sr in r.iterShapeRecords():
        rec = sr.record.as_dict()
        if keep and not keep(rec):
            continue
        g = make_valid(shape(sr.shape.__geo_interface__))
        out.append((rec, transform(utm, g)))
    return out


places = {rec['GEOID']: g for rec, g in load(SRC / 'geo/place/tl_2024_27_place.shp', lambda r: r['GEOID'] in by_geoid)}
districts = load(next((SRC / 'geo2/unsd').glob('*.shp')))
water = []
for shp in glob.glob(str(SRC / 'geo/water/w*/*.shp')):
    water += load(shp, lambda r: r['FULLNAME'] and r['MTFCC'] in ('H2030', 'H2040'))

# Merge water pieces that share a name (e.g. a lake split by a county line) before measuring.
lakes_by_name = defaultdict(list)
for rec, g in water:
    lakes_by_name[rec['FULLNAME']].append(g)


# Official names where the Census map is out of date or abbreviated.
RENAMES = {'Lake Calhoun': 'Bde Maka Ska', 'Lake of Isles': 'Lake of the Isles'}


def pretty(name):
    name = name.removeprefix('Shore ')
    for a, b in [('Lk ', 'Lake '), (' Lk', ' Lake'), ('Regl ', 'Regional '), (' Regl', ' Regional'), (' Pk', ' Park'),
                 ('Natl ', 'National '), (' Co ', ' County '), ('Cntry', 'Country'), ('Cmtry', 'Cemetery')]:
        name = name.replace(a, b)
    return RENAMES.get(name, name)


# ---------- ZIP codes ----------
zips = defaultdict(list)
with open(SRC / 'geo2/zcta_place.txt', encoding='utf-8-sig') as f:
    header = f.readline().strip().split('|')
    for line in f:
        r = dict(zip(header, line.strip().split('|')))
        g = r['GEOID_PLACE_20']
        if g in by_geoid and r['GEOID_ZCTA5_20']:
            part, place_land = int(r['AREALAND_PART'] or 0), int(r['AREALAND_PLACE_20'] or 0)
            share = part / place_land if place_land else 0
            if share >= 0.05:
                zips[g].append((r['GEOID_ZCTA5_20'], round(100 * share)))

# ---------- drive times ----------
osrm = json.load(open(SRC / 'geo2/osrm.json'))

details = {}
for c in communities:
    city = places[c['geoid']]
    district_rows = []
    for rec, g in districts:
        if g.intersects(city):
            share = g.intersection(city).area / city.area
            if share >= 0.03:
                district_rows.append({'name': rec['NAME'], 'pctOfCity': round(100 * share)})
    district_rows.sort(key=lambda d: -d['pctOfCity'])

    lake_rows = []
    for name, geoms in lakes_by_name.items():
        inside = sum(g.intersection(city).area for g in geoms if g.intersects(city))
        if inside / ACRE >= 10:
            lake_rows.append({'name': pretty(name), 'acresInCity': round(inside / ACRE)})
    lake_rows.sort(key=lambda d: -d['acresInCity'])

    zip_rows = []
    for z, share in sorted(zips[c['geoid']], key=lambda x: -x[1]):
        geo = f'860Z200US{z}'
        zip_rows.append({'zip': z, 'pctOfCityLand': share,
                         'medianHomeValue': num('b25077', geo, '001'),
                         'medianHouseholdIncome': num('b19013', geo, '001'),
                         'ownerOccupiedPct': pct(num('b25003', geo, '002'), num('b25003', geo, '001'))})

    details[c['slug']] = {
        'acs': acs_profile(f"1600000US{c['geoid']}"),
        'schoolDistricts': district_rows,
        'lakes': lake_rows[:8],
        'zips': zip_rows,
        'driveMinutes': osrm['toDestinations'][c['slug']],
        'driveMinutesToCommunities': osrm['toCommunities'][c['slug']],
    }

# County, state and nation profiles for comparisons. Each city's first county holds most of its people.
import csv
county_fips = {r['NAME'].removesuffix(' County'): r['COUNTY'] for r in csv.DictReader(open(SRC / 'geo/sub.csv', encoding='latin-1'))
               if r['STATE'] == '27' and r['SUMLEV'] == '050'}
for c in communities:
    details[c['slug']]['primaryCounty'] = {'name': c['counties'][0], 'fips': county_fips[c['counties'][0]]}
used = {d['primaryCounty']['fips'] for d in details.values()}
baselines = {
    'minnesota': acs_profile('0400000US27'),
    'unitedStates': acs_profile('0100000US'),
    'counties': {f: {'name': n, **acs_profile(f'0500000US27{f}')} for n, f in county_fips.items() if f in used},
}

json.dump({
    'sources': {
        'acs': 'US Census Bureau, American Community Survey 2020-2024 5-year estimates (tables B01002, B01003, B08013, B08301, B08303, B11001, B15003, B19013, B19301, B23025, B25003, B25024, B25035, B25064, B25077, C24050)',
        'schoolDistricts': 'US Census Bureau TIGER/Line 2024 unified school districts; districts covering at least 3% of the city',
        'zips': 'US Census Bureau 2020 ZCTA-to-place relationship file; ZIP areas covering at least 5% of the city',
        'lakes': 'US Census Bureau TIGER/Line 2024 area water; named lakes and reservoirs with at least 10 acres inside the city',
        'driveTimes': 'OSRM routing on OpenStreetMap data (router.project-osrm.org), light-traffic estimates from the Census center point of each city',
    },
    'driveDestinations': {
        'downtownMinneapolis': 'Downtown Minneapolis', 'downtownSaintPaul': 'Downtown Saint Paul',
        'mspAirport': 'MSP Airport', 'mallOfAmerica': 'Mall of America',
    },
    'baselines': baselines,
    'communities': details,
}, open('src/data/community-details.json', 'w'), indent=1)
print(f'{len(details)} communities written')
