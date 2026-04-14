# 90DaysToSlay

## Project Overview
Static website for Jessica Allen's sales coaching business, converted from GoHighLevel to Eleventy. The HTML/CSS was copied directly from the live GHL site to preserve the exact look and feel.

- **Stack**: Eleventy 3.x, Liquid templates, GHL-extracted CSS, GitHub Pages
- **Deploy**: GitHub Actions → GitHub Pages (auto on push to main)

## Development Commands
- `npm run build` — Build to `_site/`
- `npm start` — Dev server at localhost:8080
- `NODE_ENV=development npm run test:compare` — Run full Playwright comparison suite
- `NODE_ENV=development npm run test:compare:visual` — Screenshots only
- `NODE_ENV=development npm run test:compare:report` — Open Playwright HTML report

Note: `NODE_ENV=development` is required because the container defaults to production, which skips devDependencies.

## Key File Paths
- `src/` — Source files (templates, CSS, data, images)
- `src/_data/site.json` — Global site URL
- `src/_includes/layouts/base.liquid` — Base HTML layout (head, fonts, CSS links)
- `src/assets/css/ghl-styles.css` — Extracted GHL inline styles (preserves original class names)
- `src/assets/css/entry.css` — GHL framework CSS (section/row/column layout system)
- `src/assets/css/button.css` — GHL button component CSS
- `src/assets/images/` — All site images (downloaded from GHL CDN)
- `eleventy.config.js` — Eleventy configuration
- `tests/` — Playwright comparison test suite

## Pages
- `src/index.html` → `/` — Homepage
- `src/speaker.html` → `/speaker/` — Speaker bio and booking
- `src/resources.html` → `/resources/` — Worksheet download, Slay in a Box product
- `src/speaker-page.liquid` → `/speaker-page/` — Meta-refresh redirect to /speaker/
- `src/404.html` → `/404.html` — Custom 404

## Testing
Playwright test suite compares the static site (90daystoslay.github.io) against the original GHL site (www.90daystoslay.biz):
- `tests/comparison/visual.spec.ts` — Screenshots at 3 viewports with pixel diffs
- `tests/comparison/content.spec.ts` — Text, heading, and CTA comparison
- `tests/comparison/structure.spec.ts` — Section/heading/image/link counts
- `tests/comparison/assets.spec.ts` — Broken images, links, font loading
- `tests/comparison/layout.spec.ts` — Computed styles and section heights
- Reports output to `tests/reports/` (gitignored)

## Kiro Spec-Driven Workflow

All feature work follows the **Kiro 3-phase process** with approval gates:

1. **Requirements** → `.kiro/specs/{feature}/requirements.md`
2. **Design** → `.kiro/specs/{feature}/design.md`
3. **Tasks** → `.kiro/specs/{feature}/tasks.md`
4. **Implementation** → Execute tasks incrementally

Templates are in `.kiro/templates/`. Never skip phases or approval gates.

## Agent Team

The `/project-shepherd` manages all specialist agents:

| Command | Role |
|---------|------|
| `/project-shepherd` | Coordinates team, manages Kiro workflow |
| `/frontend-developer` | UI implementation |
| `/seo-specialist` | Technical SEO, structured data |
| `/ux-architect` | Design systems, layout |
| `/code-reviewer` | Code quality reviews |
| `/accessibility-auditor` | WCAG 2.2 AA compliance |
| `/content-creator` | Copywriting, content strategy |
| `/brand-guardian` | Brand consistency |
| `/performance-benchmarker` | Core Web Vitals, page speed |
