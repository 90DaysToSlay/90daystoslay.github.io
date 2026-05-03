// Full-page screenshot capture at every CSS breakpoint, for each page.
// Usage: node scripts/visual-snapshot.mjs --label <name>
// Requires: _site/ to exist (run `npm run build:prod` first).

import { chromium } from "@playwright/test";
import { mkdirSync, existsSync, readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const siteDir = path.join(repoRoot, "_site");

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, arg, i, arr) => {
    if (arg.startsWith("--")) acc.push([arg.slice(2), arr[i + 1]]);
    return acc;
  }, []),
);

const label = args.label;
if (!label) {
  console.error("Usage: node scripts/visual-snapshot.mjs --label <name>");
  process.exit(2);
}

if (!existsSync(siteDir)) {
  console.error(`_site/ not found. Run 'npm run build:prod' first.`);
  process.exit(2);
}

const pages = [
  { name: "home", path: "/" },
  { name: "speaker", path: "/speaker/" },
  { name: "resources", path: "/resources/" },
];

// Breakpoints straddle CSS media-query boundaries at 480/767/1024/1170.
const viewports = [
  { name: "w0320", width: 320, height: 900 },
  { name: "w0375", width: 375, height: 900 },
  { name: "w0480", width: 480, height: 900 },
  { name: "w0600", width: 600, height: 900 },
  { name: "w0768", width: 768, height: 1024 },
  { name: "w1024", width: 1024, height: 900 },
  { name: "w1170", width: 1170, height: 900 },
  { name: "w1440", width: 1440, height: 900 },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function startServer(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split("?")[0]);
      let filePath = path.join(rootDir, urlPath);
      // Directory → index.html
      if (urlPath.endsWith("/")) filePath = path.join(filePath, "index.html");
      // If no extension and path isn't a file, try appending /index.html
      if (!existsSync(filePath) && !path.extname(filePath)) {
        filePath = path.join(filePath, "index.html");
      }
      if (!existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found: " + urlPath);
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME[ext] || "application/octet-stream",
      });
      res.end(readFileSync(filePath));
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

const outDir = path.join(repoRoot, "tests/reports/snapshots", label);
mkdirSync(outDir, { recursive: true });

const { server, url: baseUrl } = await startServer(siteDir);
console.log(`Local server: ${baseUrl}`);
console.log(`Output dir:   ${outDir}`);
console.log(
  `Capturing ${pages.length} pages × ${viewports.length} viewports = ${pages.length * viewports.length} screenshots...`,
);

const browser = await chromium.launch();

try {
  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    for (const pg of pages) {
      const targetUrl = baseUrl + pg.path;
      try {
        await page.goto(targetUrl, {
          waitUntil: "networkidle",
          timeout: 15000,
        });
      } catch {
        // Fallback: pages may not reach networkidle if they load external Stripe/fonts.
        // domcontentloaded has fired by now.
      }
      await page.waitForTimeout(500);
      // Disable animations/transitions for stable screenshots.
      await page.addStyleTag({
        content:
          "*, *::before, *::after { animation: none !important; transition: none !important; }",
      });
      await page.waitForTimeout(200);
      const outFile = path.join(outDir, `${pg.name}-${vp.name}.png`);
      await page.screenshot({ path: outFile, fullPage: true });
      const size = (await import("fs")).statSync(outFile).size;
      console.log(
        `  ${pg.name.padEnd(10)} ${vp.name} (${vp.width}x)  ${(size / 1024).toFixed(0)}KB`,
      );
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log(
  `\nDone. ${pages.length * viewports.length} screenshots → ${outDir}`,
);
