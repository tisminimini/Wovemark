import fs from "node:fs";
import path from "node:path";
import { findWovemarkFiles, validateProject } from "./validate.js";

export interface BuildOptions {
  outDir?: string;
  rootDir?: string;
}

export function buildProject(options: BuildOptions = {}) {
  const root = path.resolve(process.cwd(), options.rootDir || ".");
  const outDir = path.resolve(process.cwd(), options.outDir || "dist");

  console.log(`\n📦 Building Wovemark static distribution...`);

  // 1. Validate all files first
  const summary = validateProject(root);
  if (!summary.isValid) {
    console.error(`\x1b[31mBuild aborted: Found ${summary.totalErrors} validation errors in Wovemark files.\x1b[0m`);
    process.exit(1);
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 2. Copy index.html if present
  const srcIndexHtml = path.join(root, "index.html");
  if (fs.existsSync(srcIndexHtml)) {
    fs.copyFileSync(srcIndexHtml, path.join(outDir, "index.html"));
  }

  // 3. Copy all .wovemark.md files
  const wovemarkFiles = findWovemarkFiles(root);
  for (const file of wovemarkFiles) {
    const rel = path.relative(root, file);
    const dest = path.join(outDir, rel);
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(file, dest);
  }

  // 4. Copy assets directory if present
  const assetsDir = path.join(root, "assets");
  if (fs.existsSync(assetsDir)) {
    copyFolderSync(assetsDir, path.join(outDir, "assets"));
  }

  console.log(`\x1b[32m✔ Build complete: ${wovemarkFiles.length} page(s) packaged into ${path.relative(process.cwd(), outDir)}/\x1b[0m\n`);
}

function copyFolderSync(from: string, to: string) {
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  const entries = fs.readdirSync(from, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(from, entry.name);
    const destPath = path.join(to, entry.name);

    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
