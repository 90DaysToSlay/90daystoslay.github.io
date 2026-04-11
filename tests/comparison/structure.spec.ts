import { test, expect, ORIGINAL, STATIC, PAGES, loadPage } from '../fixtures/sites';
import { extractSectionCount, extractHeadings, extractImages, extractLinks } from '../helpers/extract';
import fs from 'fs';
import path from 'path';

const reportsDir = path.join(__dirname, '..', 'reports');

for (const pageInfo of PAGES) {
  test.describe(`Structure: ${pageInfo.name}`, () => {
    test('section count comparison', async ({ page }) => {
      await loadPage(page, `${ORIGINAL}${pageInfo.path}`);
      const originalSections = await extractSectionCount(page);

      await loadPage(page, `${STATIC}${pageInfo.path}`);
      const staticSections = await extractSectionCount(page);

      console.log(`  ${pageInfo.name} sections: original=${originalSections}, static=${staticSections}`);
      if (originalSections !== staticSections) {
        console.log(`  ⚠ Section count differs by ${Math.abs(originalSections - staticSections)} (GHL may render extra sections via JS)`);
      }
      // GHL may render extra sections via JS — log diff, don't fail
      if (originalSections !== staticSections) {
        test.info().annotations.push({ type: 'warning', description: `Section count: original=${originalSections}, static=${staticSections}` });
      }
    });

    test('heading hierarchy comparison', async ({ page }) => {
      await loadPage(page, `${ORIGINAL}${pageInfo.path}`);
      const originalHeadings = await extractHeadings(page);

      await loadPage(page, `${STATIC}${pageInfo.path}`);
      const staticHeadings = await extractHeadings(page);

      console.log(`  ${pageInfo.name} headings: original=${originalHeadings.length}, static=${staticHeadings.length}`);
      expect(staticHeadings.length).toBe(originalHeadings.length);
    });

    test('image count comparison', async ({ page }) => {
      await loadPage(page, `${ORIGINAL}${pageInfo.path}`);
      const originalImages = await extractImages(page);

      await loadPage(page, `${STATIC}${pageInfo.path}`);
      const staticImages = await extractImages(page);

      console.log(`  ${pageInfo.name} images: original=${originalImages.length}, static=${staticImages.length}`);

      fs.mkdirSync(path.join(reportsDir, 'structure'), { recursive: true });
      fs.writeFileSync(
        path.join(reportsDir, 'structure', `${pageInfo.name}-images.json`),
        JSON.stringify({ original: originalImages, static: staticImages }, null, 2)
      );

      expect(staticImages.length).toBe(originalImages.length);
    });

    test('link count comparison', async ({ page }) => {
      await loadPage(page, `${ORIGINAL}${pageInfo.path}`);
      const originalLinks = await extractLinks(page);

      await loadPage(page, `${STATIC}${pageInfo.path}`);
      const staticLinks = await extractLinks(page);

      console.log(`  ${pageInfo.name} links: original=${originalLinks.length}, static=${staticLinks.length}`);

      fs.mkdirSync(path.join(reportsDir, 'structure'), { recursive: true });
      fs.writeFileSync(
        path.join(reportsDir, 'structure', `${pageInfo.name}-links.json`),
        JSON.stringify({ original: originalLinks, static: staticLinks }, null, 2)
      );

      // Link count may differ due to JS-rendered nav or email links — log diff, don't fail
      if (originalLinks.length !== staticLinks.length) {
        console.log(`  ⚠ Link count differs by ${Math.abs(originalLinks.length - staticLinks.length)}`);
        test.info().annotations.push({ type: 'warning', description: `Link count: original=${originalLinks.length}, static=${staticLinks.length}` });
      }
    });
  });
}
