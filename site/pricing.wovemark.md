---
title: Transparent Pricing & Plans — Wovemark
description: Simple, predictable pricing for developers, startups, and enterprise teams building with autonomous AI agents.
layout: landing
theme: system
variance: 5
motion: 5
density: 5
accent: emerald
---

:::navbar title="Wovemark Pricing"
::nav-link label="Overview" href="#"
::nav-link label="Features" href="#features"
::nav-link label="Dashboard" href="#dashboard"
::nav-link label="Documentation" href="#docs"
::nav-link label="Pricing" href="#pricing" active=true
::nav-link label="UI Components" href="#components"
::nav-link label="About" href="#about"
::button label="Theme" action="theme:toggle" variant="ghost" size="sm" icon="sun"
::button label="Console" action="navigate:dashboard" variant="outline" size="sm" icon="terminal"
:::

:::pricing title="Predictable Plans for Every Stage" description="Deploy unlimited Wovemark applications with zero frontend friction and instant edge distribution."
:::pricing-card name="Developer Starter" price="$0" period="/mo" description="Ideal for solo engineers, open-source projects, and personal websites." ctaLabel="Start Free" ctaAction="navigate:docs"
- Unlimited local dev builds
- Standard component library (30+ blocks)
- Hash routing & reactive data store
- Community Discord support
- MIT Licensed core packages
:::

:::pricing-card name="Team Pro" price="$49" period="/mo" description="For engineering teams building client portals, dashboards, and landing pages." popular=true ctaLabel="Start 14-Day Free Trial" ctaAction="open:checkout-modal"
- Everything in Developer Starter
- Complete Enterprise UI Suite (60+ blocks)
- Bento grids, Kanban boards, and SVG charts
- Priority agent skills & AST optimization
- Global edge CDN hosting integration
- Dedicated Slack & Discord support channel
:::

:::pricing-card name="Enterprise Scale" price="$299" period="/mo" description="Custom SLAs, security compliance, and dedicated engineering onboarding." ctaLabel="Contact Enterprise Team" ctaAction="open:enterprise-modal"
- Everything in Team Pro
- 99.999% uptime SLA guarantee
- Custom component registry extensions
- SOC2 Type II & GDPR compliance package
- On-premise air-gapped deployment
- 24/7 dedicated solutions engineering team
:::
:::

:::comparison title="Detailed Feature Comparison Matrix" description="Explore all capabilities across individual and team subscription tiers."
::comparison-row feature="Declarative Directive Grammar" tier1="Included" tier2="Included" tier3="Included (Custom AST)"
::comparison-row feature="The Three Dials Engine" tier1="Full Access" tier2="Full Access" tier3="Custom Token Profiles"
::comparison-row feature="Autonomous Agent Skills" tier1="Standard" tier2="Priority Optimizations" tier3="Dedicated Fine-Tuning"
::comparison-row feature="SVG Data Visualizations" tier1="Basic Line/Bar" tier2="Full Charting Suite" tier3="Custom SVG Renderers"
::comparison-row feature="Reactive State & REST Store" tier1="5 Endpoints" tier2="Unlimited Endpoints" tier3="Encrypted Edge Streaming"
::comparison-row feature="Support & SLA" tier1="Community" tier2="Priority (4hr response)" tier3="24/7 Dedicated Architect (15m SLA)"
:::

:::case-study client="CloudMatrix Infrastructure Labs" metric="+380%" metricLabel="Faster Development Velocity"
### Transforming Internal Tooling with Declarative Wovemark

"Before adopting Wovemark, our infrastructure engineers spent 40% of their sprints building and maintaining React consoles, Tailwind styling classes, and custom chart wrappers.

By migrating our telemetry views and operational consoles to Wovemark markdown files, our autonomous agents now construct end-to-end monitoring portals in minutes. We eliminated 12,000 lines of brittle JSX boilerplate while achieving 100% WCAG AAA accessibility across all views."

