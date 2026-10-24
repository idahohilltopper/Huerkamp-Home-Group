"""Add the channel's newest videos to src/data/youtube.json from YouTube's public feed.

The feed lists the latest 15 uploads with title, full description, upload date, view count and whether
each one is a Short. New long videos with a description get their own watch page automatically.
Runs weekly (see docs/site-plan.md); safe to run any time:  python3 scripts/update-youtube.py
"""
import importlib.util
import json
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('build', ROOT / 'scripts/build-youtube.py')
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)

NS = {'a': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015', 'media': 'http://search.yahoo.com/mrss/'}


def feed(channel_id):
    url = f'https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}'
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'HHG-website-updater'}), timeout=30) as r:
        root = ET.fromstring(r.read())
    for e in root.findall('a:entry', NS):
        g = e.find('media:group', NS)
        stats = g.find('media:community/media:statistics', NS)
        yield {
            'id': e.find('yt:videoId', NS).text,
            'title': e.find('a:title', NS).text or '',
            'published': e.find('a:published', NS).text.replace('+00:00', 'Z'),
            'description': g.find('media:description', NS).text or '',
            'views': int(stats.attrib['views']) if stats is not None else None,
            'kind': 'short' if '/shorts/' in e.find('a:link', NS).attrib['href'] else 'long',
        }


def main():
    path = build.OUT
    data = json.loads(path.read_text())
    videos = data['videos']
    by_id = {v['id']: v for v in videos}
    slugs = {v['slug'] for v in videos if v.get('slug')}
    added, updated = [], 0
    for f in feed(data['channel']['id']):
        summary, chapters = build.clean(f['description'])
        title = build.re.sub(r'\s*#[\w-]+', '', f['title']).strip()
        v = by_id.get(f['id'])
        if v is None:
            v = {'id': f['id'], 'kind': f['kind'], 'title': title, 'published': f['published'], 'seconds': None,
                 'views': f['views'], 'summary': summary, 'chapters': chapters, 'topic': build.topic(title, ' '.join(summary)), 'order': -1}
            added.append(v)
        else:
            v['views'] = f['views'] or v.get('views')
            if not v.get('summary') and summary:
                v.update(summary=summary, chapters=chapters, published=v.get('published') or f['published'])
            updated += 1
        if v['kind'] == 'long' and v['summary'] and v['published'] and not v.get('slug'):
            slug = build.slugify(v['title'])
            while slug in slugs:
                slug += '-2'
            slugs.add(slug)
            v['slug'] = slug
    # Newest first: the feed is newest first, so new videos go to the top in feed order.
    videos[:0] = added
    for kind in ('long', 'short'):
        for i, v in enumerate(x for x in videos if x['kind'] == kind):
            v['order'] = i
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
    print(f'{len(added)} new videos added, {updated} refreshed; {sum(1 for v in videos if v.get("slug"))} watch pages')
    for v in added:
        print(f'  + [{v["kind"]}] {v["title"]}')


if __name__ == '__main__':
    main()
