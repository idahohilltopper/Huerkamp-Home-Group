"""Write the free-guide HTML files (scripts/guides/<slug>.html) from the content in guides_content.py, in the same look
as 25-insider-secrets.html (guide.css). Then: node scripts/guides/make-pdf.cjs makes the PDFs and covers.
Usage: /usr/bin/python3 scripts/guides/make-html.py
"""
import html
from pathlib import Path

from guides_content import GUIDES
from guides_content2 import GUIDES2

HERE = Path(__file__).resolve().parent
FOOT = '<strong>Huerkamp Home Group</strong> · Keller Williams Preferred Realty<br>(612) 502-7653 · huerkamphomes.com'
LEGAL = ('General information, not legal, tax or lending advice. Rules and programs change; confirm details with your '
         'lender, title company, tax adviser or attorney. Huerkamp Home Group is a team of licensed REALTORS® with Keller '
         'Williams Preferred Realty. Equal Housing Opportunity.')


def page(g):
    e = html.escape
    toc = ''.join(f'<li>{e(t[0])}</li>' for _, tips in g['parts'] for t in tips)
    body, n = [], 0
    for part, tips in g['parts']:
        for i, (h, p) in enumerate(tips):
            n += 1
            tip = f'<div class="tip"><span class="tip__n">{n}</span><div>\n  <h3>{e(h)}</h3>\n  <p>{p}</p>\n</div></div>'
            body.append(f'<div class="keep"><p class="part">{e(part)}</p>\n{tip}</div>' if i == 0 else tip)
            if n in g.get('figures', {}):
                src, cap = g['figures'][n]
                body.append(f'<figure class="fig"><img src="photos/{src}" alt=""><figcaption>{e(cap)}</figcaption></figure>')
    sources = ''.join(f'<li>{e(s)}</li>' for s in g['sources'])
    intro = ''.join(f'<p>{p}</p>' for p in g['intro'])
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{e(g['title'])} | Huerkamp Home Group</title>
<!-- Made by scripts/guides/make-html.py from guides_content.py; edit the content there, not here. -->
<link rel="stylesheet" href="guide.css">
</head>
<body>
<section class="cover">
  <img class="cover__photo" src="photos/{g['slug']}.jpg" alt="">
  <p class="cover__brand">Huerkamp Home Group</p>
  <div class="cover__title"><p>Free guide</p><h1>{e(g['title'])}</h1><span></span><p class="cover__sub">{e(g['sub'])}</p></div>
  <div class="cover__foot">{FOOT}</div>
</section>
<section class="intro">
  <p class="eyebrow">{e(g['eyebrow'])}</p>
  <h1>{e(g['title'])}</h1>
  {intro}
  <div class="toc"><strong>Inside</strong><ol>{toc}</ol></div>
</section>
{chr(10).join(body)}
<section class="close">
  <p class="eyebrow">Ready when you are</p>
  <h2>{e(g['close_h'])}</h2>
  <p>Huerkamp Home Group has helped buyers and sellers across the Twin Cities since 2002, and has been a Dave Ramsey Endorsed Local Provider for more than 15 years.</p>
  <div class="card"><strong>Huerkamp Home Group</strong> · Keller Williams Preferred Realty<br>14300 Nicollet Ct, Ste 208, Burnsville, MN 55306<br>(612) 502-7653 · <a href="https://www.huerkamphomes.com">huerkamphomes.com</a></div>
  <p class="eyebrow" style="margin-top:20pt">Sources</p>
  <ol class="sources">{sources}</ol>
  <p class="legal">{e(g.get('photo_credit', ''))} {LEGAL}</p>
</section>
</body>
</html>
'''


if __name__ == '__main__':
    for g in GUIDES + GUIDES2:
        (HERE / f"{g['slug']}.html").write_text(page(g))
        print('wrote', g['slug'], sum(len(t) for _, t in g['parts']), 'tips')
