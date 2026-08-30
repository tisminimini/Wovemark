---
title: Agent Guide — Wovemark Docs
layout: docs
theme: system
variance: 6
motion: 5
density: 6
accent: indigo
---

:::navbar title="Wovemark Docs"
::nav-link label="Overview" href="#"
::nav-link label="Syntax" href="#syntax"
::nav-link label="Components" href="#components"
::nav-link label="Marketing" href="#marketing"
::nav-link label="Product UI" href="#product-ui"
::nav-link label="Data & CRUD" href="#data-crud"
::nav-link label="Agent Guide" href="#agent-guide" active=true
:::

:::section
# Using Wovemark with AI Coding Agents

Wovemark was engineered from the ground up for agent-first workflows.

---

## 1. How Agents Understand Wovemark

When an AI agent is asked to build a website or web app, traditional frameworks force the agent to solve:
- CSS layout, margins, flexbox alignment, and media query breakpoints
- State management and re-render cycles
- Modal focus traps, keyboard handlers, and ARIA attributes
- Motion animation keyframes and physics

With **Wovemark**, the agent only supplies structure:

```text
User Request: "Create an analytics dashboard with 4 metric cards and a data table"
  ↓
Agent generates: dashboard.wovemark.md (Frontmatter + ::metric + :::data-table)
  ↓
Wovemark Runtime renders: Responsive, animated, theme-aware accessible application
```

---

## 2. Installing the Skill

Tell your coding agent:

```bash
npx skills add https://github.com/wovemark/wovemark --skill wovemark
```

---

## 3. The Validation Loop

Agents can self-heal using the built-in CLI:

```bash
npx wovemark validate .
```

If an error or warning is reported with suggestions (e.g. `Unknown property "varaint". Did you mean "variant"?`), the agent reads the diagnostic, fixes the typo in `.wovemark.md`, re-runs validation, and confirms a passing build.

:::callout variant="success" title="Ready for Autonomous Delivery"
Because Wovemark guarantees visual and accessible standards at runtime, agents consistently deliver production-grade results on the first attempt.
:::
:::
