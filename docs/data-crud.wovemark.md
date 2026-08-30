---
title: Data & CRUD — Wovemark Docs
layout: docs
theme: system
variance: 5
motion: 4
density: 8
accent: indigo
---

:::navbar title="Wovemark Docs"
::nav-link label="Overview" href="#"
::nav-link label="Syntax" href="#syntax"
::nav-link label="Components" href="#components"
::nav-link label="Marketing" href="#marketing"
::nav-link label="Product UI" href="#product-ui"
::nav-link label="Data & CRUD" href="#data-crud" active=true
::nav-link label="Agent Guide" href="#agent-guide"
:::

:::section
# Declarative Data Engine & CRUD

Build full CRUD applications without client JavaScript.

---

## 1. Defining a Data Source (`::data`)

```md
::data id="users" src="/api/users" autoRefresh=30
```

The runtime maintains loading states, reactive data caches, and automatic error handling.

---

## 2. Interactive Data Table (`:::data-table`)

```md
:::data-table source="users" searchable=true sortable=true pagination=true pageSize=10
::column field="name" label="Name"
::column field="email" label="Email"
::column field="role" label="Role"
::column field="status" label="Status"
:::
```

---

## 3. Creating & Updating Records

```md
:::dialog id="new-user-dialog" title="New User"
:::form submit="POST /api/users" success="refresh:users; toast:User Created; close:new-user-dialog"
::field name="name" label="Name" required=true
::field name="email" label="Email" type="email" required=true
::button label="Create" type="submit" variant="primary"
:::
:::
```

---

## 4. Controlled Action Sequence

Actions are chainable and safe from arbitrary code execution:

```md
::button label="Delete" action="delete:users?id={{item.id}}; toast:Deleted; refresh:users"
```
:::
