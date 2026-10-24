"""Build src/data/youtube.json from the team's YouTube channel, Living in Minneapolis Minnesota
(@livinginminneapolis, channel UCQrRaA9zK3E-NhBLgXVSGhg).

Inputs (saved outside the repo):
  videos.json, shorts.json  channel lists from:  yt-dlp --flat-playlist --dump-single-json <channel>/videos (and /shorts)
  details.json              {videoId: {...}} with title, publishedAt, description, duration (ISO 8601), viewCount, tags,
                            e.g. from the vidIQ get_videos_by_ids tool or the YouTube Data API videos.list
Usage:
  python3 scripts/build-youtube.py videos.json shorts.json details.json

Videos with details get a summary (the video-specific part of the description, without the contact
and subscribe text repeated on every video), chapters, and their own watch page on the site.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/data/youtube.json'
CHANNEL = {'id': 'UCQrRaA9zK3E-NhBLgXVSGhg', 'handle': '@livinginminneapolis', 'title': 'Living in Minneapolis Minnesota',
           'url': 'https://www.youtube.com/@livinginminneapolis'}

# Lines that appear on every video (contact details, subscribe pitch, license block, link lists).
BOILER = re.compile(
    r'(https?://|www\.|@|☎|📨|🌐|📱|📋|📩|📍|🚨|👇|🔗|▶|call/text|call or text|email:|instagram|app store|licensed since|license number|'
    r'keller williams preferred realty \d|brokered by|subscribe|thinking (about|of) (buying|moving)|living in minneapolis, minnesota \(|'
    r'if you are considering buying|call, text, or email|reach out day|video suggestion|learn more about the twin cities|find us on google|'
    r"don.t forget to like|jason & brooke huerkamp, licensed|^jason huerkamp$|we.d love to help|^#|webinar|goes here\]|go here\]|"
    r"about this channel|welcome to living in minneapolis|comment \"|dm me|follow (for|along)|hit share|drop (it|your|a|their)|"
    r"full (video|breakdown|guide|tour)[^.]*(on|here|channel)|watch (the )?full|connect with (us|me)|ready to stop waiting|get your home value|"
    r"please (watch|follow)|real estate needs in the twin cities|all stats, data|^\*|fill out (the|this) form|thinking of (selling|buying|retiring)|"
    r"^(the )?(huerkamp home group,? (of )?)?keller williams preferred realty$|^jason huerkamp & brooke huerkamp$|licensed since|licensed in minnesota|brought to you by|on (the|our|my) (youtube )?channel|"
    r"\d{3}[-. ]\d{3}[-. ]\d{4})", re.I)
# Sentences inside a kept paragraph that are calls to action, not content.
CTA = re.compile(r"(\bcomment\b.*\b(below|and i|and we)|\bdm me\b|\bsubscribe\b|\d{3}[-. ]\d{3}[-. ]\d{4}|this is the channel you need)", re.I)
CHAPTER = re.compile(r'^\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—:]?\s*(.+)$')


def iso_seconds(d):
    m = re.fullmatch(r'P(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', d or '')
    return (int(m[1] or 0) * 3600 + int(m[2] or 0) * 60 + int(m[3] or 0)) if m else None


def to_seconds(t):
    parts = [int(p) for p in t.split(':')]
    s = 0
    for p in parts:
        s = s * 60 + p
    return s


def clean(desc):
    """Return (summary paragraphs, chapters) from a YouTube description."""
    paras, chapters, cur = [], [], []
    for raw in (desc or '').splitlines():
        line = raw.strip()
        m = CHAPTER.match(line)
        if m and not BOILER.search(m[2]):
            chapters.append({'t': to_seconds(m[1]), 'label': m[2].strip()})
            continue
        if not line or set(line) <= set('=-_ ') or line.upper() == '[CHAPTERS]':
            if cur:
                paras.append(' '.join(cur))
                cur = []
            continue
        if BOILER.search(line) or len(re.sub(r'[\W_]+', '', line)) < 3:
            continue
        cur.append(re.sub(r'^[^\w"“$#(]+', '', line))  # drop leading emoji/bullets
    if cur:
        paras.append(' '.join(cur))
    paras = [' '.join(x for x in re.split(r'(?<=[.!?])\s+', p) if not CTA.search(x)) for p in paras]
    # Keep real sentences only; the channel's standard intro paragraphs are already filtered above.
    paras = [p for p in paras if len(p) > 40]
    return paras, chapters


def slugify(s):
    s = s.lower().replace('&', ' and ').replace('$', '').replace("'", '').replace('’', '')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:80].rstrip('-')


TOPICS = [
    ('Home tours', r'\b(tour of|inside|walkthrough|for sale|new construction home|luxury home|brownstone|model home)\b'),
    ('Market updates', r'\b(market|rates?|prices?|inventory|mortgage|sellers?|buyers?|crash|housing|appreciation|builders?)\b'),
    ('Suburbs & neighborhoods', r'\b(suburbs?|neighborhoods?|ranked|ranking|towns?|places to live|best places|vs\.?|driving tour)\b'),
    ('Living in Minnesota', r'.'),
]


def topic(title, summary):
    text = f'{title} {summary}'.lower()
    for name, pat in TOPICS:
        if re.search(pat, title.lower()):
            return name
    for name, pat in TOPICS[:-1]:
        if re.search(pat, text):
            return name
    return TOPICS[-1][0]


def main(videos_path, shorts_path, details_path):
    flat_long = json.loads(Path(videos_path).read_text())['entries']
    flat_short = json.loads(Path(shorts_path).read_text())['entries']
    details = json.loads(Path(details_path).read_text())
    seen, out = set(), []
    for kind, entries in (('long', flat_long), ('short', flat_short)):
        for order, e in enumerate(entries):
            d = details.get(e['id'], {})
            if '(delete)' in (d.get('title') or e['title']).lower():
                continue
            # Hashtags in Shorts titles are for YouTube search; drop them on the site.
            title = re.sub(r'\s*#[\w-]+', '', d.get('title') or e['title']).strip()
            summary, chapters = clean(d.get('description', ''))
            v = {
                'id': e['id'],
                'kind': kind,
                'title': title,
                'published': d.get('publishedAt'),
                'seconds': iso_seconds(d.get('duration')) or e.get('duration'),
                'views': d.get('viewCount') or e.get('view_count'),
                'summary': summary,
                'chapters': chapters,
                'topic': topic(title, ' '.join(summary)),
                'order': order,              # channel order, newest first
            }
            # Long videos with a real description get their own page on the site.
            if kind == 'long' and summary and v['published']:
                slug = slugify(title)
                while slug in seen:
                    slug += '-2'
                seen.add(slug)
                v['slug'] = slug
            out.append(v)
    OUT.write_text(json.dumps({'channel': CHANNEL, 'videos': out}, ensure_ascii=False, indent=1) + '\n')
    pages = sum(1 for v in out if v.get('slug'))
    print(f'{len(out)} videos ({sum(v["kind"] == "long" for v in out)} long, {sum(v["kind"] == "short" for v in out)} shorts), {pages} watch pages -> {OUT}')


if __name__ == '__main__':
    main(*sys.argv[1:4])
