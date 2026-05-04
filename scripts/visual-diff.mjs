// Pixel-diff two snapshot directories produced by visual-snapshot.mjs.
// Usage: node scripts/visual-diff.mjs --before <label> --after <label> [--threshold <pct>]

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, arg, i, arr) => {
    if (arg.startsWith('--')) acc.push([arg.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

const before = args.before;
const after = args.after;
const thresholdPct = parseFloat(args.threshold ?? '0.5');

if (!before || !after) {
  console.error('Usage: node scripts/visual-diff.mjs --before <label> --after <label> [--threshold <pct>]');
  process.exit(2);
}

const baseDir = path.join(repoRoot, 'tests/reports/snapshots');
const beforeDir = path.join(baseDir, before);
const afterDir = path.join(baseDir, after);
const diffDir = path.join(baseDir, `diff-${before}-vs-${after}`);

for (const d of [beforeDir, afterDir]) {
  if (!existsSync(d)) {
    console.error(`Missing snapshot dir: ${d}`);
    process.exit(2);
  }
}
mkdirSync(diffDir, { recursive: true });

function padImage(img, w, h) {
  if (img.width === w && img.height === h) return img;
  const padded = new PNG({ width: w, height: h });
  for (let i = 0; i < padded.data.length; i += 4) {
    padded.data[i] = 255;
    padded.data[i + 1] = 255;
    padded.data[i + 2] = 255;
    padded.data[i + 3] = 255;
  }
  PNG.bitblt(img, padded, 0, 0, img.width, img.height, 0, 0);
  return padded;
}

const files = readdirSync(beforeDir).filter(f => f.endsWith('.png'));
const results = [];
let maxPct = 0;

for (const file of files) {
  const bPath = path.join(beforeDir, file);
  const aPath = path.join(afterDir, file);
  if (!existsSync(aPath)) {
    console.error(`Missing counterpart: ${aPath}`);
    results.push({ file, status: 'missing', pct: null });
    continue;
  }
  const b = PNG.sync.read(readFileSync(bPath));
  const a = PNG.sync.read(readFileSync(aPath));
  const w = Math.max(b.width, a.width);
  const h = Math.max(b.height, a.height);
  const bp = padImage(b, w, h);
  const ap = padImage(a, w, h);
  const diff = new PNG({ width: w, height: h });
  const mismatched = pixelmatch(bp.data, ap.data, diff.data, w, h, { threshold: 0.3 });
  const total = w * h;
  const pct = (mismatched / total) * 100;
  maxPct = Math.max(maxPct, pct);
  const status = pct <= thresholdPct ? 'pass' : 'fail';
  results.push({ file, pct, status, mismatched, total });
  // Only write diff image if there was a diff
  if (mismatched > 0) {
    writeFileSync(path.join(diffDir, file), PNG.sync.write(diff));
  }
}

// Summary
console.log(`\nVisual diff: ${before} → ${after}  (threshold ${thresholdPct}%)`);
console.log(`${'-'.repeat(62)}`);
console.log(`${'file'.padEnd(34)}${'diff%'.padStart(10)}${'status'.padStart(10)}`);
console.log(`${'-'.repeat(62)}`);
for (const r of results) {
  if (r.status === 'missing') {
    console.log(`${r.file.padEnd(34)}${''.padStart(10)}${'missing'.padStart(10)}`);
  } else {
    console.log(`${r.file.padEnd(34)}${r.pct.toFixed(3).padStart(10)}${r.status.padStart(10)}`);
  }
}
console.log(`${'-'.repeat(62)}`);
console.log(`max diff: ${maxPct.toFixed(3)}%`);

// Markdown summary
const md = [
  `# Visual diff: \`${before}\` → \`${after}\``,
  ``,
  `Threshold: ${thresholdPct}%  |  Max diff: ${maxPct.toFixed(3)}%  |  ${results.filter(r=>r.status==='pass').length}/${results.length} pass`,
  ``,
  `| File | Diff % | Status |`,
  `|---|---:|:---:|`,
  ...results.map(r => {
    if (r.status === 'missing') return `| ${r.file} | — | missing |`;
    return `| ${r.file} | ${r.pct.toFixed(3)}% | ${r.status} |`;
  }),
  ``,
].join('\n');
writeFileSync(path.join(diffDir, 'summary.md'), md);
console.log(`\nReport: ${path.join(diffDir, 'summary.md')}`);

const anyFail = results.some(r => r.status === 'fail' || r.status === 'missing');
process.exit(anyFail ? 1 : 0);
