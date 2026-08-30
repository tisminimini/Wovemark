---
title: Product UI & Dashboards — Wovemark Docs
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
::nav-link label="Product UI" href="#product-ui" active=true
::nav-link label="Data & CRUD" href="#data-crud"
::nav-link label="Agent Guide" href="#agent-guide"
:::

:::section
# Product UI & Dashboard Components

Wovemark makes building internal tools, operations dashboards, and SaaS portals seamless.

---

## 1. Key Metric Stat Cards (`::metric`)

:::metric-grid columns=4
::metric label="Monthly Revenue" value="$84,250" change="+14.2%" trend="up" icon="zap"
::metric label="Active Subscribers" value="2,410" change="+8.1%" trend="up" icon="users"
::metric label="API Response Time" value="18ms" change="-3.4%" trend="up" icon="activity"
::metric label="System Uptime" value="99.99%" change="0.0%" trend="neutral" icon="shield"
:::

---

## 2. Declarative SVG Vector Charts (`::chart`)

:::grid columns=2
::chart title="Weekly Active Users (Line Chart)" type="line" height=240
::chart title="API Request Volume (Bar Chart)" type="bar" height=240
:::

---

## 3. Modal Dialogs (`:::dialog`)

:::cluster
::button label="Open Sample Dialog" action="open:sample-modal" variant="primary" icon="plus"
:::

:::dialog id="sample-modal" title="System Configuration" description="Manage cluster telemetry settings."
:::form submit="POST /api/settings" success="toast:Settings saved!; close:sample-modal"
::field name="clusterName" label="Cluster Name" placeholder="us-east-prod" required=true
::field name="environment" label="Environment" type="select" options="Production, Staging, Development" required=true
::button label="Save Changes" type="submit" variant="primary"
:::
:::

:::
