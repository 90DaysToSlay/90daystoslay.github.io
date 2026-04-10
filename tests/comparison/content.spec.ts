import { test, expect, ORIGINAL, STATIC, PAGES, loadPage } from '../fixtures/sites';
import { extractVisibleText, extractHeadings, extractButtonTexts } from '../helpers/extract';
import { textDiff, listDiff } from '../helpers/diff';
import fs from 'fs';
import path from 'path';

const reportsDir = path.join(__dirname, '..', 'reports');

for (const pageInfo of PAGES) {
  test.describe(`Content: ${pageInfo.name}`, () => {
    test('visible text comparison', async ({ page }) => {
      // Extract from original
      await loadPage(page, `${ORIGINAL}${pageInfo.path}`);
      const originalText = await extractVisibleText(page);

      // Extract from static
      await loadPage(page, `${STATIC}${pageInfo.path}`);
      const staticText = await extractVisibleText(page);

      const diff = textDiff(originalText, staticText, `${pageInfo.name}-text`);

      // Save diff to reports
      fs.mkdirSync(path.join(reportsDir, 'content'), { recursive: true });
      fs.writeFileSync(
        path.join(reportsDir, 'content', `${pageInfo.name}-text-diff.txt`),
        diff
      );

      const originalWords = originalText.split(/\s+/).length;
      const staticWords = staticText.split(/\s+/).length;
      console.log(`  ${pageInfo.name}: original=${originalWords} words, static=${staticWords} words`);

      // Not a hard assertion — just recording differences
      if (originalText !== staticText) {
        console.log(`  ${pageInfo.name}: Text differs. See reports/content/${pageInfo.name}-text-diff.txt`);
      }
    });

    test('heading comparison', async ({ page }) => {
      await loadPage(page, `${ORIGINAL}${pageInfo.path}`);
      const originalHeadings = await extractHeadings(page);

      await loadPage(page, `${STATIC}${pageInfo.path}`);
      const staticHeadings = await extractHeadings(page);

      const { added, removed } = listDiff(
        originalHeadings,
        staticHeadings,
        (h) => `${h.tag}:${h.text}`
      );

      fs.mkdirSync(path.join(reportsDir, 'content'), { recursive: true });
      fs.writeFileSync(
        path.join(reportsDir, 'content', `${pageInfo.name}-headings.json`),
        JSON.stringify({ original: originalHeadings, static: staticHeadings, added, removed }, null, 2)
      );

      console.log(`  ${pageInfo.name} headings: original=${originalHeadings.length}, static=${staticHeadings.length}`);
      if (removed.length > 0) {
        console.log(`  Missing headings: ${removed.map(h => `${h.tag}:"${h.text.substring(0, 50)}"`).join(', ')}`);
      }
      if (added.length > 0) {
        console.log(`  Extra headings: ${added.map(h => `${h.tag}:"${h.text.substring(0, 50)}"`).join(', ')}`);
      }
    });

    test('CTA / button text comparison', async ({ page }) => {
      await loadPage(page, `${ORIGINAL}${pageInfo.path}`);
      const originalButtons = await extractButtonTexts(page);

      await loadPage(page, `${STATIC}${pageInfo.path}`);
      const staticButtons = await extractButtonTexts(page);

      const { added, removed } = listDiff(originalButtons, staticButtons);

      fs.mkdirSync(path.join(reportsDir, 'content'), { recursive: true });
      fs.writeFileSync(
        path.join(reportsDir, 'content', `${pageInfo.name}-buttons.json`),
        JSON.stringify({ original: originalButtons, static: staticButtons, added, removed }, null, 2)
      );

      console.log(`  ${pageInfo.name} CTAs: original=${originalButtons.length}, static=${staticButtons.length}`);
    });
  });
}
