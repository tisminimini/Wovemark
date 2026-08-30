import { describe, expect, it } from "vitest";
import {
  extractBindings,
  extractFrontmatter,
  findClosestMatch,
  formatDiagnostic,
  levenshtein,
  parseAttributes,
  parseWovemark,
  validateAST,
} from "../index.js";

describe("Wovemark Parser & Validator", () => {
  describe("Frontmatter Parsing", () => {
    it("should parse standard frontmatter with dials and layout", () => {
      const source = `---
title: My SaaS App
description: Manage your workflow
layout: app
theme: dark
variance: 8
motion: 6
density: 7
accent: indigo
---

# Welcome
`;
      const ast = parseWovemark(source, { file: "test.wovemark.md" });
      expect(ast.frontmatter.title).toBe("My SaaS App");
      expect(ast.frontmatter.layout).toBe("app");
      expect(ast.frontmatter.theme).toBe("dark");
      expect(ast.frontmatter.variance).toBe(8);
      expect(ast.frontmatter.motion).toBe(6);
      expect(ast.frontmatter.density).toBe(7);
      expect(ast.frontmatter.accent).toBe("indigo");
      expect(ast.children.length).toBeGreaterThan(0);
    });

    it("should provide solid defaults when frontmatter is omitted", () => {
      const source = `# Plain markdown`;
      const ast = parseWovemark(source);
      expect(ast.frontmatter.title).toBe("Wovemark");
      expect(ast.frontmatter.layout).toBe("default");
      expect(ast.frontmatter.variance).toBe(5);
      expect(ast.frontmatter.motion).toBe(5);
      expect(ast.frontmatter.density).toBe(5);
    });
  });

  describe("Attribute Parsing", () => {
    it("should parse strings, numbers, booleans and comma-lists", () => {
      const attrs = parseAttributes(
        'variant="split" columns=3 required disabled=false tags="fast, secure, simple"'
      );
      expect(attrs.variant).toBe("split");
      expect(attrs.columns).toBe(3);
      expect(attrs.required).toBe(true);
      expect(attrs.disabled).toBe(false);
      expect(attrs.tags).toEqual(["fast", "secure", "simple"]);
    });
  });

  describe("Directives & Nesting", () => {
    it("should parse container directives and nested children correctly", () => {
      const source = `
:::feature-grid columns="3"
:::card title="Instant Sync" icon="zap"
Sync your files effortlessly.
:::

:::card title="Secure" icon="shield"
Protected by modern crypto.
:::
:::
`;
      const ast = parseWovemark(source);
      expect(ast.children.length).toBe(1);
      const grid = ast.children[0];
      expect(grid.type).toBe("ContainerDirective");
      if (grid.type === "ContainerDirective") {
        expect(grid.name).toBe("feature-grid");
        expect(grid.attributes.columns).toBe(3);
        expect(grid.children.length).toBe(2);
        const card1 = grid.children[0];
        expect(card1.type).toBe("ContainerDirective");
        if (card1.type === "ContainerDirective") {
          expect(card1.name).toBe("card");
          expect(card1.attributes.title).toBe("Instant Sync");
        }
      }
    });

    it("should parse element directives alongside containers", () => {
      const source = `
::data id="users" src="/api/users"

:::section variant="surface"
::button label="Create User" action="open:create-modal" variant="primary"
:::
`;
      const ast = parseWovemark(source);
      expect(ast.dataSources.length).toBe(1);
      expect(ast.dataSources[0].attributes.id).toBe("users");
      expect(ast.children.length).toBe(2);
    });

    it("should preserve code fences and not parse directives inside code blocks", () => {
      const source = `
# How to use Wovemark

\`\`\`md
:::hero
# Example inside code
:::
\`\`\`

::button label="Try it now"
`;
      const ast = parseWovemark(source);
      // Children: 1 markdown content node (including code block) + 1 button element directive
      expect(ast.children.length).toBe(2);
      expect(ast.children[0].type).toBe("MarkdownContent");
      expect(ast.children[1].type).toBe("ElementDirective");
      if (ast.children[0].type === "MarkdownContent") {
        expect(ast.children[0].content).toContain(":::hero");
      }
    });
  });

  describe("Bindings Extraction", () => {
    it("should extract {{ expr }} tokens with source locations", () => {
      const text = "Total Users: **{{ users.length }}** and status: {{ status }}";
      const bindings = extractBindings(text, 10, "doc.wovemark.md");
      expect(bindings.length).toBe(2);
      expect(bindings[0].expression).toBe("users.length");
      expect(bindings[1].expression).toBe("status");
    });
  });

  describe("Validator & Typo Suggestions", () => {
    it("should calculate Levenshtein distance correctly", () => {
      expect(levenshtein("datatable", "data-table")).toBe(1);
      expect(levenshtein("varaint", "variant")).toBe(2);
      expect(findClosestMatch("datatable", ["data-table", "button", "hero"])).toBe("data-table");
    });

    it("should suggest correct component name for typos", () => {
      const source = `
:::feture-grid columns=3
Content
:::
`;
      const ast = parseWovemark(source, { file: "landing.wovemark.md" });
      const diagnostics = validateAST(ast);
      expect(diagnostics.some((d) => d.code === "UNKNOWN_COMPONENT")).toBe(true);
      const diag = diagnostics.find((d) => d.code === "UNKNOWN_COMPONENT");
      expect(diag?.suggestion).toContain("feature-grid");
    });

    it("should suggest correct property name for typos", () => {
      const source = `
::button lable="Click Me" action="open:dialog"
`;
      const ast = parseWovemark(source, { file: "test.wovemark.md" });
      const diagnostics = validateAST(ast);
      expect(diagnostics.some((d) => d.code === "UNKNOWN_PROPERTY")).toBe(true);
      const diag = diagnostics.find((d) => d.code === "UNKNOWN_PROPERTY");
      expect(diag?.suggestion).toContain("label");
    });

    it("should flag invalid enum values", () => {
      const source = `
:::hero variant="unknown-variant"
# Title
:::
`;
      const ast = parseWovemark(source);
      const diagnostics = validateAST(ast);
      expect(diagnostics.some((d) => d.code === "INVALID_ENUM_VALUE")).toBe(true);
    });

    it("should format diagnostics clearly for AI agents", () => {
      const diag = {
        severity: "error" as const,
        code: "UNKNOWN_COMPONENT",
        message: "Unknown component 'datatable'.",
        suggestion: "Did you mean 'data-table'?",
        file: "dashboard.wovemark.md",
        loc: {
          start: { line: 12, column: 1, offset: 120 },
          end: { line: 12, column: 15, offset: 135 },
          file: "dashboard.wovemark.md",
        },
      };
      const formatted = formatDiagnostic(diag);
      expect(formatted).toContain("[ERROR] dashboard.wovemark.md:12:1");
      expect(formatted).toContain("Did you mean 'data-table'?");
    });
  });
});
