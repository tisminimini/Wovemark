import { dataStore } from "../data/store.js";

/**
 * Wovemark Safe Action Engine
 */

export class ActionEngine {
  private toasterContainer: HTMLElement | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.attachGlobalListeners();
    }
  }

  public attachGlobalListeners() {
    document.addEventListener("click", (e) => {
      const target = (e.target as HTMLElement).closest("[data-wm-action]");
      if (target) {
        const actionStr = target.getAttribute("data-wm-action");
        if (actionStr) {
          e.preventDefault();
          this.execute(actionStr);
        }
      }
    });

    document.addEventListener("submit", async (e) => {
      const form = (e.target as HTMLElement).closest("form.wm-form");
      if (form) {
        e.preventDefault();
        await this.handleFormSubmit(form as HTMLFormElement);
      }
    });

    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const openDialog = document.querySelector(".wm-dialog-backdrop.wm-open");
        if (openDialog) {
          openDialog.classList.remove("wm-open");
        }
      }
    });
  }

  public async execute(actionSequence: string, context: Record<string, unknown> = {}) {
    if (!actionSequence) return;

    const actions = actionSequence.split(";").map((a) => a.trim()).filter(Boolean);

    for (const action of actions) {
      await this.executeSingleAction(action, context);
    }
  }

  private async executeSingleAction(action: string, _context: Record<string, unknown>) {
    if (action.startsWith("open:")) {
      const id = action.slice(5).trim();
      const dialog = document.getElementById(id);
      if (dialog) {
        dialog.classList.add("wm-open");
      }
    } else if (action.startsWith("close:")) {
      const id = action.slice(6).trim();
      const dialog = document.getElementById(id);
      if (dialog) {
        dialog.classList.remove("wm-open");
      }
    } else if (action.startsWith("toggle:")) {
      const id = action.slice(7).trim();
      const el = document.getElementById(id);
      if (el) {
        if (el.tagName.toLowerCase() === "details") {
          (el as HTMLDetailsElement).open = !(el as HTMLDetailsElement).open;
        } else {
          el.classList.toggle("wm-open");
        }
      }
    } else if (action.startsWith("refresh:")) {
      const sourceId = action.slice(8).trim();
      await dataStore.fetchSource(sourceId);
    } else if (action.startsWith("navigate:")) {
      const route = action.slice(9).trim();
      const targetHash = route.startsWith("#") ? route : `#${route}`;
      window.location.hash = targetHash;
    } else if (action.startsWith("delete:")) {
      // delete:users?id=123
      const rest = action.slice(7).trim();
      const [sourceId, query] = rest.split("?");
      let itemId = "";
      if (query && query.includes("id=")) {
        const params = new URLSearchParams(query);
        itemId = params.get("id") || "";
      }
      if (sourceId && itemId) {
        await dataStore.deleteItem(sourceId, itemId);
        this.showToast(`Item deleted`, "info");
      }
    } else if (action.startsWith("toast:")) {
      const toastText = action.slice(6).trim();
      let type: "info" | "success" | "warning" | "danger" = "success";
      let msg = toastText;

      if (toastText.includes("?type=")) {
        const [textPart, query] = toastText.split("?type=");
        msg = textPart;
        type = (query as any) || "success";
      }

      this.showToast(msg, type);
    } else if (action.startsWith("theme:")) {
      const themeCmd = action.slice(6).trim();
      const currentTheme = document.documentElement.getAttribute("data-wm-theme") || "system";
      let newTheme = themeCmd;
      if (themeCmd === "toggle") {
        newTheme = currentTheme === "dark" ? "light" : "dark";
      }
      document.documentElement.setAttribute("data-wm-theme", newTheme);
      localStorage.setItem("wm-theme-preference", newTheme);
      this.showToast(`Theme set to ${newTheme}`, "info");
    } else if (action.startsWith("copy:")) {
      const textToCopy = action.slice(5).trim();
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
        this.showToast("Copied to clipboard!", "success");
      }
    }
  }

  public async handleFormSubmit(form: HTMLFormElement) {
    const submitAttr = form.getAttribute("data-wm-submit") || "";
    const successAction = form.getAttribute("data-wm-success") || "";
    const errorAction = form.getAttribute("data-wm-error") || "";

    const formData = new FormData(form);
    const data: Record<string, any> = {};
    formData.forEach((val, key) => {
      data[key] = val;
    });

    // Parse method and endpoint from submit attribute: e.g. "POST /api/users" or "/api/users"
    let method = "POST";
    let endpoint = submitAttr;

    const parts = submitAttr.trim().split(/\s+/);
    if (parts.length > 1) {
      method = parts[0].toUpperCase();
      endpoint = parts[1];
    }

    try {
      // If endpoint maps to a source or mock
      let sourceId = "";
      for (const [id, state] of Object.entries(dataStore.getStateSnapshot())) {
        if (state && state.src === endpoint) {
          sourceId = id;
          break;
        }
      }

      if (sourceId) {
        await dataStore.createItem(sourceId, data, endpoint);
      } else {
        // Try fetch
        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Submit failed with status ${res.status}`);
      }

      form.reset();
      this.showToast("Submitted successfully", "success");

      if (successAction) {
        await this.execute(successAction);
      }
    } catch (err: any) {
      console.error("Form submission error:", err);
      this.showToast(err.message || "Submission failed", "danger");
      if (errorAction) {
        await this.execute(errorAction);
      }
    }
  }

  public showToast(message: string, type: "info" | "success" | "warning" | "danger" = "success") {
    if (typeof document === "undefined") return;

    if (!this.toasterContainer) {
      this.toasterContainer = document.createElement("div");
      this.toasterContainer.className = "wm-toaster";
      document.body.appendChild(this.toasterContainer);
    }

    const toast = document.createElement("div");
    toast.className = `wm-toast wm-toast-${type}`;

    const iconColor =
      type === "success"
        ? "var(--wm-success)"
        : type === "danger"
        ? "var(--wm-danger)"
        : type === "warning"
        ? "var(--wm-warning)"
        : "var(--wm-info)";

    toast.innerHTML = `
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${iconColor}"></span>
      <span>${message}</span>
    `;

    this.toasterContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      toast.style.transition = "all 200ms ease";
      setTimeout(() => {
        toast.remove();
      }, 200);
    }, 3500);
  }
}

export const actionEngine = new ActionEngine();
