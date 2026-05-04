# Markup Modernization Project

Branch: `markup-modernization`

## What landed

| Phase | Change | Impact | Visual diff |
|---|---|---|---|
| 1.2 | Remove 15 unused `@keyframes` | -4.2KB CSS source | 0.018% |
| 1.3 | Drop `<div id="__nuxt">` + `nuxt-route-announcer` from body-open | -1KB across partials | 0.017% |
| 1.4 | Merge `body-open-{nav,no-nav}.html` + drop `bodyType` frontmatter | One source-of-truth wrapper | 0.018% |
| 2.1 | **Replace 14 hashed buttons with `.btn`/`.btn-yellow` component** | **-22KB CSS, -140 hashed rules** | 0.099% |
| 2.2 | Re-prune source CSS (PurgeCSS after button consolidation) | -9KB CSS | 0.093% |
| 3 | **Format all source HTML files for human readability** | Page files: 1 line → 405-942 lines | 0.097% |
| 4.1 | Strip 8 more zero-CSS class names from HTML | -4KB HTML | 0.098% |

### Numbers

| | Before (master-baseline) | After |
|---|---|---|
| Built CSS (deploy) | 158KB total HTML+CSS | 132KB total (**-16%**) |
| Source CSS | 228KB (1295 rules) | 190KB (933 rules, **-28%** rules) |
| Hashed-class CSS rules | 741 | 478 (**-263**) |
| Source HTML readability | minified single line | formatted multi-line |
| All visual snapshots | baseline | all 24 viewports ≤ 0.099% diff |

## Approach proven out

The visual-regression harness (`scripts/visual-snapshot.mjs` + `visual-diff.mjs`) is the load-bearing safety mechanism. Every commit on this branch was verified at 24 screenshots (8 viewports × 3 pages) before landing. Three candidates were attempted and reverted when they exceeded the 0.5% threshold:

- **Phase 1.1 — strip `.hl_page-preview--content` prefix**: 6.6% diff (specificity collisions). Reverted.
- **Phase 4 — image-feature consolidation**: 11.7% diff (subtle per-instance differences). Reverted.
- **Phase 4 — unwrap useless wrapper divs**: 22.9% diff (flex-child position changes). Reverted.

## What's left (for a future session)

These are the bigger swings that need more careful work or HTML rewrites:

1. **Section-by-section HTML rewrites** — flatten the 6-level wrapper chain (`section → .inner → row → .inner → column → .vertical .inner → content`) per-section. Each section needs bespoke rewriting to reproduce backgrounds and column ratios. Highest payoff for "simple and semantic" goal.
2. **Heading/sub-heading/paragraph consolidation** — 21+25+18 = 64 hashed classes with 330 rules. Cluster into 4-5 size variants (`.h-display`, `.h-section`, `.h-small`, `.h-tiny`). Blocked on per-instance font-size variation that requires HTML mapping.
3. **`hl_page-preview--content` prefix removal** — removing it triggered specificity cascade changes. Doable if combined with rule re-ordering audit.
4. **Image-feature consolidation** — 4 hashes × 57 rules each. Visual diff exceeded 0.5% on first attempt; needs per-property comparison to find the real differences.
5. **Cloudflare Insights beacon + `<div id="teleports">`** — vestigial in copyright partials, easy delete once the partials are formatted/balanced.
6. **Stripe iframes still embedded in `copyright-home.html`** — leftover from GHL export, dead at runtime, ~6KB removable.

## Guardrails (still in place)

- `npm run build:prod` minifies HTML + purges CSS for deploy.
- `npm run build` / `npm start` ship the formatted source for debugging.
- `npm run snapshot -- --label X` and `npm run diff -- --before X --after Y` for any future change.
- `master-baseline` snapshot at `tests/reports/snapshots/master-baseline/` is the absolute reference for this branch.
