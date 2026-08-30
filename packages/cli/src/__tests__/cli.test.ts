import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildProject } from "../commands/build.js";
import { initProject } from "../commands/init.js";
import { findWovemarkFiles, validateProject } from "../commands/validate.js";

describe("@wovemark/cli", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "wm-cli-test-"));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should scaffold a starter project with wovemark init", () => {
    const res = initProject(tempDir, { name: "TestApp" });
    expect(fs.existsSync(path.join(tempDir, "index.html"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "index.wovemark.md"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "about.wovemark.md"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "features.wovemark.md"))).toBe(true);
    expect(res.files.length).toBe(4);
  });

  it("should find and validate generated wovemark files", () => {
    initProject(tempDir, { name: "TestApp" });
    const files = findWovemarkFiles(tempDir);
    expect(files.length).toBe(3); // index, about, features

    const summary = validateProject(tempDir);
    expect(summary.isValid).toBe(true);
    expect(summary.totalErrors).toBe(0);
  });

  it("should detect errors in invalid wovemark files", () => {
    initProject(tempDir);
    const badFile = path.join(tempDir, "invalid.wovemark.md");
    fs.writeFileSync(
      badFile,
      `---
title: Broken
---
:::non-existent-component
Hello
:::
`,
      "utf-8"
    );

    const summary = validateProject(tempDir);
    expect(summary.isValid).toBe(false);
    expect(summary.totalErrors).toBeGreaterThan(0);
  });

  it("should build and copy files to dist directory", () => {
    initProject(tempDir, { name: "BuildTest" });
    const outDir = path.join(tempDir, "dist");

    buildProject({ rootDir: tempDir, outDir });
    expect(fs.existsSync(path.join(outDir, "index.html"))).toBe(true);
    expect(fs.existsSync(path.join(outDir, "index.wovemark.md"))).toBe(true);
    expect(fs.existsSync(path.join(outDir, "about.wovemark.md"))).toBe(true);
  });
});
