import { parseWovemark, validateAST, WovemarkDiagnostic } from "@wovemark/parser";
import { dataStore } from "../data/store.js";
import { motionEngine } from "../motion/motion.js";
import { renderAST } from "../renderer/registry.js";
import { applyThemeDials } from "../theme/tokens.js";

export interface RouterOptions {
  mount: HTMLElement | string;
  basePath?: string;
  debug?: boolean;
  onPageLoad?: (file: string) => void;
}

export class WovemarkRouter {
  private mountEl: HTMLElement | null = null;
  private basePath: string = "";
  private debug: boolean = true;
  private pageCache: Map<string, string> = new Map();
  private currentFilePath: string = "";
  private scrollPositions: Map<string, number> = new Map();
  private lastRoute: string = "";

  constructor(options: RouterOptions) {
    if (typeof document !== "undefined") {
      this.mountEl =
        typeof options.mount === "string"
          ? document.querySelector(options.mount)
          : options.mount;

      this.basePath = options.basePath || "";
      this.debug = options.debug !== false;

      this.init();
    }
  }

  private init() {
    window.addEventListener("hashchange", () => {
      // Save scroll position of previous route before switching
      if (this.lastRoute) {
        this.scrollPositions.set(this.lastRoute, window.scrollY || window.pageYOffset || 0);
      }
      this.handleRouteChange();
    });

    // Subscribe to reactive data store updates to re-render current view when state changes
    dataStore.subscribe((snapshot) => {
      this.reRenderCurrentPage(snapshot);
    });

    // Initial route load
    this.handleRouteChange();
  }

  public async handleRouteChange() {
    const rawHash = window.location.hash.replace(/^#\/?/, "");
    const [routePart, queryPart] = rawHash.split("?");
    const cleanRoute = (routePart || "").trim();

    this.lastRoute = cleanRoute || "index";

    const fileName = cleanRoute ? `${cleanRoute}.wovemark.md` : "index.wovemark.md";
    const filePath = this.basePath ? `${this.basePath.replace(/\/$/, "")}/${fileName}` : fileName;

    // Parse query params into dictionary
    const queryParams: Record<string, string> = {};
    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      searchParams.forEach((val, key) => {
        queryParams[key] = val;
      });
    }

    await this.loadPage(filePath, queryParams);
  }

  public async loadPage(filePath: string, queryParams: Record<string, string> = {}) {
    this.currentFilePath = filePath;

    try {
      let source = this.pageCache.get(filePath);

      if (!source) {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`File not found: ${filePath} (HTTP ${response.status})`);
        }
        source = await response.text();
        this.pageCache.set(filePath, source);
      }

