"""Make the hero skyline images (public/hero/minneapolis-skyline-*.webp and -1920.jpg) from the original photo.

The original, public/hero/minneapolis-skyline-3840.jpg, is kept unaltered (see public/hero/CREDITS.md). The site
versions are only resized, with a light sharpen after each resize so the buildings stay crisp.
Usage:  python3 scripts/make-hero.py
"""
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
HERO = ROOT / 'public/hero'
SRC = HERO / 'minneapolis-skyline-3840.jpg'
SHARPEN = ImageFilter.UnsharpMask(radius=1.0, percent=50, threshold=2)


def main():
    big = Image.open(SRC).convert('RGB')
    for w in (640, 960, 1280, 1920, 2560):
        im = big.resize((w, round(w * big.height / big.width)), Image.LANCZOS).filter(SHARPEN)
        im.save(HERO / f'minneapolis-skyline-{w}.webp', 'WEBP', quality=68, method=6)
        if w == 1920:
            im.save(HERO / 'minneapolis-skyline-1920.jpg', 'JPEG', quality=78, optimize=True, progressive=True)
        print(w, im.size, (HERO / f'minneapolis-skyline-{w}.webp').stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
