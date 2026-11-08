"""Builds src/data/places.json: the everyday places used by the "What's nearby" section on listing pages
(src/lib/nearby.mjs). Re-run every few months:  python3 -m pip install duckdb && python3 scripts/build-nearby-places.py

Sources (both free, openly licensed):
- Overture Maps places (overturemaps.org, CDLA-Permissive-2.0 / ODbL): grocery stores, coffee shops, restaurants,
  pharmacies, parks and trails, libraries, gyms. Read straight from Overture's public S3 bucket with DuckDB.
- Metro Transit GTFS (svc.metrotransit.org/mtgtfs/gtfs.zip): bus, rapid bus and light rail stops with the routes
  that serve them (Metro Transit plus Maple Grove, Plymouth, SouthWest Transit and U of M routes).

Fair housing: places only. No schools, places of worship, demographics or crime.
"""
import csv, io, json, re, sys, urllib.request, zipfile
from datetime import date
from pathlib import Path

import duckdb

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/data/places.json'
BBOX = (-94.7, 43.9, -92.2, 46.8)  # Twin Cities metro, Brainerd lakes, western Wisconsin
GTFS = 'https://svc.metrotransit.org/mtgtfs/gtfs.zip'


def latest_release(c):
    rows = c.execute("SELECT DISTINCT regexp_extract(file, 'release/([^/]+)/', 1) r FROM glob('s3://overturemaps-us-west-2/release/*/theme=places/type=place/*.parquet') ORDER BY r DESC LIMIT 1").fetchall()
    return rows[0][0]


# Overture's grocery category also holds food makers and distributors; keep real stores.
NOT_STORE = re.compile(r'\b(solutions|brands|distribut\w*|wholesale|warehouse|company|corp|inc|llc|manufactur\w*|processing|catering|bakery supply|ingredients|foods? service|foodservice|commissary|products|liquors?|wine|spirits|pizza|grill|pharmacy|gnc|syrup|honey|confections?|candy|chocolate|supervalu|agropur|del monte|land o.? lakes|pickup|delivery|rainbow foods|farms?|orchard|nutrition|vitamins?|tobacco|general mills|milk co|creamery|insta-cook|taqueria|restaurant|kitchen|cafe|naturals|zen bin|meats? (and|&) poultry)\b', re.I)
# Overture can list one store several times ("Cub Foods", "Cub - White Bear Lake"); merge places this close together.
MERGE_M = {'grocery': 150, 'pharmacy': 80, 'library': 80}
# Name checks per kind: Overture files nonprofits, offices and private collections under park, library and gym.
KEEP = {
    'grocery': (None, re.compile(r'^.{0,3}$')),
    'park': (re.compile(r'\b(parks?|trails?|beach|reserve|preserve|gardens?|playground|falls|green|commons|square|woods|forest|fields?|nature|wildlife|arboretum|refuge|regional|dog park|skate)\b', re.I),
             re.compile(r'\b(parks (and|&) rec\w*|recreation department)\b|\b(conservancy|foundation|association|department|dept|office|commission|club|inc|llc|rv|mobile|campground|parking|apartments?|ride|business|industrial|corporate|center|centre|homes?|village|estates|court)\b', re.I)),
    'library': (re.compile(r'library', re.I), re.compile(r'\b(law|legal|attorney|general|music|seed|tool|toy|little free|archives?|historical|university|college|medical|hospital|museum|school|church|society|institute|department|office|film|sound|photo|stock)\b', re.I)),
    'gym': (None, re.compile(r'\b(dao|church|temple|mosque|academy|school|club house|clubhouse|apartments?|association)\b', re.I)),
}
BIG_BOX = re.compile(r'^(target|walmart supercenter|costco|costco wholesale|sam\'s club|super target|supertarget)$', re.I)
CATS = {
    'grocery': ("tax IN ('grocery_store','supermarket','organic_grocery_store','international_grocery_store','asian_grocery_store','mexican_grocery_store','health_food_store') OR (regexp_matches(name, '^(Target|Walmart Supercenter|Costco Wholesale|Costco|Sam''s Club|SuperTarget)$') AND cat IN ('department_store','discount_store','warehouse_club','shopping','general_merchandise_store','big_box_store','retail'))"),
    'coffee': "tax IN ('coffee_shop','cafe','coffee_roastery')",
    'restaurant': "cat IN ('restaurant','casual_eatery') OR tax IN ('restaurant','pizza_restaurant','bakery','sandwich_shop','brewery','brewpub')",
    'pharmacy': "tax IN ('pharmacy','drugstore')",
    'park': "tax IN ('park','dog_park','playground','beach','state_park','hiking_trail','mountain_bike_trail','nature_reserve','botanical_garden','skate_park')",
    'library': "tax = 'library'",
    'gym': "tax IN ('gym','fitness_center','swimming_pool','recreation_center','community_center')",
}


