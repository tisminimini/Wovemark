import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@wovemark/parser": path.resolve(__dirname, "./packages/parser/src/index.ts"),
      "@wovemark/runtime": path.resolve(__dirname, "./packages/runtime/src/index.ts"),
      "@wovemark/cli": path.resolve(__dirname, "./packages/cli/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["packages/**/*.{test,spec}.ts", "tests/**/*.{test,spec}.ts"],
  },
});

