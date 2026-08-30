import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcCss = path.resolve(__dirname, "../src/theme/styles.css");
const distDir = path.resolve(__dirname, "../dist");
const distCss = path.resolve(distDir, "styles.css");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (fs.existsSync(srcCss)) {
  fs.copyFileSync(srcCss, distCss);
  console.log("Copied styles.css to dist/styles.css");
}
