import { parseWovemark } from "@wovemark/parser";
import { describe, expect, it } from "vitest";
import {
  applyThemeDials,
  componentRegistry,
  DataStore,
  evaluateExpression,
  interpolateBindings,
  renderAST,
  renderIcon,
  renderSvgChart,
} from "../index.js";

describe("@wovemark/runtime", () => {
  describe("Theme Tokens & Dials", () => {
    it("should calculate CSS dial variables correctly", () => {
      // Mock dummy element
      const el = {
        style: {
          properties: {} as Record<string, string>,
          setProperty(k: string, v: string) {
            this.properties[k] = v;
          },
        },
        setAttribute(k: string, v: string) {
          (this as any)[k] = v;
        },
      } as any;

      applyThemeDials(el, { variance: 8, motion: 6, density: 7, accent: "indigo" });
      expect(el.style.properties["--wm-dial-variance"]).toBe("8");
      expect(el.style.properties["--wm-dial-motion"]).toBe("6");
      expect(el.style.properties["--wm-dial-density"]).toBe("7");
      expect(el.style.properties["--wm-color-accent"]).toBe("#4f46e5");
    });
  });

  describe("Safe Expression Evaluator", () => {
    const context = {
      user: { name: "Alice", email: "alice@example.com", role: "Admin" },
      users: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
      isLoggedIn: true,
      activeCount: 42,
    };

    it("should lookup nested properties", () => {
      expect(evaluateExpression("user.name", context)).toBe("Alice");
      expect(evaluateExpression("users.length", context)).toBe(2);
      expect(evaluateExpression("user.role", context)).toBe("Admin");
    });

    it("should evaluate ternary conditionals", () => {
      expect(evaluateExpression("isLoggedIn ? 'Welcome' : 'Sign in'", context)).toBe("Welcome");
      expect(evaluateExpression("user.missing ? 'Yes' : 'No'", context)).toBe("No");
    });

    it("should evaluate fallback values", () => {
      expect(evaluateExpression("user.nickname || 'Anonymous'", context)).toBe("Anonymous");
      expect(evaluateExpression("user.name || 'Anonymous'", context)).toBe("Alice");
    });

    it("should interpolate multiple bindings in text", () => {
      const text = "Hello {{ user.name }}, total users: {{ users.length }}!";
      const result = interpolateBindings(text, context);
      expect(result).toBe("Hello Alice, total users: 2!");
    });
  });

  describe("Data Store", () => {
    it("should register and provide mock data", () => {
      const store = new DataStore();
      const mockList = [{ id: "u1", name: "Alice" }, { id: "u2", name: "Bob" }];
      store.registerSource("users", "/api/users", mockList);

      const state = store.getStateSnapshot();
      expect(state.users).toEqual(mockList);
      expect(state.$users.status).toBe("success");
    });

    it("should create items in mock mode", async () => {
      const store = new DataStore();
      store.registerSource("users", "/api/users", [{ id: "u1", name: "Alice" }]);

      await store.createItem("users", { name: "Charlie" });
      const state = store.getStateSnapshot();
      expect(state.users.length).toBe(2);
      expect(state.users[0].name).toBe("Charlie");
    });

    it("should delete items in mock mode", async () => {
      const store = new DataStore();
      store.registerSource("users", "/api/users", [
        { id: "u1", name: "Alice" },
        { id: "u2", name: "Bob" },
      ]);

      await store.deleteItem("users", "u1");
      const state = store.getStateSnapshot();
      expect(state.users.length).toBe(1);
      expect(state.users[0].id).toBe("u2");
    });
  });

  describe("Icon & Chart Renderers", () => {
    it("should render clean SVG icons", () => {
      const zapIcon = renderIcon("zap", 24);
      expect(zapIcon).toContain("<svg");
      expect(zapIcon).toContain("width=\"24\"");
      expect(zapIcon).toContain("polygon");
    });

    it("should render pure SVG charts", () => {
      const chartSvg = renderSvgChart("line", [
        { label: "Jan", value: 10 },
        { label: "Feb", value: 25 },
      ]);
      expect(chartSvg).toContain("<svg");
      expect(chartSvg).toContain("path");
      expect(chartSvg).toContain("linearGradient");
    });
  });

  describe("AST HTML Rendering", () => {
    it("should render marketing hero and feature grid", () => {
      const source = `---
title: Acme AI
layout: landing
---

:::hero variant="split" image="/assets/hero.webp"
# Build Faster

Ship software with AI agents.

::button label="Get Started" action="navigate:signup" variant="primary"
:::

:::feature-grid columns=3
:::card title="Instant Deploy" icon="zap"
Deploy in seconds.
:::
:::
`;
      const ast = parseWovemark(source);
      const html = renderAST(ast, {});

      expect(html).toContain("wm-layout-landing");
      expect(html).toContain("wm-hero");
      expect(html).toContain("Build Faster");
      expect(html).toContain("wm-button-primary");
      expect(html).toContain("Instant Deploy");
    });

    it("should render product UI data table with state binding", () => {
      const source = `---
title: Users Dashboard
layout: app
---

::data id="users" src="/api/users"

:::data-table source="users"
::column field="name" label="Full Name"
::column field="email" label="Email Address"
:::
`;
      const ast = parseWovemark(source);
      const context = {
        users: [
          { name: "Alice Smith", email: "alice@example.com" },
          { name: "Bob Jones", email: "bob@example.com" },
        ],
      };
      const html = renderAST(ast, context);

      expect(html).toContain("wm-table-container");
      expect(html).toContain("Full Name");
      expect(html).toContain("Alice Smith");
      expect(html).toContain("bob@example.com");
    });

    it("should render kanban and tree components", () => {
      const source = `
:::kanban title="Sprint 42"
:::kanban-column title="In Progress" badge="3"
:::kanban-card title="Implement Motion" tag="FE"
Choreograph scroll reveals.
:::
:::
:::

:::tree title="Project Structure"
:::tree-node label="packages" open=true
:::tree-node label="runtime"
:::
:::
:::
`;
      const ast = parseWovemark(source);
      const html = renderAST(ast);
      expect(html).toContain("wm-kanban");
      expect(html).toContain("Sprint 42");
      expect(html).toContain("In Progress");
      expect(html).toContain("wm-tree-explorer");
      expect(html).toContain("packages");
    });

    it("should support custom plugins with Wovemark.use()", () => {
      const customPlugin = {
        name: "test-plugin",
        install({ componentRegistry }: any) {
          componentRegistry.register("custom-widget", (node: any) => {
            return `<div class="custom-widget-rendered">${node.attributes.text || "custom"}</div>`;
          });
        },
      };

      customPlugin.install({ componentRegistry });
      const customRenderer = componentRegistry.get("custom-widget");
      expect(customRenderer).toBeDefined();
      const output = customRenderer!({ attributes: { text: "Hello Plugin" } } as any, "", {});
      expect(output).toContain("custom-widget-rendered");
      expect(output).toContain("Hello Plugin");
    });
  });
});
