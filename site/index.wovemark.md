---
title: Wovemark — The Declarative Markdown Platform for AI Agents
description: Build complete, responsive, animated, and accessible web experiences with zero frontend boilerplate.
layout: landing
theme: system
variance: 7
motion: 6
density: 4
accent: indigo
---

:::navbar title="Wovemark"
::nav-link label="Features" href="#features"
::nav-link label="Dashboard" href="#dashboard"
::nav-link label="Documentation" href="#docs"
::nav-link label="Pricing" href="#pricing"
::nav-link label="UI Components" href="#components"
::nav-link label="About" href="#about"
::button label="Theme" action="theme:toggle" variant="ghost" size="sm" icon="sun"
::button label="Launch Console" action="navigate:dashboard" variant="outline" size="sm" icon="terminal"
::button label="Get Started Free" action="open:get-started-modal" variant="primary" size="sm" icon="zap"
:::

:::hero variant="split" image="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80" badge="Wovemark 2.0 Released • Zero Boilerplate Architecture"
# The Declarative Web Engine for AI Coding Agents

Transform pure semantic Markdown directives into fast, responsive, beautifully styled, and accessible production web apps. Zero React, zero CSS keyframes, zero layout hassle.

::button label="Start Building in 60s" action="navigate:docs" variant="primary" size="lg" icon="zap"
::button label="Explore Live SaaS Console" action="navigate:dashboard" variant="outline" size="lg" icon="activity"
::button label="Schedule Architecture Demo" action="open:get-started-modal" variant="ghost" size="lg" icon="calendar"
:::

:::stats columns=4
::stat-item value="10x" label="Faster Agent Code Generation" trend="up" change="+900% speed"
::stat-item value="0 KB" label="Handwritten CSS or JSX Required" trend="up" change="Zero boilerplate"
::stat-item value="< 12ms" label="Hydration & Render Latency" trend="up" change="Ultra-light runtime"
::stat-item value="100%" label="Accessible & Responsive DOM" trend="up" change="WCAG AAA compliant"
:::

:::feature-grid columns=3 title="Engineered From the Ground Up for Agentic Creation" description="Traditional frameworks burden LLMs with thousands of lines of fragile JSX, styling classes, and state wires. Wovemark solves this at the protocol level." badge="Core Innovations"
:::card title="Semantic Directives" icon="layers" badge="Grammar"
Single-line declarative elements and cleanly nestable containers allow AI models to express complex design intents without syntax hallucinations.
:::

:::card title="The Three Dials Engine" icon="settings" badge="Design Tokens"
Dynamically parameterize visual variance, motion choreography, and UI density directly from frontmatter with values from 1 to 10.
:::

:::card title="Reactive Safe Data Store" icon="shield" badge="State & API"
Seamless two-way data bindings, declarative REST endpoints, auto-polling intervals, and sandboxed safe expressions without unsafe eval.
:::

:::card title="Built-in Component Library" icon="grid" badge="60+ Blocks"
From Bento grids and analytics charts to kanban boards, data tables, and modals — every component is ready out of the box.
:::

:::card title="Native Hash Router" icon="globe" badge="Zero-Config"
Automatic file-based hash routing resolves pages instantly with smooth staggered page reveal animations and document title sync.
:::

:::card title="Safe Action Engine" icon="zap" badge="Interactivity"
Chain interactive behaviors such as dialog opens, toasts, theme toggles, and data re-fetches without manual event listeners.
:::
:::

:::bento title="Architectural Mastery at Scale" description="How Wovemark bridges AI intent and human-grade aesthetics."
:::bento-item title="Autonomous Agent Alignment" span="2" icon="terminal" badge="Agent First"
Coding agents generate concise, fault-tolerant `.wovemark.md` documents. The Wovemark parser guarantees schema validation with intelligent typo suggestions and self-healing tokenization.
:::

:::bento-item title="Theme Dial Tokens" icon="sun" badge="Dynamic CSS"
Switch effortlessly between dark, light, and system themes with mathematically tuned contrast ratios, glassmorphism surfaces, and fluid typography.
:::

:::bento-item title="Interactive Data Visualization" icon="bar-chart" badge="SVG Charts"
Native declarative line, bar, and area charts rendered via high-performance SVG with responsive viewBoxes and gradient fills.
:::

:::bento-item title="Production Ready CI/CD" span="2" icon="shield" badge="Wovemark CLI"
Validate syntax trees, inspect layout hierarchies, and bundle static production releases with the ultra-fast `@wovemark/cli` compiler.
:::
:::

