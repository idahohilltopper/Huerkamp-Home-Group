"""Build every lake of 10 acres or more that touches one of our community guides:
  src/data/lake-list.json        name, acres, counties, shoreline communities, center and map box
  src/data/geo/lake-list.geojson simplified outlines for the lake map

Input (argument 1): a folder with TIGER/Line 2024 AREAWATER shapefiles, w<county>/tl_2024_27<county>_areawater.shp,
for the counties our communities are in (003 019 037 053 059 079 123 131 139 143 147 163 171), from
https://www2.census.gov/geo/tiger/TIGER2024/AREAWATER/tl_2024_27<county>_areawater.zip
Usage: python3 scripts/build-lake-list.py <folder>

How a lake is counted:
- Census water areas coded as lakes/ponds (H2030) or reservoirs (H2040); rivers, streams, canals and treatment ponds are left out.
- Water areas that touch are joined into one lake (so Lake Minnetonka's named bays count as Lake Minnetonka),
  and the lake takes the name of its largest named part. Unnamed water is left out.
- Parts with the same name within 150 m of each other (a causeway or narrows, like Upper and Lower Prior Lake) are one lake.
- Not rivers, creeks, ponds, sloughs, marshes or wetlands, even where the Census codes part of one as a reservoir.
- 10 acres or more in total, and touching at least one community guide's boundary.
"""
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

import shapefile
from pyproj import Transformer
from shapely.geometry import mapping, shape
from shapely.ops import transform, unary_union
from shapely.strtree import STRtree
from shapely.validation import make_valid

SRC = Path(sys.argv[1])
ROOT = Path(__file__).resolve().parent.parent
ACRE = 4046.8564224
COUNTIES = {'003': 'Anoka', '019': 'Carver', '037': 'Dakota', '053': 'Hennepin', '059': 'Isanti', '079': 'Le Sueur', '123': 'Ramsey',
            '131': 'Rice', '139': 'Scott', '143': 'Sibley', '147': 'Steele', '163': 'Washington', '171': 'Wright'}
LAKE_CODES = {'H2030', 'H2040'}
NOT_A_LAKE = re.compile(r'\b(Riv|River|Creek|Cr|Pond|Slough|Marsh|Wetland|Basin|Pool|Ditch|Channel|Treatment)\b', re.I)
to_utm = Transformer.from_crs('EPSG:4269', 'EPSG:26915', always_xy=True).transform
to_ll = Transformer.from_crs('EPSG:26915', 'EPSG:4326', always_xy=True).transform
ll_to_utm = Transformer.from_crs('EPSG:4326', 'EPSG:26915', always_xy=True).transform


# Official names the Census map hasn't caught up with.
RENAMED = {'Lake Calhoun': 'Bde Maka Ska'}


def nice(name):
    # Census abbreviations -> everyday names ("Lk" -> "Lake")
    name = re.sub(r'\bLk\b', 'Lake', name)
    name = RENAMED.get(name, name)
    return re.sub(r'\s+\d+$', '', name).strip()  # "Marcott Lake 2" -> "Marcott Lake" (a numbered part)


# Water pieces in the counties
pieces = []
for code, county in COUNTIES.items():
    shp = SRC / f'w{code}' / f'tl_2024_27{code}_areawater.shp'
    if not shp.exists():
        print('missing', shp)
        continue
    r = shapefile.Reader(str(shp))
    fields = [f[0] for f in r.fields[1:]]
    for sr in r.iterShapeRecords():
        rec = dict(zip(fields, sr.record))
        if rec['MTFCC'] not in LAKE_CODES:
            continue
        g = transform(to_utm, make_valid(shape(sr.shape.__geo_interface__)))
        pieces.append({'geom': g, 'name': nice(rec['FULLNAME'] or ''), 'county': county})

# Join touching pieces (within 3 m, to bridge tiny gaps between Census pieces) into lakes.
tree = STRtree([p['geom'] for p in pieces])
parent = list(range(len(pieces)))
def find(i):
    while parent[i] != i:
        parent[i] = parent[parent[i]]
        i = parent[i]
    return i
