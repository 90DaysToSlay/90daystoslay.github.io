# Plan: Convert 90DaysToSlay from GoHighLevel to Eleventy Static Site

## Context

Jessica Allen's sales coaching site **90DaysToSlay** is currently hosted on GoHighLevel at `https://www.90daystoslay.biz/`. The goal is to convert it to a static Eleventy (11ty) site deployed via GitHub Pages at `90DaysToSlay/90daystoslay.github.io`. The repo is empty — fresh setup needed.

**Git credentials**: Albert Volkman <albert.volkman@gmail.com>

## Site Map (4 pages, 3 unique)

| URL | Content Summary |
|-----|----------------|
| `/` | Hero logo, intro + YouTube embed, qualification section, pricing cards (3 tiers), testimonials, CTAs |
| `/speaker/` | Speaker bio, headshot, credentials, workshops list, testimonials, contact |
| `/speaker-page/` | **Redirect to `/speaker/`** (duplicate content on GHL) |
| `/resources/` | Worksheet download, "Slay in a Box" product ($249), testimonials, contact |

## Brand Tokens

- **Colors**: Purple `#5B0088`, Hot Pink `#FF66C4` / `#ed258b`, White, Black
- **Fonts**: Lato, Montserrat, Open Sans (Google Fonts)
- **Tone**: Fun, irreverent, emoji-heavy, anti-corporate

## Agent Team

| Agent | Assignment |
|-------|-----------|
| `/frontend-developer` | Build all templates, layouts, CSS |
| `/ux-architect` | CSS design system review |
| `/seo-specialist` | Meta tags, structured data, sitemap |
| `/content-creator` | Content migration accuracy |
| `/brand-guardian` | Color/font/tone consistency |
| `/accessibility-auditor` | WCAG 2.2 AA audit |
| `/performance-benchmarker` | Lighthouse/CWV audit |
| `/code-reviewer` | Final code quality review |

No additional agents from msitarzewski/agency-agents or sickn33/antigravity-awesome-skills are needed — the existing team covers all required specialties for a 4-page static site conversion.

---

## Directory Structure

```
/workspace/
├── .github/workflows/deploy.yml    # GitHub Actions: build + deploy
├── src/
│   ├── _data/
│   │   ├── site.json               # Global metadata (title, URL, social)
│   │   ├── pricing.json            # 3 pricing tiers
│   │   └── testimonials.json       # Shared testimonials
│   ├── _includes/
│   │   ├── layouts/
│   │   │   └── base.liquid         # Base HTML layout
│   │   └── partials/
│   │       ├── header.liquid       # Nav bar
│   │       ├── footer.liquid       # Footer (contact, social, copyright)
│   │       ├── testimonials.liquid  # Testimonial cards section
│   │       └── pricing-card.liquid  # Pricing card component
│   ├── assets/
│   │   ├── css/
│   │   │   ├── variables.css       # Design tokens
│   │   │   ├── reset.css           # Minimal reset
│   │   │   ├── typography.css      # Font imports + type scale
│   │   │   ├── layout.css          # Grid/flex, container
│   │   │   └── components.css      # Buttons, cards, nav, sections
│   │   └── images/                 # Downloaded from GHL CDN (~12 files)
│   ├── index.liquid                   # Homepage
│   ├── speaker.liquid                 # Speaker page
│   ├── speaker-page.liquid            # Redirect → /speaker/
│   ├── resources.liquid               # Resources page
│   ├── 404.liquid                     # Custom 404
│   ├── sitemap.liquid                 # XML sitemap
│   └── robots.liquid                  # robots.txt
├── eleventy.config.js              # Eleventy 3.x config
├── package.json
├── CNAME                           # www.90daystoslay.biz
├── .gitignore
├── CLAUDE.md                       # (update with project specifics)
└── README.md
```

---

## Implementation Steps

### Phase 1: Project Scaffolding

**Step 1** — Initialize npm project + install Eleventy 3.x
- `npm init -y`, `npm install @11ty/eleventy`
- Create `.gitignore` (node_modules, _site, .DS_Store)

**Step 2** — Create `eleventy.config.js`
- Input: `src/`, Output: `_site/`
- Template formats: liquid, md, html
- Passthrough copy: `src/assets/` → `assets/`, `CNAME` → root
- YouTube shortcode: accepts video ID, outputs responsive 16:9 iframe
- Markdown + Liquid template engines

**Step 3** — Create directory structure (`src/_data/`, `src/_includes/`, `src/assets/css/`, `src/assets/images/`)

### Phase 2: Design System (CSS)

**Step 4** — `variables.css`: Brand colors, fonts, spacing scale
**Step 5** — `reset.css`: Modern minimal reset
**Step 6** — `typography.css`: Google Fonts import (Lato, Montserrat, Open Sans), heading/body styles
**Step 7** — `layout.css`: Container, section, grid/flex utilities, responsive breakpoints
**Step 8** — `components.css`: Buttons (pink primary, purple secondary), pricing cards, testimonial cards, nav, footer, hero, YouTube embed container

### Phase 3: Layouts & Partials

**Step 9** — `base.liquid` layout: HTML shell with `<head>` (charset, viewport, title, meta description, OG tags, canonical, CSS links, Google Fonts, favicon, JSON-LD structured data), `<body>` wrapping header partial + content + footer partial

**Step 10** — `header.liquid`: Logo linked to `/`, nav links (Home, Hire Me To Speak, Slay In A Box [external], Resources & Cool Shit), mobile hamburger toggle

**Step 11** — `footer.liquid`: Contact (512-981-8669, email), social links (LinkedIn, YouTube, Facebook), copyright © 2024 #90DaysToSlay, LLC

