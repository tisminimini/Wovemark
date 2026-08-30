import { ActionEngine, actionEngine } from "./actions/engine.js";
import { DataStore, dataStore } from "./data/store.js";
import { MotionEngine, motionEngine } from "./motion/motion.js";
import { ComponentRegistry, componentRegistry, renderAST } from "./renderer/registry.js";
import { RouterOptions, WovemarkRouter } from "./router/router.js";
import { applyThemeDials } from "./theme/tokens.js";

export * from "@wovemark/parser";
export * from "./actions/engine.js";
export * from "./data/store.js";
export * from "./data/evaluator.js";
export * from "./icons/icons.js";
export * from "./motion/motion.js";
export * from "./renderer/registry.js";
export * from "./renderer/markdown.js";
export * from "./renderer/charts.js";
export * from "./router/router.js";
export * from "./theme/tokens.js";

export interface WovemarkOptions extends RouterOptions {
  autoInjectStyles?: boolean;
}

/**
 * Initializes and mounts a Wovemark application.
 */
export function createWovemark(options: WovemarkOptions = { mount: "#app" }): WovemarkRouter {
  const router = new WovemarkRouter(options);
  return router;
}

export interface WovemarkPlugin {
  name: string;
  install: (context: {
    componentRegistry: ComponentRegistry;
    dataStore: DataStore;
    actionEngine: ActionEngine;
    motionEngine: MotionEngine;
  }) => void;
}

export function use(plugin: WovemarkPlugin) {
  plugin.install({
    componentRegistry,
    dataStore,
    actionEngine,
    motionEngine,
  });
}

// Auto-initialize if running in a browser with a #app container
if (typeof window !== "undefined" && typeof document !== "undefined") {
  (window as any).Wovemark = {
    createWovemark,
    use,
    dataStore,
    actionEngine,
    motionEngine,
    componentRegistry,
    renderAST,
    applyThemeDials,
  };
}
