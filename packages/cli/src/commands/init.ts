import fs from "node:fs";
import path from "node:path";

export interface InitOptions {
  template?: string;
  name?: string;
}

export function initProject(targetDir: string = ".", options: InitOptions = {}) {
  const root = path.resolve(process.cwd(), targetDir);
  const projectName = options.name || path.basename(root) || "my-wovemark-app";

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  // 1. Create index.html
  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName}</title>
  <link rel="stylesheet" href="https://unpkg.com/@wovemark/runtime/dist/styles.css" />
</head>
<body>
  <div id="app"></div>

  <script type="module">
    import { createWovemark } from "https://unpkg.com/@wovemark/runtime/dist/index.js";

    createWovemark({
      mount: "#app"
    });
  </script>
</body>
</html>
`;
  fs.writeFileSync(path.join(root, "index.html"), indexHtml, "utf-8");

  // 2. Create index.wovemark.md
  const indexWovemark = `---
title: ${projectName} — Home
description: Built with Wovemark
layout: landing
theme: system
variance: 6
motion: 5
density: 5
accent: blue
---

:::hero variant="split"
# Welcome to ${projectName}

Create complete websites and applications with AI agents without writing frontend boilerplate.

::button label="Learn More" action="navigate:about" variant="primary"
::button label="View Features" action="navigate:features" variant="outline"
:::

:::feature-grid columns=3 title="Why Wovemark?" description="Declarative structures designed for modern AI pair programming."
:::card title="Agent-First Design" icon="zap"
Your agent selects intentions and semantic structures; the runtime solves layout, responsive design, and motion.
:::

:::card title="Zero CSS Required" icon="shield"
Design tokens, light and dark themes, and responsive typography work automatically out of the box.
:::

:::card title="Built-in Routing & Motion" icon="globe"
Hash-based file routing, micro-interactions, and accessible dialogs without manual client JS.
:::
:::

:::cta title="Ready to build your next product?" description="Explore the documentation and start writing declarative markdown."
::button label="Explore About Page" action="navigate:about" variant="primary"
:::
`;
  fs.writeFileSync(path.join(root, "index.wovemark.md"), indexWovemark, "utf-8");

  // 3. Create about.wovemark.md
  const aboutWovemark = `---
title: About — ${projectName}
layout: default
theme: system
variance: 5
motion: 5
density: 6
---

:::navbar title="${projectName}"
::nav-link label="Home" href="#"
::nav-link label="About" href="#about" active=true
::nav-link label="Features" href="#features"
:::

:::section variant="default"
# About This Project

This project was built entirely in **Wovemark**, demonstrating zero-framework declarative web creation.

:::callout variant="tip" title="Declarative Routing"
Notice how navigating to \`#about\` automatically fetched and rendered \`about.wovemark.md\`.
:::

::button label="Back to Home" action="navigate:" variant="secondary"
:::
`;
  fs.writeFileSync(path.join(root, "about.wovemark.md"), aboutWovemark, "utf-8");

  // 4. Create features.wovemark.md
  const featuresWovemark = `---
title: Features — ${projectName}
layout: default
theme: system
---

:::navbar title="${projectName}"
::nav-link label="Home" href="#"
::nav-link label="About" href="#about"
::nav-link label="Features" href="#features" active=true
:::

:::section
# Platform Features

Explore the built-in component families and capabilities.

:::bento title="Key Highlights"
:::bento-item title="Declarative CRUD" span="2" icon="layers"
Build responsive data tables with sorting, filtering, and modal forms without frontend state logic.
:::

:::bento-item title="Pure Vector Charts" icon="bar-chart"
Generate SVG line and bar charts directly from data streams.
:::
:::
:::
`;
  fs.writeFileSync(path.join(root, "features.wovemark.md"), featuresWovemark, "utf-8");

  return { root, files: ["index.html", "index.wovemark.md", "about.wovemark.md", "features.wovemark.md"] };
}
