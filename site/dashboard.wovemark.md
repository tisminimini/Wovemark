---
title: Wovemark Console — Telemetry & Orchestration Hub
description: Live edge cluster monitoring, active agent pipelines, and infrastructure management powered by Wovemark.
layout: app
theme: system
variance: 4
motion: 3
density: 8
accent: blue
---

:::app-shell title="Wovemark Cloud Console"
:::sidebar title="Wovemark Cloud"
:::sidebar-group label="Core Navigation"
::sidebar-item label="Home Overview" href="#" icon="grid"
::sidebar-item label="Live Telemetry" href="#dashboard" active=true icon="activity" badge="5 Nodes"
::sidebar-item label="Features" href="#features" icon="layers"
::sidebar-item label="Documentation" href="#docs" icon="file"
::sidebar-item label="UI Component Kit" href="#components" icon="grid"
:::

:::sidebar-group label="Management"
::sidebar-item label="Agent Pipelines" href="#dashboard" icon="terminal" badge="Active"
::sidebar-item label="Pricing & Plans" href="#pricing" icon="star"
::sidebar-item label="About Platform" href="#about" icon="info"
:::
:::

:::page-header title="Autonomous Edge Telemetry & Orchestration" description="Real-time cluster telemetry, automated agent pipelines, and global worker nodes."
::button label="Switch Theme" action="theme:toggle" variant="outline" size="sm" icon="sun"
::button label="Purge Cache" action="open:purge-confirm" variant="outline" size="sm" icon="refresh"
::button label="Provision Worker Node" action="open:deploy-modal" variant="primary" size="sm" icon="plus"
:::

:::metric-grid columns=4
::metric label="Active Agent Instances" value="165" change="+18.4%" trend="up" icon="terminal"
::metric label="Events Ingested / Sec" value="48,920" change="+12.1%" trend="up" icon="zap"
::metric label="p99 Ingestion Latency" value="8.4ms" change="-15.2%" trend="up" icon="activity"
::metric label="Global Uptime SLA" value="99.998%" change="0.0%" trend="neutral" icon="shield"
:::

:::grid columns=2
::chart title="Hourly Event Throughput (Trailing 7 Hours)" type="line" height=260
::chart title="Regional Distribution Load" type="bar" height=260
:::

::divider label="Global Edge Worker Nodes"

::data id="nodes" src="./data/nodes.json"

:::data-table source="nodes" searchable=true sortable=true pagination=true pageSize=5
::column field="id" label="Node ID"
::column field="region" label="Deployment Region"
::column field="cluster" label="Target Cluster"
::column field="agents" label="Active Agents"
::column field="cpu" label="CPU Load"
::column field="memory" label="Memory Usage"
::column field="status" label="Health Status"
::column field="uptime" label="SLA Uptime"
:::

::divider label="Agent Task Execution Pipeline"

:::kanban title="Active Pipeline Workflow"
:::kanban-column title="Backlog & Queued" badge="2"
:::kanban-card title="Telemetry Ingestion Agent" tag="Infra" priority="medium"
Aggregating OTel metrics across São Paulo and Tokyo edge clusters.
:::
:::kanban-card title="AST Validator Refactor" tag="Parser" priority="low"
Optimizing Levenshtein distance typo suggestion index.
:::
:::

:::kanban-column title="In Progress" badge="2"
:::kanban-card title="Bento Grid High-Density Pack" tag="Layout" priority="urgent"
Enhancing mobile responsive wrap for asymmetric bento cards.
:::
:::kanban-card title="Theme Variable Synchronization" tag="Tokens" priority="high"
Propagating accent color changes to SVG chart stroke gradients.
:::
:::

:::kanban-column title="Verification & QA" badge="1"
:::kanban-card title="Dialog Escape Trapping" tag="A11y" priority="high"
Verified focus restore after dialog modal dismissal.
:::
:::

:::kanban-column title="Deployed to Edge" badge="1"
:::kanban-card title="Wovemark 2.0 Core Runtime" tag="Release" priority="low"
Live across all 5 global regions with 0ms downtime.
:::
:::
:::

:::split ratio="50-50"
:::tree title="Project Architecture Explorer"
:::tree-node label="packages/" icon="folder" open=true
:::tree-node label="runtime/ (Design tokens, renderer, motion, router)" icon="folder" open=true
:::tree-node label="renderer/registry.ts" icon="file"
:::
:::tree-node label="motion/motion.ts" icon="file"
:::
:::tree-node label="data/store.ts" icon="file"
:::
:::
:::tree-node label="parser/ (AST grammar, diagnostics, schema)" icon="folder"
:::tree-node label="parser.ts" icon="file"
:::
:::tree-node label="schema.ts" icon="file"
:::
:::
:::tree-node label="cli/ (Compiler, dev server, static bundler)" icon="folder"
:::tree-node label="bin.ts" icon="file"
:::
:::
:::
:::

:::calendar title="Scheduled Deployments & Agent Runs"
:::
:::

:::dialog id="deploy-modal" title="Provision Edge Worker Node" description="Deploy a dedicated telemetry worker to your chosen cluster region." size="md"
:::form id="deploy-form" submit="POST /api/nodes" success="toast:Edge worker provisioned successfully!; close:deploy-modal; refresh:nodes"
::field name="nodeName" label="Worker Name" placeholder="us-east-worker-09" required=true
::field name="region" label="Target Region" type="select" options="US-East (N. Virginia), EU-West (Frankfurt), AP-East (Tokyo), SA-East (São Paulo), US-West (Oregon)" required=true
::field name="clusterTier" label="Compute Tier" type="select" options="Standard Worker (4 vCPU 16GB), High-Memory Worker (8 vCPU 64GB), GPU Accelerated Worker" required=true
::field name="autoScale" label="Auto-Scaling Threshold (%)" type="slider" min=10 max=100 value=75
::checkbox name="edgeReplication" label="Replicate state to nearest regional backup cluster" checked=true
::button label="Deploy Node Immediately" type="submit" variant="primary" icon="zap"
:::
:::

:::confirm id="purge-confirm" title="Purge Global Edge Cache" confirmLabel="Confirm Purge" cancelLabel="Cancel" confirmAction="toast:Global edge cache purged across all nodes!"
:::

:::