def places():
    c = duckdb.connect()
    c.execute("INSTALL httpfs; LOAD httpfs; CREATE SECRET (TYPE s3, KEY_ID '', SECRET '', REGION 'us-west-2');")
    rel = latest_release(c)
    print('Overture release', rel, file=sys.stderr)
    x0, y0, x1, y1 = BBOX
    c.execute(f"""CREATE TABLE p AS SELECT names.primary AS name, basic_category AS cat, taxonomy.primary AS tax, confidence AS conf,
        operating_status AS st, round((bbox.ymin+bbox.ymax)/2, 5) AS lat, round((bbox.xmin+bbox.xmax)/2, 5) AS lng
      FROM read_parquet('s3://overturemaps-us-west-2/release/{rel}/theme=places/type=place/*', hive_partitioning=1)
      WHERE bbox.xmin > {x0} AND bbox.xmax < {x1} AND bbox.ymin > {y0} AND bbox.ymax < {y1}
        AND names.primary IS NOT NULL AND confidence >= 0.8 AND (operating_status IS NULL OR operating_status = 'open')""")
    out = {}
    for key, where in CATS.items():
        rows = c.execute(f"SELECT DISTINCT name, lat, lng FROM p WHERE {where}").fetchall()
        if key == 'grocery':
            rows = [r for r in rows if BIG_BOX.match(r[0]) or not NOT_STORE.search(r[0])]
        if key in KEEP:
            need, bad = KEEP[key]
            rows = [r for r in rows if (not need or need.search(r[0])) and not bad.search(r[0])]
        rows = sorted(rows, key=lambda r: (len(r[0]), r[0]))
        kept, m = [], MERGE_M.get(key, 25)
        for r in rows:
            if not any(abs(r[1] - k[0]) * 111000 < m and abs(r[2] - k[1]) * 79000 < m for k in kept):
                kept.append([r[1], r[2], r[0]])
        out[key] = sorted(kept)
        print(key, len(out[key]), file=sys.stderr)
    return rel, out


def transit():
    req = urllib.request.Request(GTFS, headers={'User-Agent': 'huerkamphomes-build/1.0'})
    z = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(req, timeout=300).read()))
    rd = lambda f: csv.DictReader(io.TextIOWrapper(z.open(f), 'utf-8-sig'))
    routes = {r['route_id']: (r['route_short_name'] or r['route_long_name']).strip() for r in rd('routes.txt')}
    rail = {r['route_id'] for r in rd('routes.txt') if r['route_type'] in ('0', '2') or r['route_long_name'].startswith('METRO ')}
    trip_route = {t['trip_id']: t['route_id'] for t in rd('trips.txt')}
    served = {}
    for st in rd('stop_times.txt'):
        served.setdefault(st['stop_id'], set()).add(trip_route.get(st['trip_id']))
    stops = []
    for s in rd('stops.txt'):
        rs = {r for r in served.get(s['stop_id'], ()) if r}
        if not rs or s.get('location_type') not in ('', '0'):
            continue
        names = sorted({routes[r] for r in rs}, key=lambda n: (not n.startswith('METRO'), len(n), n))
        stops.append([round(float(s['stop_lat']), 5), round(float(s['stop_lon']), 5), s['stop_name'], ', '.join(names[:4]), 1 if rs & rail else 0])
    print('transit stops', len(stops), file=sys.stderr)
    return sorted(stops)


if __name__ == '__main__':
    rel, cats = places()
    cats['transit'] = transit()
    OUT.write_text(json.dumps({
        'built': date.today().isoformat(),
        'sources': {
            'places': f'Overture Maps Foundation places, release {rel} (overturemaps.org)',
            'transit': 'Metro Transit GTFS schedule data (metrotransit.org)',
        },
        'cats': cats,
    }, separators=(',', ':')))
    print('wrote', OUT, round(OUT.stat().st_size / 1e6, 2), 'MB', file=sys.stderr)
