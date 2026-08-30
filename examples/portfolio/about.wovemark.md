---
title: About & Contact — Elena Voss
layout: default
theme: system
variance: 7
motion: 5
density: 5
accent: purple
---

:::navbar title="Elena Voss"
::nav-link label="Selected Work" href="#"
::nav-link label="Projects" href="#projects"
::nav-link label="About & Contact" href="#about" active=true
:::

:::section
:::split ratio="40-60"
<div>
  <h2>About Elena</h2>
  <p class="wm-text-muted" style="margin-top:8px">Designer, technologist, and design systems architect.</p>
</div>
<div>
  <p class="wm-lead">
    I partner with founders and visionary engineering teams to solve complex UX challenges, structure foundational design tokens, and launch iconic software.
  </p>
  <p>
    My background spans human-computer interaction, spatial computing, and computational geometry. I believe that thoughtful software should elevate human capability through clarity and delight.
  </p>
</div>
:::

::divider label="Contact Form"

:::surface
<h3>Send a Direct Message</h3>
<p class="wm-text-muted" style="margin-bottom:20px">Let's discuss your next product launch or brand evolution.</p>

:::form submit="POST /api/contact" success="toast:Message received! I will reply shortly."
::field name="name" label="Your Name" placeholder="Jane Doe" required=true
::field name="email" label="Email Address" type="email" placeholder="jane@example.com" required=true
::field name="subject" label="Subject" placeholder="Design Collaboration Inquiry" required=true
::field name="message" label="Message" type="textarea" placeholder="How can I help with your project?" required=true
::button label="Transmit Message" type="submit" variant="primary" icon="mail"
:::
:::
:::
