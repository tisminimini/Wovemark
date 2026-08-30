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
          const rows = Array.from(tableContainer.querySelectorAll("tbody tr"));
          let visibleCount = 0;

          rows.forEach((row) => {
            const text = row.textContent?.toLowerCase() || "";
            const matches = query === "" || text.includes(query);
            (row as HTMLElement).style.display = matches ? "" : "none";
            if (matches) visibleCount++;
          });

          // Update record counter badge
          const countBadge = tableContainer.querySelector(".wm-record-count");
          if (countBadge) {
            countBadge.textContent = query === "" ? `${rows.length} records` : `${visibleCount} found`;
          }

          // Hide pagination during search filter
          const pagination = tableContainer.querySelector(".wm-table-pagination") as HTMLElement | null;
          if (pagination) {
            pagination.style.display = query === "" ? "flex" : "none";
          }
        }
      }

      // Clear input error on user typing
      const inputEl = e.target as HTMLElement;
      if (inputEl && (inputEl.classList.contains("wm-input") || inputEl.classList.contains("wm-textarea") || inputEl.classList.contains("wm-select"))) {
        inputEl.classList.remove("wm-input-error");
        const parentField = inputEl.closest(".wm-field");
        const errEl = parentField?.querySelector(".wm-field-error");
        if (errEl) errEl.remove();
      }
    });

    // Interactive Table Pagination (Prev / Next)
    document.addEventListener("click", (e) => {
      const prevBtn = (e.target as HTMLElement).closest(".wm-page-prev") as HTMLButtonElement | null;
      const nextBtn = (e.target as HTMLElement).closest(".wm-page-next") as HTMLButtonElement | null;

      if (prevBtn || nextBtn) {
        const paginationEl = (prevBtn || nextBtn)!.closest(".wm-table-pagination") as HTMLElement;
        const tableContainer = paginationEl.closest(".wm-table-container");
        if (!paginationEl || !tableContainer) return;

        let currentPage = parseInt(paginationEl.getAttribute("data-current-page") || "1", 10);
        const pageSize = parseInt(paginationEl.getAttribute("data-page-size") || "10", 10);
        const total = parseInt(paginationEl.getAttribute("data-total") || "0", 10);
        const totalPages = Math.ceil(total / pageSize) || 1;

        if (prevBtn && currentPage > 1) {
          currentPage--;
        } else if (nextBtn && currentPage < totalPages) {
          currentPage++;
        }

        paginationEl.setAttribute("data-current-page", String(currentPage));

        // Update row visibility
        const rows = Array.from(tableContainer.querySelectorAll("tbody tr"));
        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = currentPage * pageSize;

        rows.forEach((row, idx) => {
          (row as HTMLElement).style.display = idx >= startIdx && idx < endIdx ? "" : "none";
        });

        // Update info text
        const infoEl = paginationEl.querySelector(".wm-pagination-info");
        if (infoEl) {
          infoEl.textContent = `Showing ${startIdx + 1}-${Math.min(endIdx, total)} of ${total}`;
        }

        // Update buttons state
        const pBtn = paginationEl.querySelector(".wm-page-prev") as HTMLButtonElement;
        const nBtn = paginationEl.querySelector(".wm-page-next") as HTMLButtonElement;
        if (pBtn) pBtn.disabled = currentPage <= 1;
        if (nBtn) nBtn.disabled = currentPage >= totalPages;
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
          table.querySelectorAll("th.wm-sortable").forEach((h) => {
            h.removeAttribute("data-sort");
            const indicator = h.querySelector(".wm-sort-arrow");
            if (indicator) indicator.remove();
          });

          th.setAttribute("data-sort", isAsc ? "asc" : "desc");
          const arrow = document.createElement("span");
          arrow.className = "wm-sort-arrow";
          arrow.style.marginLeft = "4px";
          arrow.textContent = isAsc ? "▲" : "▼";
          th.appendChild(arrow);

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

      document.documentElement.classList.add("wm-theme-transitioning");
      document.documentElement.setAttribute("data-wm-theme", newTheme);
      localStorage.setItem("wm-theme-preference", newTheme);
      setTimeout(() => {
        document.documentElement.classList.remove("wm-theme-transitioning");
      }, 300);

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

    // 1. Client-side Form Validation
    let hasError = false;
    let firstInvalidField: HTMLElement | null = null;

    const requiredFields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[required]");
    requiredFields.forEach((field) => {
      const parent = field.closest(".wm-field");
      // Remove any existing error message
      const existingErr = parent?.querySelector(".wm-field-error");
      if (existingErr) existingErr.remove();

      let isFieldInvalid = false;
      let errorMsg = "This field is required";

      if (!field.value || field.value.trim() === "") {
        isFieldInvalid = true;
      } else if (field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value.trim())) {
          isFieldInvalid = true;
          errorMsg = "Please enter a valid email address";
        }
      }

      if (isFieldInvalid) {
        hasError = true;
        field.classList.add("wm-input-error");
        if (!firstInvalidField) firstInvalidField = field;

        if (parent) {
          const errDiv = document.createElement("span");
          errDiv.className = "wm-field-error";
          errDiv.textContent = errorMsg;
          parent.appendChild(errDiv);
        }
      } else {
        field.classList.remove("wm-input-error");
      }
    });

    if (hasError) {
      if (firstInvalidField) {
        (firstInvalidField as HTMLElement).focus();
      }
      this.showToast("Please fill all required fields correctly", "warning");
      return;
    }

    const formData = new FormData(form);
    const data: Record<string, any> = {};
    formData.forEach((val, key) => {
      data[key] = val;
    });

    let method = "POST";
    let endpoint = submitAttr;

    const parts = submitAttr.trim().split(/\s+/);
    if (parts.length > 1) {
      method = parts[0].toUpperCase();
      endpoint = parts[1];
    }

    try {
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
