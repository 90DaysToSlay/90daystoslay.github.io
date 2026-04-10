import { Page } from '@playwright/test';

export async function extractVisibleText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const body = document.body;
    if (!body) return '';
    const clone = body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    return (clone.innerText || '').replace(/\s+/g, ' ').trim();
  });
}

export async function extractHeadings(page: Page): Promise<Array<{ tag: string; text: string }>> {
  return page.evaluate(() => {
    const headings: Array<{ tag: string; text: string }> = [];
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
      const text = (el as HTMLElement).innerText?.trim();
      if (text) {
        headings.push({ tag: el.tagName.toLowerCase(), text });
      }
    });
    return headings;
  });
}

export async function extractImages(page: Page): Promise<Array<{ src: string; alt: string; loaded: boolean }>> {
  return page.evaluate(() => {
    const images: Array<{ src: string; alt: string; loaded: boolean }> = [];
    document.querySelectorAll('img').forEach(img => {
      const el = img as HTMLImageElement;
      images.push({
        src: el.src,
        alt: el.alt || '',
        loaded: el.complete && el.naturalWidth > 0,
      });
    });
    return images;
  });
}

export async function extractLinks(page: Page): Promise<Array<{ href: string; text: string }>> {
  return page.evaluate(() => {
    const links: Array<{ href: string; text: string }> = [];
    document.querySelectorAll('a[href]').forEach(el => {
      const a = el as HTMLAnchorElement;
      links.push({
        href: a.href,
        text: (a.innerText || '').trim(),
      });
    });
    return links;
  });
}

export async function extractSectionCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    return document.querySelectorAll('[class*="c-section"], section').length;
  });
}

export async function extractComputedStyles(page: Page, selector: string): Promise<Record<string, string> | null> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const styles = window.getComputedStyle(el);
    return {
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      lineHeight: styles.lineHeight,
    };
  }, selector);
}

export async function extractSectionMetrics(page: Page): Promise<Array<{ index: number; height: number; className: string }>> {
  return page.evaluate(() => {
    const sections = document.querySelectorAll('[class*="c-section"], section');
    return Array.from(sections).map((el, index) => ({
      index,
      height: el.getBoundingClientRect().height,
      className: el.className?.substring(0, 80) || '',
    }));
  });
}

export async function extractButtonTexts(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const texts: string[] = [];
    document.querySelectorAll('a, button').forEach(el => {
      const text = (el as HTMLElement).innerText?.trim();
      if (text && text.length < 100) {
        texts.push(text);
      }
    });
    return texts;
  });
}

export async function checkFontsLoaded(page: Page, fonts: string[]): Promise<Record<string, boolean>> {
  return page.evaluate((fontList) => {
    const results: Record<string, boolean> = {};
    for (const font of fontList) {
      results[font] = document.fonts.check(`16px "${font}"`);
    }
    return results;
  }, fonts);
}
