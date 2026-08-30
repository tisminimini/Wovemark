---
title: API Reference — Aura Engine Docs
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
::nav-link label="Architecture" href="#architecture"
::nav-link label="API Reference" href="#api" active=true
:::

:::section
# API Reference

Aura provides both REST JSON endpoints and high-throughput gRPC service definitions.

---

## 1. REST Endpoints

### `POST /v1/events`
Publish a batch of events to a specified partition stream.

**Request Headers:**
- `Authorization: Bearer <API_KEY>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "stream": "user.telemetry",
  "events": [
    { "id": "evt_101", "type": "session.start", "timestamp": 1714502400 }
  ]
}
```

**Response (200 OK):**
```json
{
  "committed": 1,
  "offset": 4920412,
  "status": "SUCCESS"
}
```

:::callout variant="tip" title="Rate Limits"
Standard tier keys allow up to 10,000 requests/second per cluster.
:::

::button label="Return to Documentation Home" action="navigate:" variant="secondary" icon="arrow-left"
:::