:::comparison title="How Wovemark Compares" description="See why modern engineering teams and autonomous agents choose Wovemark over legacy stacks."
::comparison-row feature="Agent Code Token Efficiency" tier1="Low (~2,500 tokens/page)" tier2="Medium (~1,200 tokens/page)" tier3="Highest (~250 tokens/page)"
::comparison-row feature="Zero-Config Accessibility" tier1="Manual ARIA tags" tier2="Partial via UI libs" tier3="Built-in Automatic WCAG AAA"
::comparison-row feature="Interactive Form Validation" tier1="Complex hook wiring" tier2="State libraries" tier3="Declarative Attributes"
::comparison-row feature="Live Hash Routing & Navigation" tier1="External Router Packages" tier2="Bundler routing" tier3="Native Instant Zero-Config"
::comparison-row feature="Animation Choreography" tier1="Custom Framer/CSS" tier2="Tailwind animate" tier3="The Motion Dial (0-10)"
:::

:::testimonials columns=3 title="Endorsed by Leading Builders and Researchers" description="Discover what engineering leaders say about the declarative markdown paradigm."
:::testimonial-item name="Dr. Marcus Vance" role="Head of AI Systems" company="Cognitive Dynamics" rating=5
Wovemark reduced our autonomous agent code hallucination rate to practically zero. Our agents create entire multi-page documentation portals and internal tools in seconds.
:::

:::testimonial-item name="Beatriz Silva" role="Lead Frontend Architect" company="Starlight Cloud" rating=5
The Three Dials concept is revolutionary. We can toggle an entire application from a spacious marketing landing page to an ultra-dense enterprise dashboard with a single YAML property.
:::

:::testimonial-item name="Kenji Sato" role="CTO & Co-Founder" company="HyperScale Labs" rating=5
We migrated our developer console and telemetry views to Wovemark. Maintenance overhead dropped by 80%, and our designers love tweaking tokens without touching JavaScript code.
:::
:::

:::cta title="Ready to unlock the full potential of Wovemark?" description="Join thousands of developers and AI agents building modern web applications with pure declarative markdown."
::button label="Get Started in 60 Seconds" action="navigate:docs" variant="primary" size="lg" icon="zap"
::button label="Launch Live Dashboard" action="navigate:dashboard" variant="outline" size="lg" icon="activity"
::button label="View UI Component Kit" action="navigate:components" variant="outline" size="lg" icon="grid"
:::

:::dialog id="get-started-modal" title="Start Building with Wovemark" description="Fill out the form below to receive starter templates, CLI guides, and agent skills." size="md"
:::form id="start-form" submit="POST /api/onboarding" success="toast:Welcome to Wovemark! Check your console; close:get-started-modal"
::field name="fullName" label="Full Name" placeholder="Alex Rivers" required=true
::field name="workEmail" label="Email Address" type="email" placeholder="alex@company.com" required=true
::field name="primaryUse" label="Primary Use Case" type="select" options="AI Agent Workflows, SaaS Dashboard, Developer Documentation, Marketing Landing Page, Internal Tools" required=true
::field name="experienceLevel" label="Frontend Background" type="select" options="AI Researcher / Prompt Engineer, Fullstack Engineer, Product Manager, Designer" required=true
::checkbox name="newsletterOptIn" label="Receive monthly Wovemark architectural updates and release notes" checked=true
::button label="Submit and Launch" type="submit" variant="primary" icon="zap"
:::
:::

:::footer copyright="© 2026 Wovemark Project. Open-source declarative web runtime for AI coding agents." columns=4
:::footer-column title="Product"
::nav-link label="Features" href="#features"
::nav-link label="Live Dashboard" href="#dashboard"
::nav-link label="Pricing & Plans" href="#pricing"
::nav-link label="UI Component Kit" href="#components"
:::
:::footer-column title="Documentation"
::nav-link label="Quick Start Guide" href="#docs"
::nav-link label="Directives Reference" href="#docs"
::nav-link label="The Three Dials" href="#docs"
::nav-link label="Action Engine" href="#docs"
:::
:::footer-column title="Company"
::nav-link label="About Wovemark" href="#about"
::nav-link label="Mission & Team" href="#about"
::nav-link label="GitHub Repository" href="https://github.com/wovemark/wovemark"
::nav-link label="Security & Trust" href="#about"
:::
:::footer-column title="Interactive Dials"
::button label="Toggle Dark/Light Theme" action="theme:toggle" variant="outline" size="sm" icon="sun"
::button label="Copy Starter CLI Command" action="copy:npx wovemark init my-project" variant="ghost" size="sm" icon="copy"
:::
:::
