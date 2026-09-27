"""Fetches light-traffic drive times from the public OSRM demo server (OpenStreetMap data).

Writes <download-folder>/geo2/osrm.json with:
  toDestinations:  {slug: {destination: minutes}}  for the four landmarks below
  toCommunities:   {slug: {slug: minutes}}         for each city's six closest cities (straight line)

The demo server allows light use only, so requests are batched and spaced one second apart.
Usage: python3 scripts/fetch-drive-times.py <download-folder>
"""
import json
import math
import sys
import time
import urllib.request
from pathlib import Path

OUT = Path(sys.argv[1]) / 'geo2' / 'osrm.json'
DESTINATIONS = {  # [lon, lat]
    'downtownMinneapolis': [-93.2718, 44.9765],
    'downtownSaintPaul': [-93.0998, 44.9445],
    'mspAirport': [-93.2052, 44.8820],
    'mallOfAmerica': [-93.2422, 44.8549],
}
communities = json.load(open('src/data/communities.json'))['communities']


def table(sources, destinations):
    coords = ';'.join(f'{x},{y}' for x, y in sources + destinations)
    src = ';'.join(str(i) for i in range(len(sources)))
    dst = ';'.join(str(len(sources) + i) for i in range(len(destinations)))
    url = f'https://router.project-osrm.org/table/v1/driving/{coords}?sources={src}&destinations={dst}'
    req = urllib.request.Request(url, headers={'User-Agent': 'HuerkampSiteBuild/1.0'})
    for attempt in range(3):
        try:
            data = json.load(urllib.request.urlopen(req, timeout=60))
            if data.get('code') == 'Ok':
                time.sleep(1)
                return data['durations']
        except Exception as e:  # noqa: BLE001 - retry any network hiccup
            print('retry', attempt + 1, e)
        time.sleep(3 * (attempt + 1))
    raise SystemExit(f'OSRM request failed: {url[:120]}')


def miles(a, b):
    la1, lo1, la2, lo2 = map(math.radians, [a[1], a[0], b[1], b[0]])
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 3958.8 * math.asin(math.sqrt(h))


to_dest = {}
names = list(DESTINATIONS)
for i in range(0, len(communities), 80):
    batch = communities[i:i + 80]
    rows = table([c['center'] for c in batch], list(DESTINATIONS.values()))
    for c, row in zip(batch, rows):
        to_dest[c['slug']] = {n: round(s / 60) for n, s in zip(names, row) if s is not None}
    print(f'destinations: {min(i + 80, len(communities))}/{len(communities)}')

to_comm = {}
for n, c in enumerate(communities, 1):
    near = sorted((o for o in communities if o['slug'] != c['slug']), key=lambda o: miles(c['center'], o['center']))[:6]
    row = table([c['center']], [o['center'] for o in near])[0]
    to_comm[c['slug']] = {o['slug']: round(s / 60) for o, s in zip(near, row) if s is not None}
    if n % 25 == 0:
        print(f'neighbors: {n}/{len(communities)}')

OUT.write_text(json.dumps({'source': 'OSRM demo server, router.project-osrm.org (OpenStreetMap data)',
                           'destinations': names, 'toDestinations': to_dest, 'toCommunities': to_comm}))
print('wrote', OUT)
