import { test, expect, STATIC, PAGES, loadPage } from '../fixtures/sites';
import { extractImages, extractLinks, checkFontsLoaded } from '../helpers/extract';
import fs from 'fs';
import path from 'path';

const reportsDir = path.join(__dirname, '..', 'reports');

for (const pageInfo of PAGES) {
  test.describe(`Assets: ${pageInfo.name} (static site)`, () => {
    test('no broken images', async ({ page, request }) => {
      await loadPage(page, `${STATIC}${pageInfo.path}`);
      const images = await extractImages(page);

      const results: Array<{ src: string; status: number | string; ok: boolean }> = [];

      for (const img of images) {
        if (!img.src || img.src.startsWith('data:')) continue;
        try {
          const response = await request.head(img.src);
          results.push({ src: img.src, status: response.status(), ok: response.ok() });
        } catch (e: any) {
          results.push({ src: img.src, status: e.message, ok: false });
        }
      }

      fs.mkdirSync(path.join(reportsDir, 'assets'), { recursive: true });
      fs.writeFileSync(
        path.join(reportsDir, 'assets', `${pageInfo.name}-images.json`),
        JSON.stringify(results, null, 2)
      );

      const broken = results.filter(r => !r.ok);
      if (broken.length > 0) {
        console.log(`  Broken images on ${pageInfo.name}:`);
        broken.forEach(b => console.log(`    ${b.src} → ${b.status}`));
      }
      expect(broken, `Broken images found on ${pageInfo.name}`).toHaveLength(0);
    });

    test('no broken internal links', async ({ page, request }) => {
      await loadPage(page, `${STATIC}${pageInfo.path}`);
      const links = await extractLinks(page);

      const internalLinks = links.filter(l =>
        l.href.startsWith(STATIC) || l.href.startsWith('/')
      );

      const results: Array<{ href: string; status: number | string; ok: boolean }> = [];
      const checked = new Set<string>();

      for (const link of internalLinks) {
        const href = link.href.startsWith('/') ? `${STATIC}${link.href}` : link.href;
        if (checked.has(href)) continue;
        checked.add(href);

        try {
          const response = await request.head(href);
          const ok = response.status() !== 404;
          results.push({ href, status: response.status(), ok });
        } catch (e: any) {
          results.push({ href, status: e.message, ok: false });
        }
      }

      fs.mkdirSync(path.join(reportsDir, 'assets'), { recursive: true });
      fs.writeFileSync(
        path.join(reportsDir, 'assets', `${pageInfo.name}-links.json`),
        JSON.stringify(results, null, 2)
      );

      const broken = results.filter(r => !r.ok);
      if (broken.length > 0) {
        console.log(`  Broken links on ${pageInfo.name}:`);
        broken.forEach(b => console.log(`    ${b.href} → ${b.status}`));
      }
      expect(broken, `Broken internal links found on ${pageInfo.name}`).toHaveLength(0);
    });

    test('fonts are loading', async ({ page }) => {
      await loadPage(page, `${STATIC}${pageInfo.path}`);
      // Wait for fonts to load
      await page.evaluate(() => document.fonts.ready);

      const fonts = await checkFontsLoaded(page, ['Lato', 'Open Sans', 'Montserrat', 'Roboto']);

      fs.mkdirSync(path.join(reportsDir, 'assets'), { recursive: true });
      fs.writeFileSync(
        path.join(reportsDir, 'assets', `${pageInfo.name}-fonts.json`),
        JSON.stringify(fonts, null, 2)
      );

      console.log(`  ${pageInfo.name} fonts:`, fonts);

      // Only assert Lato (the primary font used on all pages).
      // Other fonts are linked but only load on-demand when rendered,
      // so document.fonts.check() returns false in headless Chrome.
      expect(fonts['Lato'], `Font "Lato" should be loaded on ${pageInfo.name}`).toBeTruthy();

      const secondary = ['Open Sans', 'Montserrat', 'Roboto'];
      for (const font of secondary) {
        if (!fonts[font]) {
          console.log(`  ⚠ ${font} not rendered on ${pageInfo.name} (linked but no elements use it directly)`);
        }
      }
    });
  });
}
