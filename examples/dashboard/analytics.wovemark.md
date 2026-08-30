---
title: Detailed Analytics — Vortex Console
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
::sidebar-item label="Analytics" href="#analytics" active=true icon="bar-chart"
::sidebar-item label="Activity Feed" href="#activity" icon="activity"
:::
:::sidebar-group label="Management"
::sidebar-item label="Customers" href="#customers" icon="users" badge="1.8k"
::sidebar-item label="Settings" href="#settings" icon="settings"
:::
:::

:::page-header title="Traffic & Latency Analytics" description="Granular breakdown of API throughput and edge latency."
::button label="Refresh Telemetry" variant="secondary" size="sm" icon="refresh" action="toast:Refreshing analytics stream..."
:::

:::metric-grid columns=3
::metric label="P99 Response Time" value="28.1ms" change="-2.4ms" trend="up" icon="activity"
::metric label="Cache Hit Ratio" value="94.6%" change="+1.2%" trend="up" icon="zap"
::metric label="Bandwidth Consumed" value="48.2 TB" change="+4.1 TB" trend="neutral" icon="globe"
:::

:::grid columns=1
::chart title="Hourly Network Ingress / Egress (GB/s)" type="area" height=320
:::

:::
