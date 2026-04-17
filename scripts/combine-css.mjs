// Regenerate src/assets/css/styles.css from a set of input CSS files.
// Deduplicates identical rules and outputs human-readable formatting.
// Minification happens later at build time (scripts/purge-css.mjs).

import { readFileSync, writeFileSync, statSync } from 'fs';
import postcss from 'postcss';
import cssnano from 'cssnano';
import prettier from 'prettier';

// Cascade order: page CSS first, styles.css last (same order base.liquid
// originally loaded them, so styles.css continues to win on equal-specificity
// ties after the concatenation).
const sources = [
  'src/assets/css/styles.css',
];

const output = 'src/assets/css/styles.css';

const before = statSync(output).size;
const combined = sources.map((f) => readFileSync(f, 'utf8')).join('\n\n');

// Dedupe only — no whitespace/declaration mutations that would alter cascade.
const deduped = await postcss([
  cssnano({
    preset: [
      'default',
      {
        discardDuplicates: true,
        discardEmpty: true,
        normalizeWhitespace: false,
        mergeRules: false,
        mergeLonghand: false,
        reduceIdents: false,
        minifyFontValues: false,
        minifySelectors: false,
        minifyParams: false,
        colormin: false,
        cssDeclarationSorter: false,
      },
    ],
  }),
]).process(combined, { from: undefined, to: output });

// Format for humans.
const formatted = await prettier.format(deduped.css, { parser: 'css' });

writeFileSync(output, formatted);

const after = statSync(output).size;
console.log(`styles.css: ${(before / 1024).toFixed(1)}KB → ${(after / 1024).toFixed(1)}KB`);
