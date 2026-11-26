"""public/free-guides/<slug>-cover.png -> <slug>-600.webp, -1200.webp and -1200.jpg (the png is removed).
Usage: /usr/bin/python3 scripts/guides/cover-sizes.py <slug> [...]"""
import sys
from pathlib import Path
from PIL import Image

D = Path(__file__).resolve().parent.parent.parent / 'public/free-guides'
for slug in sys.argv[1:]:
    src = D / f'{slug}-cover.png'
    im = Image.open(src).convert('RGB')
    for w in (600, 1200):
        im.resize((w, w), Image.LANCZOS).save(D / f'{slug}-{w}.webp', 'WEBP', quality=78, method=6)
    im.save(D / f'{slug}-1200.jpg', 'JPEG', quality=82, optimize=True)
    src.unlink()
    print('sizes', slug)
