// Make the free-guide PDFs from their HTML in scripts/guides/ (Chromium's print to PDF).
// Usage: node scripts/guides/make-pdf.cjs   -> public/free-guides/<name>.pdf
const { chromium } = require('playwright');
const path = require('path');
const guides = [['25-insider-secrets.html', '25-insider-secrets-on-home-buying.pdf']];
(async () => {
  const b = await chromium.launch();
  for (const [src, out] of guides) {
    const p = await b.newPage();
    await p.goto('file://' + path.join(__dirname, src), { waitUntil: 'load' });
    await p.pdf({ path: path.join(__dirname, '../../public/free-guides', out), format: 'Letter', printBackground: true, preferCSSPageSize: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: '<div style="width:100%;font:8px Arial;color:#8a8385;padding:0 0.75in;display:flex;justify-content:space-between"><span>Huerkamp Home Group · (612) 502-7653 · huerkamphomes.com</span><span class="pageNumber"></span></div>' });
    console.log('made', out);
  }
  await b.close();
})();
