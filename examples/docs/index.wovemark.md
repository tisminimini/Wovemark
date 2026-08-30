---
title: Aura Engine — Documentation Portal
layout: docs
theme: system
variance: 5
motion: 4
density: 6
accent: emerald
---

:::navbar title="Aura Engine"
::nav-link label="Documentation" href="#" active=true
::nav-link label="Getting Started" href="#getting-started"
::nav-link label="Architecture" href="#architecture"
::nav-link label="API Reference" href="#api"
::button label="v2.4.0 (Latest)" variant="outline" size="sm"
:::

:::section
:::hero variant="split" badge="Aura Runtime v2.4"
# Aura Engine Documentation

High-performance distributed state machine and edge compute runtime designed for sub-millisecond event streaming.

::button label="Quickstart Guide" action="navigate:getting-started" variant="primary" icon="zap"
::button label="Core Architecture" action="navigate:architecture" variant="secondary" icon="layers"
:::

:::grid columns=3
:::card title="Getting Started" icon="zap" action="navigate:getting-started"
Learn how to install the Aura CLI, scaffold your first node, and stream live events in under 5 minutes.
:::
:::card title="System Architecture" icon="shield" action="navigate:architecture"
Understand distributed Raft consensus, vector clocks, and memory-mapped append-only storage.
:::
:::card title="REST & gRPC APIs" icon="terminal" action="navigate:api"
Complete endpoints, schema definitions, SDK clients, and authentication parameters.
:::
:::
:::
