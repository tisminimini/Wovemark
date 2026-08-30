---
title: Features — Pulse Observability
layout: default
theme: system
variance: 6
motion: 5
density: 5
accent: indigo
---

:::navbar title="Pulse"
::nav-link label="Overview" href="#"
::nav-link label="Features" href="#features" active=true
::nav-link label="Pricing" href="#pricing"
::button label="Start Free" action="navigate:pricing" variant="primary" size="sm"
:::

:::section
# Deep-Dive Platform Features

Everything required to maintain five-nines uptime across modern distributed architectures.

:::grid columns=3
:::card title="Kernel-Level eBPF" icon="activity"
Capture network sockets, memory pressure, and syscall latency without application code modification.
:::
:::card title="Distributed Context Propagation" icon="layers"
W3C TraceContext headers injected automatically across HTTP/gRPC/Kafka boundaries.
:::
:::card title="Synthetic Canary Monitors" icon="globe"
Simulate user journeys from 40 global regions with automated SSL and DNS timing alerts.
:::
:::

:::callout variant="tip" title="Enterprise Ready"
Integrates directly with PagerDuty, Slack, OpsGenie, Datadog, and AWS CloudWatch out of the box.
:::

::button label="View Pricing Plans" action="navigate:pricing" variant="primary" icon="arrow-right"
:::
