# Markup Modernization Project

Branch: `markup-modernization`

## Goal

Replace the GHL-exported markup with simple, semantic HTML and slim CSS, with no visual regression at any breakpoint.

## Guardrails

- Visual snapshot harness (`scripts/visual-snapshot.mjs` + `scripts/visual-diff.mjs`) is the gate. 8 viewports × 3 pages = 24 screenshots per check.
- Threshold: **≤ 0.5%** per screenshot vs the rolling baseline. Any candidate exceeding this is reverted.
- Every commit follows: change → `npm run build:prod` → snapshot → diff → if pass, commit; if fail, revert.
- Rolling baseline: re-baseline at the end of each phase so subsequent phases have a fresh reference.
- All work on `markup-modernization` branch. Push periodically. Merge to `main` when project is done.

## Phases

### Phase 1 — CSS-only safe wins (no markup risk)

1.1 Strip `.hl_page-preview--content` prefix from CSS source selectors. The prefix exists because GHL scoped its preview iframe; on a deployed static site the body never has it as an ancestor — it's always a sibling-level wrapper that we can drop.
1.2 Audit and remove unused `@keyframes` (38 declared, ~3 referenced).
1.3 Remove vestigial Vue/Nuxt scaffolding from `body-open-*.html` (`<div id="__nuxt">`, `<span class="nuxt-route-announcer">`).
1.4 Merge identical `body-open-{nav,no-nav}.html` and inline a clean wrapper into `base.liquid`. Drop the `bodyType` frontmatter.
1.5 Add semantic landmark tags (`<main>`, `<header>`, `<nav>`, `<footer>`) where structurally clear.

### Phase 2 — Component-class extraction

2.1 Audit `.cbutton-*` rules and classify variants (likely pink CTA, alt-pink CTA, ghost, etc.).
2.2 Define `.btn`, `.btn-pink`, `.btn-pink-alt` (or whatever the actual variants are) in source CSS.
2.3 Replace hashed button classes in HTML with the new semantic ones, one button at a time.
2.4 Once all buttons converted, delete the old `.cbutton-*` rules and any remaining `.button-<HASH>` wrapper rules.
2.5 Repeat the same audit/extract/replace/delete cycle for headings, paragraphs, sub-headings.

### Phase 3 — Section flattening (per-section)

For each of the 5 homepage sections, the speaker page sections, the resources page sections, and the footer:

3.x.1 Read the section's content (text, images, CTAs).
3.x.2 Write minimal semantic markup using `<section>` + flexbox/grid.
3.x.3 Replace the section in source.
3.x.4 Update CSS as needed (add minimal section-specific rule).
3.x.5 Snapshot + diff. Revert on failure, commit on pass.

### Phase 4 — Final cleanup

4.1 Re-prune source CSS (PurgeCSS may now identify many newly-orphaned hashed rules).
4.2 Remove the `.c-section`, `.c-row`, `.c-column` framework classes that are no longer needed (their HTML scope is gone).
4.3 Format the now-clean page files with prettier.
4.4 Delete unused source files (`body-open-no-nav.html` if not folded already, etc.).
4.5 Final visual diff vs the absolute pre-modernization baseline at all 8 viewports.

## Commit cadence

- One commit per safely-verifiable change (typically 5-30 minutes of work each).
- Each commit message starts with the phase label: `phase 1.1: ...`, `phase 2.3: ...`, etc.
- No bundled commits across phases.

## Definition of done

- Source HTML for `index.html`, `speaker/index.html`, `resources/index.html` reads as clean semantic markup
- No `.cbutton-*`, `.button-<HASH>` per-instance rules remain in CSS
- Source CSS is significantly smaller (target: <100KB; currently 228KB)
- All 24 visual snapshots pass against the pre-modernization baseline (≤0.5% per shot)
- Branch pushed to origin, ready for review/merge
