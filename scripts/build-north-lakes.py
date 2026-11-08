"""Build the lakes "up north" that the team sells on, outside the Twin Cities community guides:
  src/data/north-lakes.json            groups (a chain or a single lake), each lake's DNR facts, center and map box
  src/data/geo/north-lake-shores.json  200 m shoreline zone per lake (same format as lake-shores.json), for finding
                                       the MLS listings on each lake
  src/data/geo/north-lakes.geojson     simplified outlines for maps

Minnesota lakes are the Minnesota DNR's (DNR Hydrography), picked by DNR lake number; Wisconsin lakes are the Wisconsin
DNR's (24K Hydro "Lakes and Ponds"), picked by WBIC, with acreage and maximum depth from each lake's DNR Lake Page and
shoreline length measured from the DNR outline. Chain membership:
  Gull Lake Chain: the DNR's special fishing regulation "Gull Lake Chain including connected Gull, Upper Gull,
    Margaret, Ray, Love, Nisswa, Roy and Round Lakes" (Minnesota Fishing Regulations).
  Whitefish Chain: the 13 basins in the Whitefish Chain of Lakes acreage table (DNR LakeFinder acreage), matched to
    DNR lake numbers by name, county (Crow Wing) and location along the chain.
Usage: python3 scripts/build-north-lakes.py
"""
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

from pyproj import Transformer
from shapely.geometry import Polygon, mapping, shape
from shapely.ops import transform, unary_union

ROOT = Path(__file__).resolve().parent.parent
URL = 'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_dnr/water_dnr_hydrography/FeatureServer/1/query'
REACH = 200  # meters out from the water, as for the Twin Cities lakes
to_utm = Transformer.from_crs('EPSG:4326', 'EPSG:26915', always_xy=True).transform
to_ll = Transformer.from_crs('EPSG:26915', 'EPSG:4326', always_xy=True).transform

# Regions up north, each with its lakes in groups: (group slug, group name, [(lake id, everyday name, page slug)]).
REGIONS = [
    {'slug': 'brainerd', 'name': 'Brainerd Lakes', 'state': 'MN', 'stateName': 'Minnesota', 'agency': 'Minnesota DNR',
     'title': 'Brainerd Lakes Homes for Sale: Gull, Pelican & Whitefish Chain', 'h1': 'Brainerd Lakes homes for sale',
     'intro': 'Lakefront homes on the Gull Lake Chain, Pelican Lake and the Whitefish Chain, for sale now and sold in the last three years, from a team that sells cabins up north.',
     'groups': [
    ('gull-lake-chain', 'Gull Lake Chain', [
        ('11030500', 'Gull Lake', 'gull-lake'), ('18037300', 'Round Lake', 'round-lake'), ('11021800', 'Upper Gull Lake', 'upper-gull-lake'),
        ('11022200', 'Lake Margaret', 'lake-margaret'), ('18039900', 'Nisswa Lake', 'nisswa-lake'), ('18039800', 'Roy Lake', 'roy-lake'),
        ('18038800', 'Love Lake', 'love-lake'), ('11022000', 'Ray Lake', 'ray-lake')]),
    ('pelican-lake', 'Pelican Lake', [('18030800', 'Pelican Lake', 'pelican-lake')]),
    ('whitefish-chain', 'Whitefish Chain', [
        ('18031000', 'Whitefish Lake', 'whitefish-lake'), ('18031200', 'Cross Lake', 'cross-lake'), ('18031500', 'Big Trout Lake', 'big-trout-lake'),
        ('18031100', 'Rush-Hen Lake', 'rush-hen-lake'), ('18037800', 'Lower Hay Lake', 'lower-hay-lake'), ('18026900', 'Island Lake', 'island-lake'),
        ('18035500', 'Bertha Lake', 'bertha-lake'), ('18026600', 'Little Pine Lake', 'little-pine-lake'), ('18036600', 'Arrowhead Lake', 'arrowhead-lake'),
        ('18027100', 'Daggett Lake', 'daggett-lake'), ('18026800', 'Loon Lake', 'loon-lake'), ('18035600', 'Clamshell Lake', 'clamshell-lake'),
        ('18035400', 'Pig Lake', 'pig-lake')]),
     ]},
    {'slug': 'polk-county-wi', 'name': 'Polk County, Wisconsin', 'state': 'WI', 'stateName': 'Wisconsin', 'agency': 'Wisconsin DNR',
     'title': 'Balsam Lake & Bone Lake Homes for Sale (Polk County, WI)', 'h1': 'Balsam Lake and Bone Lake homes for sale',
     'intro': 'Lakefront homes on Balsam Lake and Bone Lake in Polk County, Wisconsin, for sale now and sold in the last three years, from a team that has sold cabins on both lakes.',
     'groups': [
    ('balsam-lake', 'Balsam Lake', [('2620600', 'Balsam Lake', 'balsam-lake')]),
    ('bone-lake', 'Bone Lake', [('2628100', 'Bone Lake', 'bone-lake')]),
     ]},
]
WI_URL = 'https://dnrmaps.wi.gov/arcgis/rest/services/ER_Biotics/ER_Biotics_WGS84_Hydro/MapServer/0/query'
WI_PAGE = 'https://apps.dnr.wi.gov/lakes/lakepages/LakeDetail.aspx?wbic={}'


