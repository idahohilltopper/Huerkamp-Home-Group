"""Builds src/data/communities.json and src/data/geo/communities.geojson.

Inputs (download into one folder, passed as the only argument):
  - tl_2024_27_place.zip, unzipped into place/
      https://www2.census.gov/geo/tiger/TIGER2024/PLACE/tl_2024_27_place.zip
  - sub-est2024.csv saved as sub.csv
      https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/cities/totals/sub-est2024.csv

Usage: python3 scripts/build-communities.py <download-folder>
"""
import csv
import json
import math
import re
import subprocess
import sys
from pathlib import Path

SRC = Path(sys.argv[1])

# Census names of the 30 communities, and the region each is grouped under.
REGIONS = {
    'Minneapolis': 'Minneapolis & Saint Paul', 'St. Paul': 'Minneapolis & Saint Paul',
    'Apple Valley': 'South Metro', 'Burnsville': 'South Metro', 'Eagan': 'South Metro',
    'Farmington': 'South Metro', 'Inver Grove Heights': 'South Metro', 'Lakeville': 'South Metro',
    'Mendota Heights': 'South Metro', 'Northfield': 'South Metro', 'Rosemount': 'South Metro',
    'South St. Paul': 'South Metro', 'West St. Paul': 'South Metro', 'Shakopee': 'South Metro',
    'Prior Lake': 'South Metro', 'Savage': 'South Metro',
    'Bloomington': 'West Metro', 'Plymouth': 'West Metro', 'Eden Prairie': 'West Metro',
    'Edina': 'West Metro', 'Minnetonka': 'West Metro', 'St. Louis Park': 'West Metro',
    'Brooklyn Park': 'North Metro', 'Maple Grove': 'North Metro', 'Blaine': 'North Metro',
    'Coon Rapids': 'North Metro', 'Roseville': 'North Metro',
    'Woodbury': 'East Metro', 'Cottage Grove': 'East Metro', 'Maplewood': 'East Metro',
}
DISPLAY = {'St. Paul': 'Saint Paul'}
DOWNTOWN_MPLS = (44.9778, -93.2650)
DOWNTOWN_STP = (44.9537, -93.0900)


def miles(a, b):
    la1, lo1, la2, lo2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 3958.8 * math.asin(math.sqrt(h))


def slugify(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower().replace('st.', 'st')).strip('-')


rows = [r for r in csv.DictReader(open(SRC / 'sub.csv', encoding='latin-1')) if r['STATE'] == '27']
places = {r['NAME'].removesuffix(' city'): r for r in rows if r['SUMLEV'] == '162'}
county_names = {r['COUNTY']: r['NAME'].removesuffix(' County') for r in rows if r['SUMLEV'] == '050'}

attrs_path = SRC / 'attrs.json'
subprocess.run(['npx', 'mapshaper', str(SRC / 'place/tl_2024_27_place.shp'), '-o', 'format=json', str(attrs_path)],
               check=True, capture_output=True)
attrs = {a['NAME']: a for a in json.load(open(attrs_path))}

communities = []
for census_name, region in REGIONS.items():
    p, a = places[census_name], attrs[census_name]
    parts = sorted((r for r in rows if r['SUMLEV'] == '157' and r['PLACE'] == p['PLACE']),
                   key=lambda r: -int(r['POPESTIMATE2024']))
    lat, lon = float(a['INTPTLAT']), float(a['INTPTLON'])
    name = DISPLAY.get(census_name, census_name)
    pop24, pop20 = int(p['POPESTIMATE2024']), int(p['ESTIMATESBASE2020'])
    communities.append({
        'slug': slugify(name), 'name': name, 'censusName': census_name, 'region': region,
        'counties': [county_names[r['COUNTY']] for r in parts],
        'population2024': pop24, 'population2020': pop20,
        'growthPct': round((pop24 - pop20) / pop20 * 100, 1),
        'landSqMi': round(int(a['ALAND']) / 2589988.11, 1),
        'waterSqMi': round(int(a['AWATER']) / 2589988.11, 1),
        'center': [round(lon, 5), round(lat, 5)],
        'milesToMinneapolis': round(miles((lat, lon), DOWNTOWN_MPLS)),
        'milesToSaintPaul': round(miles((lat, lon), DOWNTOWN_STP)),
        'geoid': a['GEOID'],
    })

communities.sort(key=lambda c: -c['population2024'])
json.dump({
    'sources': {
        'boundaries': 'US Census Bureau TIGER/Line 2024 places (public domain)',
        'population': 'US Census Bureau Vintage 2024 city population estimates (sub-est2024); 2020 is the estimates base',
        'distances': "Straight-line miles from the city's Census center point to downtown Minneapolis / Saint Paul",
    },
    'communities': communities,
}, open('src/data/communities.json', 'w'), indent=2)

slugs = {c['geoid']: c['slug'] for c in communities}
(SRC / 'slugs.json').write_text(json.dumps(slugs))
geoids = ','.join(f"'{g}'" for g in slugs)
Path('src/data/geo').mkdir(parents=True, exist_ok=True)
subprocess.run(['npx', 'mapshaper', str(SRC / 'place/tl_2024_27_place.shp'),
                '-filter', f'[{geoids}].indexOf(GEOID) > -1',
                '-simplify', '8%', 'keep-shapes',
                '-each', f"slug=({json.dumps(slugs)})[GEOID]",
                '-filter-fields', 'slug',
                '-o', 'precision=0.00001', 'format=geojson', 'src/data/geo/communities.geojson'],
               check=True)
print(f'{len(communities)} communities written')
