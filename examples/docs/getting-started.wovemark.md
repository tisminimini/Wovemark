---
title: Getting Started — Aura Engine Docs
layout: docs
theme: system
variance: 5
motion: 4
density: 6
accent: emerald
---

:::navbar title="Aura Engine"
::nav-link label="Documentation" href="#"
::nav-link label="Getting Started" href="#getting-started" active=true
::nav-link label="Architecture" href="#architecture"
::nav-link label="API Reference" href="#api"
:::

:::section
# Getting Started with Aura Engine

This guide walks through spinning up an isolated Aura runtime instance on your local machine.

---

## 1. Prerequisites

- Node.js 18+ or Docker 24+
- Linux (x86_64 / arm64) or macOS Apple Silicon

---

## 2. Installation via CLI

Install the official Aura CLI using npm or brew:

```bash
npm install -g aura-engine-cli
```

Verify your installation:

```bash
aura --version
# aura-engine v2.4.0 (x86_64-unknown-linux-gnu)
```

---

## 3. Initialize your first cluster node

```bash
aura cluster init --name primary-cluster --port 8080
```

:::callout variant="success" title="Cluster Initialized"
Your cluster is now accepting inbound WebSocket and gRPC connections at `http://localhost:8080`.
:::

---

## 4. Connecting a Client SDK

```typescript
import { AuraClient } from "@aura/client";

const aura = new AuraClient({
  endpoint: "http://localhost:8080",
  apiKey: process.env.AURA_SECRET_KEY,
});

await aura.publish("telemetry.events", {
  userId: "usr_9410",
  latencyMs: 14.2,
  status: "OK",
});
```

::button label="Next: Core Architecture" action="navigate:architecture" variant="primary" icon="arrow-right"
:::
