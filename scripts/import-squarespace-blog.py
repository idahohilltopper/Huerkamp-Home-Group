"""One-time import of the old Squarespace blog into src/content/blog/.

Input: the blog's JSON feed saved to one file, e.g.
    curl 'https://www.huerkamphomegroup.com/blog?format=json'   (then follow pagination.nextPageUrl)
    -> a JSON list of every item
Usage:
    python3 scripts/import-squarespace-blog.py all.json
Needs beautifulsoup4, markdownify and Pillow.

Each post keeps its exact old address (/blog/2022/10/27/slug) in the `path` field, so Google
rankings and old links carry over. Images are downloaded from Squarespace's CDN (which goes away
with the Squarespace account), resized and saved as WebP under public/blog/<slug>/.
"""
import io
import json
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html import unescape
from pathlib import Path

from bs4 import BeautifulSoup
from markdownify import markdownify
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'src/content/blog'
PUBLIC = ROOT / 'public/blog'
SITE = 'https://www.huerkamphomegroup.com'
BODY_MAX, COVER_MAX = 800, 1200

# Old-site pages that moved; same list the hosting redirects use, plus a few the redirects don't cover.
LINK_MAP = {r['from']: r['to'] for r in json.loads((ROOT / 'redirects.json').read_text())}
LINK_MAP.update({'/financing-1': '/buy', '/home-valuation-1': '/sell#value'})
SKIP_TAGS = {'fade-blog-header-image'}


def slugify(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def fix_link(href):
    href = href.strip()
    if href.startswith(SITE):
        href = href[len(SITE):] or '/'
    if href.startswith('http://www.huerkamphomegroup.com'):
        href = href[len('http://www.huerkamphomegroup.com'):] or '/'
    path, _, frag = href.partition('#')
    if path in LINK_MAP:
        href = LINK_MAP[path] + (('#' + frag) if frag and '#' not in LINK_MAP[path] else '')
    return href


def fetch(url):
    out = subprocess.run(['curl', '-sS', '-f', '-m', '60', '--retry', '3', url], capture_output=True)
    if out.returncode:
        raise RuntimeError(f'{url}: {out.stderr.decode()[:200]}')
    return out.stdout


def save_image(job):
    url, dest, max_w = job
    if dest.exists():
        im = Image.open(dest)
        return im.size
    sized = url + ('&' if '?' in url else '?') + ('format=1500w' if max_w > 1000 else 'format=1000w')
    try:
        data = fetch(sized) if 'squarespace-cdn.com' in url else fetch(url)
    except RuntimeError:
        data = fetch(url)
    im = Image.open(io.BytesIO(data))
    im.load()
    im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, 'WEBP', quality=70, method=5)
    return im.size


def text_of(html):
    return re.sub(r'\s+', ' ', unescape(BeautifulSoup(html or '', 'html.parser').get_text(' '))).strip()


def describe(item, body_text):
    text = text_of(item.get('excerpt')) or body_text
    if len(text) <= 160:
        return text
    cut = text[:157].rsplit(' ', 1)[0].rstrip(',;:')
    return cut + '…'


