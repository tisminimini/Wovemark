---
title: Krona Identity Management
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
::sidebar-item label="Directory Overview" href="#" active=true icon="users"
::sidebar-item label="User Accounts" href="#users" icon="user"
::sidebar-item label="Roles & Policies" href="#roles" icon="shield"
:::
:::sidebar-group label="Compliance"
::sidebar-item label="Audit Logs" href="#audit" icon="activity"
::sidebar-item label="Single Sign-On" href="#sso" icon="lock"
:::
:::

:::page-header title="Identity Directory Overview" description="Enterprise user access, role assignments, and provisioning."
::button label="Invite Member" variant="primary" size="sm" icon="plus" action="open:create-user-modal"
:::

:::metric-grid columns=4
::metric label="Total Directory Users" value="5" change="+1 this week" trend="up" icon="users"
::metric label="Active SSO Sessions" value="4" change="80% compliance" trend="up" icon="lock"
::metric label="MFA Enrollment" value="100%" change="Enforced" trend="up" icon="shield"
::metric label="Pending Invites" value="1" change="Expires in 4d" trend="neutral" icon="mail"
:::

::data id="usersList" src="/api/users"

:::surface
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
  <h3>Directory Members</h3>
  ::button label="New User" variant="primary" size="sm" icon="plus" action="open:create-user-modal"
</div>

:::data-table source="usersList" searchable=true sortable=true pagination=true pageSize=10
::column field="id" label="ID"
::column field="name" label="Full Name"
::column field="email" label="Email"
::column field="role" label="Role"
::column field="department" label="Department"
::column field="status" label="Status"
::column field="created" label="Joined Date"
:::
:::

:::dialog id="create-user-modal" title="Provision New Member" description="Add an employee or contractor to your organization directory."
:::form submit="POST /api/users" success="refresh:usersList; toast:User invited successfully!; close:create-user-modal"
::field name="name" label="Full Name" placeholder="Marcus Ward" required=true
::field name="email" label="Corporate Email" type="email" placeholder="marcus.w@acme.com" required=true
::field name="department" label="Department" type="select" options="Engineering, Security, Product, Finance, Operations" required=true
::field name="role" label="Assigned Role" type="select" options="Super Admin, Security Lead, Product Manager, Developer, Auditor" required=true
::field name="status" label="Initial Status" type="select" options="Active, Invited" required=true
::button label="Send Invitation" type="submit" variant="primary" icon="mail"
:::
:::

:::
