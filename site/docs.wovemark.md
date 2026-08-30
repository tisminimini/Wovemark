---
title: Documentation & Specification — Wovemark
description: Complete developer reference for Wovemark syntax, directives, frontmatter dials, reactive data store, and action engine.
layout: landing
theme: system
variance: 4
motion: 4
density: 5
accent: cyan
---

:::navbar title="Wovemark Docs"
::nav-link label="Overview" href="#"
::nav-link label="Features" href="#features"
::nav-link label="Dashboard" href="#dashboard"
::nav-link label="Docs" href="#docs" active=true
::nav-link label="Pricing" href="#pricing"
::nav-link label="UI Components" href="#components"
::nav-link label="About" href="#about"
::button label="Theme" action="theme:toggle" variant="ghost" size="sm" icon="sun"
::button label="Console" action="navigate:dashboard" variant="outline" size="sm" icon="terminal"
:::

:::hero variant="split" badge="Developer Reference • Specification 1.0"
# Wovemark Official Documentation

A complete guide to declarative markdown engineering for autonomous coding agents and human developers alike.

::button label="Copy Quickstart Command" action="copy:npx wovemark init my-app" variant="primary" size="lg" icon="copy"
::button label="Try Live Component Playground" action="navigate:components" variant="outline" size="lg" icon="grid"
:::

:::callout variant="tip" title="Quick Installation"
Add the official Wovemark agent skill to your coding assistant in a single command:
`npx skills add https://github.com/wovemark/wovemark --skill wovemark`
:::

:::feature-grid columns=3 title="Core Architecture Modules" description="Master the four building blocks of any Wovemark application."
:::card title="1. Frontmatter & Dials" icon="settings"
Configure layout type (`landing`, `app`, `docs`), color accent tokens, and numerical dials (`variance`, `motion`, `density`).
:::

:::card title="2. Directives Grammar" icon="layers"
Express containers (`:::hero ... :::`, `:::bento ... :::`) and atomic elements (`::metric`, `::button`, `::chart`).
:::

:::card title="3. Reactive Data Engine" icon="shield"
Register data endpoints (`::data id="source" src="..."`) and interpolate values via `{{ expression }}`.
:::
:::

## 1. Frontmatter Configuration

Every `.wovemark.md` document begins with an optional YAML frontmatter block:

```yaml
---
title: SaaS Analytics Console
description: Real-time telemetry monitoring
layout: app        # default | landing | app | docs | minimal
theme: system      # light | dark | system
variance: 6        # 1 (symmetrical) to 10 (asymmetric/editorial)
motion: 5          # 0 (instant) to 10 (cinematic choreography)
density: 8         # 1 (spacious) to 10 (compact dashboard)
accent: cyan       # blue | indigo | purple | rose | emerald | amber | cyan
---
```

:::callout variant="info" title="The Three Dials in Action"
- **Variance (1-10)**: Controls layout asymmetry, typography scaling, and varied card elevations.
- **Motion (0-10)**: Controls animation duration, stagger timings, and entrance choreography.
- **Density (1-10)**: Controls spacing, padding, font sizes, and UI element packing.
:::

## 2. Directives Grammar

Wovemark extends standard CommonMark Markdown with two directive forms:

:::tabs
:::tab-item id="tab-container-directives" label="Container Directives (:::)"
```markdown
:::hero variant="split" image="/assets/hero.webp" badge="v2.0 Released"
# Autonomous Telemetry for Modern Cloud Teams

Diagnose distributed bottlenecks and optimize serverless pipelines in real-time.

::button label="Start Free Trial" action="navigate:pricing" variant="primary" size="lg"
::button label="Learn More" action="navigate:about" variant="outline" size="lg"
:::
```
:::

:::tab-item id="tab-element-directives" label="Element Directives (::)"
```markdown
::metric label="Monthly Recurring Revenue" value="$184,920" change="+14.8%" trend="up" icon="zap"
::chart title="Revenue Growth" type="line" height=240
::divider label="Recent Ledger Transactions"
::data id="users" src="/api/users"
```
:::
:::

## 3. Safe Action Engine

Interactive behaviors are triggered via declarative `data-wm-action` attributes:

:::feature-grid columns=3 title="Supported Action Primitives" description="Safely trigger interactive workflows without writing raw JavaScript event handlers."
:::card title="open:id & close:id" icon="eye"
Opens or closes accessible dialog modals, drawers, or sheets: `action="open:demo-modal"`
:::

:::card title="toast:message" icon="bell"
Dispatches auto-dismissing toast notifications: `action="toast:Item saved successfully!"`
:::

:::card title="navigate:route" icon="globe"
Performs smooth hash route transitions: `action="navigate:dashboard"`
:::

:::card title="theme:toggle" icon="sun"
Toggles between light and dark themes and persists preference in `localStorage`.
:::

:::card title="copy:text" icon="copy"
Copies text or code snippets directly to user clipboard: `action="copy:npx wovemark init"`
:::

:::card title="refresh:sourceId" icon="refresh"
Re-fetches and updates a registered REST data source dynamically: `action="refresh:nodes"`
:::
:::

## 4. Frequently Asked Questions

:::accordion
:::accordion-item title="How does Wovemark compare to MDX?" open=true
MDX requires compiling React components, configuring JSX transformers, importing CSS packages, and writing boilerplate JavaScript hooks. Wovemark uses a pure declarative grammar with zero compilation runtime dependencies in the browser — making it ideal for AI agents and fast static deployment.
:::

:::accordion-item title="Can Wovemark be embedded in existing React / Vue apps?"
Yes! You can import `@wovemark/runtime` and call `createWovemark({ mount: "#custom-container" })` or use `@wovemark/parser` on the server to generate semantic HTML.
:::

:::accordion-item title="How do I validate syntax errors in CI/CD pipelines?"
Run `npx wovemark validate .` in your terminal. The CLI scans all `.wovemark.md` files and outputs diagnostics with line numbers and typo suggestions.
:::
:::

:::cta title="Explore the Interactive SaaS Console" description="See the Wovemark runtime powering an operational cloud management application."
::button label="Launch Live Dashboard" action="navigate:dashboard" variant="primary" size="lg" icon="terminal"
::button label="View UI Component Kit" action="navigate:components" variant="outline" size="lg" icon="grid"
:::

:::footer copyright="© 2026 Wovemark Project. Declarative Markdown Engine for AI Coding Agents." columns=4
:::footer-column title="Documentation"
::nav-link label="Quickstart" href="#docs"
::nav-link label="Grammar Guide" href="#docs"
::nav-link label="Action Engine" href="#docs"
::nav-link label="CLI Tooling" href="#docs"
:::
:::footer-column title="Product"
::nav-link label="Features" href="#features"
::nav-link label="Live Console" href="#dashboard"
::nav-link label="Pricing Plans" href="#pricing"
::nav-link label="UI Components" href="#components"
:::
:::footer-column title="Community"
::nav-link label="GitHub Repository" href="https://github.com/wovemark/wovemark"
::nav-link label="Release Notes" href="#about"
::nav-link label="About Team" href="#about"
:::
:::footer-column title="Preferences"
::button label="Toggle Dark/Light" action="theme:toggle" variant="outline" size="sm" icon="sun"
::button label="Console" action="navigate:dashboard" variant="ghost" size="sm" icon="terminal"
:::
:::
