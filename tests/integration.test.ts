import fs from "node:fs";
import path from "node:path";
import { parseWovemark, validateAST } from "@wovemark/parser";
import { findWovemarkFiles, validateProject } from "@wovemark/cli";
import { renderAST } from "@wovemark/runtime";
import { describe, expect, it } from "vitest";

describe("Wovemark Full Monorepo Integration Tests", () => {
  it("should validate all files in docs with 0 errors", () => {
    const docsDir = path.resolve(__dirname, "../docs");
    const summary = validateProject(docsDir);
    expect(summary.filesChecked).toBeGreaterThan(0);
    expect(summary.totalErrors).toBe(0);
    expect(summary.totalWarnings).toBe(0);
    expect(summary.isValid).toBe(true);
  });

  it("should validate all files in examples with 0 errors", () => {
    const examplesDir = path.resolve(__dirname, "../examples");
    const summary = validateProject(examplesDir);
    expect(summary.filesChecked).toBeGreaterThanOrEqual(15);
    expect(summary.totalErrors).toBe(0);
    expect(summary.totalWarnings).toBe(0);
    expect(summary.isValid).toBe(true);
  });

  it("should render every example page to valid semantic HTML", () => {
    const examplesDir = path.resolve(__dirname, "../examples");
    const files = findWovemarkFiles(examplesDir);

    for (const file of files) {
      const source = fs.readFileSync(file, "utf-8");
      const ast = parseWovemark(source, { file });
      const diagnostics = validateAST(ast);
      expect(diagnostics.filter((d) => d.severity === "error").length).toBe(0);

      const html = renderAST(ast, {
        usersList: [{ id: 1, name: "Test User", email: "test@example.com" }],
        recentTransactions: [{ id: "TX-1", customer: "Acme", amount: "$100" }],
      });

      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(50);
    }
  });
});
