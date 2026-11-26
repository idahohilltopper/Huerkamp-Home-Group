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
    await p.setContent(`<!doctype html><html><body style="margin:0">
      <div style="position:relative;width:1200px;height:1200px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;background:#222">
        <img src="${photo}" style="position:absolute;inset:0;width:100%;height:78%;object-fit:cover">
        <div style="position:absolute;inset:0 0 22% 0;background:linear-gradient(180deg,rgba(20,18,19,.15) 0%,rgba(20,18,19,.35) 45%,rgba(20,18,19,.88) 100%)"></div>
        <div style="position:absolute;left:0;top:70px;background:#3f4752;color:#fff;font-weight:700;font-size:46px;padding:22px 40px 22px 56px">Free Guide</div>
        <div style="position:absolute;left:70px;right:70px;bottom:300px;color:#fff;font-weight:700;font-size:78px;line-height:1.05;text-transform:uppercase">${title}</div>
        <div style="position:absolute;left:0;right:0;bottom:0;height:22%;background:#b00000;color:#fff;display:flex;align-items:center;padding:0 70px;font-size:40px;font-weight:700;letter-spacing:.06em">HUERKAMP HOME GROUP</div>
      </div></body></html>`, { waitUntil: 'load' });
    await p.screenshot({ path: path.join(__dirname, '../../public/free-guides', slug + '-cover.png') });
    console.log('cover', slug);
  }
  await b.close();
})();
