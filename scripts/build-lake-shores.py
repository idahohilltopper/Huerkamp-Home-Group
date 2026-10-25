"""Build the shoreline zone around every lake, for finding the MLS listings on it (src/data/geo/lake-shores.json).

A listing's map point is usually the house or the street in front of it, so the zone reaches 200 m out from the
water. The listings function then keeps only the listings the MLS marks as lakefront, so homes across the road
don't show. Islands are left out (only each lake's outer shoreline is used), and outlines are simplified to keep
the request small.
Input: src/data/geo/lake-list.geojson (from scripts/build-lake-list.py)
Usage: python3 scripts/build-lake-shores.py
"""
import json
from pathlib import Path

from pyproj import Transformer
from shapely.geometry import Polygon, shape
from shapely.ops import transform, unary_union

ROOT = Path(__file__).resolve().parent.parent
REACH = 200  # meters out from the water
to_utm = Transformer.from_crs('EPSG:4326', 'EPSG:26915', always_xy=True).transform
to_ll = Transformer.from_crs('EPSG:26915', 'EPSG:4326', always_xy=True).transform

shores = {}
for f in json.loads((ROOT / 'src/data/geo/lake-list.geojson').read_text())['features']:
    g = transform(to_utm, shape(f['geometry']))
    zone = unary_union(g.buffer(REACH)).simplify(25)
    parts = list(zone.geoms) if zone.geom_type == 'MultiPolygon' else [zone]
    rings = []
    for p in parts:
        ring = transform(to_ll, Polygon(p.exterior)).exterior.coords
        rings.append([[[round(x, 5), round(y, 5)] for x, y in ring]])
    shores[f['properties']['slug']] = rings
(ROOT / 'src/data/geo/lake-shores.json').write_text(json.dumps(shores, separators=(',', ':')))
pts = sum(len(r[0]) for v in shores.values() for r in v)
print(f'{len(shores)} lakes, {pts:,} points, biggest: {max(shores, key=lambda s: sum(len(r[0]) for r in shores[s]))}')
