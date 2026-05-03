import { PurgeCSS } from "purgecss";
import { readFileSync, writeFileSync, statSync } from "fs";
import postcss from "postcss";
import cssnano from "cssnano";

const cssFiles = ["_site/assets/css/styles.css"];

const result = await new PurgeCSS().purge({
  content: ["_site/**/*.html"],
  css: cssFiles,
  safelist: {
    standard: [
      "hide",
      "hide-popup",
      // Mobile responsive class toggled by JS
      /^--mobile$/,
      // Animate.css
      /^animate__/,
      // Font Awesome
      /^fa$/,
      /^fas$/,
      /^far$/,
      /^fab$/,
      /^fa-/,
    ],
    deep: [
      // GHL builder-generated IDs — any descendant rule keyed on these stays
      /^section-[A-Za-z0-9_-]+/,
      /^row-[A-Za-z0-9_-]+/,
      /^col-[A-Za-z0-9_-]+/,
      /^button-[A-Za-z0-9_-]+/,
      /^heading-[A-Za-z0-9_-]+/,
      /^image-[A-Za-z0-9_-]+/,
      /^paragraph-[A-Za-z0-9_-]+/,
      /^cbutton-/, // button class variants like cbutton-Erifl3CgSN
      /^nav-menu-v2-/,
    ],
    // Keep CSS variables and keyframes referenced elsewhere
    keyframes: true,
    variables: true,
  },
});

for (const r of result) {
  const sizeBefore = statSync(r.file).size;
  // Purge first, then minify with cssnano (keeps declaration order intact).
  const minified = await postcss([
    cssnano({
      preset: [
        "default",
        {
          mergeRules: true,
          mergeLonghand: true,
          reduceIdents: false,
        },
      ],
    }),
  ]).process(r.css, { from: undefined, to: r.file });
  writeFileSync(r.file, minified.css);
  const sizeAfter = statSync(r.file).size;
  const pct = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
  console.log(
    `${r.file}: ${(sizeBefore / 1024).toFixed(1)}KB → ${(sizeAfter / 1024).toFixed(1)}KB (${pct}% reduction)`,
  );
}
