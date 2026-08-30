---
title: Features & Capabilities — Wovemark
description: Deep dive into the architectural primitives, design dials, reactive data engine, and agent-first design of Wovemark.
layout: landing
theme: system
variance: 6
motion: 5
density: 5
accent: purple
---

:::navbar title="Wovemark"
::nav-link label="Overview" href="#"
::nav-link label="Features" href="#features" active=true
::nav-link label="Dashboard" href="#dashboard"
::nav-link label="Documentation" href="#docs"
::nav-link label="Pricing" href="#pricing"
::nav-link label="UI Components" href="#components"
::nav-link label="About" href="#about"
::button label="Toggle Theme" action="theme:toggle" variant="ghost" size="sm" icon="sun"
::button label="Console" action="navigate:dashboard" variant="primary" size="sm" icon="terminal"
:::

:::hero variant="centered" badge="Architectural Capabilities • Wovemark Platform"
# Unmatched Power Behind Pure Markdown

Explore how Wovemark pairs the intuitive brevity of Markdown with an enterprise-grade client runtime, reactive data store, and parameterized design system.

::button label="Inspect Interactive SaaS Dashboard" action="navigate:dashboard" variant="primary" size="lg" icon="activity"
::button label="Read Documentation" action="navigate:docs" variant="outline" size="lg" icon="file"
:::

:::callout variant="tip" title="AI Agent Optimization"
Wovemark files use standard CommonMark directives (`:::container` and `::element`). AI models generate this format with 95% fewer syntax errors than JSX or Vue SFCs because there are no closing tags to misalign and no manual state hook imports.
:::

:::feature-grid columns=3 title="Six Core Engineering Pillars" description="Everything required to construct production web apps without frontend framework complexity." badge="Platform Pillars"
:::card title="1. Grammar & Directives" icon="code" badge="Syntax"
Clean, unambiguous AST parser supporting container blocks (`:::hero`, `:::grid`, `:::bento`) and self-closing elements (`::metric`, `::button`, `::chart`).
:::

:::card title="2. The Three Dials Engine" icon="settings" badge="Parametric"
Dial up variance for expressive asymmetric landing pages, or dial up density for data-dense operational consoles without touching CSS.
:::

:::card title="3. Reactive Data Engine" icon="shield" badge="State Store"
Register REST endpoints via `::data` directives with auto-refresh intervals, mock registries, optimistic mutations, and safe expression bindings (`{{ ... }}`).
:::

:::card title="4. Choreographed Motion" icon="zap" badge="Animations"
Micro-interactions, staggered entrance choreography, modal backdrop transitions, and smooth tab switching powered by CSS custom properties.
:::

:::card title="5. Accessible Design Tokens" icon="globe" badge="WCAG AAA"
High contrast palettes, automatic focus trapping in dialogs, keyboard navigation (`Escape`, `Tab`, `Cmd+K`), and native semantic HTML elements.
:::

:::card title="6. Zero-Config Hash Router" icon="layers" badge="Routing"
Instant client-side route transitions that dynamically fetch `.wovemark.md` files, update browser history, and manage scroll positions.
:::
:::

:::bento title="Deep Architectural Primitives" description="Explore advanced features built directly into the runtime engine."
:::bento-item title="The Three Parametric Dials" span="2" icon="settings" badge="Dials System"
Every page frontmatter exposes three dials from 1 to 10:
- **Variance (1-10)**: Controls layout asymmetry, typography scaling, and visual accents.
- **Motion (0-10)**: Controls animation duration, stagger timings, and entrance effects.
- **Density (1-10)**: Adjusts spacing, padding, font sizes, and UI component packing.
:::

:::bento-item title="Safe Action Dispatcher" icon="zap" badge="Action Engine"
Execute multi-action sequences safely via semicolon delimiters:
`action="open:modal-1; toast:Action executed!; refresh:telemetry"`
Supports modals, toasts, theme toggles, clipboard copy, and hash navigation.
:::

