// Export the site's city sale rules (src/data/sale-rules.ts) for the time-of-sale guide (guides_content3.py).
// Usage: node --experimental-strip-types scripts/guides/export-sale-rules.mjs
import { writeFileSync } from 'node:fs';
const { saleRules } = await import('../../src/data/sale-rules.ts');
writeFileSync(new URL('./sale-rules.json', import.meta.url), JSON.stringify(saleRules, null, 1));
console.log('exported', saleRules.length, 'city rules');