**— Julian Croft, VP of Infrastructure, CloudMatrix Labs**
:::

:::accordion
:::accordion-item title="Can I switch between monthly and annual billing?" open=true
Yes. Annual billing offers a 20% discount on Team Pro and Enterprise plans with flexible seat provisioning.
:::

:::accordion-item title="Is there a limit on generated pages or traffic?"
No. Wovemark runtime executes entirely client-side in the user's browser, meaning you can serve unlimited page requests from any static host or CDN.
:::

:::accordion-item title="What payment methods do you accept?"
We support all major credit cards, Stripe, wire transfers for annual enterprise agreements, and purchase orders.
:::
:::

:::cta title="Start your 14-day free trial of Team Pro today" description="Zero credit card required. Upgrade or downgrade anytime with instant deployment."
::button label="Start Free Trial" action="open:checkout-modal" variant="primary" size="lg" icon="zap"
::button label="Launch Live Dashboard" action="navigate:dashboard" variant="outline" size="lg" icon="terminal"
:::

:::dialog id="checkout-modal" title="Activate Team Pro Trial" description="Experience the complete Wovemark Enterprise suite free for 14 days." size="md"
:::form id="checkout-form" submit="POST /api/trials" success="toast:Team Pro trial activated! Welcome aboard.; close:checkout-modal"
::field name="orgName" label="Organization / Team Name" placeholder="Starlight Cloud Labs" required=true
::field name="adminEmail" label="Admin Work Email" type="email" placeholder="admin@starlight.io" required=true
::field name="teamSize" label="Estimated Team Size" type="select" options="1-5 Engineers, 6-20 Engineers, 21-100 Engineers, 100+ Enterprise" required=true
::checkbox name="acceptTerms" label="I agree to the Terms of Service and Privacy Policy" checked=true
::button label="Activate 14-Day Free Trial" type="submit" variant="primary" icon="zap"
:::
:::

:::dialog id="enterprise-modal" title="Request Enterprise Architecture Demo" description="Schedule a dedicated architecture session with our core team." size="md"
:::form id="enterprise-form" submit="POST /api/enterprise" success="toast:Enterprise demo request received! We will reach out shortly.; close:enterprise-modal"
::field name="name" label="Full Name" placeholder="Samantha Bell" required=true
::field name="workEmail" label="Corporate Email" type="email" placeholder="samantha@enterprise.com" required=true
::field name="region" label="Primary Deployment Region" type="select" options="North America (US-East/West), Europe (Frankfurt/London), Asia-Pacific (Tokyo/Sydney), Latin America (São Paulo)" required=true
::field name="customNeeds" label="Key Requirements / Compliance Needs" type="textarea" placeholder="SOC2 Type II, custom on-premise air-gapped deployment, high-throughput telemetry..."
::button label="Submit Enterprise Request" type="submit" variant="primary" icon="shield"
:::
:::

:::footer copyright="© 2026 Wovemark Project. Declarative Markdown Engine for AI Coding Agents." columns=4
:::footer-column title="Pricing"
::nav-link label="Developer Plan" href="#pricing"
::nav-link label="Team Pro Plan" href="#pricing"
::nav-link label="Enterprise Scale" href="#pricing"
::nav-link label="Feature Matrix" href="#pricing"
:::
:::footer-column title="Product"
::nav-link label="Features" href="#features"
::nav-link label="SaaS Console" href="#dashboard"
::nav-link label="Documentation" href="#docs"
::nav-link label="UI Components" href="#components"
:::
:::footer-column title="Company"
::nav-link label="About Us" href="#about"
::nav-link label="Security" href="#about"
::nav-link label="Case Studies" href="#pricing"
:::
:::footer-column title="Preferences"
::button label="Switch Theme" action="theme:toggle" variant="outline" size="sm" icon="sun"
::button label="Launch Console" action="navigate:dashboard" variant="ghost" size="sm" icon="terminal"
:::
:::
