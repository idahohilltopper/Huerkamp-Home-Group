"""One-time import of the blog posts that only exist on the Luxury Presence site (huerkamphomes.com).

That site shuts down in December 2026. Posts that were also on the Squarespace blog were already imported
(scripts/import-squarespace-blog.py); this copies the rest, mostly the team's local Twin Cities stories.

Input: each post page saved as <slug>.html in one folder, e.g.
    curl -s https://huerkamphomes.com/blog/<slug> > posts/<slug>.html
Usage:
    python3 scripts/import-luxury-presence-blog.py posts/
    python3 scripts/make-blog-thumbs.py
    python3 scripts/build-lp-redirects.py <LP sitemaps>  &&  node scripts/write-redirects.mjs
Needs beautifulsoup4, markdownify and Pillow.

Each post keeps its old address (/blog/<slug>), so old links only need the domain changed. Text is kept as
written. Images are downloaded from Luxury Presence's CDN (which goes away with the account) and saved as WebP.
"""
import importlib.util
import json
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from html import unescape
from pathlib import Path

from bs4 import BeautifulSoup
from markdownify import markdownify

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('sqs', ROOT / 'scripts/import-squarespace-blog.py')
sqs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sqs)
CONTENT, PUBLIC = sqs.CONTENT, sqs.PUBLIC
LP = ('https://huerkamphomes.com', 'https://www.huerkamphomes.com', 'http://huerkamphomes.com')
LP_LINKS = {r['from']: r['to'] for r in json.loads((ROOT / 'redirects-lp.json').read_text()) if '*' not in r['from']}
COMMUNITIES = [c['name'] for c in json.loads((ROOT / 'src/data/communities.json').read_text())['communities']]
# "St. Paul" also matches "Saint Paul" and "St Paul".
PLACE_PATTERNS = [(c, r'\b' + re.escape(c).replace(r'St\.', r'(St\.?|Saint)') + r'\b') for c in COMMUNITIES]

