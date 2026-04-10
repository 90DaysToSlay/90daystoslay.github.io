import { test as base, Page } from '@playwright/test';

export const ORIGINAL = 'https://www.90daystoslay.biz';
export const STATIC = 'https://90daystoslay.github.io';

export const PAGES = [
  { name: 'homepage', path: '/' },
  { name: 'speaker', path: '/speaker/' },
  { name: 'resources', path: '/resources/' },
] as const;

export type PageInfo = (typeof PAGES)[number];

export async function loadPage(page: Page, url: string, options?: { disableAnimations?: boolean }) {
  // GHL homepage never reaches networkidle due to persistent connections.
  // Use domcontentloaded + extra wait to let JS render content.
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  } catch {
    // Fallback: if networkidle times out, the page is still loaded
    // (domcontentloaded already fired). Just wait for content to render.
  }
  await page.waitForTimeout(3000);

  if (options?.disableAnimations) {
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
      document.head.appendChild(style);
    });
    await page.waitForTimeout(500);
  }
}

export const test = base;
export { expect } from '@playwright/test';
