# 90DaysToSlay

## Project Overview
Static website for Jessica Allen's sales coaching business, converted from GoHighLevel to Eleventy.

- **Stack**: Eleventy 3.x, Liquid templates, vanilla CSS, GitHub Pages
- **Deploy**: GitHub Actions → GitHub Pages (auto on push to main)

## Development Commands
- `npm run build` — Build to `_site/`
- `npm start` — Dev server at localhost:8080

## Key File Paths
- `src/` — Source files (templates, CSS, data, images)
- `src/_data/` — Global data (site.json, pricing.json, testimonials.json)
- `src/_includes/layouts/` — Base layout (base.liquid)
- `src/_includes/partials/` — Header, footer, testimonials, pricing-card
- `src/assets/css/` — CSS design system (variables, reset, typography, layout, components)
- `src/assets/images/` — All site images
- `eleventy.config.js` — Eleventy configuration with YouTube shortcode

## Pages
- `/` — Homepage (pricing, video, testimonials, CTAs)
- `/speaker/` — Speaker bio and booking
- `/resources/` — Worksheet download, Slay in a Box product
- `/speaker-page/` — Redirect to /speaker/
- `/404.html` — Custom 404

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