      await this.renderPage(source, filePath, queryParams);
    } catch (err: any) {
      this.render404(filePath, err.message);
    }
  }

  public async renderPage(source: string, filePath: string, queryParams: Record<string, string> = {}) {
    if (!this.mountEl) return;

    // 1. Parse AST
    const ast = parseWovemark(source, { file: filePath });

    // 2. Validate AST
    const diagnostics = validateAST(ast);

    // 3. Register Data Sources
    for (const ds of ast.dataSources) {
      const id = String(ds.attributes.id || "");
      const src = String(ds.attributes.src || "");
      const mock = ds.attributes.mock;
      const autoRefresh = typeof ds.attributes.autoRefresh === "number" ? ds.attributes.autoRefresh : undefined;

      if (id && src) {
        dataStore.registerSource(id, src, mock, autoRefresh);
      }
    }

    // 4. Update Document Title
    if (ast.frontmatter.title) {
      document.title = ast.frontmatter.title;
    }

    // 5. Apply Theme & Dials
    applyThemeDials(document.documentElement, {
      theme: ast.frontmatter.theme,
      variance: ast.frontmatter.variance,
      motion: ast.frontmatter.motion,
      density: ast.frontmatter.density,
      accent: ast.frontmatter.accent,
    });

    // 6. Transition & Mount
    await motionEngine.transitionPage(() => {
      if (!this.mountEl) return;
      const context = {
        ...dataStore.getStateSnapshot(),
        $query: queryParams,
      };
      const html = renderAST(ast, context);
      const errorOverlayHtml = this.debug && diagnostics.length > 0 ? this.renderErrorOverlay(diagnostics, filePath) : "";

      this.mountEl.innerHTML = `${html}${errorOverlayHtml}`;
      this.syncActiveNavLinks();
      motionEngine.attach(this.mountEl);

      // Restore scroll position or scroll to top
      const savedScroll = this.scrollPositions.get(this.lastRoute);
      if (typeof savedScroll === "number") {
        window.scrollTo(0, savedScroll);
      } else {
        window.scrollTo(0, 0);
      }
    });
  }

  private syncActiveNavLinks() {
    if (!this.mountEl) return;
    const currentHash = window.location.hash || "#";
    const cleanHash = currentHash.split("?")[0];

    this.mountEl.querySelectorAll<HTMLAnchorElement>(".wm-nav-link, .wm-sidebar-item").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      const isMatch = (cleanHash === "#" && (href === "#" || href === "" || href === "#/")) || href === cleanHash;
      if (isMatch) {
        link.classList.add("wm-active");
      } else {
        link.classList.remove("wm-active");
      }
    });
  }

  private reRenderCurrentPage(snapshot: Record<string, any>) {
    if (!this.mountEl || !this.currentFilePath) return;
    const source = this.pageCache.get(this.currentFilePath);
    if (!source) return;

    const ast = parseWovemark(source, { file: this.currentFilePath });
    const html = renderAST(ast, snapshot);
    this.mountEl.innerHTML = html;
    this.syncActiveNavLinks();
    motionEngine.attach(this.mountEl);
  }

  private renderErrorOverlay(diagnostics: WovemarkDiagnostic[], filePath: string): string {
    const errorCount = diagnostics.filter((d) => d.severity === "error").length;
    const warnCount = diagnostics.filter((d) => d.severity === "warning").length;

    const items = diagnostics
      .map(
        (d) => `
      <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1)">
        <div style="display:flex;gap:8px;align-items:center">
          <span style="background:${d.severity === "error" ? "#ef4444" : "#f59e0b"};color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700">${d.severity.toUpperCase()}</span>
          <span style="color:#94a3b8;font-family:monospace;font-size:12px">${filePath}:${d.loc.start.line}:${d.loc.start.column}</span>
        </div>
        <div style="color:#f8fafc;margin-top:4px;font-size:13px">${d.message}</div>
        ${d.suggestion ? `<div style="color:#38bdf8;font-size:12px;margin-top:2px">💡 ${d.suggestion}</div>` : ""}
      </div>
    `
      )
      .join("");

    return `
      <div id="wm-error-overlay" style="position:fixed;bottom:16px;left:16px;max-width:480px;background:#0f172a;color:#fff;border-radius:12px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);border:1px solid #334155;padding:16px;z-index:9999;font-family:sans-serif">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <strong style="font-size:13px">Wovemark Diagnostics (${errorCount} errors, ${warnCount} warnings)</strong>
          <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px">&times;</button>
        </div>
        <div style="max-height:240px;overflow-y:auto">${items}</div>
      </div>
    `;
  }

  private render404(filePath: string, message: string) {
    if (!this.mountEl) return;
    this.mountEl.innerHTML = `
      <div class="wm-section" style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center">
        <div class="wm-container wm-container-sm">
          <div class="wm-surface" style="padding:48px">
            <span class="wm-badge wm-badge-danger" style="margin-bottom:16px">404 Not Found</span>
            <h1 style="font-size:2rem;margin-bottom:12px">Page Not Found</h1>
            <p class="wm-text-muted" style="margin-bottom:24px">Could not load <code>${filePath}</code>.</p>
            <p style="font-size:0.85rem;color:var(--wm-text-faint);margin-bottom:24px">${message}</p>
            <a href="#" class="wm-button wm-button-primary">Return Home</a>
          </div>
        </div>
      </div>
    `;
  }
}
