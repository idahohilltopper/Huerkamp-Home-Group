"""Adds light-traffic drive times from every community to one more destination, using the same public OSRM
server and method as scripts/fetch-drive-times.py (from each city's Census center point).

Usage: python3 scripts/add-drive-destination.py <key> "<Label>" <lon> <lat>
e.g.   python3 scripts/add-drive-destination.py universityOfMinnesota "University of Minnesota" -93.2354 44.9764
Writes the minutes into src/data/community-details.json (driveMinutes.<key>) and the label into driveDestinations.
"""
import json
import sys
import time
import urllib.request

key, label, lon, lat = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
comms = json.load(open('src/data/communities.json'))['communities']
path = 'src/data/community-details.json'
details = json.load(open(path))

for i in range(0, len(comms), 50):
    batch = comms[i:i + 50]
    coords = ';'.join(f"{c['center'][0]},{c['center'][1]}" for c in batch) + f';{lon},{lat}'
    url = f"https://router.project-osrm.org/table/v1/driving/{coords}?sources={';'.join(map(str, range(len(batch))))}&destinations={len(batch)}"
    data = json.load(urllib.request.urlopen(url, timeout=60))
    assert data['code'] == 'Ok', data
    for c, row in zip(batch, data['durations']):
        if c['slug'] in details['communities'] and row[0] is not None:
            details['communities'][c['slug']].setdefault('driveMinutes', {})[key] = max(1, round(row[0] / 60))
    time.sleep(1)

details['driveDestinations'][key] = label
json.dump(details, open(path, 'w'), indent=1, ensure_ascii=False)
open(path, 'a').write('\n')
print('done', sum(1 for c in details['communities'].values() if key in c.get('driveMinutes', {})))
