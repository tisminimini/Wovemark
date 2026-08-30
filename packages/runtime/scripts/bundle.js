import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const runtimeRoot = path.resolve(__dirname, "..");

async function build() {
  const distDir = path.join(runtimeRoot, "dist");
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 1. Bundle ESM standalone (bundles @wovemark/parser so browser needs no importmaps)
  await esbuild.build({
    entryPoints: [path.join(runtimeRoot, "src/index.ts")],
    outfile: path.join(distDir, "index.js"),
    bundle: true,
    format: "esm",
    target: "es2022",
    sourcemap: true,
    logLevel: "info",
  });

  // 2. Standalone browser bundle (wovemark.js)
  await esbuild.build({
    entryPoints: [path.join(runtimeRoot, "src/index.ts")],
    outfile: path.join(distDir, "wovemark.js"),
    bundle: true,
    format: "esm",
    target: "es2022",
    minify: false,
    sourcemap: true,
  });

  // 3. Copy CSS file
  const cssSrc = path.join(runtimeRoot, "src/theme/styles.css");
  const cssDist = path.join(distDir, "styles.css");
  fs.copyFileSync(cssSrc, cssDist);
  console.log("✔ Copied styles.css to dist/styles.css");
  console.log("✔ Standalone runtime bundle created in packages/runtime/dist/");
}

build().catch((err) => {
  console.error("Bundle build failed:", err);
  process.exit(1);
});
