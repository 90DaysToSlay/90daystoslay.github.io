# 90DaysToSlay

## Who I Am

**Albert Volkman** — senior software developer running Volkman Software.
Primary languages: PHP, JavaScript/Node.js, Python. Skip beginner explanations. Match my level.

---

## How You Must Work (Non-Negotiable)

### Phase discipline — NEVER skip this
1. **Explore first.** Read and map the codebase before touching anything. Do NOT write code yet.
2. **Plan second.** Write your plan to `plan.md` before implementation. Use extended thinking.
3. **Code third.** Implement per the plan. Run tests/linter after each file change.
4. **Commit last.** Stage, write a descriptive commit message, push.

If I ask you to "just do it," still explore first. You may be brief, but never skip.

### Verification loops — always
After every file change:
- Run the relevant test command (check `package.json` for the right one)
- Run the linter if configured
- Report what passed/failed before moving on

Never tell me "I think this will work." Verify it.

### Context health
- At 60% context used, warn me: "⚠️ Context at 60%. Recommend handoff soon."
- At 80%+, stop and write a handoff document to `HANDOFF-$(date +%Y-%m-%d).md` before continuing.
- If you find yourself re-asking questions I already answered, tell me context is degrading.

---

## What I Never Want

- Long preambles, apologies, or recapping what I just said
- Confident answers about specific API behavior or third-party libs without checking
- Rewriting files in a different style than the existing code
- Suggesting the minimal/safe path when I ask for the right solution
- Bullet-point soup — use prose unless structure genuinely helps
- Validating my ideas before giving substance — challenge my reasoning

---

## Commit Standards

Format: `type(scope): description`
Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`
Always stage specific files, never `git add .` without listing what's included.

---

## Mistakes Become Rules

If you make a mistake and I correct you, acknowledge it and ask: "Should I add this as a rule to CLAUDE.md?"

---

## Project Overview

Static website for Jessica Allen's sales coaching business. The HTML/CSS/JS was copied verbatim from the live GoHighLevel site at www.90daystoslay.biz. No build step — the `site/` directory is deployed directly to GitHub Pages.

- **Stack**: Static HTML/CSS/JS (copied from GHL), GitHub Pages
- **Deploy**: GitHub Actions → GitHub Pages (auto on push to main, deploys `site/`)

## Development Commands
- `npm start` — Serve `site/` locally on port 8080
- `NODE_ENV=development npm run test:compare` — Run full Playwright comparison suite
- `NODE_ENV=development npm run test:compare:visual` — Screenshots only
- `NODE_ENV=development npm run test:compare:report` — Open Playwright HTML report

Note: `NODE_ENV=development` is required because the container defaults to production, which skips devDependencies.

## Key File Paths
- `site/` — Static site root (deployed directly, no build step)
- `site/index.html` — Homepage (verbatim GHL HTML with local asset paths)
- `site/speaker/index.html` — Speaker bio and booking
- `site/resources/index.html` — Worksheet download, Slay in a Box product
- `site/speaker-page/index.html` — Speaker page (duplicate from GHL)
- `site/assets/css/` — GHL framework CSS (entry.css, button.css, etc.)
- `site/assets/js/email-decode.min.js` — Cloudflare email obfuscation decoder
- `site/assets/images/` — All site images (downloaded from GHL CDN)
- `site/assets/icons/` — Social media SVG icons
- `site/CNAME` — Custom domain (www.90daystoslay.biz)
- `tests/` — Playwright comparison test suite

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
