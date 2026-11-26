// Square website cover images for the free guides that don't have their own artwork: the guide's photo with its title,
// in the team's colors. Usage: node scripts/guides/make-covers.cjs <slug> "<title>" [...more pairs]
// -> public/free-guides/<slug>-cover.png (then make sizes with /usr/bin/python3 scripts/guides/cover-sizes.py <slug>).
const { chromium } = require('playwright');
const path = require('path');
const pairs = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1200 } });
  for (let i = 0; i < pairs.length; i += 2) {
    const [slug, title] = [pairs[i], pairs[i + 1]];
    const photo = 'data:image/jpeg;base64,' + require('fs').readFileSync(path.join(__dirname, 'photos', slug + '.jpg')).toString('base64');
    const font = (f) => 'data:font/woff2;base64,' + require('fs').readFileSync(path.join(__dirname, '../../node_modules', f)).toString('base64');
    await p.setContent(`<!doctype html><html><head><style>
      @font-face { font-family: Figtree; font-weight: 300 900; src: url(${font('@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2')}); }
      @font-face { font-family: 'Cormorant Garamond'; font-weight: 500; src: url(${font('@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2')}); }
      </style></head><body style="margin:0">
      <div style="position:relative;width:1200px;height:1200px;overflow:hidden;font-family:Figtree,Arial,sans-serif;background:#1f1b1c">
        <img src="${photo}" style="position:absolute;inset:0;width:100%;height:78%;object-fit:cover">
        <div style="position:absolute;inset:0 0 22% 0;background:linear-gradient(180deg,rgba(31,27,28,.1) 0%,rgba(31,27,28,.3) 45%,rgba(31,27,28,.88) 100%)"></div>
        <div style="position:absolute;left:0;top:70px;background:#d40000;color:#fff;font-weight:700;font-size:34px;letter-spacing:.18em;text-transform:uppercase;padding:20px 36px 20px 56px">Free Guide</div>
        <div style="position:absolute;left:70px;right:70px;bottom:300px;color:#fff;font-family:Cormorant Garamond,Georgia,serif;font-weight:500;font-size:92px;line-height:1.02">${title}</div>
        <div style="position:absolute;left:0;right:0;bottom:0;height:22%;background:#d40000;color:#fff;display:flex;align-items:center;padding:0 70px;font-size:36px;font-weight:600;letter-spacing:.2em">HUERKAMP HOME GROUP</div>
      </div></body></html>`, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(__dirname, '../../public/free-guides', slug + '-cover.png') });
    console.log('cover', slug);
  }
  await b.close();
})();
