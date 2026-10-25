"""Rebuild one person's headshot files from the original photo, keeping fine detail (fabric, hair).

Makes, from the full-size original (and its background-removed cutout for the home page):
  public/team/<slug>.jpg, <slug>-320.webp, <slug>-500.webp      team page, agent page, small cards
  public/people/<slug>-720/-1080 .jpg/.webp                      founder photos
  public/people/<slug>-cutout-560 .png/.webp, -cutout-900.webp   home page hero (only with --cutout)
Each size is resized with a high-quality filter, given a light sharpen to bring back texture lost in the
resize, and saved at high quality (the earlier files were compressed hard enough to smooth out the jacket).

Usage: python3 scripts/make-headshots.py jason-huerkamp original.jpg [--cutout cutout.png]
  original.jpg  the full-size headshot (e.g. the Squarespace original, ?format=original)
  cutout.png    the same photo with the background removed (rembg isnet-general-use), same size
"""
import sys
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SHARPEN = ImageFilter.UnsharpMask(radius=1.1, percent=55, threshold=2)


def sized(im, w, h=None):
    h = h or w
    out = im.resize((w, h), Image.LANCZOS)
    return out.filter(SHARPEN) if out.mode == 'RGB' else Image.merge('RGBA', (*out.convert('RGB').filter(SHARPEN).split(), out.split()[-1]))


def main(slug, original, cutout=None):
    im = Image.open(original).convert('RGB')
    side = min(im.size)
    im = im.crop(((im.width - side) // 2, (im.height - side) // 2, (im.width + side) // 2, (im.height + side) // 2))
    team, people = ROOT / 'public/team', ROOT / 'public/people'
    s500 = sized(im, 500)
    s500.save(team / f'{slug}.jpg', 'JPEG', quality=90, optimize=True, progressive=True)
    s500.save(team / f'{slug}-500.webp', 'WEBP', quality=88, method=6)
    sized(im, 320).save(team / f'{slug}-320.webp', 'WEBP', quality=88, method=6)
    for w in (720, 1080):
        s = sized(im, w)
        s.save(people / f'{slug}-{w}.jpg', 'JPEG', quality=88, optimize=True, progressive=True)
        s.save(people / f'{slug}-{w}.webp', 'WEBP', quality=86, method=6)
    if cutout:
        c = Image.open(cutout).convert('RGBA')
        c = c.crop(c.split()[-1].point(lambda a: 255 if a > 8 else 0).getbbox())  # tight box around the person
        for h in (560, 900):
            w = round(h * c.width / c.height)
            s = sized(c, w, h)
            s.save(people / f'{slug}-cutout-{h}.webp', 'WEBP', quality=90, alpha_quality=100, method=6)
            if h == 560:
                s.save(people / f'{slug}-cutout-560.png', 'PNG', optimize=True)
    for f in sorted(list(team.glob(f'{slug}*')) + list(people.glob(f'{slug}*'))):
        print(f'{f.relative_to(ROOT)}  {f.stat().st_size // 1024} KB')


if __name__ == '__main__':
    a = sys.argv[1:]
    main(a[0], a[1], a[a.index('--cutout') + 1] if '--cutout' in a else None)
