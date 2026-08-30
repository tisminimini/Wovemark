---
title: User Accounts — Krona Identity
layout: app
theme: system
variance: 4
motion: 3
density: 8
accent: emerald
---

:::app-shell title="Krona Identity"
:::sidebar title="Krona Identity"
:::sidebar-group label="Access Management"
::sidebar-item label="Directory Overview" href="#" icon="users"
::sidebar-item label="User Accounts" href="#users" active=true icon="user"
::sidebar-item label="Roles & Policies" href="#roles" icon="shield"
:::
:::sidebar-group label="Compliance"
::sidebar-item label="Audit Logs" href="#audit" icon="activity"
::sidebar-item label="Single Sign-On" href="#sso" icon="lock"
:::
:::

:::page-header title="User Accounts Directory" description="Inspect individual access permissions and lifecycle states."
::button label="Filter Status" variant="outline" size="sm" icon="filter"
::button label="Add Member" variant="primary" size="sm" icon="plus" action="open:add-modal"
:::

::data id="usersList" src="/api/users"

:::data-table source="usersList" searchable=true sortable=true pagination=true pageSize=10
::column field="name" label="Full Name"
::column field="email" label="Email"
::column field="role" label="Role"
::column field="department" label="Department"
::column field="status" label="Status"
:::

:::dialog id="add-modal" title="Add User Account" description="Create a new profile record."
:::form submit="POST /api/users" success="refresh:usersList; toast:Account created; close:add-modal"
::field name="name" label="Name" required=true
::field name="email" label="Email" type="email" required=true
::field name="role" label="Role" type="select" options="Super Admin, Security Lead, Developer, Auditor" required=true
::button label="Create Account" type="submit" variant="primary"
:::
:::

:::
