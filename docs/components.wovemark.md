---
title: Component Catalog — Wovemark Docs
layout: docs
theme: system
variance: 5
motion: 4
density: 6
accent: indigo
---

:::navbar title="Wovemark Docs"
::nav-link label="Overview" href="#"
::nav-link label="Syntax" href="#syntax"
::nav-link label="Components" href="#components" active=true
::nav-link label="Marketing" href="#marketing"
::nav-link label="Product UI" href="#product-ui"
::nav-link label="Data & CRUD" href="#data-crud"
::nav-link label="Agent Guide" href="#agent-guide"
:::

:::section
# Component Catalog

Wovemark includes a comprehensive design system divided into distinct component families.

---

## 1. Foundation Components

:::grid columns=3
:::card title=":::container" icon="grid"
Constrains content to standard max-widths (`sm`, `md`, `lg`, `xl`, `full`).
:::
:::card title=":::section" icon="layers"
Vertical content section with variants (`default`, `surface`, `muted`, `accent`).
:::
:::card title=":::split" icon="split"
Two-column responsive split layout (`50-50`, `60-40`, `70-30`).
:::
:::

---

## 2. Content & Feedback Components

:::callout variant="info" title="Callout Box"
Callouts emphasize critical background or alert information with automated icons.
:::

:::accordion
:::accordion-item title="What is the difference between Container and Element directives?" open=true
Container directives (`:::name`) wrap multiple lines of markdown or nested directives, closed with `:::`. Element directives (`::name`) are self-closing atomic components.
:::
:::accordion-item title="Can I customize the color palette?"
Yes! Specify `accent: indigo` (or purple, rose, emerald, amber, cyan) in frontmatter to switch all primary accent colors automatically.
:::
:::

---

## 3. Interactive Buttons & Actions

:::cluster
::button label="Primary Action" variant="primary" icon="zap"
::button label="Secondary Action" variant="secondary" icon="layers"
::button label="Outline" variant="outline" icon="globe"
::button label="Ghost" variant="ghost"
::button label="Danger" variant="danger" icon="trash"
:::

:::
