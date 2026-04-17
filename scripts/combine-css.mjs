import { readFileSync, writeFileSync, statSync } from 'fs';
import postcss from 'postcss';
import cssnano from 'cssnano';

// Cascade order: page CSS first, styles.css last (same order base.liquid
// currently loads them, so styles.css continues to win on equal-specificity
// ties after the concatenation).
const sources = [
  'src/assets/css/home.css',
  'src/assets/css/speaker.css',
  'src/assets/css/resources.css',
  'src/assets/css/styles.css',
];

const output = 'src/assets/css/styles.css';

const before = sources.reduce((sum, f) => sum + statSync(f).size, 0);

const combined = sources.map((f) => readFileSync(f, 'utf8')).join('\n\n');

const result = await postcss([
  cssnano({
    preset: [
      'default',
      {
        // Keep these optimizations: they're safe and what we want.
        discardDuplicates: true,
        discardEmpty: true,
        normalizeWhitespace: true,
        // Disable anything that could reorder or merge declarations —
        // the concatenation relies on cascade order being preserved.
        mergeRules: false,
        mergeLonghand: false,
        reduceIdents: false,
      },
    ],
  }),
]).process(combined, { from: undefined, to: output });

writeFileSync(output, result.css);

const after = statSync(output).size;
console.log(`Combined 4 files: ${(before / 1024).toFixed(1)}KB → ${(after / 1024).toFixed(1)}KB (${((1 - after / before) * 100).toFixed(1)}% reduction)`);
