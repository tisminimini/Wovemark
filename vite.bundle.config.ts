import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@wovemark/parser": path.resolve(__dirname, "./packages/parser/src/index.ts"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "./packages/runtime/dist"),
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, "./packages/runtime/src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: [],
    },
  },
});
