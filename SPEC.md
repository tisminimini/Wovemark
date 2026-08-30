# Wovemark Specification (SPEC-1.0)

## 1. Overview & Philosophy

Wovemark is a declarative, agent-first Markdown format and lightweight runtime designed for authoring complete websites, marketing pages, documentations, and interactive web applications without traditional frontend frameworks (React, Vue, Tailwind, CSS keyframes, complex grid configurations).

The fundamental paradigm of Wovemark is:
> **The AI Agent chooses and supplies semantic structure and content; the Wovemark Runtime decides layout, motion, responsiveness, accessibility, and visual execution.**

```
+-------------------------------------------------------------+
| AI Agent / Human Author                                     |
| Writes: *.wovemark.md (Frontmatter + Directives + Content)  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| @wovemark/parser                                            |
| Lexes, parses frontmatter & directives into a validated AST |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| @wovemark/runtime                                           |
| Component Registry + Design Tokens + Motion + Data Engine   |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| Accessible, Responsive, Animated HTML5 DOM                  |
+-------------------------------------------------------------+
```

---

## 2. Runtime Model

### 2.1 Single Entry Point (`index.html`)
The consumer project requires only a minimal HTML shell importing `@wovemark/runtime`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wovemark App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module">
    import { createWovemark } from "@wovemark/runtime";
    createWovemark({ mount: "#app" });
  </script>
</body>
</html>
```

### 2.2 Hash-Based File Routing
Wovemark uses zero-config hash-based file routing:
- `#` or empty hash -> fetches and renders `index.wovemark.md`
- `#about` -> fetches and renders `about.wovemark.md`
- `#pricing` -> fetches and renders `pricing.wovemark.md`
- `#docs/install` -> fetches and renders `docs/install.wovemark.md`
- `#users/:id` -> fetches and renders `users/[id].wovemark.md` or passes route params to data bindings

### 2.3 Route Lifecycle
1. `hashchange` or programmatic `navigate:<route>` trigger.
2. Route resolution to candidate `.wovemark.md` file.
3. Fetch markdown content (with memory caching).
4. Parse frontmatter, directives, bindings into AST.
5. Validate AST against Component Schema Registry.
6. Trigger View Transition (if supported) or Motion Engine page fade/slide.
7. Update `document.title` and meta tags from frontmatter.
8. Mount rendered DOM tree to target container.
9. Restore scroll position or scroll to hash target element.
10. Initialize data sources (`::data`) and attach action listeners.

---

## 3. The Three Dials

Wovemark frontmatter accepts three numerical dials (`1` to `10`) that dynamically parameterize styling, layout density, and animation behavior across all components:

| Dial | Range | Default | Effect |
| :--- | :--- | :--- | :--- |
| **`variance`** | 1 - 10 | 5 | Controls layout asymmetry, structural surprise, visual variety, typography contrast, and decorative surfaces. (1 = rigid/symmetrical, 10 = highly dynamic/asymmetric/editorial). |
| **`motion`** | 0 - 10 | 5 | Controls motion physics, transitions, scroll reveals, stagger timing, and hover feedback. (0 = motion disabled, 1-3 = functional micro-transitions, 5 = smooth reveals, 8-10 = cinematic choreography). |
| **`density`** | 1 - 10 | 5 | Controls spacing, padding, font sizes, data table row height, and control sizes. (1-3 = spacious/airy landing page style, 5 = standard, 7-10 = high-density SaaS dashboard). |

---

## 4. Design System & Token Architecture

All visual styling is driven by CSS Custom Properties (`--wm-*`), ensuring consistent theming without manual CSS classes:
- `--wm-font-sans`, `--wm-font-mono`, `--wm-font-serif`
- `--wm-color-bg`, `--wm-color-surface`, `--wm-color-surface-subtle`, `--wm-color-border`
- `--wm-color-text`, `--wm-color-text-muted`, `--wm-color-text-faint`
- `--wm-color-accent`, `--wm-color-accent-hover`, `--wm-color-accent-fg`
- `--wm-color-success`, `--wm-color-warning`, `--wm-color-danger`, `--wm-color-info`
- `--wm-radius-sm`, `--wm-radius-md`, `--wm-radius-lg`, `--wm-radius-full`
- `--wm-shadow-sm`, `--wm-shadow-md`, `--wm-shadow-lg`
- `--wm-space-1` through `--wm-space-16`

### Themes
Supported theme modes:
- `light`: Force light palette.
- `dark`: Force dark palette.
- `system`: Automatically synchronize with `prefers-color-scheme`.
- Custom theme override file via frontmatter `theme: "./theme.wovemark.md"`.

---

## 5. Declarative Data & Reactive State

Wovemark enables data-driven dashboards and CRUD interfaces without client JavaScript:
1. **Data Source Definition**: `::data id="users" src="/api/users" autoRefresh=30`
2. **Component Binding**: `:::data-table source="users"`
3. **Inline Interpolation**: `{{ users.length }}`, `{{ currentUser.name }}`
4. **State Machine**: Each data source automatically maintains `{ status: 'idle' | 'loading' | 'success' | 'error', data, error, lastUpdated }`.

---

## 6. Action Engine & Safe Event Dispatch

To maintain security, determinism, and prevent arbitrary code execution, all interactive behaviors use whitelisted command strings:
- `open:<dialog-id>` — Opens a modal dialog or drawer.
- `close:<dialog-id>` — Closes an open dialog/drawer.
- `toggle:<element-id>` — Toggles collapsible/drawer state.
- `refresh:<data-id>` — Refreshes a data source from its endpoint.
- `navigate:<route>` — Navigates to a hash route.
- `submit:<form-id>` — Triggers programmatic form validation and submission.
- `delete:<data-id>?id={{item.id}}` — Performs REST DELETE on item.
- `toast:<message>?type=success` — Triggers a floating toast notification.
- `theme:toggle` / `theme:dark` / `theme:light` — Switches visual theme.
- `copy:<text>` — Copies string to user clipboard.

---

## 7. Security Model

1. **No Arbitrary JavaScript**: `eval()`, `new Function()`, inline `<script>` tags, and `javascript:` URLs are strictly prohibited and sanitized.
2. **HTML Sanitization**: All markdown rendering escapes raw HTML strings by default unless explicitly parameterized through safe directives.
3. **Whitelist Dispatch**: Actions only invoke verified runtime event channels.
4. **Safe URL Protocol**: Only `http:`, `https:`, `mailto:`, `tel:`, and relative hash paths (`#...`) are allowed in links and image sources.

---

## 8. Accessibility (A11y) Guarantees

Wovemark runtime enforces automated accessibility compliance:
- Native semantic HTML elements (`<main>`, `<nav>`, `<header>`, `<footer>`, `<dialog>`, `<button>`).
- Auto-associated `for`/`id` on form labels and input fields.
- Full keyboard navigation for menus, modals, accordions, and tabs (`Escape`, `Arrow` keys, `Tab` traps).
- ARIA live regions for async data loading, form errors, and toasts.
- Automated adherence to `prefers-reduced-motion: reduce`.
