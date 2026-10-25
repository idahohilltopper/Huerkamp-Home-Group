"""Build every lake of 10 acres or more that touches one of our community guides:
  src/data/lake-list.json        name, DNR acreage and shoreline miles, counties, shoreline communities, center and map box
  src/data/geo/lake-list.geojson simplified outlines for the lake map

The lakes are the Minnesota DNR's (DNR Hydrography): its outline, official acreage, shoreline miles and lake number.
A lake split into bays by the DNR (Lake Minnetonka) is one lake, the way the DNR counts it.
Names come from the Census water map where one matches ("Lake Minnetonka" for the DNR's "Minnetonka"), else the DNR
name plus "Lake" ("Lower Prior Lake").

Inputs:
  argument 1: the DNR lakes, from scripts/fetch-dnr-lakes.py
  argument 2: a folder with TIGER/Line 2024 AREAWATER shapefiles, w<county>/tl_2024_27<county>_areawater.shp,
              for the counties our communities are in (003 019 037 053 059 079 123 131 139 143 147 163 171), from
              https://www2.census.gov/geo/tiger/TIGER2024/AREAWATER/tl_2024_27<county>_areawater.zip
Usage: python3 scripts/build-lake-list.py <dnr-lakes.geojson> <tiger folder>

Rules: DNR "Lake or Pond" water, whole lakes only, named, 10 acres or more, not a pond, slough, marsh or
treatment basin by name, with shoreline within 30 m of a community guide's boundary.
"""
import json
import re
import sys
from pathlib import Path

import shapefile
from pyproj import Transformer
from shapely.geometry import mapping, shape
from shapely.ops import transform
from shapely.strtree import STRtree
from shapely.validation import make_valid

DNR = Path(sys.argv[1])
TIGER = Path(sys.argv[2])
ROOT = Path(__file__).resolve().parent.parent
COUNTIES = {'003': 'Anoka', '019': 'Carver', '037': 'Dakota', '053': 'Hennepin', '059': 'Isanti', '079': 'Le Sueur', '123': 'Ramsey',
            '131': 'Rice', '139': 'Scott', '143': 'Sibley', '147': 'Steele', '163': 'Washington', '171': 'Wright'}
NOT_A_LAKE = re.compile(r'\b(Riv|River|Creek|Pond|Slough|Marsh|Wetland|Basin|Pool|Ditch|Channel|Treatment|Unnamed)\b', re.I)
to_utm = Transformer.from_crs('EPSG:4326', 'EPSG:26915', always_xy=True).transform
nad_utm = Transformer.from_crs('EPSG:4269', 'EPSG:26915', always_xy=True).transform
to_ll = Transformer.from_crs('EPSG:26915', 'EPSG:4326', always_xy=True).transform
RENAMED = {'Lake Calhoun': 'Bde Maka Ska'}  # official names the Census map hasn't caught up with


def nice(name):
    name = re.sub(r'\bLk\b', 'Lake', name)
    name = re.sub(r'\bLks\b', 'Lakes', name)
    name = RENAMED.get(name, name)
    return re.sub(r'\s+\d+$', '', name).strip()


def key(n):
    return re.sub(r'[^a-z]', '', re.sub(r'\b(lake|lakes|lk|lks|the|of)\b', '', (n or '').lower()))


# DNR lakes (one record per lake number)
dnr = {}
for f in json.loads(DNR.read_text())['features']:
    p = f['properties']
    if p['dowlknum'] in dnr or not f['geometry'] or NOT_A_LAKE.search(p['pw_basin_name'] or 'Unnamed'):
        continue
    dnr[p['dowlknum']] = {**p, 'geom': transform(to_utm, make_valid(shape(f['geometry'])))}

