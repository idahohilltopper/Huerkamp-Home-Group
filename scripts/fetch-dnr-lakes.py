"""Download the Minnesota DNR's lakes (DNR Hydrography) around our communities: whole lakes of 10+ acres with their
outlines, official acreage, shoreline miles and DNR lake number. scripts/build-lake-list.py builds the lake list from it.
Usage: python3 scripts/fetch-dnr-lakes.py <output.geojson>
"""
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
URL = 'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_dnr/water_dnr_hydrography/FeatureServer/1/query'


def coords(g):
    if isinstance(g[0], (int, float)):
        yield g
    else:
        for c in g:
            yield from coords(c)


pts = [p for f in json.loads((ROOT / 'src/data/geo/communities.geojson').read_text())['features'] for p in coords(f['geometry']['coordinates'])]
w, s = min(p[0] for p in pts) - .01, min(p[1] for p in pts) - .01
e, n = max(p[0] for p in pts) + .01, max(p[1] for p in pts) + .01
feats, off = [], 0
while True:
    q = dict(where="wb_class = 'Lake or Pond' AND sub_flag IN ('X', 'N') AND acres >= 10 AND pw_basin_name IS NOT NULL",
             geometry=f'{w},{s},{e},{n}', geometryType='esriGeometryEnvelope', inSR=4326, spatialRel='esriSpatialRelIntersects',
             outFields='dowlknum,pw_basin_name,sub_flag,acres,shore_mi,cty_name', outSR=4326, geometryPrecision=5,
             maxAllowableOffset=0.00003, resultOffset=off, resultRecordCount=500, orderByFields='objectid', f='geojson')
    res = json.load(urllib.request.urlopen(URL + '?' + urllib.parse.urlencode(q), timeout=180))
    page = res['features']
    feats += page
    # The service can send fewer than asked (a size limit), so keep going until a page comes back empty.
    if not page:
        break
    off += len(page)
Path(sys.argv[1]).write_text(json.dumps({'type': 'FeatureCollection', 'features': feats}))
print(len(feats), 'DNR lakes of 10+ acres')