# Categories already used on the blog, picked from words in the title. Local stories get "Neighborhoods".
CATEGORIES = [
    ('Seller', r'\b(sell|sellers?|selling|sale|listing|list with|fsbo|appraisal)'),
    ('Buyer', r'\b(buy|buyers?|buying|mortgage|offer|down payment|earnest|closing costs|first-time|lenders?|credit score|grants)'),
    ('Homeowner', r'\b(homeowners?|maintenance|remodel|renovat|bathroom|yard|declutter|gallery wall|haunted|appliances|hvac|foundation|improvement)'),
    ('Empty Nester', r'\b(empty nesters?|downsiz)'),
    ('Military', r'\bmilitary\b'),
    ('Renter', r'\brenters?\b'),
]
BLOCK = {'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'blockquote', 'table', 'figure', 'hr', 'div'}


def cf_email(hexed):
    """Cloudflare hides email addresses on the old site; this undoes it."""
    k = int(hexed[:2], 16)
    return ''.join(chr(int(hexed[i:i + 2], 16) ^ k) for i in range(2, len(hexed), 2))


def fix_link(href):
    href = href.strip()
    if '/cdn-cgi/l/email-protection#' in href:
        return 'mailto:' + cf_email(href.split('#', 1)[1])
    for host in LP:
        if href.startswith(host):
            path = href[len(host):].split('?')[0].rstrip('/') or '/'
            href = LP_LINKS.get(path, path)
            if href.startswith('https://www.huerkamphomegroup.com'):
                href = href[len('https://www.huerkamphomegroup.com'):] or '/'
    return sqs.fix_link(href)


def categories(title, places):
    found = [name for name, pat in CATEGORIES if re.search(pat, title, re.I)]
    if places:
        found.append('Neighborhoods')
    return found or ['General']


def convert(body, title, slug, jobs):
    """Post body HTML -> Markdown. Handles both the new plain posts and the old Squarespace-style ones."""
    n_img, raw = 0, {}
    for s in body.select('.socials, script, style, form'):
        s.decompose()
    for img in body.find_all('img'):
        src = img.get('data-src') or img.get('src')
        if not src or src.startswith('data:'):
            img.decompose()
            continue
        n_img += 1
        dest = PUBLIC / slug / f'{n_img}.webp'
        jobs.append((src, dest, sqs.BODY_MAX))
        key = f'RAWBLOCK{len(raw)}X'
        raw[key] = (f'<figure class="post-figure"><img src="/blog/{slug}/{n_img}.webp" alt="{img.get("alt", "")}" '
                    f'loading="lazy" decoding="async" data-size="{dest}" /></figure>')
        block = img.find_parent(class_='sqs-block') or img
        block.replace_with(BeautifulSoup(f'<p>{key}</p>', 'html.parser'))
    for hr in body.select('.sqs-block-horizontalrule'):
        hr.replace_with(BeautifulSoup('<hr>', 'html.parser'))
    # Squarespace-style text sits in <div>s; a div with only inline content is a paragraph.
    for d in body.find_all('div'):
        if not any(c.name in BLOCK for c in d.find_all(recursive=False)):
            d.name = 'p'
    for d in body.find_all('div'):
        d.unwrap()
    for p in body.find_all('p'):
        if not p.get_text(strip=True) and not p.find(['img', 'a']):
            p.decompose()
    for a in body.select('a[href*="email-protection"]'):
        a.string = fix_link(a['href'])[len('mailto:'):]
    for t in body.find_all(True):
        if t.name == 'a' and t.get('href'):
            t.attrs = {'href': fix_link(t['href'])}
        else:
            t.attrs = {}
    first_h = body.find(['h1', 'h2'])
    if first_h and sqs.slugify(first_h.get_text()) == sqs.slugify(title):
        first_h.decompose()
    for h in body.find_all('h1'):
        h.name = 'h2'
    text = sqs.text_of(str(body))
    md = markdownify(str(body), heading_style='ATX', bullets='-', escape_underscores=False, escape_misc=False)
    md = re.sub(r'[ \t]+\n', '\n', md)
    md = re.sub(r'\n{3,}', '\n\n', md).strip()
    for key, block in raw.items():
        md = md.replace(key, block)
    return md, text


def main(src):
    posts, jobs = [], []
    existing = {sqs.slugify(re.search(r'^title: (.*)$', t, re.M)[1].strip('"'))
                for t in (f.read_text() for f in CONTENT.glob('*.md')) if 'importedFrom: luxurypresence' not in t}
    for f in sorted(Path(src).glob('*.html')):
        slug = f.stem
        page = f.read_text()
        soup = BeautifulSoup(page, 'html.parser')
        ld = next(x for x in (json.loads(m) for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page, re.S))
                  if x.get('@type') == 'BlogPosting')
        if not ld['mainEntityOfPage']['@id'].endswith(f'/blog/{slug}'):
            continue
        title = unescape(soup.find('h1').get_text(' ', strip=True))
        if sqs.slugify(title) in existing:
            print('skip, already on the blog:', title)
            continue
        boxes = soup.select('.intro-box')
        body = max(boxes, key=lambda b: len(b.get_text()))
        md, text = convert(body, title, slug, jobs)
        cover = None
        if ld.get('image', {}).get('url'):
            cover = PUBLIC / slug / 'cover.webp'
            jobs.append((ld['image']['url'], cover, sqs.COVER_MAX))
        meta = soup.find('meta', attrs={'name': 'description'})
        description = unescape(meta['content']).strip() if meta and meta.get('content') else sqs.describe({}, text)
        places = [c for c, pat in PLACE_PATTERNS if re.search(pat, f'{title} {description} {text[:600]}')]
        author = (ld.get('author') or {}).get('name') or 'Huerkamp Home Group'
        posts.append(dict(slug=slug, title=title, description=description, date=ld['datePublished'][:10],
                          author=author, categories=categories(title, places), md=md, cover=cover))

    print(f'{len(posts)} posts, {len(jobs)} images to fetch')
    with ThreadPoolExecutor(8) as pool:
        sizes = dict(zip((str(j[1]) for j in jobs), pool.map(sqs.save_image, jobs)))

    for p in posts:
        md = re.sub(r'data-size="([^"]+)"', lambda m: 'width="%d" height="%d"' % sizes[m.group(1)], p['md'])
        fm = [
            '---',
            f'title: {sqs.yaml_str(p["title"])}',
            f'description: {sqs.yaml_str(p["description"])}',
            f'path: {sqs.yaml_str(p["slug"])}',
            f'date: {p["date"]}',
            f'author: {sqs.yaml_str(p["author"])}',
            f'categories: {json.dumps(p["categories"])}',
            'tags: []',
        ]
        if p['cover']:
            w, h = sizes[str(p['cover'])]
            fm.append(f'cover: {{ src: "/blog/{p["slug"]}/cover.webp", width: {w}, height: {h} }}')
        fm += ['importedFrom: luxurypresence', '---', '']
        (CONTENT / f'{p["slug"]}.md').write_text('\n'.join(fm) + md + '\n')
    print('done')


if __name__ == '__main__':
    main(sys.argv[1])
