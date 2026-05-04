// Minify all HTML files in _site/ in place. Used as the final step of
// `npm run build:prod`. The dev build (`npm run build`, `npm start`) leaves
// HTML pretty so it's debuggable.

import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join, extname } from "path";
import { minify } from "html-minifier-terser";

const root = "_site";

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.isFile() && extname(entry.name) === ".html") yield path;
  }
}

const options = {
  collapseWhitespace: true,
  // Preserve trailing spaces inside text nodes — html-minifier-terser
  // would otherwise strip the space after "Good. " or "I create " before
  // a following <strong>/<a>, producing "Good.Because" / "createworkshops"
  // in rendered text.
  conservativeCollapse: true,
  // Same reason — don't eat the space the browser would render between
  // e.g. <strong>Good.</strong> Because.
  collapseInlineTagWhitespace: false,
  removeComments: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: false,
  minifyCSS: true,
  minifyJS: true,
  sortAttributes: false,
  sortClassName: false,
  keepClosingSlash: true,
  decodeEntities: false,
};

let totalBefore = 0;
let totalAfter = 0;
const results = [];

for (const file of walk(root)) {
  const before = readFileSync(file, "utf8");
  const after = await minify(before, options);
  writeFileSync(file, after);
  const sb = Buffer.byteLength(before, "utf8");
  const sa = Buffer.byteLength(after, "utf8");
  totalBefore += sb;
  totalAfter += sa;
  results.push({ file, sb, sa });
}

for (const r of results) {
  const pct = ((1 - r.sa / r.sb) * 100).toFixed(1);
  console.log(
    `${r.file}: ${(r.sb / 1024).toFixed(1)}KB → ${(r.sa / 1024).toFixed(1)}KB (-${pct}%)`,
  );
}
const total = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
console.log(
  `\ntotal: ${(totalBefore / 1024).toFixed(1)}KB → ${(totalAfter / 1024).toFixed(1)}KB (-${total}%)`,
);
