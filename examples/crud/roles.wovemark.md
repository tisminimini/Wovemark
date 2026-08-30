---
title: Roles & Policies — Krona Identity
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
::sidebar-item label="User Accounts" href="#users" icon="user"
::sidebar-item label="Roles & Policies" href="#roles" active=true icon="shield"
:::
:::sidebar-group label="Compliance"
::sidebar-item label="Audit Logs" href="#audit" icon="activity"
::sidebar-item label="Single Sign-On" href="#sso" icon="lock"
:::
:::

:::page-header title="Roles & Access Policies" description="Manage fine-grained role-based access control (RBAC)."
::button label="Create Policy" variant="primary" size="sm" icon="plus" action="open:role-modal"
:::

::data id="rolesList" src="/api/roles"

:::data-table source="rolesList" searchable=true sortable=true pagination=true pageSize=10
::column field="name" label="Role Name"
::column field="permissions" label="Policy Grants"
::column field="userCount" label="Assigned Users"
:::

:::dialog id="role-modal" title="Create Access Policy" description="Define permissions and scope for a new role."
:::form submit="POST /api/roles" success="refresh:rolesList; toast:Policy created; close:role-modal"
::field name="name" label="Role Name" placeholder="Security Auditor" required=true
::field name="permissions" label="Permission Scope" placeholder="Read-Only Compliance Access" required=true
::button label="Create Policy" type="submit" variant="primary"
:::
:::

:::
