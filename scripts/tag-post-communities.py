"""Add `communities:` to blog posts: the community guides (src/data/communities.json slugs) a post is about.

A post tagged with a community appears under "Local stories" on that community's page, and the post links
back to the guide. Towns are taken from the title, or else the description, or else (local stories only)
the opening paragraphs. A tag already set by hand is never changed.
Usage:  python3 scripts/tag-post-communities.py          (only posts without `communities:`)
        python3 scripts/tag-post-communities.py --dry    (show what would change)
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'src/content/blog'
COMMUNITIES = json.loads((ROOT / 'src/data/communities.json').read_text())['communities']
# Names that are also common words or other places: only count them as "Hugo, MN" or "Hugo, Minnesota".
AMBIGUOUS = {'ramsey', 'grant', 'independence', 'columbus', 'lexington', 'mendota', 'hilltop', 'woodland', 'empire',
             'dayton', 'victoria', 'hanover', 'greenwood', 'medina', 'hugo', 'landfall', 'coates', 'vermillion', 'nowthen',
             'carver', 'bethel', 'hampton', 'anoka', 'afton', 'randolph', 'greenfield', 'scandia', 'mayer', 'cologne'}
# Places and roads named after a city that are not in it.
NOT_THE_CITY = re.compile(r'lake minnetonka|excelsior (boulevard|blvd)|minneapolis-saint paul|minneapolis/saint paul|'
                          r'twin cities|saint paul public schools|minneapolis public schools', re.I)


def norm(s):
    return re.sub(r'\bst\.?\s', 'saint ', s.lower().replace('’', "'"))


PATTERNS = []
for c in sorted(COMMUNITIES, key=lambda c: -len(c['name'])):  # longest first: "West Saint Paul" before "Saint Paul"
    name = re.escape(norm(c['name']))
    pat = rf"\b{name},? (mn|minnesota)\b" if norm(c['name']) in AMBIGUOUS else rf"\b{name}\b"
    PATTERNS.append((c['slug'], re.compile(pat)))


def places(text):
    text = NOT_THE_CITY.sub(' ', norm(text))
    found = []
    for slug, pat in PATTERNS:
        if pat.search(text):
            found.append(slug)
            text = pat.sub(' ', text)  # so "West Saint Paul" isn't also counted as "Saint Paul"
    return found


def main(dry):
    changed = 0
    for f in sorted(CONTENT.glob('*.md')):
        s = f.read_text()
        fm, _, body = s.partition('\n---\n')
        if re.search(r'^communities:', fm, re.M):
            continue
        title = re.search(r'^title: "(.*)"$', fm, re.M)[1]
        desc = (re.search(r'^description: "(.*)"$', fm, re.M) or [None, ''])[1]
        local = 'categories: ["Neighborhoods"' in fm or '"Neighborhoods"]' in fm
        # The town in the title is what the post is about; other towns are often only mentioned for comparison.
        intro = re.sub(r'<[^>]+>|\(http[^)]*\)', ' ', body[:1500]) if local else ''
        found = places(title) or places(desc) or places(intro)
        if not found:
            continue
        changed += 1
        print(f'{f.stem[:70]:72} {found}')
        if not dry:
            f.write_text(re.sub(r'^(categories: .*)$', lambda m: m[1] + f'\ncommunities: {json.dumps(found)}', s, count=1, flags=re.M))
    print(f'{changed} posts tagged' + (' (dry run)' if dry else ''))


if __name__ == '__main__':
    main('--dry' in sys.argv)
