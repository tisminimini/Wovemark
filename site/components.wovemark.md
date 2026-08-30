---
title: UI Component Kit & Interactive Playground — Wovemark
description: Live interactive catalog of all Wovemark UI primitives, form controls, overlays, feedback states, and safe action triggers.
layout: landing
theme: system
variance: 6
motion: 5
density: 6
accent: rose
---

:::navbar title="Wovemark UI Kit"
::nav-link label="Overview" href="#"
::nav-link label="Features" href="#features"
::nav-link label="Dashboard" href="#dashboard"
::nav-link label="Documentation" href="#docs"
::nav-link label="Pricing" href="#pricing"
::nav-link label="UI Components" href="#components" active=true
::nav-link label="About" href="#about"
::button label="Theme" action="theme:toggle" variant="ghost" size="sm" icon="sun"
::button label="Console" action="navigate:dashboard" variant="outline" size="sm" icon="terminal"
:::

:::hero variant="centered" badge="Living Styleguide • 60+ UI Primitives"
# Interactive Component Playground

Test every button variant, form control, feedback state, and dialog overlay in real-time. Everything rendered natively from declarative Wovemark Markdown.

::button label="Trigger Toast Message" action="toast:Hello from Wovemark Action Engine!?type=success" variant="primary" size="lg" icon="bell"
::button label="Open Interactive Modal" action="open:sample-dialog" variant="outline" size="lg" icon="eye"
::button label="Toggle Theme Mode" action="theme:toggle" variant="ghost" size="lg" icon="sun"
:::

:::feature-grid columns=3 title="1. Interactive Action Triggers" description="Click each button below to see the Safe Action Engine execute instant workflows."
:::card title="Toast Notifications" icon="bell"
::button label="Success Toast" action="toast:Operation completed successfully!?type=success" variant="primary" size="sm"
::button label="Warning Toast" action="toast:Approaching memory threshold (85%)?type=warning" variant="outline" size="sm"
::button label="Danger Toast" action="toast:Failed to reach upstream node.?type=danger" variant="danger" size="sm"
:::

:::card title="Modal & Confirm Overlays" icon="eye"
::button label="Open Form Dialog" action="open:sample-dialog" variant="primary" size="sm"
::button label="Trigger Confirm Modal" action="open:confirm-demo" variant="danger" size="sm"
:::

:::card title="Clipboard & Utility" icon="copy"
::button label="Copy Markdown Snippet" action="copy:::metric label=\"Active\" value=\"42\"" variant="outline" size="sm" icon="copy"
::button label="Switch Color Theme" action="theme:toggle" variant="ghost" size="sm" icon="sun"
:::
:::

## 2. Interactive Form Controls

All form controls manage their own state, validation rules, and accessibility attributes without requiring external JavaScript hook libraries:

:::form id="playground-form" submit="POST /api/demo-submit" success="toast:Playground form submitted successfully!; close:sample-dialog"
:::grid columns=2
::field name="username" label="Username / Identifier" placeholder="developer_01" required=true helpText="Unique handle for your workspace profile."
::field name="email" label="Email Address" type="email" placeholder="dev@wovemark.org" required=true
:::

:::grid columns=3
::field name="role" label="Account Role" type="select" options="Admin, Lead Engineer, Designer, Viewer" required=true
::combobox name="preferredFramework" options="Wovemark Native, Next.js, Remix, Astro, SvelteKit" placeholder="Pick framework..."
::date name="startDate" label="Target Deployment Date" required=true
:::

::field name="bio" label="Project Description" type="textarea" placeholder="Tell us about the application you are building..." helpText="Supports multiline markdown."

:::cluster gap="lg"
::checkbox name="subscribe" label="Subscribe to release notes" checked=true
::checkbox name="telemetry" label="Enable anonymous crash reporting" checked=true
::switch name="gpuAcceleration" label="Enable Edge GPU Acceleration" checked=true
:::

::slider name="budget" label="Resource Allocation Threshold" min=0 max=100 value=65

::file name="configAttachment" label="Upload Configuration File (YAML/JSON)" accept=".json,.yaml,.yml"

::button label="Submit Form Data" type="submit" variant="primary" size="lg" icon="zap"
:::

## 3. Feedback, Progress & State Banners

:::callout variant="success" title="Success Callout"
All system clusters in North America and Europe are operating normally at 100% capacity.
:::

:::callout variant="warning" title="Notice: Scheduled Maintenance"
Edge proxy updates will roll out tonight between 02:00 and 02:15 UTC. Zero packet loss expected.
:::

:::callout variant="danger" title="Danger Alert Box"
Authentication token expired. Please re-authenticate via the command palette.
:::

:::grid columns=3
:::card title="Disk Utilization" icon="layers"
::progress label="NVMe Storage" value=68 max=100
:::
:::card title="Memory Capacity" icon="activity"
::progress label="RAM Ingestion Pool" value=42 max=100
:::
:::card title="Agent Task Quota" icon="terminal"
::progress label="Monthly Task Budget" value=91 max=100
:::
:::

:::split ratio="50-50"
:::empty-state icon="inbox" title="No Pending Reviews" description="All PRs and agent generation pipelines have been reviewed and approved." actionLabel="Trigger New Agent Run" action="toast:New agent run scheduled..."
:::
:::error-state title="Cluster Connection Timeout" description="The remote worker in region AP-East is unreachable. Check your gateway firewall settings." retryLabel="Retry Regional Ping" retryAction="toast:Pinging AP-East gateway..."
:::
:::

## 4. Quotes & Editorial Elements

:::quote author="Ada Lovelace" role="Pioneer of Scientific Computing" avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
"The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves."
:::

:::dialog id="sample-dialog" title="Interactive Modal Dialog" description="Accessible modal with backdrop blur, focus trapping, and Escape key dismissal." size="md"
:::form id="modal-form" submit="POST /api/modal" success="toast:Modal form saved!; close:sample-dialog"
::field name="projectName" label="Project Name" placeholder="Nexus Telemetry" required=true
::field name="environment" label="Target Environment" type="select" options="Development, Staging, Production" required=true
::button label="Save & Close" type="submit" variant="primary" icon="check"
:::
:::

:::confirm id="confirm-demo" title="Delete Deployment Record?" confirmLabel="Yes, Delete" cancelLabel="Cancel" confirmAction="toast:Record deleted successfully!?type=info"
:::

:::footer copyright="© 2026 Wovemark Project. Declarative Markdown Engine for AI Coding Agents." columns=4
:::footer-column title="UI Kit"
::nav-link label="Buttons & Actions" href="#components"
::nav-link label="Form Controls" href="#components"
::nav-link label="Feedback States" href="#components"
::nav-link label="Modal Overlays" href="#components"
:::
:::footer-column title="Navigation"
::nav-link label="Home Overview" href="#"
::nav-link label="Features" href="#features"
::nav-link label="SaaS Console" href="#dashboard"
::nav-link label="Documentation" href="#docs"
:::
:::footer-column title="Resources"
::nav-link label="Pricing Plans" href="#pricing"
::nav-link label="GitHub Repository" href="https://github.com/wovemark/wovemark"
::nav-link label="About Team" href="#about"
:::
:::footer-column title="Preferences"
::button label="Toggle Theme" action="theme:toggle" variant="outline" size="sm" icon="sun"
::button label="Console" action="navigate:dashboard" variant="ghost" size="sm" icon="terminal"
:::
:::
