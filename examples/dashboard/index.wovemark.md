---
title: Vortex Analytics Dashboard
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
::sidebar-item label="Overview" href="#" active=true icon="grid"
::sidebar-item label="Analytics" href="#analytics" icon="bar-chart"
::sidebar-item label="Activity Feed" href="#activity" icon="activity"
:::
:::sidebar-group label="Management"
::sidebar-item label="Customers" href="#customers" icon="users" badge="1.8k"
::sidebar-item label="Settings" href="#settings" icon="settings"
:::
:::

:::page-header title="Executive Overview" description="Key performance indicators across all global clusters."
::button label="Export CSV" variant="outline" size="sm" icon="download" action="toast:Exporting CSV report..."
::button label="Deploy Node" variant="primary" size="sm" icon="plus" action="open:deploy-dialog"
:::

:::metric-grid columns=4
::metric label="Monthly Recurring Revenue" value="$184,920" change="+14.8%" trend="up" icon="zap"
::metric label="Active Subscriptions" value="2,419" change="+9.2%" trend="up" icon="users"
::metric label="Avg Ingestion Latency" value="12.4ms" change="-18.5%" trend="up" icon="activity"
::metric label="Global Service SLA" value="99.998%" change="0.0%" trend="neutral" icon="shield"
:::

:::grid columns=2
::chart title="Revenue Growth (Trailing 7 Days)" type="line" height=260
::chart title="Hourly Event Volume" type="bar" height=260
:::

::divider label="Recent Ledger Transactions"

::data id="recentTransactions" src="/api/transactions"

:::data-table source="recentTransactions" searchable=true sortable=true pagination=true pageSize=5
::column field="id" label="Transaction ID"
::column field="customer" label="Customer"
::column field="plan" label="Subscription Tier"
::column field="amount" label="Amount"
::column field="status" label="Status"
::column field="date" label="Timestamp"
:::

:::dialog id="deploy-dialog" title="Deploy New Telemetry Node" description="Provision an isolated worker in your target region."
:::form submit="POST /api/nodes" success="toast:Node provisioning started!; close:deploy-dialog"
::field name="nodeName" label="Node Name" placeholder="us-east-worker-04" required=true
::field name="region" label="Deployment Region" type="select" options="US East (N. Virginia), US West (Oregon), EU Central (Frankfurt), AP East (Tokyo)" required=true
::field name="capacity" label="Instance Capacity" type="select" options="Standard (4 vCPU, 16GB), High-Mem (8 vCPU, 64GB), GPU Cluster" required=true
::button label="Confirm Deployment" type="submit" variant="primary" icon="zap"
:::
:::
:::
