---
title: System Settings — Vortex Console
layout: app
theme: system
variance: 4
motion: 3
density: 8
accent: blue
---

:::app-shell title="Vortex Console"
:::sidebar title="Vortex Console"
:::sidebar-group label="Core"
::sidebar-item label="Overview" href="#" icon="grid"
::sidebar-item label="Analytics" href="#analytics" icon="bar-chart"
::sidebar-item label="Activity Feed" href="#activity" icon="activity"
:::
:::sidebar-group label="Management"
::sidebar-item label="Customers" href="#customers" icon="users" badge="1.8k"
::sidebar-item label="Settings" href="#settings" active=true icon="settings"
:::
:::

:::page-header title="Workspace Settings" description="Manage organization details, telemetry thresholds, and API keys."
::button label="Theme: Toggle Mode" variant="outline" size="sm" icon="sun" action="theme:toggle"
:::

:::grid columns=2
:::surface
<h3>Organization Profile</h3>
<p class="wm-text-muted" style="margin-bottom:16px">Update company details visible on invoice receipts.</p>

:::form submit="POST /api/settings/org" success="toast:Organization profile saved!"
::field name="orgName" label="Organization Name" placeholder="Vortex Technologies, Inc." required=true
::field name="billingEmail" label="Billing Email" type="email" placeholder="billing@vortex.cloud" required=true
::field name="timezone" label="Primary Timezone" type="select" options="UTC, America/New_York, Europe/London, Asia/Tokyo" required=true
::button label="Save Profile" type="submit" variant="primary"
:::
:::

:::surface
<h3>Alert Escalation Rules</h3>
<p class="wm-text-muted" style="margin-bottom:16px">Configure automated webhook targets for P1 incidents.</p>

:::form submit="POST /api/settings/alerts" success="toast:Alert rules updated!"
::field name="webhookUrl" label="Incident Webhook URL" placeholder="https://hooks.slack.com/services/..." required=true
::field name="latencyThreshold" label="P99 Alert Threshold (ms)" type="number" placeholder="100" required=true
::field name="notifyOnResolve" label="Send Auto-Resolve Notifications" type="select" options="Yes (Instant), No" required=true
::button label="Save Escalation Rules" type="submit" variant="primary"
:::
:::
:::

:::
