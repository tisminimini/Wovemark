---
title: Architecture — Aura Engine Docs
layout: docs
theme: system
variance: 5
motion: 4
density: 6
accent: emerald
---

:::navbar title="Aura Engine"
::nav-link label="Documentation" href="#"
::nav-link label="Getting Started" href="#getting-started"
::nav-link label="Architecture" href="#architecture" active=true
::nav-link label="API Reference" href="#api"
:::

:::section
# Aura Core Architecture

Aura combines deterministic finite state machines with multi-leader Raft consensus.

---

## 1. Storage Subsystem

The storage engine is written in Rust and utilizes `mmap`-backed ring buffers to ensure zero-copy disk writes.

:::bento
:::bento-item title="Append-Only WAL" span="2" icon="layers"
Write-Ahead Log records every incoming event before committing to memory state machines.
:::
:::bento-item title="Vector Clocks" icon="activity"
Causality tracking guarantees conflict-free monotonic clock synchronization.
:::
:::bento-item title="Snapshots" icon="shield"
Asynchronous checkpoint compaction generates point-in-time state tarballs without blocking ingestion threads.
:::
:::bento-item title="Zero-Copy Serialization" span="2" icon="zap"
FlatBuffers binary wire encoding eliminates GC pauses and JSON parsing overhead.
:::
:::

::button label="Next: API Reference" action="navigate:api" variant="primary" icon="arrow-right"
:::
