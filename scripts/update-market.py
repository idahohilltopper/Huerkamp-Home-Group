"""Monthly housing-market numbers for the Twin Cities region and each community guide -> src/data/market.json.

Source: Minneapolis Area REALTORS "Local Market Update" reports (one page per area per month, data from
NorthstarMLS, produced by ShowingTime Plus): https://maar.stats.10kresearch.com/reports/lmu
New reports come out around the 7th-10th of each month for the month before.

Usage:
  python3 scripts/update-market.py                 # newest month for every area, added to the history
                                                   # (does nothing if that month is already in market.json)
  python3 scripts/update-market.py --backfill 12   # also the 11 months before it (first run)
  python3 scripts/update-market.py --month 2026-09 # one specific month
Needs pypdf (pip install pypdf). Only the numbers are kept; every page that shows them names the source,
the month and the "current as of" date, and links to the original report.
"""
import io
import json
import logging
import re
import subprocess
import sys
import time
import urllib.parse
from datetime import date
from pathlib import Path

from pypdf import PdfReader

logging.getLogger('pypdf').setLevel(logging.ERROR)
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/data/market.json'
BASE = 'https://maar.stats.10kresearch.com'
REGION = '16-County Twin Cities Region'
# Community guides whose report goes by a different name (townships), and ones with no report.
RENAMED = {'credit-river': 'Credit River Township', 'empire': 'Empire Township'}

ROWS = {
    'New Listings': 'newListings',
    'Closed Sales': 'closedSales',
    'Median Sales Price': 'medianPrice',
    'Average Sales Price': 'averagePrice',
    'Price Per Square Foot': 'pricePerSqft',
    'Percent of Original List Price Received': 'pctOfList',
    'Days on Market Until Sale': 'daysOnMarket',
    'Inventory of Homes for Sale': 'inventory',
    'Months Supply of Inventory': 'monthsSupply',
}
NO_SALES_ZERO = {'medianPrice', 'averagePrice', 'pricePerSqft', 'pctOfList', 'daysOnMarket'}
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


def report_name(c):
    if c['slug'] in RENAMED:
        return RENAMED[c['slug']]
    return re.sub(r'\bSt\. ', 'St ', c['name'])


def report_url(name, month=None):
    key = re.sub(r'[&+ ]', '', name)
    return f'{BASE}/docs/lmu/{month + "/" if month else ""}x/{urllib.parse.quote(key)}?src=page'


def num(s):
    s = re.sub(r'[$,%+\s]', '', s)
    return None if s in ('--', '') else float(s)


def parse(text):
    """The report's table -> {metric: {month: [last year, this year, % change], r12: [...]}} plus its month and date."""
    head = re.search(r'Local Market Update – (\w+) (\d{4})', text)
    asof = re.search(r'Current as of (\w+ \d+, \d{4})', text)
    if not head:
        return None
    data = {}
    for label, key in ROWS.items():
        m = re.search(rf'^{re.escape(label)}\*? (.+)$', text, re.M)
        if not m:
            continue
        vals = re.findall(r'--|[+-]? ?\$?[\d,]+(?:\.\d+)?%?', m[1])
        vals = [num(v) for v in vals]
        if len(vals) >= 6:
            if key in NO_SALES_ZERO:  # the report prints 0 when nothing sold; that's "no sales", not a $0 price
                vals = [None if (i % 3 != 2 and v == 0) else v for i, v in enumerate(vals)]
                vals = [vals[i] if i % 3 != 2 or (vals[i - 2] is not None and vals[i - 1] is not None) else None for i in range(len(vals))]
            data[key] = {'month': vals[0:3], 'r12': vals[3:6]}
    month = f'{head[2]}-{MONTHS.index(head[1]) + 1:02d}'
    return {'month': month, 'asOf': asof and str(date(*map(int, _mdY(asof[1])))), 'data': data}


def _mdY(s):
    mon, day, year = re.match(r'(\w+) (\d+), (\d{4})', s).groups()
    return year, MONTHS.index(mon) + 1, day


def fetch(name, month=None):
    url = report_url(name, month)
    for attempt in range(3):
        out = subprocess.run(['curl', '-sS', '-f', '-m', '60', url], capture_output=True)
        if out.returncode == 0 and out.stdout[:4] == b'%PDF':
            text = PdfReader(io.BytesIO(out.stdout)).pages[0].extract_text()
            r = parse(text)
            if r:
                r['url'] = url.replace('?src=page', '')
                return r
        time.sleep(2 * (attempt + 1))
    return None


def prev_month(m):
    y, mo = map(int, m.split('-'))
    return f'{y - 1}-12' if mo == 1 else f'{y}-{mo - 1:02d}'


def main(args):
    communities = json.loads((ROOT / 'src/data/communities.json').read_text())['communities']
    skip = set(json.loads(OUT.read_text()).get('noReport', [])) if OUT.exists() else set()
    store = json.loads(OUT.read_text()) if OUT.exists() else {}
    store.setdefault('source', {
        'name': 'Minneapolis Area REALTORS® Local Market Update',
        'publisher': 'Minneapolis Area REALTORS®', 'data': 'NorthstarMLS', 'producer': 'ShowingTime Plus, LLC',
        'url': f'{BASE}/reports/lmu',
        'note': 'Does not account for seller concessions. Activity for one month can sometimes look extreme due to small sample size.',
    })
    store.setdefault('months', {})
    areas = [('twin-cities', REGION)] + [(c['slug'], report_name(c)) for c in communities if c['slug'] not in skip]

    # Which months: the newest available (read from the region's report), or the one asked for.
    first = fetch(REGION, args.get('month'))
    if not first:
        sys.exit('Could not read the region report; nothing changed.')
    months = [first['month']]
    if first['month'] in store['months'] and 'backfill' not in args and 'month' not in args:
        print(f'No new report yet: {first["month"]} is already on the site.')
        return
    for _ in range(int(args.get('backfill', 1)) - 1):
        months.append(prev_month(months[-1]))

    no_report = set()
    for month in months:
        got = store['months'].setdefault(month, {'asOf': None, 'areas': {}})
        for i, (slug, name) in enumerate(areas):
            r = first if (slug == 'twin-cities' and month == first['month']) else fetch(name, month)
            time.sleep(0.25)  # be polite to the report server
            if not r or r['month'] != month:
                no_report.add(slug)
                continue
            got['asOf'] = got['asOf'] or r['asOf']
            got['areas'][slug] = {'name': name, 'url': r['url'], **r['data']}
        print(f'{month}: {len(got["areas"])} areas (as of {got["asOf"]})')

    store['latest'] = max(store['months'])
    # Communities that never had a report (outside the region) are remembered so later runs skip them.
    store['noReport'] = sorted(no_report - {s for m in store['months'].values() for s in m['areas']})
    store['months'] = dict(sorted(store['months'].items(), reverse=True))
    OUT.write_text(json.dumps(store, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(f'latest {store["latest"]}; no report for: {", ".join(store["noReport"]) or "none"}')


if __name__ == '__main__':
    a = sys.argv[1:]
    main({a[i].lstrip('-'): a[i + 1] for i in range(0, len(a) - 1, 2)})
