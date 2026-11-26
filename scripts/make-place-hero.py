"""Make a page-hero photo in the site sizes: public/hero/<name>-{640,960,1280,1920}.webp and <name>-1920.jpg.

Usage:  python3 scripts/make-place-hero.py <source image> <name>
Crops to a 3:2 banner around the center if the photo is taller than that, resizes with a light sharpen.
Credits for every photo are in public/hero/CREDITS.md and src/data/hero-photos.ts (shown on the page).
"""
import sys
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
HERO = ROOT / 'public/hero'
SHARPEN = ImageFilter.UnsharpMask(radius=1.0, percent=50, threshold=2)


def main(src, name):
    big = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    w, h = big.size
    if h / w > 2 / 3:  # taller than 3:2: trim top and bottom evenly
        nh = round(w * 2 / 3)
        top = (h - nh) // 2
        big = big.crop((0, top, w, top + nh))
    for tw in (640, 960, 1280, 1920):
        if tw > big.width and tw != 640:
            continue
        im = big.resize((tw, round(tw * big.height / big.width)), Image.LANCZOS).filter(SHARPEN)
        im.save(HERO / f'{name}-{tw}.webp', 'WEBP', quality=68, method=6)
        if tw == 1920 or (tw < 1920 and (tw * 2) > big.width):
            im.save(HERO / f'{name}-1920.jpg', 'JPEG', quality=78, optimize=True, progressive=True)
        print(name, tw, im.size)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