def convert(item, slug, jobs):
    soup = BeautifulSoup(item['body'], 'html.parser')
    parts, raw = [], {}
    n_img = 0

    def keep_raw(html):
        key = f'RAWBLOCK{len(raw)}X'
        raw[key] = html
        return f'<p>{key}</p>'

    def image(img_url, link=None):
        nonlocal n_img
        n_img += 1
        dest = PUBLIC / slug / f'{n_img}.webp'
        jobs.append((img_url, dest, BODY_MAX))
        tag = f'<img src="/blog/{slug}/{n_img}.webp" alt="" loading="lazy" decoding="async" data-size="{dest}" />'
        if link:
            tag = f'<a href="{fix_link(link)}">{tag}</a>'
        return keep_raw(f'<figure class="post-figure">{tag}</figure>')

    blocks = [b for b in soup.select('.sqs-block') if not b.find_parent(class_='sqs-block')]
    for b in blocks:
        classes = b.get('class', [])
        definition = b.get('data-definition-name', '')
        if 'html-block' in classes:
            content = b.select_one('.sqs-html-content') or b
            for p in content.find_all('p'):
                if not p.get_text(strip=True) and not p.find(['img', 'a']):
                    p.decompose()
            parts.append(content.decode_contents())
        elif 'image-block' in classes or 'gallery-block' in classes:
            for img in b.find_all('img'):
                src = img.get('data-src') or img.get('data-image') or img.get('src')
                if not src or src.startswith('data:'):
                    continue
                a = img.find_parent('a', href=True)
                parts.append(image(src, a['href'] if a else None))
        elif definition.endswith('.video'):
            wrapper = b.select_one('[data-html]')
            m = re.search(r'src="([^"]+)"', unescape(wrapper['data-html'])) if wrapper else None
            if m:
                parts.append(keep_raw(
                    f'<div class="post-embed"><iframe src="{m.group(1)}" title="Video" loading="lazy" '
                    'allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>'))
        elif definition.endswith('.code'):
            table = b.find('table')
            if table:
                for t in table.find_all(True):
                    t.attrs = {}
                parts.append(str(table))
        elif definition.endswith('.button'):
            a = b.find('a', href=True)
            if a:
                parts.append(f'<p><a href="{a["href"]}">{a.get_text(strip=True)}</a></p>')
        elif definition.endswith('.horizontalrule'):
            parts.append('<hr>')
        # spacer, social links, forms, newsletter and map blocks are dropped: the new post
        # template has its own contact form and links.

    html = BeautifulSoup('\n'.join(parts), 'html.parser')
    for t in html.find_all(True):
        if t.name == 'a' and t.get('href'):
            t.attrs = {'href': fix_link(t['href'])}
        elif t.name not in ('img',):
            t.attrs = {}
    # A post's own title repeated as a heading inside the body becomes redundant next to the page title.
    first_h = html.find(['h1', 'h2'])
    if first_h and slugify(first_h.get_text()) == slugify(item['title']):
        first_h.decompose()
    for h in html.find_all('h1'):
        h.name = 'h2'

    body_text = text_of(str(html))
    md = markdownify(str(html), heading_style='ATX', bullets='-', escape_underscores=False, escape_misc=False)
    md = re.sub(r'\n{3,}', '\n\n', md).strip()
    for key, block in raw.items():
        md = md.replace(key, block)
    return md, body_text


def yaml_str(s):
    return json.dumps(s, ensure_ascii=False)


def main(src):
    items = json.loads(Path(src).read_text())
    CONTENT.mkdir(parents=True, exist_ok=True)
    seen, posts, jobs = set(), [], []
    for item in items:
        path = item['fullUrl'].removeprefix('/blog/')
        slug = slugify(path.split('/')[-1])[:80] or slugify(item['title'])[:80]
        while slug in seen:
            slug += '-2'
        seen.add(slug)
        md, body_text = convert(item, slug, jobs)
        cover = None
        if item.get('assetUrl'):
            cover = PUBLIC / slug / 'cover.webp'
            jobs.append((item['assetUrl'], cover, COVER_MAX))
        posts.append((item, slug, path, md, body_text, cover))

    print(f'{len(posts)} posts, {len(jobs)} images to fetch')
    with ThreadPoolExecutor(8) as pool:
        sizes = dict(zip((str(j[1]) for j in jobs), pool.map(save_image, jobs)))

    for item, slug, path, md, body_text, cover in posts:
        def sized(m):
            w, h = sizes[m.group(1)]
            return f'width="{w}" height="{h}"'
        md = re.sub(r'data-size="([^"]+)"', sized, md)
        date = datetime.fromtimestamp(int(item['publishOn']) / 1000, timezone.utc)
        updated = datetime.fromtimestamp(int(item['updatedOn']) / 1000, timezone.utc)
        author = 'Jason Huerkamp' if item['author'].get('displayName') == 'Jason Huerkamp' else 'Huerkamp Home Group'
        fm = [
            '---',
            f'title: {yaml_str(unescape(item["title"]).strip())}',
            f'description: {yaml_str(describe(item, body_text))}',
            f'path: {yaml_str(path)}',
            f'date: {date.strftime("%Y-%m-%d")}',
            f'updated: {updated.strftime("%Y-%m-%d")}',
            f'author: {yaml_str(author)}',
            f'categories: {json.dumps(item.get("categories") or [], ensure_ascii=False)}',
            f'tags: {json.dumps([t for t in item.get("tags") or [] if t not in SKIP_TAGS], ensure_ascii=False)}',
        ]
        if cover:
            w, h = sizes[str(cover)]
            fm.append(f'cover: {{ src: "/blog/{slug}/cover.webp", width: {w}, height: {h} }}')
        fm += ['importedFrom: squarespace', '---', '']
        (CONTENT / f'{slug}.md').write_text('\n'.join(fm) + md + '\n')
    print('done')


if __name__ == '__main__':
    main(sys.argv[1])
