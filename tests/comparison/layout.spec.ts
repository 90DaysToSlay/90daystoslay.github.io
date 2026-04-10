import { test, ORIGINAL, STATIC, PAGES, loadPage } from '../fixtures/sites';
import { extractComputedStyles, extractSectionMetrics } from '../helpers/extract';
import fs from 'fs';
import path from 'path';

const reportsDir = path.join(__dirname, '..', 'reports');

const KEY_SELECTORS = [
  { name: 'body', selector: 'body' },
  { name: 'first-section', selector: '[class*="c-section"]:first-of-type, section:first-of-type' },
  { name: 'first-h1', selector: 'h1' },
  { name: 'first-h2', selector: 'h2' },
  { name: 'first-paragraph', selector: 'p' },
];

for (const pageInfo of PAGES) {
  test.describe(`Layout: ${pageInfo.name}`, () => {
    test('computed styles comparison', async ({ page }, testInfo) => {
      const viewport = testInfo.project.name;
      const results: Record<string, { original: Record<string, string> | null; static: Record<string, string> | null }> = {};

      for (const { name, selector } of KEY_SELECTORS) {
        // Original
        await loadPage(page, `${ORIGINAL}${pageInfo.path}`);
        const originalStyles = await extractComputedStyles(page, selector);

        // Static
        await loadPage(page, `${STATIC}${pageInfo.path}`);
        const staticStyles = await extractComputedStyles(page, selector);

        results[name] = { original: originalStyles, static: staticStyles };

        if (originalStyles && staticStyles) {
          const diffs: string[] = [];
          for (const prop of Object.keys(originalStyles)) {
            if (originalStyles[prop] !== staticStyles[prop]) {
              diffs.push(`${prop}: "${originalStyles[prop]}" → "${staticStyles[prop]}"`);
            }
          }
          if (diffs.length > 0) {
            console.log(`  ${pageInfo.name}/${name} style diffs (${viewport}):`);
            diffs.forEach(d => console.log(`    ${d}`));
          }
        }
      }

      fs.mkdirSync(path.join(reportsDir, 'layout'), { recursive: true });
      fs.writeFileSync(
        path.join(reportsDir, 'layout', `${pageInfo.name}-${viewport}-styles.json`),
        JSON.stringify(results, null, 2)
      );
    });

    test('section heights comparison', async ({ page }, testInfo) => {
      const viewport = testInfo.project.name;

      await loadPage(page, `${ORIGINAL}${pageInfo.path}`);
      const originalMetrics = await extractSectionMetrics(page);

      await loadPage(page, `${STATIC}${pageInfo.path}`);
      const staticMetrics = await extractSectionMetrics(page);

      const comparison = originalMetrics.map((orig, i) => {
        const stat = staticMetrics[i];
        const heightDiff = stat ? ((stat.height - orig.height) / orig.height * 100).toFixed(1) : 'N/A';
        return {
          index: i,
          originalHeight: Math.round(orig.height),
          staticHeight: stat ? Math.round(stat.height) : null,
          diffPercent: heightDiff,
        };
      });

      fs.mkdirSync(path.join(reportsDir, 'layout'), { recursive: true });
      fs.writeFileSync(
        path.join(reportsDir, 'layout', `${pageInfo.name}-${viewport}-sections.json`),
        JSON.stringify(comparison, null, 2)
      );

      console.log(`  ${pageInfo.name} section heights (${viewport}):`);
      comparison.forEach(c => {
        console.log(`    Section ${c.index}: original=${c.originalHeight}px, static=${c.staticHeight}px (${c.diffPercent}%)`);
      });
    });
  });
}
