---
title: About Wovemark — Mission & Principles
description: Discover the philosophy, architecture, and team behind the Wovemark declarative web runtime.
layout: landing
theme: system
variance: 6
motion: 5
density: 5
accent: violet
---

:::navbar title="Wovemark"
::nav-link label="Overview" href="#"
::nav-link label="Features" href="#features"
::nav-link label="Dashboard" href="#dashboard"
::nav-link label="Documentation" href="#docs"
::nav-link label="Pricing" href="#pricing"
::nav-link label="UI Components" href="#components"
::nav-link label="About" href="#about" active=true
::button label="Theme" action="theme:toggle" variant="ghost" size="sm" icon="sun"
::button label="Launch Console" action="navigate:dashboard" variant="outline" size="sm" icon="terminal"
:::

:::hero variant="split" image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&auto=format&fit=crop&q=80" badge="Open-Source Mission • Founded 2026"
# Reinventing the Web Protocol for the AI Agent Era

Modern web development became overly complex with thousands of lines of fragile JSX, intricate state hooks, and bloated build configurations. We designed Wovemark to give autonomous AI agents and engineers a clean, declarative language to build beautiful software effortlessly.

::button label="Read Documentation" action="navigate:docs" variant="primary" size="lg" icon="file"
::button label="Explore SaaS Console" action="navigate:dashboard" variant="outline" size="lg" icon="activity"
:::

:::stats columns=4
::stat-item value="100%" label="Open Source & MIT Licensed" trend="neutral"
::stat-item value="0 ms" label="Build Step in Browser" trend="up" change="Zero bundler overhead"
::stat-item value="60+" label="Accessible UI Primitives" trend="up" change="Full design system"
::stat-item value="5 Global" label="Edge Regions Supported" trend="up" change="Sub-15ms latency"
:::

:::feature-grid columns=3 title="Our Core Architectural Principles" description="The core design axioms that guide every decision in Wovemark." badge="Guiding Values"
:::card title="1. Agent-First Ergonomics" icon="terminal"
AI models excel at generating structured, hierarchical documents. By removing the burden of manual JSX imports and closing tag boilerplate, agent error rates decrease by over 90%.
:::

:::card title="2. The Three Dials" icon="settings"
Design systems should be parametric. Adjusting visual variance, motion intensity, and layout density from 1 to 10 empowers instantaneous visual personalization.
:::

:::card title="3. Accessible & Ethical by Default" icon="globe"
Accessibility is not an afterthought. Keyboard navigation, ARIA semantics, focus management, and contrast compliance are hard-coded into every component primitive.
:::
:::

:::bento title="Open Source & Community Ecosystem" description="Built in the open with world-class engineering standards."
:::bento-item title="Pure TypeScript & Zero Runtime Dependencies" span="2" icon="shield" badge="Clean Architecture"
The entire Wovemark monorepo is written in strict TypeScript with 100% test coverage, comprehensive type contracts, and zero external DOM runtime dependencies.
:::

:::bento-item title="Global Edge Distribution" icon="globe" badge="Speed"
Wovemark applications run as lightweight static markdown files delivered instantly via any edge network, S3 bucket, or GitHub Pages.
:::

:::bento-item title="Developer & Agent Tooling" icon="terminal" badge="CLI & Skills"
Includes the `@wovemark/cli` compiler, live development server with hot reload, AST validation with typo diagnostics, and official AI coding agent skills.
:::

:::bento-item title="Collaborative Future" span="2" icon="zap" badge="Roadmap"
Ongoing developments include real-time multi-agent live editing, generative design themes, WebGPU hardware acceleration, and voice-driven declarative layouts.
:::
:::

:::contact title="Get in Touch with the Core Team" description="Have questions, ideas, or enterprise partnership inquiries? Reach out below."
:::form id="contact-form" submit="POST /api/contact" success="toast:Message sent successfully! We will respond within 24 hours.; close:contact-modal"
:::grid columns=2
::field name="name" label="Your Name" placeholder="Alex Morgan" required=true
::field name="email" label="Email Address" type="email" placeholder="alex@company.org" required=true
:::
::field name="subject" label="Subject" placeholder="Enterprise inquiry / Open Source contribution" required=true
::field name="message" label="Your Message" type="textarea" placeholder="How can we collaborate?..." required=true
::button label="Send Message" type="submit" variant="primary" size="lg" icon="zap"
:::
:::

:::cta title="Join the Declarative Web Revolution" description="Start creating websites and dashboards in pure markdown today."
::button label="Get Started in 60s" action="navigate:docs" variant="primary" size="lg" icon="zap"
::button label="Launch Live Dashboard" action="navigate:dashboard" variant="outline" size="lg" icon="terminal"
:::

:::footer copyright="© 2026 Wovemark Project. Open-source declarative web runtime for AI coding agents." columns=4
:::footer-column title="About"
::nav-link label="Mission & Principles" href="#about"
::nav-link label="Features" href="#features"
::nav-link label="SaaS Console" href="#dashboard"
::nav-link label="Pricing Plans" href="#pricing"
:::
:::footer-column title="Documentation"
::nav-link label="Quickstart" href="#docs"
::nav-link label="Syntax Reference" href="#docs"
::nav-link label="The Three Dials" href="#docs"
::nav-link label="Component Kit" href="#components"
:::
:::footer-column title="Community"
::nav-link label="GitHub Repository" href="https://github.com/wovemark/wovemark"
::nav-link label="Discord Community" href="#about"
::nav-link label="Security" href="#about"
:::
:::footer-column title="Preferences"
::button label="Toggle Dark/Light" action="theme:toggle" variant="outline" size="sm" icon="sun"
::button label="Console" action="navigate:dashboard" variant="ghost" size="sm" icon="terminal"
:::
:::
