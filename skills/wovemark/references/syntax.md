# Wovemark Syntax Reference

## 1. Frontmatter

```yaml
---
title: Page Title
description: Meta description
layout: default | landing | app | docs | minimal
theme: system | light | dark
variance: 5 # 1 to 10
motion: 5   # 0 to 10
density: 5  # 1 to 10
accent: blue | indigo | purple | rose | emerald | amber | cyan
---
```

## 2. Directives

### Containers (`:::`)
```md
:::hero variant="split" image="/assets/hero.webp"
# Title
Description text
::button label="Action" action="navigate:signup"
:::
```

### Atomic Elements (`::`)
```md
::button label="Submit" variant="primary" action="submit:my-form"
::metric label="Active Users" value="12,450" change="+8.2%" trend="up"
::data id="users" src="/api/users"
::divider label="Or"
```

## 3. Attribute Grammar
- Strings: `label="Create Account"`
- Numbers: `columns=3`, `height=280`
- Booleans: `required`, `disabled=false`, `searchable=true`
- Lists: `options="Admin, Editor, Viewer"` or `tags="ai, fast, cloud"`
- Actions: `action="open:modal-id; toast:Opened"`

## 4. Bindings (`{{ expr }}`)
- `{{ source.length }}`
- `{{ user.email }}`
- `{{ isOnline ? 'Online' : 'Offline' }}`
- `{{ user.name || 'Guest' }}`