**Step 12** — `testimonials.liquid`: Iterable testimonial card component
**Step 13** — `pricing-card.liquid`: Card with title, price, features list, CTA button

### Phase 4: Data Files

**Step 14** — `site.json`: Site title, URL, description, author, social URLs, contact info
**Step 15** — `pricing.json`: 3 tiers extracted from homepage:
  - 90 Minute Session — $3,500 (features list, Calendly link)
  - 90 Day Program — $9,500 (features list, Calendly link)  
  - Annual Program — $18,000 (features list, Calendly link)
**Step 16** — `testimonials.json`: 4 testimonials (Brandon, Raul, Anne, Jeff) with text + attribution

### Phase 5: Image Assets

**Step 17** — Download all ~12 images from `assets.cdn.filesafe.space` CDN via curl, rename descriptively:
  - `logo-hero.png` (6642c519...)
  - `jessica-headshot.png` (66b66c3d...)
  - `jessica-speaking.jpeg` (66e9a144...)
  - `client-logo-1.png` through `client-logo-3.png` (66ba7ab1, 66ba7d4b, 66c62b9b)
  - Background images (66ba5f9f, 66ba5f18)
  - etc.
- Set explicit `width`/`height` on all `<img>` tags
- Use `loading="lazy"` on below-fold images

### Phase 6: Page Content Migration

**Step 18** — `index.liquid` (Homepage):
  1. Hero section with logo image
  2. Intro section: "Sales Doesn't Have to Be Cringe" + body text + YouTube embed (ID: `bxFNd15LsPQ`) + "Book A Vibe Check" CTA → Calendly
  3. Qualification section: "Slaying might not be your jam if:" + disqualifiers
  4. "Bet On Your Business" section + CTA
  5. Client logos row (3 images)
  6. "Book My Slay Sesh NOW!" CTA
  7. Pricing cards section (iterate `pricing.json`)
  8. Testimonials section (iterate `testimonials.json`)

**Step 19** — `speaker.liquid`:
  1. Speaker bio header with headshot, contact details, location
  2. Intro: "Helping teams turn sales from cringe to captivating"
  3. "What Jessica Brings to Your Stage" (5 talk topics)
  4. "Who Is Jessica?" bio section
  5. "Workshops & Signature Talks" (7 workshop descriptions)
  6. "Skillz" section (8 skill descriptions)
  7. "Street Cred" credentials list
  8. Testimonials
  9. CTA → Calendly

**Step 20** — `speaker-page.liquid`: Meta-refresh redirect to `/speaker/` with canonical tag

**Step 21** — `resources.liquid`:
  1. Intro: "#90DaysToSlay Is For You"
  2. Worksheet download section
  3. "Slay in a Box" product ($249) → FastPay link
  4. Testimonials
  5. Contact/footer

**Step 22** — `404.liquid`: Custom 404 page with brand styling + link back to home

### Phase 7: SEO

**Step 23** — Per-page front matter: title, description, ogImage
**Step 24** — JSON-LD structured data in `base.liquid`:
  - Organization schema (name, URL, logo, social profiles)
  - LocalBusiness schema (Jessica Allen, Austin TX)
**Step 25** — `sitemap.liquid`: XML sitemap with all 3 pages
**Step 26** — `robots.liquid`: Allow all, reference sitemap

### Phase 8: GitHub Actions + Deployment

**Step 27** — `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: "pages"
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Step 28** — `CNAME` file with `www.90daystoslay.biz`

### Phase 9: Final Polish + Commit + Push

**Step 29** — Update `CLAUDE.md` with actual project details (stack, commands, file paths)
**Step 30** — Configure git user: `Albert Volkman <albert.volkman@gmail.com>`
**Step 31** — Build locally to verify: `npx @11ty/eleventy`
**Step 32** — Commit all files and push to `main`

---

## Key Technical Decisions

- **Eleventy 3.x** with Liquid templates — Eleventy's default template language, clean syntax
- **No CSS framework** — 4 pages, ~15 components. Custom CSS is smaller/faster
- **No Eleventy Image plugin** — 12 static images, pre-optimize once
- **Order forms replaced with external links** — GHL Stripe forms → Calendly/FastPay CTAs
- **Meta-refresh redirect** for `/speaker-page/` → `/speaker/` (GitHub Pages has no server-side redirects)
- **GitHub Actions** with `actions/deploy-pages@v4` for automated build + deploy on push to main

## Progress

- ✅ Phase 1: Project scaffolding (npm, eleventy config, directory structure)
- ✅ Phase 2: CSS design system (variables, reset, typography, layout, components)
- ✅ Phase 3: Layouts & partials (base, header, footer, testimonials, pricing-card)
- ✅ Phase 4: Data files (site.json, pricing.json, testimonials.json)
- ✅ Phase 5: Images downloaded (10 images from CDN)
- ✅ Phase 6: All 4 pages + 404 created
- ✅ Phase 7: SEO (sitemap.xml, robots.txt, JSON-LD, OG tags, canonical URLs)
- ✅ Phase 8: GitHub Actions deploy workflow
- ✅ Phase 9: CLAUDE.md updated, build verified (7 pages, 16 copied files)
- 🔄 Commit and push to main

## Verification

1. `npm run build` — produces `_site/` with all pages
2. `npx @11ty/eleventy --serve` — local preview at localhost:8080
3. Verify all 3 pages render correctly with images, YouTube embed, correct links
4. Verify `/speaker-page/` redirects to `/speaker/`
5. Verify sitemap.xml and robots.txt are generated
6. After push — GitHub Actions builds and deploys successfully
7. Site accessible at `https://90daystoslay.github.io` (and eventually at custom domain)
