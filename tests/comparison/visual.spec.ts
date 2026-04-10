import { test, ORIGINAL, STATIC, PAGES, loadPage } from '../fixtures/sites';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'fs';
import path from 'path';

const reportsDir = path.join(__dirname, '..', 'reports');

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

for (const pageInfo of PAGES) {
  test.describe(`Visual: ${pageInfo.name}`, () => {
    test(`capture and compare screenshots`, async ({ page }, testInfo) => {
      const viewport = testInfo.project.name;
      const originalDir = path.join(reportsDir, 'screenshots', 'original');
      const staticDir = path.join(reportsDir, 'screenshots', 'static');
      const diffsDir = path.join(reportsDir, 'screenshots', 'diffs');
      ensureDir(originalDir);
      ensureDir(staticDir);
      ensureDir(diffsDir);

      const baseName = `${pageInfo.name}-${viewport}`;

      // Screenshot original site
      await loadPage(page, `${ORIGINAL}${pageInfo.path}`, { disableAnimations: true });
      const originalPath = path.join(originalDir, `${baseName}.png`);
      await page.screenshot({ path: originalPath, fullPage: true });

      // Screenshot static site
      await loadPage(page, `${STATIC}${pageInfo.path}`, { disableAnimations: true });
      const staticPath = path.join(staticDir, `${baseName}.png`);
      await page.screenshot({ path: staticPath, fullPage: true });

      // Generate pixel diff
      const originalImg = PNG.sync.read(fs.readFileSync(originalPath));
      const staticImg = PNG.sync.read(fs.readFileSync(staticPath));

      // Use the larger dimensions to accommodate different page heights
      const width = Math.max(originalImg.width, staticImg.width);
      const height = Math.max(originalImg.height, staticImg.height);

      // Pad images to same size if needed
      const padImage = (img: PNG, w: number, h: number): PNG => {
        if (img.width === w && img.height === h) return img;
        const padded = new PNG({ width: w, height: h });
        // Fill with white
        for (let i = 0; i < padded.data.length; i += 4) {
          padded.data[i] = 255;
          padded.data[i + 1] = 255;
          padded.data[i + 2] = 255;
          padded.data[i + 3] = 255;
        }
        PNG.bitblt(img, padded, 0, 0, img.width, img.height, 0, 0);
        return padded;
      };

      const paddedOriginal = padImage(originalImg, width, height);
      const paddedStatic = padImage(staticImg, width, height);
      const diffImg = new PNG({ width, height });

      const mismatchedPixels = pixelmatch(
        paddedOriginal.data,
        paddedStatic.data,
        diffImg.data,
        width,
        height,
        { threshold: 0.3 }
      );

      const totalPixels = width * height;
      const mismatchPercent = ((mismatchedPixels / totalPixels) * 100).toFixed(2);

      // Save diff image
      const diffPath = path.join(diffsDir, `${baseName}-diff.png`);
      fs.writeFileSync(diffPath, PNG.sync.write(diffImg));

      // Save result to shared JSON
      const resultsPath = path.join(reportsDir, 'visual-results.json');
      let results: Record<string, any> = {};
      if (fs.existsSync(resultsPath)) {
        results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      }
      results[baseName] = {
        page: pageInfo.name,
        viewport,
        mismatchPercent: parseFloat(mismatchPercent),
        mismatchedPixels,
        totalPixels,
        originalSize: { width: originalImg.width, height: originalImg.height },
        staticSize: { width: staticImg.width, height: staticImg.height },
      };
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      // Attach screenshots to test report
      await testInfo.attach('original', { path: originalPath, contentType: 'image/png' });
      await testInfo.attach('static', { path: staticPath, contentType: 'image/png' });
      await testInfo.attach('diff', { path: diffPath, contentType: 'image/png' });

      console.log(`  ${baseName}: ${mismatchPercent}% pixel difference (${mismatchedPixels}/${totalPixels} pixels)`);
    });
  });
}
