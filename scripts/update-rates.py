"""Refreshes the public numbers the calculators and the data page use:

  src/data/rates.json  Freddie Mac Primary Mortgage Market Survey (PMMS), weekly 30- and 15-year fixed averages
  src/data/hpi.json    FHFA House Price Index (all-transactions, quarterly) for the Minneapolis-St. Paul metro

Both are free public downloads; no key needed. Freddie Mac publishes every Thursday, FHFA each quarter.
Usage: python3 scripts/update-rates.py
"""
import csv
import io
import json
import urllib.request
from datetime import datetime

PMMS = 'https://www.freddiemac.com/pmms/docs/PMMS_history.csv'
HPI = 'https://www.fhfa.gov/hpi/download/quarterly_datasets/hpi_at_metro.csv'
MSA = '33460'  # Minneapolis-St. Paul-Bloomington, MN-WI


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (huerkamphomegroup.com data refresh)'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read().decode('utf-8', 'replace')


# ---------- mortgage rates ----------
weeks = []
for row in csv.DictReader(io.StringIO(get(PMMS))):
    d = datetime.strptime(row['date'], '%m/%d/%Y').date()
    if row['pmms30'].strip():
        weeks.append({'date': d.isoformat(), 'rate30': float(row['pmms30']),
                      'rate15': float(row['pmms15']) if row['pmms15'].strip() else None})
latest = weeks[-1]
rates = {
    'source': 'Freddie Mac Primary Mortgage Market Survey (PMMS), weekly national averages',
    'url': 'https://www.freddiemac.com/pmms',
    'latest': latest,
    # One point per month (last survey of each month) since 2000, for the data page chart.
    'monthly': [w for i, w in enumerate(weeks) if w['date'] >= '2000-01-01' and (i + 1 == len(weeks) or weeks[i + 1]['date'][:7] != w['date'][:7])],
}
json.dump(rates, open('src/data/rates.json', 'w'), indent=1)
print('PMMS', latest)

# ---------- home price index ----------
rows = [r for r in csv.reader(io.StringIO(get(HPI))) if len(r) >= 5 and r[1].strip() == MSA]
series = [{'q': f'{r[2]}-Q{r[3]}', 'index': float(r[4])} for r in rows if r[4].strip() not in ('', '-', '.')]
last = series[-1]


def back(years):
    y, q = int(last['q'][:4]) - years, last['q'][-2:]
    old = next((s for s in series if s['q'] == f'{y}-{q}'), None)
    return round(((last['index'] / old['index']) ** (1 / years) - 1) * 100, 1) if old else None


hpi = {
    'source': 'Federal Housing Finance Agency (FHFA) House Price Index, all-transactions, not seasonally adjusted',
    'area': 'Minneapolis-St. Paul-Bloomington, MN-WI metro area',
    'url': 'https://www.fhfa.gov/data/hpi',
    'latest': last,
    'yearOverYear': round((last['index'] / series[-5]['index'] - 1) * 100, 1),
    'annualized': {'5': back(5), '10': back(10), '20': back(20), '30': back(30)},
    'quarterly': [s for s in series if s['q'] >= '1990'],
}
json.dump(hpi, open('src/data/hpi.json', 'w'), indent=1)
print('HPI', last, hpi['yearOverYear'], hpi['annualized'])
