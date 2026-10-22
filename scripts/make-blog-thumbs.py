"""Make the small card image (cover-640.webp) for each blog post that has a cover but no thumb,
and add `thumb` to the post's frontmatter. Run after adding posts:  python3 scripts/make-blog-thumbs.py
Covers live at public/blog/<slug>/cover.webp. Cards show a 16:9 crop from the top of the cover."""
import glob
import re
from PIL import Image

for f in glob.glob('src/content/blog/*.md'):
    s = open(f).read()
    m = re.search(r'cover: \{ src: "(/blog/[^"]+/cover\.webp)", width: (\d+), height: (\d+) \}', s)
    if not m:
        continue
    src = 'public' + m.group(1)
    im = Image.open(src)
    w, h = im.width, min(im.height, round(im.width * 9 / 16))
    im = im.crop((0, 0, w, h))
    if w > 640:
        im = im.resize((640, round(640 * h / w)), Image.LANCZOS)
    im.save(src.replace('cover.webp', 'cover-640.webp'), 'WEBP', quality=70, method=5)
    thumb = m.group(1).replace('cover.webp', 'cover-640.webp')
    open(f, 'w').write(s.replace(m.group(0), m.group(0)[:-2] + f', thumb: "{thumb}" }}'))
    print('thumb', thumb)
