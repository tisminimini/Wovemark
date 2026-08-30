# Wovemark

> **Declarative Markdown for AI Coding Agents.** Build complete, responsive, animated, and accessible websites, landing pages, documentation portals, and SaaS dashboards without writing frontend boilerplate.

---

## 🤖 Using Wovemark with an AI Coding Agent

If you are using an AI coding agent (e.g. Claude Code, Gemini CLI, Codex, OpenCode, Antigravity):

### 1. Install the Official Skill:
```bash
npx skills add https://github.com/wovemark/wovemark --skill wovemark
```

### 2. Prompt your agent:
> *"Create a complete SaaS analytics dashboard with 4 metric cards, a weekly traffic chart, and a searchable user management table. Write everything entirely in Wovemark."*

Your agent will choose semantic intentions and generate `.wovemark.md` files; the Wovemark runtime decides layout, styling, animations, responsive breakpoints, and accessibility.

---

## ⚡ What is Wovemark?

Wovemark is a declarative Markdown format and ultra-lightweight client runtime designed from the ground up for agent-first software creation:

```text
AI Coding Agent
      ↓
*.wovemark.md (Frontmatter + Directives + Content)
      ↓
@wovemark/parser (AST & Schema Validation with Typo Suggestions)
      ↓
@wovemark/runtime (Tokens + Component Registry + Motion + Data Store)
      ↓
Semantic, Animated, Accessible HTML5 DOM
```

The agent **never** needs to generate:
- React / Vue / Svelte components
- JSX or raw HTML templates
- Tailwind classes or custom CSS keyframes
- Media query breakpoints and manual flex/grid calculations
- Modal focus traps and keyboard event listeners

---

## 🚀 Quick Start in 60 Seconds

### 1. Minimal HTML Shell (`index.html`)

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Wovemark App</title>
  <link rel="stylesheet" href="https://unpkg.com/@wovemark/runtime/dist/styles.css" />
</head>
<body>
  <div id="app"></div>

  <script type="module">
    import { createWovemark } from "https://unpkg.com/@wovemark/runtime/dist/index.js";

    createWovemark({ mount: "#app" });
  </script>
</body>
</html>
```

### 2. Write your home page (`index.wovemark.md`)

```md
---
title: Nexus — Cloud Observability
layout: landing
theme: system
variance: 7
motion: 6
density: 5
accent: indigo
---

:::hero variant="split" image="/assets/hero.webp" badge="v2.0 Released"
# Autonomous Telemetry for Modern Cloud Teams

Diagnose distributed bottlenecks and optimize serverless pipelines in real-time.

::button label="Start Free Trial" action="navigate:pricing" variant="primary" size="lg"
::button label="Learn More" action="navigate:about" variant="outline" size="lg"
:::

:::feature-grid columns=3 title="Why Nexus?" description="Zero configuration, pure speed."
:::card title="Distributed Tracing" icon="activity"
Trace requests across microservice boundaries with zero sampling loss.
:::
:::card title="Anomaly Detection" icon="shield"
Machine learning models catch regressions before your customers do.
:::
:::card title="Sub-Millisecond Logs" icon="layers"
Query billions of log records with instant full-text filtering.
:::
:::
```

### 3. Add secondary pages (`about.wovemark.md`, `pricing.wovemark.md`)

Wovemark resolves hash routes automatically:
- `index.html` -> `index.wovemark.md`
- `index.html#about` -> `about.wovemark.md`
- `index.html#pricing` -> `pricing.wovemark.md`
- `index.html#docs/install` -> `docs/install.wovemark.md`

---

## 🎛 The Three Dials

Every page frontmatter accepts three numerical dials (`1` to `10`) that dynamically parameterize visual variance, motion intensity, and layout density:

```yaml
---
variance: 7 # 1 (rigid/symmetrical) to 10 (editorial/asymmetric)
motion: 6   # 0 (none) to 10 (cinematic choreography)
density: 5  # 1 (spacious landing) to 10 (dense SaaS dashboard)
accent: indigo # blue | indigo | purple | rose | emerald | amber | cyan
---
```

---

## 🛠 Wovemark CLI

```bash
# Scaffold a new starter project
npx wovemark init my-project

# Start local development server with hot live reload
npx wovemark dev

# Validate all .wovemark.md files and report diagnostics / typo suggestions
npx wovemark validate .

# Inspect AST, frontmatter, and component hierarchy
npx wovemark inspect index.wovemark.md

# Package static production bundle
npx wovemark build --out dist
```

---

## 📚 Component Families

- **Foundation**: `container`, `section`, `stack`, `cluster`, `grid`, `split`, `divider`, `spacer`, `surface`, `card`
- **Content**: `heading`, `text`, `quote`, `image`, `video`, `gallery`, `figure`, `code`, `callout`, `accordion`, `timeline`, `badge`, `icon`
- **Navigation**: `navbar`, `nav-link`, `sidebar`, `sidebar-group`, `sidebar-item`, `breadcrumbs`, `tabs`, `pagination`, `footer`
- **Actions**: `button`, `button-group`, `dropdown`, `menu`
- **Feedback**: `alert`, `toast`, `progress`, `skeleton`, `empty-state`, `loading`
- **Overlay**: `dialog`, `drawer`, `popover`, `tooltip`
- **Marketing**: `hero`, `logo-wall`, `feature-grid`, `feature-list`, `bento`, `stats`, `testimonials`, `pricing`, `faq`, `cta`, `newsletter`, `contact`
- **Product UI**: `app-shell`, `page-header`, `metric`, `metric-grid`, `chart` (pure SVG vector charts), `activity-feed`, `data-table`, `list`, `description-list`
- **Forms & Data**: `form`, `field`, `input`, `textarea`, `select`, `checkbox`, `switch`, `data`

---

## 📦 Monorepo Architecture

- [`packages/parser`](file:///workspaces/Wovemark/packages/parser) (`@wovemark/parser`) — Pure TypeScript AST tokenizer, directive parser, frontmatter extractor, bindings analyzer, and schema validator with Levenshtein typo suggestion engine.
- [`packages/runtime`](file:///workspaces/Wovemark/packages/runtime) (`@wovemark/runtime`) — Zero-framework client runtime, hash router, design token engine, CSS system, SVG vector icon & chart renderers, reactive data store, and safe action dispatcher.
- [`packages/cli`](file:///workspaces/Wovemark/packages/cli) (`@wovemark/cli`) — Scaffolding, validation tool, AST inspector, local dev server with SSE live reload, and static production exporter.
- [`skills/wovemark`](file:///workspaces/Wovemark/skills/wovemark) — Official AI Agent Skill with comprehensive reference documentation and prompt guides.
- [`docs`](file:///workspaces/Wovemark/docs) — Dogfooded documentation portal built entirely in Wovemark.
- [`examples`](file:///workspaces/Wovemark/examples) — 5 complete working applications:
  1. `examples/landing` (SaaS Observability Landing Page)
  2. `examples/portfolio` (Creative Design Portfolio)
  3. `examples/docs` (Engine Documentation Site)
  4. `examples/dashboard` (SaaS Analytics Dashboard)
  5. `examples/crud` (Identity User Management CRUD)

---

## 📄 License

MIT © 2026 Wovemark Team
