import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './comparison',
  timeout: 60000,
  retries: 1,
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(__dirname, 'reports/playwright-report'), open: 'never' }],
  ],
  use: {
    actionTimeout: 15000,
    bypassCSP: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  projects: [
    {
      name: 'mobile',
      use: { viewport: { width: 375, height: 812 } },
    },
    {
      name: 'tablet',
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop',
      use: { viewport: { width: 1440, height: 900 } },
    },
  ],
  globalTeardown: path.join(__dirname, 'helpers/global-teardown.ts'),
});