for i, p in enumerate(pieces):
    for j in tree.query(p['geom'].buffer(3)):
        if j != i and p['geom'].distance(pieces[j]['geom']) <= 3:
            parent[find(i)] = find(j)
groups = defaultdict(list)
for i in range(len(pieces)):
    groups[find(i)].append(pieces[i])

# Community outlines
comm = json.loads((ROOT / 'src/data/geo/communities.geojson').read_text())['features']
cinfo = {c['slug']: c for c in json.loads((ROOT / 'src/data/communities.json').read_text())['communities']}
cgeom = [(f['properties']['slug'], transform(ll_to_utm, make_valid(shape(f['geometry'])))) for f in comm]
ctree = STRtree([g for _, g in cgeom])

lakes, groups_named = [], []
for members in groups.values():
    geom = unary_union([m['geom'] for m in members])
    if geom.area / ACRE < 3:
        continue
    named = defaultdict(float)
    for m in members:
        if m['name']:
            named[m['name']] += m['geom'].area
    if not named:
        continue
    name = max(named, key=named.get)
    if NOT_A_LAKE.search(name):
        continue
    groups_named.append({'name': name, 'geom': geom, 'members': members})

# Same-named lakes separated only by a causeway or narrows count as one lake.
merged = []
for g in sorted(groups_named, key=lambda g: -g['geom'].area):
    twin = next((m for m in merged if m['name'] == g['name'] and m['geom'].distance(g['geom']) <= 150), None)
    if twin:
        twin['geom'] = unary_union([twin['geom'], g['geom']]); twin['members'] += g['members']
    else:
        merged.append(g)

for g in merged:
    name, geom, members = g['name'], g['geom'], g['members']
    acres = geom.area / ACRE
    if acres < 10:
        continue
    near = []
    for k in ctree.query(geom.buffer(30)):
        slug, cg = cgeom[k]
        if cg.distance(geom) <= 30:  # shoreline within 30 m of the community boundary
            near.append((slug, cg.intersection(geom.buffer(30)).area))
    if not near:
        continue
    near.sort(key=lambda x: -x[1])
    ll = transform(to_ll, geom)
    c = transform(to_ll, geom.representative_point())
    minx, miny, maxx, maxy = ll.bounds
    lakes.append({
        'name': name, 'acres': round(acres), 'counties': sorted({m['county'] for m in members}),
        'communities': [s for s, _ in near], 'center': [round(c.x, 5), round(c.y, 5)],
        'bbox': [round(v, 5) for v in (minx, miny, maxx, maxy)], '_geom': ll,
    })

# Unique addresses: the lake name, plus the main community when two lakes share a name.
def slugify(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower().replace("'", '')).strip('-')
count = defaultdict(int)
for l in lakes:
    count[l['name']] += 1
used = set()
for l in sorted(lakes, key=lambda l: -l['acres']):
    slug = slugify(l['name'])
    if count[l['name']] > 1 or slug in used:
        slug = slugify(f"{l['name']} {cinfo[l['communities'][0]]['name']}")
    while slug in used:
        slug += '-2'
    used.add(slug)
    l['slug'] = slug

lakes.sort(key=lambda l: -l['acres'])
features = [{'type': 'Feature', 'properties': {'slug': l['slug']},
             'geometry': mapping(l['_geom'].simplify(0.0002 if l['acres'] > 300 else 0.0001, preserve_topology=True))} for l in lakes]
for l in lakes:
    del l['_geom']
(ROOT / 'src/data/lake-list.json').write_text(json.dumps({
    'sources': {'water': 'US Census Bureau TIGER/Line 2024 area water (lakes, ponds and reservoirs; touching parts joined)',
                'rule': 'Named lakes of 10 acres or more that touch a community guide boundary'},
    'lakes': lakes,
}, ensure_ascii=False, indent=1) + '\n')
(ROOT / 'src/data/geo/lake-list.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, separators=(',', ':')))
print(f'{len(lakes)} lakes of 10+ acres; biggest: ' + ', '.join(f"{l['name']} ({l['acres']:,})" for l in lakes[:8]))
