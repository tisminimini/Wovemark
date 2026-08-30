---
name: wovemark
description: Create complete websites, landing pages, documentation portals, and SaaS dashboards using declarative Wovemark Markdown without frontend boilerplate.
---

# Wovemark Official Agent Skill

This skill teaches AI coding agents how to author complete, aesthetic, accessible, and interactive websites using **Wovemark** (`.wovemark.md`).

---

## 1. The Core Rule

> **Never implement what Wovemark already knows how to render.**

When you need a hero banner, a data table, a modal dialog, or a metric card, **do not** generate custom HTML, React components, Tailwind utility classes, manual CSS keyframes, or client JavaScript.

Choose the corresponding semantic Wovemark directive (`:::hero`, `:::data-table`, `:::dialog`, `::metric`), specify properties and content, and let the Wovemark runtime handle visual styling, responsive layout, motion physics, and accessibility.

---

## 2. Standard Agent Workflow

1. **Analyze Requirements & Choose Layout**:
   - Marketing / Landing page -> `layout: landing` (generous white space, motion 5-8, variance 6-8)
   - SaaS App / Dashboard / CRUD -> `layout: app` (compact density 7-9, motion 2-4, variance 3-5)
   - Documentation Portal -> `layout: docs` (sidebar navigation, search, density 6)
   - Standard Content / Blog -> `layout: default`

2. **Configure Frontmatter & The Three Dials**:
   ```yaml
   ---
   title: Project Analytics
   layout: app
   theme: system
   variance: 5    # 1 (rigid/symmetrical) to 10 (editorial/asymmetric)
   motion: 4      # 0 (none) to 10 (cinematic choreography)
   density: 8     # 1 (airy landing) to 10 (dense enterprise SaaS)
   accent: indigo # blue | indigo | purple | rose | emerald | amber | cyan
   ---
   ```

3. **Structure Zero-Config Hash Routes**:
   - `index.html` -> single shell importing `@wovemark/runtime`
   - `index.wovemark.md` -> `#` (Home)
   - `features.wovemark.md` -> `#features`
   - `pricing.wovemark.md` -> `#pricing`
   - `dashboard.wovemark.md` -> `#dashboard`
   - `users.wovemark.md` -> `#users`

4. **Author Declarative Directives**:
   - Containers: `:::component-name prop="value"` ... `:::`
   - Atomic Elements: `::element-name prop="value"`
   - Reactive Data: `::data id="users" src="/api/users"`
   - Bindings: `Total: {{ users.length }}`
   - Actions: `action="open:new-user-dialog"` or `action="refresh:users; toast:Updated"`

5. **Validate & Self-Heal**:
   Run the CLI validator:
   ```bash
   npx wovemark validate .
   ```
   If any diagnostics or typo suggestions are emitted (e.g. `Unknown property 'varaint'. Did you mean 'variant'?`), fix them immediately before final delivery.

---

## 3. Skill Reference Router

When you need deep contracts or detailed component parameters, refer to the specialized reference documents:

- **Syntax & Frontmatter**: [references/syntax.md](file:///workspaces/Wovemark/skills/wovemark/references/syntax.md) — Frontmatter keys, attribute grammar, bindings, inline markdown rules.
- **Foundation & Content Components**: [references/components.md](file:///workspaces/Wovemark/skills/wovemark/references/components.md) — `container`, `section`, `card`, `grid`, `split`, `accordion`, `timeline`, `callout`, `button`.
- **Marketing Blocks**: [references/marketing.md](file:///workspaces/Wovemark/skills/wovemark/references/marketing.md) — `hero`, `feature-grid`, `bento`, `stats`, `testimonials`, `pricing`, `faq`, `cta`.
- **Product UI & Dashboards**: [references/product-ui.md](file:///workspaces/Wovemark/skills/wovemark/references/product-ui.md) — `app-shell`, `sidebar`, `page-header`, `metric`, `metric-grid`, `chart`, `activity-feed`.
- **Data Engine, Forms & CRUD**: [references/data.md](file:///workspaces/Wovemark/skills/wovemark/references/data.md) — `data-table`, `form`, `field`, `dialog`, REST operations, actions.
- **Motion & Dials**: [references/motion.md](file:///workspaces/Wovemark/skills/wovemark/references/motion.md) — Dial scaling, presets (`reveal`, `stagger`, `fade`), reduced motion.
- **Full Examples**: [references/examples.md](file:///workspaces/Wovemark/skills/wovemark/references/examples.md) — Complete working templates for landing pages, portfolios, doc sites, and dashboards.
