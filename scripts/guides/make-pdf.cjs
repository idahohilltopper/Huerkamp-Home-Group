// Make the free-guide PDFs and their square cover images from the HTML in scripts/guides/ (Chromium print to PDF).
// Usage: node scripts/guides/make-pdf.cjs [slug ...]   -> public/free-guides/<slug>.pdf (+ <slug>-cover.png for guides
// that have no cover photo of their own; make-covers turns those into webp/jpg sizes).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
// The first guide's file name differs from its PDF name.
const NAMES = { '25-insider-secrets': '25-insider-secrets-on-home-buying' };
const want = process.argv.slice(2);
const files = fs.readdirSync(__dirname).filter((f) => f.endsWith('.html')).map((f) => f.replace(/\.html$/, ''))
  .filter((f) => !want.length || want.includes(f) || want.includes(NAMES[f]));
(async () => {
  const b = await chromium.launch();
  for (const f of files) {
    const out = NAMES[f] ?? f;
    const p = await b.newPage();
    await p.goto('file://' + path.join(__dirname, f + '.html'), { waitUntil: 'load' });
    await p.pdf({ path: path.join(__dirname, '../../public/free-guides', out + '.pdf'), format: 'Letter', printBackground: true, preferCSSPageSize: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: '<div style="width:100%;font:8px Arial;color:#8a8385;padding:0 0.75in;display:flex;justify-content:space-between"><span>Huerkamp Home Group · (612) 502-7653 · huerkamphomes.com</span><span class="pageNumber"></span></div>' });
    console.log('made', out + '.pdf');
    await p.close();
  }
  await b.close();
})();
