---
title: Pricing — Pulse Observability
layout: default
theme: system
variance: 6
motion: 5
density: 5
accent: indigo
---

:::navbar title="Pulse"
::nav-link label="Overview" href="#"
::nav-link label="Features" href="#features"
::nav-link label="Pricing" href="#pricing" active=true
::button label="Start Free" action="navigate:pricing" variant="primary" size="sm"
:::

:::section
:::pricing title="Simple, Transparent Telemetry Pricing" description="Start for free and scale as your traffic grows."
:::pricing-card name="Developer" price="$0" period="/mo" description="Ideal for personal projects and early stage prototyping." ctaLabel="Start Free"
- Up to 10M Ingested Events/mo
- 3-Day Log Retention
- 5 User Seats
- Community Slack Support
:::
:::pricing-card name="Team" price="$99" period="/mo" description="For engineering teams building production applications." popular=true ctaLabel="Start 14-Day Trial"
- Up to 250M Ingested Events/mo
- 30-Day Trace & Log Retention
- Unlimited User Seats
- eBPF Kernel Tracing
- Slack & PagerDuty Alerts
- 99.9% Uptime SLA
:::
:::pricing-card name="Enterprise" price="$499" period="/mo" description="Dedicated clusters and custom security compliance." ctaLabel="Contact Sales" ctaAction="open:contact-sales-dialog"
- Unlimited Events & Petabyte Storage
- 1-Year Retention
- Dedicated VPC Peering
- Custom SAML / SSO
- 24/7 Dedicated Support Engineer
- 99.999% Financial SLA
:::
:::

:::faq title="Frequently Asked Questions"
:::faq-item question="How does the 14-day trial work?"
You get full access to Team tier features with no credit card required. At the end of the trial, you can upgrade or seamlessly transition to the perpetual Developer tier.
:::
:::faq-item question="Is Pulse compatible with OpenTelemetry?"
Yes! Pulse is 100% OpenTelemetry native. Point your OTel Collector or Jaeger agent to your Pulse ingest endpoint and data begins streaming immediately.
:::
:::faq-item question="What happens if we exceed our monthly event quota?"
We never drop telemetry. You will receive an automated notification with options to upgrade or configure client-side rate limiters.
:::
:::
:::

:::dialog id="contact-sales-dialog" title="Contact Enterprise Solutions" description="Discuss custom telemetry volume and dedicated clusters."
:::form submit="POST /api/enterprise" success="toast:Inquiry submitted!; close:contact-sales-dialog"
::field name="name" label="Full Name" required=true
::field name="email" label="Work Email" type="email" required=true
::field name="volume" label="Expected Monthly Ingestion" type="select" options="1B-10B events, 10B-50B events, 50B+ events"
::button label="Submit Inquiry" type="submit" variant="primary"
:::
:::
