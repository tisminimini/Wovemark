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
    // Action trigger clicks
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

    // Form submissions
    document.addEventListener("submit", async (e) => {
      const form = (e.target as HTMLElement).closest("form.wm-form");
      if (form) {
        e.preventDefault();
        await this.handleFormSubmit(form as HTMLFormElement);
      }
    });

    // Modal Backdrop dismiss on outside click
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList && target.classList.contains("wm-dialog-backdrop") && target.classList.contains("wm-open")) {
        target.classList.remove("wm-open");
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

    // Interactive Tab switching
    document.addEventListener("click", (e) => {
      const tabBtn = (e.target as HTMLElement).closest(".wm-tab-btn") as HTMLElement | null;
      if (tabBtn) {
        e.preventDefault();
        const targetId = tabBtn.getAttribute("data-target");
        const tabsContainer = tabBtn.closest(".wm-tabs");
        if (tabsContainer && targetId) {
          tabsContainer.querySelectorAll(".wm-tab-btn").forEach((b) => b.classList.remove("wm-active"));
          tabBtn.classList.add("wm-active");

          tabsContainer.querySelectorAll(".wm-tab-panel").forEach((p) => p.classList.remove("wm-active"));
          const targetPanel = tabsContainer.querySelector(`#${targetId}`);
          if (targetPanel) {
            targetPanel.classList.add("wm-active");
          }
        }
      }
    });

    // Interactive Table real-time search filtering
    document.addEventListener("input", (e) => {
      const searchInput = e.target as HTMLInputElement;
      if (searchInput && searchInput.classList.contains("wm-table-search")) {
        const tableContainer = searchInput.closest(".wm-table-container");
        if (tableContainer) {
          const query = searchInput.value.toLowerCase().trim();
          const rows = tableContainer.querySelectorAll("tbody tr");
          rows.forEach((row) => {
            const text = row.textContent?.toLowerCase() || "";
            (row as HTMLElement).style.display = query === "" || text.includes(query) ? "" : "none";
          });
        }
      }
    });

    // Interactive Table column sorting
    document.addEventListener("click", (e) => {
      const th = (e.target as HTMLElement).closest("th.wm-sortable") as HTMLElement | null;
      if (th) {
        const table = th.closest("table");
        const tbody = table?.querySelector("tbody");
        if (table && tbody) {
          const thIndex = Array.from(th.parentElement?.children || []).indexOf(th);
          const rows = Array.from(tbody.querySelectorAll("tr"));
          if (rows.length === 0) return;

          const isAsc = th.getAttribute("data-sort") !== "asc";
          table.querySelectorAll("th.wm-sortable").forEach((h) => h.removeAttribute("data-sort"));
          th.setAttribute("data-sort", isAsc ? "asc" : "desc");

          rows.sort((a, b) => {
            const aVal = a.children[thIndex]?.textContent?.trim() || "";
            const bVal = b.children[thIndex]?.textContent?.trim() || "";
            const aNum = parseFloat(aVal.replace(/[^0-9.-]/g, ""));
            const bNum = parseFloat(bVal.replace(/[^0-9.-]/g, ""));
            if (!isNaN(aNum) && !isNaN(bNum)) {
              return isAsc ? aNum - bNum : bNum - aNum;
            }
            return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
          });

          rows.forEach((row) => tbody.appendChild(row));
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
        try {
          const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok && res.status !== 404 && res.status !== 405) {
            throw new Error(`Submit failed with status ${res.status}`);
          }
        } catch (fetchErr) {
          // Graceful fallback for mock static endpoints
          console.info(`[Wovemark Action] Local form submission handled for endpoint: ${endpoint}`);
        }
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