:::bento-item title="Integrated SVG Charts" icon="bar-chart" badge="Visualizations"
Render data-bound line, bar, area, and donut charts instantly with zero external heavyweight charting library dependencies.
:::

:::bento-item title="Built-in Typo Diagnostics & Self-Healing AST" span="2" icon="terminal" badge="Compiler"
The `@wovemark/parser` includes a Levenshtein-distance suggestion engine that automatically identifies misspelled directive names and missing attributes during validation.
:::
:::

:::tabs
:::tab-item id="tab-wovemark" label="Wovemark Markdown"
```markdown
---
title: Real-Time Telemetry
layout: app
density: 8
accent: blue
---

:::metric-grid columns=3
::metric label="Active Nodes" value="128" change="+4" trend="up" icon="zap"
::metric label="Avg Latency" value="14.2ms" change="-2.1ms" trend="up" icon="activity"
::metric label="Uptime" value="99.99%" trend="neutral" icon="shield"
:::

::chart title="Weekly Traffic" type="line" height=240
```
:::

:::tab-item id="tab-react" label="Traditional React / Next.js (150+ lines)"
```tsx
// Requires importing React, useState, useEffect, Lucide icons,
// Tailwind classes, chart library wrappers, responsive grid math,
// and state wiring...
import React, { useState, useEffect } from 'react';
import { Zap, Activity, Shield } from 'lucide-react';
import { LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export default function Dashboard() {
  // 100+ lines of component boilerplate and Tailwind classes...
}
```
:::
:::

:::callout variant="info" title="Zero Dependencies in the Browser"
The entire `@wovemark/runtime` is ultra-lightweight, has zero external browser dependencies, and mounts on any standard HTML page via a single `<script type="module">` tag.
:::

:::accordion
:::accordion-item title="How does Wovemark handle responsive design on mobile devices?" open=true
All Wovemark grid, split, bento, and navbar components automatically compute mobile breakpoints based on responsive CSS Grid and Flexbox token systems. Grids collapse gracefully into single-column stacks on narrow viewports without requiring manual media query definitions.
:::

:::accordion-item title="Can I connect real backend APIs and microservices?"
Yes! Use the `::data id="mySource" src="https://api.yourdomain.com/data" autoRefresh=30` directive. The runtime automatically performs JSON fetching, caches the payload in the reactive data store, and renders data tables or charts bound to that source.
:::

:::accordion-item title="Is Wovemark extensible with custom plugins and components?"
Absolutely. You can register custom component renderers, actions, or data transformers using the `Wovemark.use(...)` plugin API.
:::
:::

:::cta title="Test the Power in the Live SaaS Console" description="See all components, charts, data tables, and kanban boards in action."
::button label="Open Interactive SaaS Console" action="navigate:dashboard" variant="primary" size="lg" icon="terminal"
::button label="View UI Component Kit" action="navigate:components" variant="outline" size="lg" icon="grid"
:::

:::footer copyright="© 2026 Wovemark Project. Declarative Markdown Engine for AI Coding Agents." columns=4
:::footer-column title="Navigation"
::nav-link label="Overview" href="#"
::nav-link label="Features" href="#features"
::nav-link label="Dashboard" href="#dashboard"
::nav-link label="Documentation" href="#docs"
:::
:::footer-column title="Components"
::nav-link label="Bento Grids" href="#features"
::nav-link label="Interactive Charts" href="#dashboard"
::nav-link label="Kanban Boards" href="#dashboard"
::nav-link label="Form Controls" href="#components"
:::
:::footer-column title="Resources"
::nav-link label="Quick Start" href="#docs"
::nav-link label="CLI Validation" href="#docs"
::nav-link label="Pricing Plans" href="#pricing"
::nav-link label="About Us" href="#about"
:::
:::footer-column title="Settings"
::button label="Switch Theme" action="theme:toggle" variant="outline" size="sm" icon="sun"
::button label="Documentation" action="navigate:docs" variant="ghost" size="sm" icon="file"
:::
:::
