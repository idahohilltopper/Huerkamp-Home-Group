"""Make the hero skyline images (public/hero/minneapolis-skyline-*.webp and -1920.jpg) from the original photo.

The original, public/hero/minneapolis-skyline-3840.jpg, is kept unaltered. The site versions are brightened,
and the city lights and their reflections get a soft glow so they sparkle against the night sky.
Usage:  python3 scripts/make-hero.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
HERO = ROOT / 'public/hero'
SRC = HERO / 'minneapolis-skyline-3840.jpg'

BRIGHTEN = 1.30      # overall exposure
LIFT = 0.04          # how much the darkest parts (sky, water, trees) are lifted
SATURATE = 1.18      # a little more color in the dusk sky and the lights
GLOW = 0.95          # strength of the glow around bright lights
GLOW_FROM = 0.62     # how bright a pixel must be to glow (0-1)


def enhance(im):
    a = np.asarray(im.convert('RGB'), dtype=np.float32) / 255
    # Lift shadows and brighten, with a gentle curve so the lights don't blow out.
    a = 1 - (1 - a) ** BRIGHTEN
    a = a + LIFT * (1 - a) * (1 - a.mean(axis=2, keepdims=True)) ** 2
    # Saturation around each pixel's own gray value.
    gray = a.mean(axis=2, keepdims=True)
    a = gray + (a - gray) * SATURATE
    a = np.clip(a, 0, 1)
    # Glow ("bloom"): take only the bright lights, blur them at two sizes, and add the halo back on top.
    lum = a.max(axis=2, keepdims=True)
    bright = a * np.clip((lum - GLOW_FROM) / (1 - GLOW_FROM), 0, 1)
    img = Image.fromarray((bright * 255).astype(np.uint8))
    scale = im.width / 1920
    halo = sum(np.asarray(img.filter(ImageFilter.GaussianBlur(r * scale)), dtype=np.float32) / 255 * w
               for r, w in ((4, 0.6), (16, 0.5)))
    a = 1 - (1 - a) * (1 - np.clip(halo * GLOW, 0, 1))  # "screen" blend: only ever brightens
    return Image.fromarray((np.clip(a, 0, 1) * 255).round().astype(np.uint8))


def main():
    big = enhance(Image.open(SRC))
    for w in (640, 960, 1280, 1920, 2560):
        im = big.resize((w, round(w * big.height / big.width)), Image.LANCZOS)
        im.save(HERO / f'minneapolis-skyline-{w}.webp', 'WEBP', quality=72, method=6)
        if w == 1920:
            im.save(HERO / 'minneapolis-skyline-1920.jpg', 'JPEG', quality=80, optimize=True, progressive=True)
        print(w, (HERO / f'minneapolis-skyline-{w}.webp').stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
