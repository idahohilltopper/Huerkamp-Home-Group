#!/usr/bin/env python3
"""Blog cover photos from Wikimedia Commons, with the credit the license asks for.

  python3 scripts/commons-cover.py search "Lake Minnetonka"          # list freely licensed photos (title, size, license, author)
  python3 scripts/commons-cover.py use <post-slug> "File:Name.jpg"    # download, save public/blog/<slug>/cover.webp (1200 wide),
                                                                      # and print the cover: line for the post's frontmatter

Only public domain, CC0, CC BY and CC BY-SA photos are accepted. The credit (author, license, link to the file page) goes
in the post's cover.credit and shows under the photo (src/pages/blog/...). Then run scripts/make-blog-thumbs.py.
"""
import io, json, re, sys, time, urllib.error, urllib.parse, urllib.request
from html import unescape
from pathlib import Path

API = 'https://commons.wikimedia.org/w/api.php'
UA = {'User-Agent': 'HHG-site-builder/1.0 (https://www.huerkamphomes.com; blog cover photos)'}
OK = re.compile(r'^(public domain|pd\b|cc0|cc by(-sa)? ?\d)', re.I)


def fetch(url, tries=6):
    # Commons asks automated clients to slow down (HTTP 429): wait as told, then try again.
    for n in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or n == tries - 1:
                raise
            time.sleep(int(e.headers.get('Retry-After') or 0) or 10 * (n + 1))


def get(params):
    q = urllib.parse.urlencode({**params, 'format': 'json'})
    return json.loads(fetch(f'{API}?{q}'))


def text(html):
    return re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', '', html or ''))).strip()


def info(titles):
    d = get({'action': 'query', 'titles': '|'.join(titles), 'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata|mime', 'iiurlwidth': 1600})
    out = []
    for p in d['query']['pages'].values():
        ii = (p.get('imageinfo') or [{}])[0]
        m = ii.get('extmetadata', {})
        lic = text(m.get('LicenseShortName', {}).get('value'))
        out.append({'title': p['title'], 'w': ii.get('width'), 'h': ii.get('height'), 'mime': ii.get('mime'), 'license': lic,
                    'licenseUrl': m.get('LicenseUrl', {}).get('value', ''), 'author': text(m.get('Artist', {}).get('value'))[:80],
                    'page': ii.get('descriptionurl'), 'thumb': ii.get('thumburl'), 'ok': bool(OK.match(lic))})
    return out


def search(q):
    d = get({'action': 'query', 'list': 'search', 'srnamespace': 6, 'srsearch': q, 'srlimit': 30})
    titles = [r['title'] for r in d['query']['search'] if re.search(r'\.(jpe?g|png|webp)$', r['title'], re.I)]
    for i in info(titles[:30]) if titles else []:
        if i['ok'] and i['mime'] in ('image/jpeg', 'image/png', 'image/webp') and (i['w'] or 0) >= 1000 and i['w'] > (i['h'] or 0):
            print(f"{i['title']} | {i['w']}x{i['h']} | {i['license']} | {i['author']}")


def use(slug, title):
    from PIL import Image
    i = info([title])[0]
    if not i['ok']:
        sys.exit(f"License not accepted: {i['license']}")
    img = Image.open(io.BytesIO(fetch(i['thumb']))).convert('RGB')
    w = 1200
    h = round(img.height * w / img.width)
    img = img.resize((w, h), Image.LANCZOS)
    out = Path('public/blog') / slug
    out.mkdir(parents=True, exist_ok=True)
    img.save(out / 'cover.webp', 'WEBP', quality=80)
    credit = f"Photo: {i['author'] or 'Wikimedia Commons'}, {i['license']}, via Wikimedia Commons"
    print(json.dumps({'src': f'/blog/{slug}/cover.webp', 'width': w, 'height': h, 'credit': credit, 'creditUrl': i['page']}))


if __name__ == '__main__':
    if sys.argv[1] == 'search':
        search(' '.join(sys.argv[2:]))
    else:
        use(sys.argv[2], sys.argv[3])
