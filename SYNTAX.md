# Wovemark Syntax Guide (SYNTAX-1.0)

Wovemark extends standard CommonMark Markdown with three declarative constructs:
1. **Frontmatter** (`--- ... ---`)
2. **Directives** (`:::container` and `::element`)
3. **Data Bindings** (`{{ expression }}`)

---

## 1. Frontmatter

Every `.wovemark.md` document begins with an optional YAML frontmatter block:

```yaml
---
title: SaaS Analytics Dashboard
description: Real-time telemetry and user metrics
layout: app        # default | landing | app | docs | minimal
theme: system      # light | dark | system | "./custom-theme.wovemark.md"
variance: 6        # 1 - 10
motion: 4          # 0 - 10
density: 8         # 1 - 10
accent: indigo     # blue | indigo | purple | rose | emerald | amber | cyan
---
```

### Frontmatter Fields

| Property | Type | Default | Options / Range | Description |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `string` | `"Wovemark"` | Any text | Document title; updates `document.title` and browser tab. |
| `description` | `string` | `""` | Any text | Page summary; updates meta tags and accessibility descriptions. |
| `layout` | `string` | `"default"` | `default`, `landing`, `app`, `docs`, `minimal`, `blank` | Master layout scaffold and container structure. |
| `theme` | `string` | `"system"` | `system`, `light`, `dark`, relative file path | Color theme mode. |
| `variance` | `number` | `5` | `1` to `10` | Design asymmetry, typography scale, surface complexity dial. |
| `motion` | `number` | `5` | `0` to `10` | Animation intensity, stagger timing, entrance choreography dial. |
| `density` | `number` | `5` | `1` to `10` | Spacing, padding, and UI element density dial. |
| `accent` | `string` | `"blue"` | `blue`, `indigo`, `purple`, `violet`, `rose`, `red`, `amber`, `emerald`, `cyan`, `neutral` | Primary accent color token. |

---

## 2. Directives

Wovemark uses two directive forms: **Container Directives** (`:::`) and **Element Directives** (`::`).

### 2.1 Container Directives (`:::name ... :::`)
Used for components that enclose structured blocks, text, or nested children.

```md
:::hero variant="split" image="/assets/hero.webp" align="left"
# Ship software 10x faster

Connect your team's workflow in minutes with real-time sync.

::button label="Start Free Trial" action="navigate:signup" variant="primary"
::button label="Book Demo" action="open:demo-dialog" variant="outline"
:::
```

#### Nested Containers
Containers can be nested cleanly:

```md
:::feature-grid columns="3"
:::card title="Instant Sync" icon="zap"
Real-time delta compression across all nodes.
:::

:::card title="End-to-End Encryption" icon="shield"
Zero-knowledge encryption for mission critical records.
:::

:::card title="Global Edge CDN" icon="globe"
Under 20ms response time globally.
:::
:::
```

### 2.2 Element Directives (`::name ...`)
Used for self-closing, atomic UI elements.

```md
::button label="Create Workspace" icon="plus" action="open:create-modal" variant="primary"
::metric label="Monthly Recurring Revenue" value="$84,230" change="+14.2%" trend="up"
::data id="users" src="/api/users"
::divider
```

---

## 3. Attribute Grammar

Directives accept key-value pairs formatted cleanly without commas:

```md
::button label="Submit Data" disabled=true variant="primary" size="lg"
```

### Supported Value Types:
- **Strings**: Quoted with `"` or `'` (`label="Create Account"`, `src='/api/data'`).
- **Booleans**: Unquoted literals (`searchable=true`, `required=false`) or shorthand flags (`required`, `disabled`, `sortable`).
- **Numbers**: Unquoted integers or floats (`columns=3`, `delay=0.2`, `opacity=0.85`).
- **Lists / Arrays**: Comma-separated within quotes (`options="Admin, Editor, Viewer"`, `tags="ai, fast, cloud"`).
- **JSON Objects**: Compact JSON inside quotes (`filters='{"status":"active"}'`).

---

## 4. Bindings Syntax (`{{ ... }}`)

Directives and markdown text can interpolate reactive state and data source values:

```md
::data id="analytics" src="/api/analytics"

Total Active Users: **{{ analytics.totalUsers }}**
Conversion Rate: **{{ analytics.conversionRate }}%**

:::data-table source="analytics.recentTransactions"
::column field="id" label="Tx ID"
::column field="amount" label="Amount ($)"
::column field="status" label="Status"
:::
```

### Safe Expression Rules
- Property access: `{{ users.length }}`, `{{ profile.email }}`, `{{ item.stats.views }}`
- Array indexing: `{{ list.0.name }}`
- Ternary conditionals: `{{ isOnline ? 'Active' : 'Offline' }}`
- Default fallbacks: `{{ user.displayName || 'Anonymous' }}`
- Strictly **no** `eval()`, arbitrary functions, or window/document global access.

---

## 5. Actions Syntax

Action handlers are attached to interactive elements (`::button`, `::row-action`, `:::form`):

```md
::button label="New Project" action="open:new-project-dialog"
::button label="Delete" action="delete:project?id={{project.id}}"
::button label="Switch Theme" action="theme:toggle"
```

Multiple chained actions are separated by semicolons:

```md
:::form id="add-user" submit="POST /api/users" success="refresh:users; toast:User created successfully; close:add-user-modal"
```

---

## 6. Formatting & Markdown Integration

Inside any container directive, full standard CommonMark is supported:
- `#`, `##`, `###` headings
- `**bold**`, `*italic*`, `~~strikethrough~~`, `` `inline code` ``
- `[link text](#hash-route-or-url)`
- `![alt text](/path/to/image.png)`
- Ordered and unordered lists (`- item`, `1. item`)
- Blockquotes (`> quote`)
- Fenced code blocks (```` ```ts ... ``` ````)
