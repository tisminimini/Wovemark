---
title: Syntax & Frontmatter — Wovemark Docs
layout: docs
theme: system
variance: 5
motion: 4
density: 6
accent: indigo
---

:::navbar title="Wovemark Docs"
::nav-link label="Overview" href="#"
::nav-link label="Syntax" href="#syntax" active=true
::nav-link label="Components" href="#components"
::nav-link label="Marketing" href="#marketing"
::nav-link label="Product UI" href="#product-ui"
::nav-link label="Data & CRUD" href="#data-crud"
::nav-link label="Agent Guide" href="#agent-guide"
:::

:::section
# Wovemark Syntax Guide

Wovemark extends standard Markdown with three declarative primitives:

1. **Frontmatter** (`--- ... ---`)
2. **Directives** (`:::container` and `::element`)
3. **Data Bindings** (`{{ expression }}`)

---

## 1. Frontmatter

Every page starts with an optional YAML block configured with title, layout, theme, and dials:

```yaml
---
title: Application Analytics
layout: app
theme: system
variance: 6
motion: 4
density: 8
accent: indigo
---
```

:::callout variant="tip" title="The Three Dials"
- **variance** (1-10): Controls visual asymmetry, typography scales, and surface variation.
- **motion** (0-10): Controls transition physics, stagger timings, and reveal speeds.
- **density** (1-10): Controls layout padding, row heights, and control compacting.
:::

---

## 2. Directives

### Container Directives (`:::name ... :::`)
Used for structural elements that wrap markdown content or other nested components:

```md
:::hero variant="split" image="/assets/preview.webp"
# Heading text
Description paragraph.
::button label="Action" action="navigate:next"
:::
```

### Atomic Elements (`::name ...`)
Used for self-closing inline elements:

```md
::button label="Create Record" variant="primary" icon="plus"
::metric label="Total Views" value="45.2K" change="+12%" trend="up"
::data id="users" src="/api/users"
::divider
```

---

## 3. Bindings (`{{ expr }}`)

Interpolate reactive values from data sources or state:

```md
Total Users: **{{ users.length }}**
Status: **{{ isOnline ? 'Online' : 'Offline' }}**
```
:::