# Census named water, for everyday names and counties
census = []
for code, county in COUNTIES.items():
    shp = TIGER / f'w{code}' / f'tl_2024_27{code}_areawater.shp'
    r = shapefile.Reader(str(shp))
    fields = [f[0] for f in r.fields[1:]]
    for sr in r.iterShapeRecords():
        rec = dict(zip(fields, sr.record))
        if rec['MTFCC'] in ('H2030', 'H2040', 'H2051'):
            census.append({'geom': transform(nad_utm, make_valid(shape(sr.shape.__geo_interface__))),
                           'name': nice(rec['FULLNAME'] or ''), 'county': county})
ctree_w = STRtree([c['geom'] for c in census])

# Community outlines
comm = json.loads((ROOT / 'src/data/geo/communities.geojson').read_text())['features']
cinfo = {c['slug']: c for c in json.loads((ROOT / 'src/data/communities.json').read_text())['communities']}
cgeom = [(f['properties']['slug'], transform(to_utm, make_valid(shape(f['geometry'])))) for f in comm]
ctree = STRtree([g for _, g in cgeom])

lakes = []
for d in dnr.values():
    geom = d['geom']
    if d['acres'] < 10:
        continue
    near = []
    for k in ctree.query(geom.buffer(30)):
        slug, cg = cgeom[k]
        if cg.distance(geom) <= 30:  # shoreline within 30 m of the community boundary
            near.append((slug, cg.intersection(geom.buffer(30)).area))
    if not near:
        continue
    near.sort(key=lambda x: -x[1])
    over = [(census[k], census[k]['geom'].intersection(geom).area) for k in ctree_w.query(geom)]
    over = [(c, a) for c, a in over if a > 0]
    named = [c for c, a in sorted(over, key=lambda x: -x[1]) if c['name'] and key(c['name']) == key(d['pw_basin_name'])]
    base = d['pw_basin_name'].strip()
    name = named[0]['name'] if named else (base if re.search(r'\bLakes?\b', base) or base in RENAMED.values() else f'{base} Lake')
    counties = sorted({c['county'] for c, a in over if a > 0.02 * geom.area} or {d['cty_name']})
    ll = transform(to_ll, geom)
    c = transform(to_ll, geom.representative_point())
    lakes.append({
        'name': name, 'acres': round(d['acres']), 'shoreMiles': round(d['shore_mi'], 1), 'dnrId': d['dowlknum'],
        'counties': counties, 'communities': [s for s, _ in near], 'center': [round(c.x, 5), round(c.y, 5)],
        'bbox': [round(v, 5) for v in ll.bounds], '_geom': ll,
    })

# Unique addresses: the lake name; a smaller lake sharing a name adds its main community (and a number if needed).
def slugify(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower().replace("'", '')).strip('-')
used = set()
for l in sorted(lakes, key=lambda l: -l['acres']):
    slug = slugify(l['name'])
    if slug in used:
        slug = slugify(f"{l['name']} {cinfo[l['communities'][0]]['name']}")
    base, n = slug, 2
    while slug in used:
        slug, n = f'{base}-{n}', n + 1
    used.add(slug)
    l['slug'] = slug

lakes.sort(key=lambda l: -l['acres'])
features = [{'type': 'Feature', 'properties': {'slug': l['slug']},
             'geometry': mapping(l['_geom'].simplify(0.0001 if l['acres'] > 300 else 0.00005, preserve_topology=True))} for l in lakes]
for l in lakes:
    del l['_geom']
(ROOT / 'src/data/lake-list.json').write_text(json.dumps({
    'sources': {'water': 'Minnesota DNR Hydrography (lake outlines, official acreage, shoreline miles and DNR lake numbers)',
                'names': 'Everyday lake names from US Census Bureau TIGER/Line 2024 area water where they match the DNR name',
                'rule': 'Named DNR lakes of 10 acres or more that touch a community guide boundary'},
    'lakes': lakes,
}, ensure_ascii=False, indent=1) + '\n')
(ROOT / 'src/data/geo/lake-list.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, separators=(',', ':')))
print(f'{len(lakes)} lakes of 10+ acres; biggest: ' + ', '.join(f"{l['name']} ({l['acres']:,})" for l in lakes[:10]))
