"""Build redirects-lp.json: every address on the old Luxury Presence site (huerkamphomes.com) -> its page here.

The Luxury Presence site shuts down in December. Once huerkamphomes.com points at this site (Netlify domain
alias), these rules send each old address to the matching new page, so links in YouTube descriptions,
Google and old emails keep working.

Inputs: the Luxury Presence sitemaps, saved outside the repo:
  curl -s https://huerkamphomes.com/sitemap-static.xml          > lp/static.xml
  curl -s https://huerkamphomes.com/sitemap-blog-dpages.xml     > lp/blog-dpages.xml
  curl -s https://huerkamphomes.com/sitemap-neighborhoods-dpages.xml > lp/neighborhoods-dpages.xml
  and each blog post page saved as lp/posts/<slug>.html (used to match posts that changed address but kept their title)
Usage:
  python3 scripts/build-lp-redirects.py lp/   then   node scripts/write-redirects.mjs
"""
import json
import re
import sys
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEARCH = 'https://search.huerkamphomegroup.com'

# Old static pages -> new pages. Webinar pages on the old site were the same contact form as /youtube-form.
STATIC = {
    '/': '/', '/blog': '/blog', '/careers': '/team#careers', '/cash-offer': '/sell#cash',
    '/communities': '/communities', '/contact': '/contact', '/financing': '/buy', '/home-valuation': '/sell#value',
    '/html-sitemap': '/', '/lakeville': '/communities/lakeville', '/our-guarantees': '/sell',
    '/properties/sale': f'{SEARCH}/search?s[featured]=t', '/properties/sold': '/reviews', '/team': '/team',
    '/testimonials': '/reviews', '/why-list-with-us': '/sell', '/home-search/listings': f'{SEARCH}/search',
    '/youtube-form': '/youtube-form', '/webinar': '/youtube-form', '/webinarsignup': '/youtube-form',
    '/webinar-register': '/youtube-form', '/buy': '/buy', '/sell': '/sell',
}
# Whole sections, after the exact pages above. Listing pages change daily, so they go to live search.
SECTIONS = [
    ('/agent/*', '/team'),
    ('/properties/*', f'{SEARCH}/search'),
    ('/home-search/*', f'{SEARCH}/search'),
    ('/neighborhoods/*', '/communities'),
    ('/blog/*', '/blog'),
]


def key(title):
    return re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')


def locs(path):
    return [re.sub(r'^https?://[^/]+', '', u).rstrip('/') or '/' for u in re.findall(r'<loc>([^<]+)', path.read_text())]


def main(lp_dir):
    lp = Path(lp_dir)
    rules = dict(STATIC)

    communities = {c['slug'] for c in json.loads((ROOT / 'src/data/communities.json').read_text())['communities']}
    for p in locs(lp / 'neighborhoods-dpages.xml'):
        slug = p.rsplit('/', 1)[1].replace('saint-', 'st-')
        slug = slug if slug in communities else p.rsplit('/', 1)[1]
        if slug in communities:
            rules[p] = f'/communities/{slug}'

    # Old blog posts -> the same post here, matched by address, or else by title.
    posts, titles = {}, {}
    for md in (ROOT / 'src/content/blog').glob('*.md'):
        text = md.read_text()
        m = re.search(r'^path:\s*"([^"]+)"', text, re.M)
        t = re.search(r'^title:\s*"(.*)"$', text, re.M)
        if m:
            posts[m[1].rsplit('/', 1)[-1]] = f'/blog/{m[1]}'
            if t:
                titles[key(json.loads(f'"{t[1]}"'))] = f'/blog/{m[1]}'
    unmatched = []
    for p in locs(lp / 'blog-dpages.xml'):
        slug = p.rsplit('/', 1)[1]
        saved = lp / 'posts' / f'{slug}.html'
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', saved.read_text(), re.S) if saved.exists() else None
        if slug in posts:
            rules[p] = posts[slug]
        elif h1 and key(unescape(re.sub(r'<[^>]+>', '', h1[1]))) in titles:
            rules[p] = titles[key(unescape(re.sub(r'<[^>]+>', '', h1[1])))]
        else:
            unmatched.append(p)

    out = [{'from': k, 'to': v} for k, v in rules.items()] + [{'from': k, 'to': v} for k, v in SECTIONS]
    (ROOT / 'redirects-lp.json').write_text(json.dumps(out, indent=1) + '\n')
    print(f'{len(out)} huerkamphomes.com rules -> redirects-lp.json; {len(unmatched)} old blog posts have no match here (sent to /blog)')


if __name__ == '__main__':
    main(sys.argv[1])