def fetch(numbers):
    q = dict(where=f"dowlknum IN ({','.join(repr(n) for n in numbers)}) AND sub_flag IN ('X','N')",
             outFields='dowlknum,pw_basin_name,acres,shore_mi,cty_name', outSR=4326, geometryPrecision=5, f='geojson')
    with urllib.request.urlopen(f'{URL}?{urllib.parse.urlencode(q)}', timeout=120) as r:
        return {f['properties']['dowlknum']: f for f in json.load(r)['features']}


def fetch_wi(wbics):
    q = dict(where=f"WATERBODY_WBIC IN ({','.join(wbics)})", outFields='WATERBODY_WBIC,WATERBODY_NAME', outSR=4326, f='geojson')
    with urllib.request.urlopen(f'{WI_URL}?{urllib.parse.urlencode(q)}', timeout=120) as r:
        feats = json.load(r)['features']
    out = {}
    for w in wbics:  # a lake can come in several polygons: one outline per WBIC
        mine = [f for f in feats if str(f['properties']['WATERBODY_WBIC']) == w]
        parts = [shape(f['geometry']) for f in mine]
        geom = unary_union(parts)
        with urllib.request.urlopen(WI_PAGE.format(w), timeout=60) as r:
            page = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', r.read().decode('utf8', 'replace')))
        m = re.search(r'is a ([\d,]+) acre lake located in ([A-Za-z. ]+?) County\. It has a maximum depth of (\d+) feet', page)
        if not m:
            raise SystemExit(f'WBIC {w}: no acreage sentence on the DNR Lake Page')
        out[w] = {'geometry': geom, 'properties': {'pw_basin_name': mine[0]['properties']['WATERBODY_NAME'], 'acres': float(m.group(1).replace(',', '')),
                  'cty_name': m.group(2).strip(), 'maxDepth': int(m.group(3)), 'shore_mi': None}}
    return out


regions, shores, outlines = [], {}, []
for reg in REGIONS:
    ids = [n for _, _, lakes in reg['groups'] for n, _, _ in lakes]
    feats = fetch(ids) if reg['state'] == 'MN' else fetch_wi(ids)
    groups = []
    for gslug, gname, lakes in reg['groups']:
        out = []
        for num, name, slug in lakes:
            f = feats[num]
            g = f['geometry'] if reg['state'] == 'WI' else shape(f['geometry'])
            utm = transform(to_utm, g)
            zone = unary_union(utm.buffer(REACH)).simplify(25)
            parts = list(zone.geoms) if zone.geom_type == 'MultiPolygon' else [zone]
            key = f"{reg['slug']}/{slug}"
            shores[key] = [[[[round(x, 5), round(y, 5)] for x, y in transform(to_ll, Polygon(p.exterior)).exterior.coords]] for p in parts]
            minx, miny, maxx, maxy = g.bounds
            c = g.representative_point()
            p = f['properties']
            # Wisconsin's Lake Pages give no shoreline length: measured here from the DNR outline (outer shore, islands excluded).
            shore = p['shore_mi'] if p['shore_mi'] is not None else sum(Polygon(q.exterior).length for q in (utm.geoms if utm.geom_type == 'MultiPolygon' else [utm])) / 1609.344
            lake = {'slug': slug, 'key': key, 'name': name, 'dnrName': p['pw_basin_name'], 'dnrId': num, 'acres': round(p['acres']),
                    'shoreMiles': round(shore, 1), 'county': p['cty_name'], 'center': [round(c.x, 5), round(c.y, 5)],
                    'bbox': [round(minx, 5), round(miny, 5), round(maxx, 5), round(maxy, 5)]}
            if p.get('maxDepth'):
                lake['maxDepth'] = p['maxDepth']
            out.append(lake)
            simple = transform(to_ll, utm.simplify(20))
            outlines.append({'type': 'Feature', 'properties': {'key': key, 'name': name}, 'geometry': mapping(simple)})
        xs = [v for l in out for v in (l['bbox'][0], l['bbox'][2])]
        ys = [v for l in out for v in (l['bbox'][1], l['bbox'][3])]
        groups.append({'slug': gslug, 'name': gname, 'region': reg['slug'], 'acres': sum(l['acres'] for l in out), 'shoreMiles': round(sum(l['shoreMiles'] for l in out), 1),
                       'bbox': [round(min(xs) - .005, 5), round(min(ys) - .005, 5), round(max(xs) + .005, 5), round(max(ys) + .005, 5)], 'lakes': out})
    regions.append({k: v for k, v in reg.items() if k != 'groups'} | {'groups': groups})

data = {'source': 'Minnesota DNR Hydrography (lake outlines, official acreage, shoreline miles, DNR lake numbers); Wisconsin DNR 24K Hydro and Lake Pages (outlines, WBICs, acreage, maximum depth)', 'regions': regions}
(ROOT / 'src/data/north-lakes.json').write_text(json.dumps(data, indent=1))
(ROOT / 'src/data/geo/north-lake-shores.json').write_text(json.dumps(shores, separators=(',', ':')))
(ROOT / 'src/data/geo/north-lakes.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': outlines}, separators=(',', ':')))
for g in (g for r in regions for g in r['groups']):
    print(f"{g['name']}: {len(g['lakes'])} lakes, {g['acres']:,} acres, {g['shoreMiles']} shore miles")
