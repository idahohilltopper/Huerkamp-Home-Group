"""Finds each Minneapolis/Saint Paul neighborhood in the team's Ylopo home search -> src/data/ylopo-neighborhoods.json.

Only an exact "neighborhood" match in the right city is used (Ylopo also knows a Highland Park in Mendota Heights
and a Kenwood in Duluth). Neighborhoods without one search the map area of the neighborhood instead.
Usage: python3 scripts/match-ylopo-neighborhoods.py
"""
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEARCH = 'https://search.huerkamphomegroup.com'
CITY = {'minneapolis': 'Minneapolis', 'saint-paul': 'Saint Paul'}
# Ylopo's names for some districts, tried after the page name.
EXTRA = {'battle-creek-highwood': ['Battle Creek', 'Highwood'], 'union-park': ['Merriam Park', 'Lexington-Hamline'],
         'summit-university': ['Summit University'], 'payne-phalen': ['Payne Phalen'], 'hamline-midway': ['Hamline Midway'],
         'macalester-groveland': ['Macalester Groveland', 'Mac-Groveland'], 'west-seventh': ['West 7th', 'Fort Road']}


def lookup(q):
    url = f'{SEARCH}/api/1.0/autocomplete?q={urllib.parse.quote(q)}'
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'HHG-website-builder'}), timeout=30) as r:
        return json.load(r)


hoods = json.loads((ROOT / 'src/data/neighborhoods.json').read_text())['neighborhoods']
out = {}
for h in hoods:
    city = CITY[h['city']]
    for q in [h['name'], h['report'].split(' – ')[-1]] + EXTRA.get(h['slug'], []):
        hit = next((x for x in lookup(q) if x.get('type') == 'neighborhood' and x.get('city') == city), None)
        time.sleep(0.2)
        if hit:
            out[f"{h['city']}/{h['slug']}"] = hit['searchValue']['neighborhood']
            break
(ROOT / 'src/data/ylopo-neighborhoods.json').write_text(json.dumps(out, indent=1, ensure_ascii=False) + '\n')
print(f'{len(out)} of {len(hoods)} neighborhoods found in Ylopo; the rest search their map area')
print('not found:', [f"{h['city']}/{h['slug']}" for h in hoods if f"{h['city']}/{h['slug']}" not in out])
