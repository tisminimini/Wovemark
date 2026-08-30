---
title: Elena Voss — Portfolio
description: Design systems, interactive computing, and high-fidelity digital artifacts
layout: landing
theme: system
variance: 9
motion: 7
density: 3
accent: purple
---

:::navbar title="Elena Voss"
::nav-link label="Selected Work" href="#" active=true
::nav-link label="Projects" href="#projects"
::nav-link label="About & Contact" href="#about"
::button label="Let's Talk" action="open:contact-modal" variant="primary" size="sm" icon="mail"
:::

:::hero variant="editorial" badge="Digital Product Architect"
# Sculpting interfaces at the intersection of typography, motion, and generative systems.

Based in Zurich & San Francisco. Partnering with venture-backed founders and design teams to craft iconic brand surfaces and applications.

::button label="Explore Projects" action="navigate:projects" variant="primary" size="lg" icon="arrow-right"
::button label="Get in Touch" action="open:contact-modal" variant="outline" size="lg"
:::

:::section variant="default"
:::grid columns=2
:::card title="Aethelgard OS" description="Spatial Design System" badge="2026" action="navigate:projects"
Next-generation spatial computing desktop environment engineered with deterministic physics and micro-lattices.
:::
:::card title="Chronos Telemetry" description="Interactive WebGL Suite" badge="2025" action="navigate:projects"
Sub-millisecond data density canvas rendering 100k nodes simultaneously in real-time.
:::
:::card title="Vesper Sans" description="Variable Type Foundry" badge="2025" action="navigate:projects"
18-axis bespoke grotesque typography family deployed across global digital flagships.
:::
:::card title="Luminary AI" description="Autonomous Agent Studio" badge="2024" action="navigate:projects"
Generative canvas environment for multi-agent prompt synthesis and orchestration.
:::
:::
:::

:::section variant="surface"
:::split ratio="40-60"
<div>
  <span class="wm-badge wm-badge-accent" style="margin-bottom:16px">Philosophy</span>
  <h2>Form follows intent, amplified by physics.</h2>
</div>
<div>
  <p class="wm-lead">
    Digital products should feel physically grounded yet boundless. Every interaction is an opportunity to communicate depth, spatial hierarchy, and clarity without friction.
  </p>
  <p class="wm-text-muted">
    Over the past decade, I have led design teams from seed stage through IPO, crafting brand identities and product architectures used by millions daily.
  </p>
</div>
:::
:::

:::dialog id="contact-modal" title="Start a Collaboration" description="Inquire about availability for Q3/Q4 design engagements."
:::form submit="POST /api/inquiry" success="toast:Message delivered!; close:contact-modal"
::field name="name" label="Your Name" placeholder="Sophia Sterling" required=true
::field name="email" label="Email Address" type="email" placeholder="sophia@studio.com" required=true
::field name="timeline" label="Project Timeline" type="select" options="Immediate, Next Month, Next Quarter"
::field name="details" label="Project Scope" type="textarea" placeholder="Tell me about your product goals..." required=true
::button label="Send Message" type="submit" variant="primary"
:::
:::

:::footer copyright="© 2026 Elena Voss. Handcrafted with Wovemark." columns=3
:::footer-column title="Navigation"
::nav-link label="Selected Work" href="#"
::nav-link label="Projects" href="#projects"
::nav-link label="About" href="#about"
:::
:::footer-column title="Network"
::nav-link label="Twitter / X" href="https://twitter.com"
::nav-link label="GitHub" href="https://github.com"
::nav-link label="Substack" href="https://substack.com"
:::
:::footer-column title="Studio"
Zurich — Switzerland

Direct: elena@voss.design
:::
:::
