// src/data/store.ts
var DataStore = class {
  sources = /* @__PURE__ */ new Map();
  mockRegistry = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  registerSource(id, src, mockData, autoRefreshSeconds) {
    if (mockData !== void 0) {
      this.mockRegistry.set(id, mockData);
    }
    const existing = this.sources.get(id);
    if (existing && existing.src === src) {
      return;
    }
    const initialState = {
      id,
      src,
      status: "idle",
      data: mockData !== void 0 ? mockData : null,
      error: null,
      lastUpdated: null
    };
    this.sources.set(id, initialState);
    this.fetchSource(id);
    if (autoRefreshSeconds && autoRefreshSeconds > 0) {
      if (initialState.autoRefreshTimer) {
        clearInterval(initialState.autoRefreshTimer);
      }
      initialState.autoRefreshTimer = setInterval(() => {
        this.fetchSource(id);
      }, autoRefreshSeconds * 1e3);
    }
  }
  async fetchSource(id) {
    const source = this.sources.get(id);
    if (!source) return;
    source.status = "loading";
    this.notify();
    if (this.mockRegistry.has(id)) {
      source.data = this.mockRegistry.get(id);
      source.status = "success";
      source.lastUpdated = Date.now();
      this.notify();
      return;
    }
    try {
      if (typeof fetch === "undefined") {
        throw new Error("Fetch is not available in this environment.");
      }
      const res = await fetch(source.src);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      source.data = json;
      source.status = "success";
      source.error = null;
      source.lastUpdated = Date.now();
    } catch (err) {
      if (this.mockRegistry.has(id)) {
        source.data = this.mockRegistry.get(id);
        source.status = "success";
      } else {
        source.status = "error";
        source.error = err.message || "Failed to fetch data";
      }
    }
    this.notify();
  }
  setMock(id, mockData) {
    this.mockRegistry.set(id, mockData);
    const source = this.sources.get(id);
    if (source) {
      source.data = mockData;
      source.status = "success";
      this.notify();
    }
  }
  async createItem(sourceId, item, endpoint) {
    const source = this.sources.get(sourceId);
    const targetUrl = endpoint || source?.src;
    if (this.mockRegistry.has(sourceId) || !targetUrl) {
      const currentData = Array.isArray(source?.data) ? [...source.data] : [];
      const newItem = { id: item.id || `item-${Date.now()}`, ...item };
      currentData.unshift(newItem);
      this.mockRegistry.set(sourceId, currentData);
      if (source) {
        source.data = currentData;
        source.status = "success";
      }
      this.notify();
      return newItem;
    }
    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      const created = await res.json();
      await this.fetchSource(sourceId);
      return created;
    } catch (err) {
      console.error(`Failed to create item for source '${sourceId}':`, err);
      throw err;
    }
  }
  async deleteItem(sourceId, itemId, endpoint) {
    const source = this.sources.get(sourceId);
    if (this.mockRegistry.has(sourceId) || !source?.src) {
      if (Array.isArray(source?.data)) {
        const filtered = source.data.filter((item) => String(item.id) !== String(itemId));
        this.mockRegistry.set(sourceId, filtered);
        source.data = filtered;
        this.notify();
      }
      return;
    }
    try {
      const url = endpoint ? endpoint : `${source.src}/${itemId}`;
      await fetch(url, { method: "DELETE" });
      await this.fetchSource(sourceId);
    } catch (err) {
      console.error(`Failed to delete item '${itemId}':`, err);
      throw err;
    }
  }
  getStateSnapshot() {
    const snapshot = {};
    for (const [id, state] of this.sources.entries()) {
      snapshot[id] = state.data;
      snapshot[`$${id}`] = state;
    }
    return snapshot;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  notify() {
    const snapshot = this.getStateSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
  reset() {
    for (const source of this.sources.values()) {
      if (source.autoRefreshTimer) {
        clearInterval(source.autoRefreshTimer);
      }
    }
    this.sources.clear();
    this.mockRegistry.clear();
  }
};
var dataStore = new DataStore();

// src/actions/engine.ts
var ActionEngine = class {
  toasterContainer = null;
  constructor() {
    if (typeof window !== "undefined") {
      this.attachGlobalListeners();
    }
  }
  attachGlobalListeners() {
    document.addEventListener("click", (e) => {
      const target = e.target.closest("[data-wm-action]");
      if (target) {
        const actionStr = target.getAttribute("data-wm-action");
        if (actionStr) {
          e.preventDefault();
          this.execute(actionStr);
        }
      }
    });
    document.addEventListener("submit", async (e) => {
      const form = e.target.closest("form.wm-form");
      if (form) {
        e.preventDefault();
        await this.handleFormSubmit(form);
      }
    });
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList && target.classList.contains("wm-dialog-backdrop") && target.classList.contains("wm-open")) {
        target.classList.remove("wm-open");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const openDialog = document.querySelector(".wm-dialog-backdrop.wm-open");
        if (openDialog) {
          openDialog.classList.remove("wm-open");
        }
      }
    });
    document.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".wm-tab-btn");
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
    document.addEventListener("input", (e) => {
      const searchInput = e.target;
      if (searchInput && searchInput.classList.contains("wm-table-search")) {
        const tableContainer = searchInput.closest(".wm-table-container");
        if (tableContainer) {
          const query = searchInput.value.toLowerCase().trim();
          const rows = Array.from(tableContainer.querySelectorAll("tbody tr"));
          let visibleCount = 0;
          rows.forEach((row) => {
            const text = row.textContent?.toLowerCase() || "";
            const matches = query === "" || text.includes(query);
            row.style.display = matches ? "" : "none";
            if (matches) visibleCount++;
          });
          const countBadge = tableContainer.querySelector(".wm-record-count");
          if (countBadge) {
            countBadge.textContent = query === "" ? `${rows.length} records` : `${visibleCount} found`;
          }
          const pagination = tableContainer.querySelector(".wm-table-pagination");
          if (pagination) {
            pagination.style.display = query === "" ? "flex" : "none";
          }
        }
      }
      const inputEl = e.target;
      if (inputEl && (inputEl.classList.contains("wm-input") || inputEl.classList.contains("wm-textarea") || inputEl.classList.contains("wm-select"))) {
        inputEl.classList.remove("wm-input-error");
        const parentField = inputEl.closest(".wm-field");
        const errEl = parentField?.querySelector(".wm-field-error");
        if (errEl) errEl.remove();
      }
    });
    document.addEventListener("click", (e) => {
      const prevBtn = e.target.closest(".wm-page-prev");
      const nextBtn = e.target.closest(".wm-page-next");
      if (prevBtn || nextBtn) {
        const paginationEl = (prevBtn || nextBtn).closest(".wm-table-pagination");
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
        const rows = Array.from(tableContainer.querySelectorAll("tbody tr"));
        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = currentPage * pageSize;
        rows.forEach((row, idx) => {
          row.style.display = idx >= startIdx && idx < endIdx ? "" : "none";
        });
        const infoEl = paginationEl.querySelector(".wm-pagination-info");
        if (infoEl) {
          infoEl.textContent = `Showing ${startIdx + 1}-${Math.min(endIdx, total)} of ${total}`;
        }
        const pBtn = paginationEl.querySelector(".wm-page-prev");
        const nBtn = paginationEl.querySelector(".wm-page-next");
        if (pBtn) pBtn.disabled = currentPage <= 1;
        if (nBtn) nBtn.disabled = currentPage >= totalPages;
      }
    });
    document.addEventListener("click", (e) => {
      const th = e.target.closest("th.wm-sortable");
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
          arrow.textContent = isAsc ? "\u25B2" : "\u25BC";
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
  async execute(actionSequence, context = {}) {
    if (!actionSequence) return;
    const actions = actionSequence.split(";").map((a) => a.trim()).filter(Boolean);
    for (const action of actions) {
      await this.executeSingleAction(action, context);
    }
  }
  async executeSingleAction(action, _context) {
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
          el.open = !el.open;
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
      let type = "success";
      let msg = toastText;
      if (toastText.includes("?type=")) {
        const [textPart, query] = toastText.split("?type=");
        msg = textPart;
        type = query || "success";
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
  async handleFormSubmit(form) {
    const submitAttr = form.getAttribute("data-wm-submit") || "";
    const successAction = form.getAttribute("data-wm-success") || "";
    const errorAction = form.getAttribute("data-wm-error") || "";
    let hasError = false;
    let firstInvalidField = null;
    const requiredFields = form.querySelectorAll("[required]");
    requiredFields.forEach((field) => {
      const parent = field.closest(".wm-field");
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
        firstInvalidField.focus();
      }
      this.showToast("Please fill all required fields correctly", "warning");
      return;
    }
    const formData = new FormData(form);
    const data = {};
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
            body: JSON.stringify(data)
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
    } catch (err) {
      console.error("Form submission error:", err);
      this.showToast(err.message || "Submission failed", "danger");
      if (errorAction) {
        await this.execute(errorAction);
      }
    }
  }
  showToast(message, type = "success") {
    if (typeof document === "undefined") return;
    if (!this.toasterContainer) {
      this.toasterContainer = document.createElement("div");
      this.toasterContainer.className = "wm-toaster";
      document.body.appendChild(this.toasterContainer);
    }
    const toast = document.createElement("div");
    toast.className = `wm-toast wm-toast-${type}`;
    const iconColor = type === "success" ? "var(--wm-success)" : type === "danger" ? "var(--wm-danger)" : type === "warning" ? "var(--wm-warning)" : "var(--wm-info)";
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
};
var actionEngine = new ActionEngine();

// src/motion/motion.ts
var MotionEngine = class {
  observer = null;
  isReducedMotion = false;
  constructor() {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.isReducedMotion = mediaQuery.matches;
      mediaQuery.addEventListener("change", (e) => {
        this.isReducedMotion = e.matches;
      });
      this.setupObserver();
    }
  }
  setupObserver() {
    if (typeof IntersectionObserver === "undefined") return;
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target;
            target.classList.add("wm-in-view");
            this.observer?.unobserve(target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
  }
  attach(root) {
    if (this.isReducedMotion || !this.observer) {
      const animatedElements = root.querySelectorAll(".wm-reveal, .wm-fade, [data-wm-motion]");
      animatedElements.forEach((el) => el.classList.add("wm-in-view"));
      return;
    }
    const staggerContainers = root.querySelectorAll("[data-wm-motion='stagger'], .wm-stagger");
    staggerContainers.forEach((container) => {
      const children = Array.from(container.children);
      children.forEach((child, index) => {
        child.classList.add("wm-reveal");
        child.style.transitionDelay = `${index * 60}ms`;
        this.observer?.observe(child);
      });
    });
    const revealElements = root.querySelectorAll(".wm-reveal, .wm-fade, [data-wm-motion='reveal']");
    revealElements.forEach((el) => {
      this.observer?.observe(el);
    });
  }
  async transitionPage(callback) {
    if (typeof document !== "undefined" && "startViewTransition" in document && !this.isReducedMotion) {
      await document.startViewTransition(async () => {
        await callback();
      }).finished;
    } else {
      await callback();
    }
  }
};
var motionEngine = new MotionEngine();

// src/renderer/charts.ts
function renderSvgChart(type = "line", data, options = {}) {
  const width = options.width || 600;
  const height = options.height || 260;
  const color = options.color || "var(--wm-color-accent)";
  const normalized = data.map((item, idx) => {
    if (typeof item === "number") {
      return { label: `Pt ${idx + 1}`, value: item };
    }
    return item;
  });
  if (normalized.length === 0) {
    return `<div class="wm-empty-chart" style="height:${height}px;display:flex;align-items:center;justify-content:center;color:var(--wm-text-muted)">No data available</div>`;
  }
  if (type === "pie" || type === "donut") {
    const total = normalized.reduce((sum, d) => sum + (d.value || 0), 0) || 1;
    const cx = width / 3;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 20;
    const innerRadius = type === "donut" ? radius * 0.55 : 0;
    const colors = [
      "var(--wm-color-accent)",
      "#10b981",
      "#8b5cf6",
      "#f59e0b",
      "#ec4899",
      "#06b6d4",
      "#6366f1",
      "#14b8a6"
    ];
    let currentAngle = -Math.PI / 2;
    const slices = [];
    const legendItems = [];
    normalized.forEach((d, i) => {
      const sliceAngle = d.value / total * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;
      const sliceColor = colors[i % colors.length];
      const pct = Math.round(d.value / total * 100);
      const x1 = cx + radius * Math.cos(currentAngle);
      const y1 = cy + radius * Math.sin(currentAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      const x3 = cx + innerRadius * Math.cos(endAngle);
      const y3 = cy + innerRadius * Math.sin(endAngle);
      const x4 = cx + innerRadius * Math.cos(currentAngle);
      const y4 = cy + innerRadius * Math.sin(currentAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const pathData = innerRadius > 0 ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z` : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      slices.push(`
        <path d="${pathData}" fill="${sliceColor}" class="wm-chart-slice" style="cursor:pointer;transition:transform 150ms ease">
          <title>${d.label}: ${d.value} (${pct}%)</title>
        </path>
      `);
      legendItems.push(`
        <div style="display:flex;align-items:center;gap:8px;font-size:0.85rem">
          <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${sliceColor}"></span>
          <span style="color:var(--wm-text-muted)">${d.label}</span>
          <strong style="margin-left:auto">${pct}%</strong>
        </div>
      `);
      currentAngle = endAngle;
    });
    return `
      <div style="display:flex;align-items:center;gap:24px;width:100%;flex-wrap:wrap">
        <svg class="wm-chart-svg" viewBox="0 0 ${(width * 0.6).toFixed(0)} ${height}" width="${width * 0.55}" height="${height}" style="overflow:visible">
          ${slices.join("\n")}
        </svg>
        <div style="flex:1;min-width:180px;display:flex;flex-direction:column;gap:8px">
          ${legendItems.join("\n")}
        </div>
      </div>
    `;
  }
  const values = normalized.map((d) => d.value);
  const maxVal = Math.max(...values, 10);
  const minVal = Math.min(0, ...values);
  const range = maxVal - minVal || 1;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const gridLines = [0, 0.5, 1].map((ratio) => {
    const y = padding.top + chartH * (1 - ratio);
    const val = (minVal + range * ratio).toFixed(0);
    return `
        <line x1="${padding.left}" y1="${y.toFixed(1)}" x2="${width - padding.right}" y2="${y.toFixed(1)}" stroke="var(--wm-border-subtle)" stroke-dasharray="3,3" stroke-width="1" />
        <text x="${(padding.left - 8).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--wm-text-faint)">${val}</text>
      `;
  }).join("\n");
  if (type === "bar") {
    const barWidth = Math.max(12, Math.min(48, chartW / normalized.length * 0.6));
    const step2 = chartW / normalized.length;
    const bars = normalized.map((d, i) => {
      const x = padding.left + i * step2 + (step2 - barWidth) / 2;
      const barH = Math.max(2, (d.value - minVal) / range * chartH);
      const y = padding.top + chartH - barH;
      return `
        <g class="wm-chart-bar" style="cursor:pointer">
          <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" rx="4" fill="${color}" opacity="0.9">
            <title>${d.label}: ${d.value}</title>
          </rect>
          <text x="${(x + barWidth / 2).toFixed(1)}" y="${(height - 15).toFixed(1)}" text-anchor="middle" font-size="11" fill="var(--wm-text-muted)">${d.label}</text>
        </g>
      `;
    }).join("\n");
    return `
      <svg class="wm-chart-svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="overflow:visible">
        ${gridLines}
        <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="var(--wm-border)" stroke-width="1" />
        ${bars}
      </svg>
    `;
  }
  const step = chartW / Math.max(1, normalized.length - 1);
  const points = normalized.map((d, i) => {
    const x = padding.left + i * step;
    const y = padding.top + chartH - (d.value - minVal) / range * chartH;
    return { x, y, label: d.label, value: d.value };
  });
  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, "");
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(padding.top + chartH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padding.top + chartH).toFixed(1)} Z`;
  const dots = points.map(
    (pt) => `
    <g class="wm-chart-dot" style="cursor:pointer">
      <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4.5" fill="${color}" stroke="var(--wm-surface)" stroke-width="2">
        <title>${pt.label}: ${pt.value}</title>
      </circle>
      <text x="${pt.x.toFixed(1)}" y="${(height - 15).toFixed(1)}" text-anchor="middle" font-size="11" fill="var(--wm-text-muted)">${pt.label}</text>
    </g>
  `
  ).join("\n");
  const gradientId = `wm-grad-${Math.random().toString(36).slice(2, 8)}`;
  return `
    <svg class="wm-chart-svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="overflow:visible">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="var(--wm-border)" stroke-width="1" />
      <path d="${areaD}" fill="url(#${gradientId})" />
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ${dots}
    </svg>
  `;
}

// src/data/evaluator.ts
function getNestedValue(obj, path) {
  if (obj == null) return void 0;
  if (!path || path.trim() === "") return obj;
  const parts = path.trim().split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null) return void 0;
    current = current[part];
  }
  return current;
}
function evaluateExpression(expr, context) {
  const trimmed = expr.trim();
  if (!trimmed) return "";
  if (trimmed.includes("?") && trimmed.includes(":")) {
    const qIndex = trimmed.indexOf("?");
    const colonIndex = trimmed.lastIndexOf(":");
    if (qIndex !== -1 && colonIndex !== -1 && colonIndex > qIndex) {
      const conditionStr = trimmed.slice(0, qIndex).trim();
      const trueValStr = trimmed.slice(qIndex + 1, colonIndex).trim();
      const falseValStr = trimmed.slice(colonIndex + 1).trim();
      const conditionResult = evaluateExpression(conditionStr, context);
      const isTruthy = Boolean(conditionResult);
      return evaluateExpression(isTruthy ? trueValStr : falseValStr, context);
    }
  }
  if (trimmed.includes("||")) {
    const parts = trimmed.split("||").map((s) => s.trim());
    for (const part of parts) {
      const val = evaluateExpression(part, context);
      if (val !== void 0 && val !== null && val !== "") {
        return val;
      }
    }
    return "";
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"') || trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  return getNestedValue(context, trimmed);
}
function interpolateBindings(text, context) {
  if (!text || !text.includes("{{")) return text;
  return text.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_match, expr) => {
    const val = evaluateExpression(expr, context);
    if (val === void 0 || val === null) return "";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  });
}

// src/icons/icons.ts
var ICONS = {
  plus: `<path d="M12 5v14M5 12h14"/>`,
  minus: `<path d="M5 12h14"/>`,
  check: `<path d="M20 6 9 17l-5-5"/>`,
  x: `<path d="M18 6 6 18M6 6l12 12"/>`,
  search: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
  "chevron-right": `<path d="m9 18 6-6-6-6"/>`,
  "chevron-left": `<path d="m15 18-6-6 6-6"/>`,
  "chevron-down": `<path d="m6 9 6 6 6-6"/>`,
  "chevron-up": `<path d="m18 15-6-6-6 6"/>`,
  "arrow-right": `<path d="M5 12h14M12 5l7 7-7 7"/>`,
  "arrow-left": `<path d="M19 12H5M12 19l-7-7 7-7"/>`,
  zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>`,
  globe: `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>`,
  sparkles: `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>`,
  star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
  user: `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  inbox: `<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>`,
  trash: `<path d="3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>`,
  edit: `<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>`,
  eye: `<path d="2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`,
  copy: `<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`,
  filter: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
  calendar: `<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>`,
  bell: `<path d="6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>`,
  sun: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>`,
  moon: `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`,
  menu: `<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>`,
  "external-link": `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>`,
  activity: `<path d="22 12h-4l-3 9L9 3l-3 9H2"/>`,
  "bar-chart": `<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>`,
  layers: `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
  grid: `<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>`,
  folder: `<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>`,
  file: `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><polyline points="14 2 14 8 20 8"/>`,
  info: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>`,
  "alert-circle": `<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>`,
  "alert-triangle": `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>`,
  "check-circle": `<path d="22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
  mail: `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`,
  lock: `<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
  terminal: `<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>`,
  code: `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
  refresh: `<path d="3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="21 3v5h-5"/><path d="21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="8 16H3v5"/>`
};
function renderIcon(name, size = 18, className = "") {
  const iconPath = ICONS[name] || ICONS["sparkles"];
  return `<svg class="wm-icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPath}</svg>`;
}

// src/renderer/markdown.ts
function sanitizeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function renderMarkdown(markdown) {
  if (!markdown) return "";
  const lines = markdown.split(/\r?\n/);
  const out = [];
  let inList = null;
  let inBlockquote = false;
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines = [];
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      if (!inCodeBlock) {
        if (inList) {
          out.push(`</${inList}>`);
          inList = null;
        }
        if (inBlockquote) {
          out.push("</blockquote>");
          inBlockquote = false;
        }
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
        codeBlockLines = [];
        continue;
      } else {
        inCodeBlock = false;
        const codeContent = sanitizeHtml(codeBlockLines.join("\n"));
        const langAttr = codeBlockLang ? ` class="language-${codeBlockLang}"` : "";
        const header = codeBlockLang ? `<div class="wm-code-header"><span class="wm-code-lang">${codeBlockLang}</span><button class="wm-code-copy" data-wm-action="copy:${escapeAttr(
          codeBlockLines.join("\n")
        )}">Copy</button></div>` : "";
        out.push(
          `<div class="wm-code-block">${header}<pre><code${langAttr}>${codeContent}</code></pre></div>`
        );
        continue;
      }
    }
    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }
    if (!trimmed) {
      if (inList) {
        out.push(`</${inList}>`);
        inList = null;
      }
      if (inBlockquote) {
        out.push("</blockquote>");
        inBlockquote = false;
      }
      continue;
    }
    if (trimmed.startsWith("#")) {
      if (inList) {
        out.push(`</${inList}>`);
        inList = null;
      }
      if (inBlockquote) {
        out.push("</blockquote>");
        inBlockquote = false;
      }
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const headingText = renderInlineMarkdown(match[2]);
        const id = slugify(match[2]);
        out.push(`<h${level} id="${id}">${headingText}</h${level}>`);
        continue;
      }
    }
    if (trimmed.startsWith(">")) {
      if (inList) {
        out.push(`</${inList}>`);
        inList = null;
      }
      if (!inBlockquote) {
        inBlockquote = true;
        out.push("<blockquote>");
      }
      const quoteText = renderInlineMarkdown(trimmed.replace(/^>\s?/, ""));
      out.push(`<p>${quoteText}</p>`);
      continue;
    } else if (inBlockquote) {
      out.push("</blockquote>");
      inBlockquote = false;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (inList === "ol") {
        out.push("</ol>");
        inList = null;
      }
      if (!inList) {
        inList = "ul";
        out.push("<ul>");
      }
      const itemText = renderInlineMarkdown(trimmed.slice(2));
      out.push(`<li>${itemText}</li>`);
      continue;
    }
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (inList === "ul") {
        out.push("</ul>");
        inList = null;
      }
      if (!inList) {
        inList = "ol";
        out.push("<ol>");
      }
      const itemText = renderInlineMarkdown(olMatch[1]);
      out.push(`<li>${itemText}</li>`);
      continue;
    }
    if (inList) {
      out.push(`</${inList}>`);
      inList = null;
    }
    out.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  }
  if (inList) {
    out.push(`</${inList}>`);
  }
  if (inBlockquote) {
    out.push("</blockquote>");
  }
  return out.join("\n");
}
function renderInlineMarkdown(text) {
  if (!text) return "";
  let out = sanitizeHtml(text);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/__(.+?)__/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+?)\*/g, "<em>$1</em>");
  out = out.replace(/_([^_]+?)_/g, "<em>$1</em>");
  out = out.replace(/~~(.+?)~~/g, "<del>$1</del>");
  out = out.replace(/`([^`]+?)`/g, "<code>$1</code>");
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, src) => {
    return `<img src="${src}" alt="${alt}" class="wm-inline-img" loading="lazy" />`;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    const isExternal = href.startsWith("http://") || href.startsWith("https://");
    const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${href}"${targetAttr}>${label}</a>`;
  });
  return out;
}
function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}
function escapeAttr(str) {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// src/renderer/registry.ts
var ComponentRegistry = class {
  renderers = /* @__PURE__ */ new Map();
  constructor() {
    this.registerDefaults();
  }
  register(name, renderer) {
    this.renderers.set(name, renderer);
  }
  get(name) {
    return this.renderers.get(name);
  }
  registerDefaults() {
    this.register("container", (node, children) => {
      const size = node.attributes.size || "lg";
      return `<div class="wm-container wm-container-${size}">${children}</div>`;
    });
    this.register("section", (node, children) => {
      const variant = node.attributes.variant || "default";
      const idAttr = node.attributes.id ? ` id="${node.attributes.id}"` : "";
      return `<section class="wm-section wm-section-${variant}"${idAttr}><div class="wm-container">${children}</div></section>`;
    });
    this.register("stack", (node, children) => {
      const gap = node.attributes.gap || "md";
      const align = node.attributes.align || "stretch";
      return `<div class="wm-stack wm-gap-${gap}" style="align-items:${align}">${children}</div>`;
    });
    this.register("cluster", (node, children) => {
      const justify = node.attributes.justify || "start";
      return `<div class="wm-cluster" style="justify-content:${justify}">${children}</div>`;
    });
    this.register("grid", (node, children) => {
      const cols = node.attributes.columns || 3;
      return `<div class="wm-grid" style="--wm-grid-cols:${cols}">${children}</div>`;
    });
    this.register("split", (node, children) => {
      const ratio = node.attributes.ratio || "50-50";
      return `<div class="wm-split wm-split-${ratio}">${children}</div>`;
    });
    this.register("divider", (node) => {
      const label = node.attributes.label;
      return `<div class="wm-divider">${label ? `<span class="wm-divider-label">${label}</span>` : ""}</div>`;
    });
    this.register("spacer", (node) => {
      const size = node.attributes.size || "md";
      return `<div class="wm-spacer-${size}"></div>`;
    });
    this.register("surface", (node, children) => {
      const elevation = node.attributes.elevation || "sm";
      return `<div class="wm-surface wm-surface-elevation-${elevation}">${children}</div>`;
    });
    this.register("card", (node, children) => {
      const title = node.attributes.title;
      const desc = node.attributes.description;
      const icon = node.attributes.icon ? renderIcon(String(node.attributes.icon), 24) : "";
      const badge = node.attributes.badge ? `<span class="wm-badge wm-badge-accent">${node.attributes.badge}</span>` : "";
      const action = node.attributes.action ? ` data-wm-action="${node.attributes.action}" style="cursor:pointer"` : "";
      return `
        <div class="wm-card"${action}>
          ${title || icon || badge ? `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
              <div style="display:flex;align-items:center;gap:10px">
                ${icon}
                ${title ? `<h3 style="margin:0">${title}</h3>` : ""}
              </div>
              ${badge}
            </div>
          ` : ""}
          ${desc ? `<p class="wm-text-muted" style="margin-bottom:12px">${desc}</p>` : ""}
          ${children}
        </div>
      `;
    });
    this.register("heading", (node, children) => {
      const level = node.attributes.level || 2;
      const gradient = node.attributes.gradient ? " wm-gradient-text" : "";
      const text = node.attributes.text || children;
      return `<h${level} class="wm-heading${gradient}">${text}</h${level}>`;
    });
    this.register("text", (node, children) => {
      const variant = node.attributes.variant || "body";
      const align = node.attributes.align || "left";
      return `<p class="wm-text wm-text-${variant}" style="text-align:${align}">${children}</p>`;
    });
    this.register("badge", (node) => {
      const variant = node.attributes.variant || "default";
      const icon = node.attributes.icon ? renderIcon(String(node.attributes.icon), 14) : "";
      return `<span class="wm-badge wm-badge-${variant}">${icon}<span>${node.attributes.label}</span></span>`;
    });
    this.register("icon", (node) => {
      const name = String(node.attributes.name || "sparkles");
      const size = node.attributes.size === "lg" ? 28 : node.attributes.size === "sm" ? 14 : 20;
      return renderIcon(name, size, String(node.attributes.class || ""));
    });
    this.register("quote", (node, children) => {
      const author = node.attributes.author;
      const role = node.attributes.role;
      const avatar = node.attributes.avatar;
      return `
        <blockquote class="wm-quote wm-surface">
          <div style="font-size:1.15rem;font-style:italic;margin-bottom:16px">${children}</div>
          ${author ? `
            <footer style="display:flex;align-items:center;gap:12px">
              ${avatar ? `<img src="${avatar}" alt="${author}" style="width:40px;height:40px;border-radius:50%;object-fit:cover" />` : ""}
              <div>
                <strong>${author}</strong>
                ${role ? `<div class="wm-text-muted" style="font-size:0.85rem">${role}</div>` : ""}
              </div>
            </footer>
          ` : ""}
        </blockquote>
      `;
    });
    this.register("image", (node) => {
      const src = node.attributes.src || "";
      const alt = node.attributes.alt || "";
      const rounded = node.attributes.rounded || "md";
      const shadow = node.attributes.shadow ? " box-shadow:var(--wm-shadow-lg);" : "";
      return `<img src="${src}" alt="${alt}" class="wm-image" style="width:100%;border-radius:var(--wm-radius-${rounded});${shadow}" loading="lazy" />`;
    });
    this.register("callout", (node, children) => {
      const variant = node.attributes.variant || "info";
      const title = node.attributes.title;
      const iconName = node.attributes.icon || (variant === "danger" ? "alert-triangle" : variant === "success" ? "check-circle" : "info");
      const icon = renderIcon(String(iconName), 20);
      return `
        <div class="wm-callout wm-callout-${variant}">
          <div>${icon}</div>
          <div style="flex:1">
            ${title ? `<strong style="display:block;margin-bottom:4px">${title}</strong>` : ""}
            <div>${children}</div>
          </div>
        </div>
      `;
    });
    this.register("accordion", (_node, children) => {
      return `<div class="wm-accordion">${children}</div>`;
    });
    this.register("accordion-item", (node, children) => {
      const title = node.attributes.title || "";
      const openAttr = node.attributes.open ? " open" : "";
      return `
        <details class="wm-accordion-item"${openAttr}>
          <summary class="wm-accordion-header">
            <span>${title}</span>
            <span class="wm-accordion-icon">${renderIcon("chevron-down", 16)}</span>
          </summary>
          <div class="wm-accordion-content">${children}</div>
        </details>
      `;
    });
    this.register("navbar", (node, children) => {
      const title = node.attributes.title || "Wovemark";
      const logo = node.attributes.logo;
      return `
        <nav class="wm-navbar">
          <div class="wm-container wm-navbar-inner">
            <a href="#" class="wm-brand" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--wm-text);font-weight:700;font-size:1.15rem">
              ${logo ? `<img src="${logo}" alt="${title}" style="height:28px" />` : renderIcon("sparkles", 22, "wm-color-accent")}
              <span>${title}</span>
            </a>
            <button class="wm-nav-toggle" aria-label="Toggle Navigation" onclick="this.nextElementSibling.classList.toggle('wm-nav-open')">
              ${renderIcon("menu", 20)}
            </button>
            <ul class="wm-nav-links">${children}</ul>
          </div>
        </nav>
      `;
    });
    this.register("nav-link", (node) => {
      const label = node.attributes.label || "";
      const href = node.attributes.href || "#";
      const active = node.attributes.active ? " wm-active" : "";
      const icon = node.attributes.icon ? renderIcon(String(node.attributes.icon), 16) : "";
      return `<li><a href="${href}" class="wm-nav-link${active}">${icon}<span>${label}</span></a></li>`;
    });
    this.register("sidebar", (node, children) => {
      const title = node.attributes.title || "App";
      const logo = node.attributes.logo;
      return `
        <aside class="wm-sidebar">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;padding:0 8px">
            ${logo ? `<img src="${logo}" style="height:24px"/>` : renderIcon("zap", 20)}
            <strong style="font-size:1.1rem">${title}</strong>
          </div>
          <nav style="display:flex;flex-direction:column;gap:4px">${children}</nav>
        </aside>
      `;
    });
    this.register("sidebar-group", (node, children) => {
      const label = node.attributes.label;
      return `
        <div class="wm-sidebar-group">
          ${label ? `<div class="wm-sidebar-label">${label}</div>` : ""}
          ${children}
        </div>
      `;
    });
    this.register("sidebar-item", (node) => {
      const label = node.attributes.label || "";
      const href = node.attributes.href || "#";
      const active = node.attributes.active ? " wm-active" : "";
      const icon = node.attributes.icon ? renderIcon(String(node.attributes.icon), 18) : "";
      const badge = node.attributes.badge ? `<span class="wm-badge wm-badge-accent" style="margin-left:auto">${node.attributes.badge}</span>` : "";
      return `<a href="${href}" class="wm-sidebar-item${active}">${icon}<span>${label}</span>${badge}</a>`;
    });
    this.register("tabs", (node, children) => {
      const tabItems = [];
      if (node.type === "ContainerDirective" && node.children) {
        node.children.forEach((c, idx) => {
          if (c.type === "ContainerDirective" && c.name === "tab-item") {
            const id = String(c.attributes.id || `tab-${idx}`);
            const label = String(c.attributes.label || `Tab ${idx + 1}`);
            tabItems.push({ id, label });
          }
        });
      }
      const headerHtml = tabItems.length > 0 ? `<div class="wm-tabs-header">
            ${tabItems.map((t, idx) => `
              <button type="button" class="wm-tab-btn ${idx === 0 ? "wm-active" : ""}" data-target="${t.id}">
                ${t.label}
              </button>
            `).join("")}
          </div>` : "";
      let panelsHtml = children;
      if (!panelsHtml.includes("wm-tab-panel wm-active") && panelsHtml.includes("wm-tab-panel")) {
        panelsHtml = panelsHtml.replace('class="wm-tab-panel"', 'class="wm-tab-panel wm-active"');
      }
      return `
        <div class="wm-tabs">
          ${headerHtml}
          <div class="wm-tabs-panels">${panelsHtml}</div>
        </div>
      `;
    });
    this.register("tab-item", (node, children) => {
      const id = node.attributes.id || `tab-${Math.random().toString(36).slice(2, 6)}`;
      const label = node.attributes.label || "Tab";
      const active = node.attributes.active ? " wm-active" : "";
      return `
        <div class="wm-tab-panel${active}" id="${id}" data-tab-label="${label}">
          ${children}
        </div>
      `;
    });
    this.register("footer", (node, children) => {
      const copyright = node.attributes.copyright || `\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Wovemark. All rights reserved.`;
      const cols = node.attributes.columns || 4;
      return `
        <footer class="wm-section wm-section-surface" style="margin-top:auto;border-top:1px solid var(--wm-border)">
          <div class="wm-container">
            <div class="wm-grid" style="--wm-grid-cols:${cols};margin-bottom:36px">${children}</div>
            <div style="padding-top:24px;border-top:1px solid var(--wm-border-subtle);color:var(--wm-text-muted);font-size:0.85rem;text-align:center">
              ${copyright}
            </div>
          </div>
        </footer>
      `;
    });
    this.register("footer-column", (node, children) => {
      const title = node.attributes.title;
      return `
        <div>
          <h4 style="font-size:0.95rem;margin-bottom:12px">${title}</h4>
          <div style="display:flex;flex-direction:column;gap:8px">${children}</div>
        </div>
      `;
    });
    this.register("button", (node, children) => {
      const label = node.attributes.label || children;
      const variant = node.attributes.variant || "primary";
      const size = node.attributes.size || "md";
      const action = node.attributes.action ? ` data-wm-action="${node.attributes.action}"` : "";
      const href = node.attributes.href;
      const icon = node.attributes.icon ? renderIcon(String(node.attributes.icon), 16) : "";
      const type = node.attributes.type || "button";
      if (href) {
        return `<a href="${href}" class="wm-button wm-button-${variant} wm-button-${size}"${action}>${icon}<span>${label}</span></a>`;
      }
      return `<button type="${type}" class="wm-button wm-button-${variant} wm-button-${size}"${action}>${icon}<span>${label}</span></button>`;
    });
    this.register("button-group", (_node, children) => {
      return `<div class="wm-button-group">${children}</div>`;
    });
    this.register("alert", (node, children) => {
      const variant = node.attributes.variant || "info";
      const title = node.attributes.title;
      return `
        <div class="wm-callout wm-callout-${variant}">
          <div>${renderIcon("info", 20)}</div>
          <div>
            ${title ? `<strong>${title}</strong><br/>` : ""}
            ${children}
          </div>
        </div>
      `;
    });
    this.register("progress", (node) => {
      const val = Number(node.attributes.value || 0);
      const max = Number(node.attributes.max || 100);
      const pct = Math.min(100, Math.max(0, Math.round(val / max * 100)));
      return `
        <div style="width:100%">
          <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px">
            <span>${node.attributes.label || "Progress"}</span>
            <span>${pct}%</span>
          </div>
          <div style="height:8px;background:var(--wm-surface-subtle);border-radius:var(--wm-radius-full);overflow:hidden">
            <div style="width:${pct}%;height:100%;background:var(--wm-color-accent);border-radius:var(--wm-radius-full)"></div>
          </div>
        </div>
      `;
    });
    this.register("empty-state", (node) => {
      const icon = node.attributes.icon || "inbox";
      const title = node.attributes.title || "No data";
      const desc = node.attributes.description || "";
      const actionLabel = node.attributes.actionLabel;
      const action = node.attributes.action;
      return `
        <div style="text-align:center;padding:48px 24px;background:var(--wm-surface);border-radius:var(--wm-radius-lg);border:1px dashed var(--wm-border)">
          <div style="display:inline-flex;padding:16px;background:var(--wm-surface-subtle);border-radius:50%;margin-bottom:16px;color:var(--wm-text-muted)">
            ${renderIcon(String(icon), 36)}
          </div>
          <h3 style="margin-bottom:6px">${title}</h3>
          ${desc ? `<p class="wm-text-muted" style="max-width:400px;margin:0 auto 20px auto">${desc}</p>` : ""}
          ${actionLabel && action ? `<button class="wm-button wm-button-primary" data-wm-action="${action}">${actionLabel}</button>` : ""}
        </div>
      `;
    });
    this.register("dialog", (node, children) => {
      const id = node.attributes.id || "dialog";
      const title = node.attributes.title || "Modal";
      const desc = node.attributes.description;
      const size = node.attributes.size || "md";
      return `
        <div id="${id}" class="wm-dialog-backdrop">
          <div class="wm-dialog-modal wm-dialog-${size}">
            <div class="wm-dialog-header">
              <div>
                <h3 style="margin:0">${title}</h3>
                ${desc ? `<p class="wm-text-muted" style="font-size:0.9rem;margin-top:4px">${desc}</p>` : ""}
              </div>
              <button class="wm-button wm-button-ghost wm-button-sm" data-wm-action="close:${id}">${renderIcon("x", 18)}</button>
            </div>
            <div class="wm-dialog-body">${children}</div>
          </div>
        </div>
      `;
    });
    this.register("hero", (node, children) => {
      const variant = node.attributes.variant || "split";
      const badge = node.attributes.badge ? `<span class="wm-badge wm-badge-accent" style="margin-bottom:16px;align-self:flex-start">${node.attributes.badge}</span>` : "";
      const image = node.attributes.image;
      const motion = node.attributes.motion || "reveal";
      const align = node.attributes.align || (variant === "centered" || variant === "editorial" ? "center" : "left");
      if (variant === "centered" || variant === "editorial") {
        return `
          <div class="wm-hero wm-hero-${variant} wm-${motion}">
            <div class="wm-container wm-hero-centered" style="text-align:${align}">
              ${badge}
              <div class="wm-hero-content">${children}</div>
              ${image ? `<div class="wm-hero-media" style="margin-top:40px"><img src="${image}" alt="Preview" loading="eager" /></div>` : ""}
            </div>
          </div>
        `;
      }
      return `
        <div class="wm-hero wm-hero-${variant} wm-${motion}">
          <div class="wm-container wm-hero-split" style="text-align:${align}">
            <div class="wm-hero-text">
              ${badge}
              <div class="wm-hero-content">${children}</div>
            </div>
            ${image ? `<div class="wm-hero-media"><img src="${image}" alt="Preview" loading="eager" /></div>` : ""}
          </div>
        </div>
      `;
    });
    this.register("feature-grid", (node, children) => {
      const cols = node.attributes.columns || 3;
      const title = node.attributes.title;
      const badge = node.attributes.badge ? `<span class="wm-badge wm-badge-accent" style="margin-bottom:12px">${node.attributes.badge}</span>` : "";
      const desc = node.attributes.description;
      return `
        <div class="wm-section wm-reveal">
          <div class="wm-container">
            ${title || badge || desc ? `
              <div style="text-align:center;max-width:680px;margin:0 auto 48px auto">
                ${badge}
                ${title ? `<h2 style="margin-bottom:12px">${title}</h2>` : ""}
                ${desc ? `<p class="wm-lead">${desc}</p>` : ""}
              </div>
            ` : ""}
            <div class="wm-grid wm-stagger" style="--wm-grid-cols:${cols}">${children}</div>
          </div>
        </div>
      `;
    });
    this.register("bento", (node, children) => {
      const title = node.attributes.title;
      const desc = node.attributes.description;
      return `
        <div class="wm-section wm-reveal">
          <div class="wm-container">
            ${title ? `<div style="text-align:center;max-width:680px;margin:0 auto 48px auto"><h2 style="margin-bottom:12px">${title}</h2>${desc ? `<p class="wm-lead">${desc}</p>` : ""}</div>` : ""}
            <div class="wm-bento">${children}</div>
          </div>
        </div>
      `;
    });
    this.register("bento-item", (node, children) => {
      const title = node.attributes.title || "";
      const desc = node.attributes.description || "";
      const span = node.attributes.span === "2" ? " wm-bento-span-2" : "";
      const icon = node.attributes.icon ? renderIcon(String(node.attributes.icon), 24) : "";
      return `
        <div class="wm-card${span}" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            ${icon ? `<div style="margin-bottom:12px;color:var(--wm-color-accent)">${icon}</div>` : ""}
            <h3 style="margin-bottom:8px">${title}</h3>
            ${desc ? `<p class="wm-text-muted" style="font-size:0.95rem">${desc}</p>` : ""}
          </div>
          <div>${children}</div>
        </div>
      `;
    });
    this.register("stats", (node, children) => {
      const cols = node.attributes.columns || 4;
      return `
        <div class="wm-section wm-section-surface wm-reveal">
          <div class="wm-container">
            <div class="wm-grid" style="--wm-grid-cols:${cols}">${children}</div>
          </div>
        </div>
      `;
    });
    this.register("stat-item", (node) => {
      const val = node.attributes.value;
      const label = node.attributes.label;
      const change = node.attributes.change;
      const trend = node.attributes.trend || "neutral";
      return `
        <div style="text-align:center;padding:16px">
          <div style="font-size:2.5rem;font-weight:800;letter-spacing:-0.02em;color:var(--wm-text)">${val}</div>
          <div class="wm-text-muted" style="font-size:0.95rem;font-weight:500;margin-top:4px">${label}</div>
          ${change ? `<span class="wm-metric-change wm-trend-${trend}">${change}</span>` : ""}
        </div>
      `;
    });
    this.register("pricing", (node, children) => {
      const title = node.attributes.title || "Simple, Transparent Pricing";
      const desc = node.attributes.description || "Choose the plan that best fits your requirements.";
      return `
        <div class="wm-section wm-reveal">
          <div class="wm-container">
            <div style="text-align:center;max-width:680px;margin:0 auto 48px auto">
              <h2 style="margin-bottom:12px">${title}</h2>
              <p class="wm-lead">${desc}</p>
            </div>
            <div class="wm-pricing-grid wm-stagger">${children}</div>
          </div>
        </div>
      `;
    });
    this.register("pricing-card", (node, children) => {
      const name = node.attributes.name || "Plan";
      const price = node.attributes.price || "$0";
      const period = node.attributes.period || "/mo";
      const desc = node.attributes.description || "";
      const popular = node.attributes.popular ? " wm-popular" : "";
      const ctaLabel = node.attributes.ctaLabel || "Get Started";
      const ctaAction = node.attributes.ctaAction ? ` data-wm-action="${node.attributes.ctaAction}"` : "";
      const ctaVariant = node.attributes.popular ? "primary" : "outline";
      return `
        <div class="wm-pricing-card${popular}">
          ${node.attributes.popular ? `<span class="wm-badge wm-badge-accent" style="align-self:flex-start;margin-bottom:12px">Most Popular</span>` : ""}
          <h3 style="font-size:1.4rem">${name}</h3>
          ${desc ? `<p class="wm-text-muted" style="font-size:0.9rem;margin-top:4px">${desc}</p>` : ""}
          <div class="wm-pricing-price">
            <span>${price}</span>
            <span style="font-size:1rem;font-weight:400;color:var(--wm-text-muted)">${period}</span>
          </div>
          <div class="wm-pricing-features">${children}</div>
          <button class="wm-button wm-button-${ctaVariant} wm-button-lg" style="width:100%;margin-top:auto"${ctaAction}>${ctaLabel}</button>
        </div>
      `;
    });
    this.register("cta", (node, children) => {
      const title = node.attributes.title || "Ready to get started?";
      const desc = node.attributes.description || "Deploy your first app in minutes.";
      return `
        <div class="wm-section wm-reveal">
          <div class="wm-container">
            <div class="wm-surface" style="background:linear-gradient(135deg, var(--wm-surface), var(--wm-surface-subtle));border:1px solid var(--wm-border);padding:48px;text-align:center;border-radius:var(--wm-radius-xl)">
              <h2 style="margin-bottom:12px">${title}</h2>
              <p class="wm-lead" style="max-width:560px;margin:0 auto 24px auto">${desc}</p>
              <div class="wm-cluster" style="justify-content:center">${children}</div>
            </div>
          </div>
        </div>
      `;
    });
    this.register("app-shell", (_node, children) => {
      const sidebarMatch = children.match(/<aside class="wm-sidebar">[\s\S]*?<\/aside>/);
      if (sidebarMatch) {
        const sidebarHtml = sidebarMatch[0];
        const restHtml = children.replace(sidebarHtml, "").trim();
        return `
          <div class="wm-app-shell">
            ${sidebarHtml}
            <main class="wm-app-main">
              <div class="wm-app-content">${restHtml}</div>
            </main>
          </div>
        `;
      }
      return `<div class="wm-app-shell"><main class="wm-app-main"><div class="wm-app-content">${children}</div></main></div>`;
    });
    this.register("page-header", (node, children) => {
      const title = node.attributes.title || "";
      const desc = node.attributes.description || "";
      return `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;gap:16px;flex-wrap:wrap">
          <div>
            <h1 style="font-size:1.85rem;margin-bottom:4px">${title}</h1>
            ${desc ? `<p class="wm-text-muted">${desc}</p>` : ""}
          </div>
          <div class="wm-cluster">${children}</div>
        </div>
      `;
    });
    this.register("metric", (node) => {
      const label = node.attributes.label || "";
      const val = node.attributes.value || "";
      const change = node.attributes.change;
      const trend = node.attributes.trend || "neutral";
      const icon = node.attributes.icon ? renderIcon(String(node.attributes.icon), 20) : "";
      return `
        <div class="wm-metric">
          <div class="wm-metric-header">
            <span>${label}</span>
            ${icon}
          </div>
          <div class="wm-metric-value">${val}</div>
          ${change ? `<span class="wm-metric-change wm-trend-${trend}">${change}</span>` : ""}
        </div>
      `;
    });
    this.register("metric-grid", (node, children) => {
      const cols = node.attributes.columns || 4;
      return `<div class="wm-grid" style="--wm-grid-cols:${cols};margin-bottom:28px">${children}</div>`;
    });
    this.register("chart", (node, _children, context) => {
      const title = node.attributes.title;
      const type = node.attributes.type || "line";
      const sourceKey = node.attributes.source ? String(node.attributes.source) : "";
      let chartData = [];
      if (sourceKey && context[sourceKey]) {
        chartData = context[sourceKey];
      } else {
        chartData = [
          { label: "Mon", value: 34 },
          { label: "Tue", value: 52 },
          { label: "Wed", value: 48 },
          { label: "Thu", value: 71 },
          { label: "Fri", value: 65 },
          { label: "Sat", value: 89 },
          { label: "Sun", value: 95 }
        ];
      }
      const svg = renderSvgChart(type, chartData, { height: Number(node.attributes.height || 260) });
      return `
        <div class="wm-card" style="margin-bottom:24px">
          ${title ? `<h3 style="font-size:1.1rem;margin-bottom:16px">${title}</h3>` : ""}
          ${svg}
        </div>
      `;
    });
    this.register("data-table", (node, children, context) => {
      const sourceKey = String(node.attributes.source || "");
      const items = Array.isArray(context[sourceKey]) ? context[sourceKey] : [];
      const pageSize = Number(node.attributes.pageSize || 10);
      const isPaginationEnabled = node.attributes.pagination !== false && items.length > pageSize;
      const explicitFields = [];
      if (node.type === "ContainerDirective" && node.children) {
        for (const child of node.children) {
          if (child.type === "ElementDirective" && child.name === "column" && child.attributes.field) {
            explicitFields.push(String(child.attributes.field));
          }
        }
      }
      return `
        <div class="wm-table-container" data-page-size="${pageSize}">
          <div class="wm-table-toolbar">
            <input type="search" class="wm-input wm-table-search" placeholder="Search records in real-time..." />
            <div class="wm-cluster">
              <span class="wm-badge wm-badge-accent wm-record-count">${items.length} records</span>
            </div>
          </div>
          <div class="wm-table-responsive">
            <table class="wm-table">
              <thead>
                <tr>${children}</tr>
              </thead>
              <tbody>
                ${items.length === 0 ? `<tr><td colspan="12" style="text-align:center;padding:32px;color:var(--wm-text-muted)">${node.attributes.emptyTitle || "No records found"}</td></tr>` : items.map((item, idx) => {
        const fieldsToRender = explicitFields.length > 0 ? explicitFields : Object.keys(item);
        const isVisible = idx < pageSize;
        return `
                        <tr data-row-index="${idx}" style="${isVisible ? "" : "display:none"}">
                          ${fieldsToRender.map((k) => {
          const val = item[k];
          if (val === null || val === void 0) return `<td></td>`;
          const lowerStr = String(val).toLowerCase();
          if (k === "status" || k === "Health Status" || k === "state") {
            const isSuccess = ["healthy", "active", "paid", "success", "completed", "approved", "ok"].includes(lowerStr);
            const isDanger = ["suspended", "failed", "error", "blocked", "down"].includes(lowerStr);
            const isWarning = ["invited", "pending", "processing", "review"].includes(lowerStr);
            const badgeClass = isSuccess ? "wm-badge-success" : isDanger ? "wm-badge-danger" : isWarning ? "wm-badge-warning" : "wm-badge-accent";
            return `<td><span class="wm-badge ${badgeClass}">${val}</span></td>`;
          }
          return `<td>${val}</td>`;
        }).join("")}
                        </tr>
                      `;
      }).join("")}
              </tbody>
            </table>
          </div>
          ${isPaginationEnabled ? `
            <div class="wm-table-pagination" data-current-page="1" data-page-size="${pageSize}" data-total="${items.length}">
              <span class="wm-pagination-info">Showing 1-${Math.min(pageSize, items.length)} of ${items.length}</span>
              <div class="wm-cluster" style="gap:6px">
                <button type="button" class="wm-button wm-button-outline wm-button-sm wm-page-prev" disabled>Previous</button>
                <button type="button" class="wm-button wm-button-outline wm-button-sm wm-page-next"${items.length <= pageSize ? " disabled" : ""}>Next</button>
              </div>
            </div>
          ` : ""}
        </div>
      `;
    });
    this.register("column", (node) => {
      const label = node.attributes.label || node.attributes.field || "";
      return `<th class="wm-sortable">${label}</th>`;
    });
    this.register("form", (node, children) => {
      const id = node.attributes.id || "";
      const submit = node.attributes.submit || "";
      const success = node.attributes.success || "";
      const error = node.attributes.error || "";
      return `
        <form class="wm-form" id="${id}" data-wm-submit="${submit}" data-wm-success="${success}" data-wm-error="${error}">
          ${children}
        </form>
      `;
    });
    this.register("field", (node) => {
      const name = node.attributes.name || "";
      const label = node.attributes.label || name;
      const type = node.attributes.type || "text";
      const placeholder = node.attributes.placeholder || "";
      const required = node.attributes.required;
      const helpText = node.attributes.helpText;
      const reqStar = required ? `<span class="wm-field-required">*</span>` : "";
      let inputHtml = "";
      if (type === "textarea") {
        inputHtml = `<textarea name="${name}" class="wm-textarea" placeholder="${placeholder}" ${required ? "required" : ""}></textarea>`;
      } else if (type === "select") {
        const optionsRaw = node.attributes.options;
        const optionsList = Array.isArray(optionsRaw) ? optionsRaw : typeof optionsRaw === "string" ? optionsRaw.split(",").map((s) => s.trim()) : [];
        inputHtml = `
          <select name="${name}" class="wm-select" ${required ? "required" : ""}>
            <option value="">Select option...</option>
            ${optionsList.map((opt) => `<option value="${opt}">${opt}</option>`).join("")}
          </select>
        `;
      }
      return `
        <div class="wm-field">
          <label class="wm-field-label">${label}${reqStar}</label>
          ${inputHtml}
          ${helpText ? `<span class="wm-field-help">${helpText}</span>` : ""}
        </div>
      `;
    });
    this.register("combobox", (node) => {
      const name = node.attributes.name || "";
      const optionsRaw = node.attributes.options;
      const optionsList = Array.isArray(optionsRaw) ? optionsRaw : typeof optionsRaw === "string" ? optionsRaw.split(",").map((s) => s.trim()) : [];
      return `
        <div class="wm-combobox-wrapper">
          <input list="list-${name}" name="${name}" class="wm-input" placeholder="${node.attributes.placeholder || "Type or select..."}" />
          <datalist id="list-${name}">
            ${optionsList.map((opt) => `<option value="${opt}"></option>`).join("")}
          </datalist>
        </div>
      `;
    });
    this.register("checkbox", (node) => {
      const name = node.attributes.name || "";
      const label = node.attributes.label || "";
      const checked = node.attributes.checked ? " checked" : "";
      return `
        <label class="wm-checkbox-label" style="display:inline-flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" name="${name}" class="wm-checkbox"${checked} />
          <span>${label}</span>
        </label>
      `;
    });
    this.register("radio", (node) => {
      const name = node.attributes.name || "";
      const label = node.attributes.label || "";
      const val = node.attributes.value || "";
      const checked = node.attributes.checked ? " checked" : "";
      return `
        <label class="wm-radio-label" style="display:inline-flex;align-items:center;gap:8px;cursor:pointer">
          <input type="radio" name="${name}" value="${val}" class="wm-radio"${checked} />
          <span>${label}</span>
        </label>
      `;
    });
    this.register("radio-group", (node, children) => {
      const label = node.attributes.label;
      return `
        <div class="wm-field">
          ${label ? `<label class="wm-field-label">${label}</label>` : ""}
          <div class="wm-cluster" style="gap:16px">${children}</div>
        </div>
      `;
    });
    this.register("switch", (node) => {
      const name = node.attributes.name || "";
      const label = node.attributes.label || "";
      const checked = node.attributes.checked ? " checked" : "";
      return `
        <label class="wm-switch-label" style="display:inline-flex;align-items:center;gap:10px;cursor:pointer">
          <input type="checkbox" name="${name}" class="wm-switch"${checked} />
          <span>${label}</span>
        </label>
      `;
    });
    this.register("date", (node) => {
      const name = node.attributes.name || "";
      const label = node.attributes.label;
      return `
        <div class="wm-field">
          ${label ? `<label class="wm-field-label">${label}</label>` : ""}
          <input type="date" name="${name}" class="wm-input" />
        </div>
      `;
    });
    this.register("file", (node) => {
      const name = node.attributes.name || "";
      const label = node.attributes.label;
      const accept = node.attributes.accept ? ` accept="${node.attributes.accept}"` : "";
      const multiple = node.attributes.multiple ? " multiple" : "";
      return `
        <div class="wm-field">
          ${label ? `<label class="wm-field-label">${label}</label>` : ""}
          <div style="border:2px dashed var(--wm-border);padding:24px;text-align:center;border-radius:var(--wm-radius-md);background:var(--wm-surface-subtle)">
            ${renderIcon("upload", 28)}
            <div style="margin:8px 0;font-size:0.9rem;color:var(--wm-text-muted)">Drag and drop files here or click to browse</div>
            <input type="file" name="${name}" class="wm-file-input"${accept}${multiple} style="cursor:pointer" />
          </div>
        </div>
      `;
    });
    this.register("slider", (node) => {
      const name = node.attributes.name || "";
      const label = node.attributes.label;
      const min = node.attributes.min ?? 0;
      const max = node.attributes.max ?? 100;
      const step = node.attributes.step ?? 1;
      const val = node.attributes.value ?? 50;
      return `
        <div class="wm-field">
          ${label ? `<div style="display:flex;justify-content:space-between"><label class="wm-field-label">${label}</label><span class="wm-text-muted" style="font-size:0.85rem">${val}</span></div>` : ""}
          <input type="range" name="${name}" min="${min}" max="${max}" step="${step}" value="${val}" class="wm-slider" style="width:100%" />
        </div>
      `;
    });
    this.register("figure", (node, children) => {
      const src = node.attributes.src;
      const alt = node.attributes.alt || "";
      const caption = node.attributes.caption;
      return `
        <figure class="wm-figure" style="margin:20px 0;text-align:center">
          ${src ? `<img src="${src}" alt="${alt}" style="max-width:100%;border-radius:var(--wm-radius-lg);box-shadow:var(--wm-shadow-md)" />` : children}
          ${caption ? `<figcaption class="wm-text-muted" style="font-size:0.85rem;margin-top:8px">${caption}</figcaption>` : ""}
        </figure>
      `;
    });
    this.register("topbar", (_node, children) => {
      return `<header class="wm-topbar">${children}</header>`;
    });
    this.register("workspace-switcher", (node) => {
      const current = node.attributes.current || "Default Workspace";
      return `
        <div class="wm-workspace-switcher" style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:var(--wm-surface-subtle);border-radius:var(--wm-radius-md);font-weight:600;font-size:0.85rem">
          ${renderIcon("layers", 16)}
          <span>${current}</span>
          ${renderIcon("chevron-down", 14)}
        </div>
      `;
    });
    this.register("user-menu", (node) => {
      const name = node.attributes.name || "User";
      const email = node.attributes.email || "";
      const avatar = node.attributes.avatar;
      return `
        <div class="wm-user-menu" style="display:flex;align-items:center;gap:10px">
          ${avatar ? `<img src="${avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover" />` : renderIcon("user", 20)}
          <div>
            <div style="font-size:0.85rem;font-weight:600">${name}</div>
            ${email ? `<div style="font-size:0.75rem;color:var(--wm-text-muted)">${email}</div>` : ""}
          </div>
        </div>
      `;
    });
    this.register("command-menu", (node, children) => {
      const id = node.attributes.id || "command-palette";
      const placeholder = node.attributes.placeholder || "Type a command or search...";
      return `
        <div id="${id}" class="wm-dialog-backdrop">
          <div class="wm-dialog-modal wm-dialog-md">
            <div style="display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--wm-border);padding-bottom:12px;margin-bottom:16px">
              ${renderIcon("search", 20)}
              <input type="search" class="wm-input" placeholder="${placeholder}" style="border:none;box-shadow:none;padding:0;font-size:1.1rem" />
              <button class="wm-button wm-button-ghost wm-button-sm" data-wm-action="close:${id}">${renderIcon("x", 18)}</button>
            </div>
            <div class="wm-command-list">${children}</div>
          </div>
        </div>
      `;
    });
    this.register("menu", (node, children) => {
      return `<div class="wm-menu wm-surface" style="padding:6px;min-width:180px">${children}</div>`;
    });
    this.register("menu-item", (node) => {
      const label = node.attributes.label || "";
      const icon = node.attributes.icon ? renderIcon(String(node.attributes.icon), 16) : "";
      const action = node.attributes.action ? ` data-wm-action="${node.attributes.action}"` : "";
      const danger = node.attributes.danger ? " color:var(--wm-danger);" : "";
      return `
        <button class="wm-menu-item" style="width:100%;display:flex;align-items:center;gap:8px;padding:8px 12px;background:none;border:none;border-radius:var(--wm-radius-sm);cursor:pointer;text-align:left;font-size:0.9rem;${danger}"${action}>
          ${icon}
          <span>${label}</span>
        </button>
      `;
    });
    this.register("error-state", (node) => {
      const title = node.attributes.title || "Something went wrong";
      const desc = node.attributes.description || "An unexpected error occurred while loading this view.";
      const retryAction = node.attributes.retryAction;
      const retryLabel = node.attributes.retryLabel || "Try Again";
      return `
        <div class="wm-error-state" style="text-align:center;padding:48px 24px;border:1px solid var(--wm-danger);background:var(--wm-danger-bg);border-radius:var(--wm-radius-lg)">
          <div style="display:inline-flex;padding:16px;background:rgba(239,68,68,0.2);border-radius:50%;color:var(--wm-danger);margin-bottom:16px">
            ${renderIcon("alert-triangle", 36)}
          </div>
          <h3 style="color:var(--wm-danger);margin-bottom:8px">${title}</h3>
          <p class="wm-text-muted" style="max-width:440px;margin:0 auto 20px auto">${desc}</p>
          ${retryAction ? `<button class="wm-button wm-button-danger" data-wm-action="${retryAction}">${retryLabel}</button>` : ""}
        </div>
      `;
    });
    this.register("popover", (node, children) => {
      const trigger = node.attributes.trigger || "Hover/Click";
      return `
        <div class="wm-popover-container" style="position:relative;display:inline-block">
          <button class="wm-button wm-button-outline wm-button-sm" onclick="this.nextElementSibling.classList.toggle('wm-open')">${trigger}</button>
          <div class="wm-popover-panel wm-surface" style="display:none;position:absolute;top:calc(100% + 8px);left:0;z-index:50;min-width:240px;box-shadow:var(--wm-shadow-xl)">
            ${children}
          </div>
        </div>
      `;
    });
    this.register("tooltip", (node, children) => {
      const content = node.attributes.content || "";
      return `
        <span class="wm-tooltip-wrapper" style="position:relative;display:inline-flex;border-bottom:1px dotted var(--wm-text-muted);cursor:help" title="${content}">
          ${children}
        </span>
      `;
    });
    this.register("confirm", (node) => {
      const id = node.attributes.id || "confirm-modal";
      const title = node.attributes.title || "Confirm Action";
      const confirmLabel = node.attributes.confirmLabel || "Confirm";
      const cancelLabel = node.attributes.cancelLabel || "Cancel";
      const confirmAction = node.attributes.confirmAction || "";
      return `
        <div id="${id}" class="wm-dialog-backdrop">
          <div class="wm-dialog-modal wm-dialog-sm">
            <h3 style="margin-bottom:12px">${title}</h3>
            <p class="wm-text-muted" style="margin-bottom:24px">Are you sure you want to continue? This action cannot be undone.</p>
            <div class="wm-cluster" style="justify-content:flex-end;gap:10px">
              <button class="wm-button wm-button-outline" data-wm-action="close:${id}">${cancelLabel}</button>
              <button class="wm-button wm-button-danger" data-wm-action="${confirmAction}; close:${id}">${confirmLabel}</button>
            </div>
          </div>
        </div>
      `;
    });
    this.register("comparison", (node, children) => {
      const title = node.attributes.title;
      const desc = node.attributes.description;
      return `
        <div class="wm-section wm-reveal">
          <div class="wm-container">
            ${title ? `<div style="text-align:center;max-width:640px;margin:0 auto 36px auto"><h2>${title}</h2>${desc ? `<p class="wm-lead">${desc}</p>` : ""}</div>` : ""}
            <div class="wm-table-container">
              <table class="wm-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Starter</th>
                    <th>Pro</th>
                    <th>Enterprise</th>
                  </tr>
                </thead>
                <tbody>${children}</tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    });
    this.register("comparison-row", (node) => {
      const feature = node.attributes.feature;
      const t1 = node.attributes.tier1;
      const t2 = node.attributes.tier2;
      const t3 = node.attributes.tier3;
      return `
        <tr>
          <td><strong>${feature}</strong></td>
          <td>${t1}</td>
          <td><span class="wm-badge wm-badge-accent">${t2}</span></td>
          <td><strong>${t3}</strong></td>
        </tr>
      `;
    });
    this.register("case-study", (node, children) => {
      const client = node.attributes.client;
      const metric = node.attributes.metric;
      const metricLabel = node.attributes.metricLabel;
      return `
        <div class="wm-card" style="padding:36px;margin:24px 0">
          <div class="wm-split ratio-40-60">
            <div>
              <span class="wm-badge wm-badge-accent" style="margin-bottom:12px">Case Study</span>
              <h2>${client}</h2>
              ${metric ? `<div style="font-size:2.8rem;font-weight:800;color:var(--wm-color-accent);margin:16px 0">${metric}</div>` : ""}
              ${metricLabel ? `<div class="wm-text-muted" style="font-weight:600">${metricLabel}</div>` : ""}
            </div>
            <div>${children}</div>
          </div>
        </div>
      `;
    });
    this.register("tree", (node, children) => {
      const title = node.attributes.title;
      return `
        <div class="wm-tree-explorer wm-surface" style="padding:16px">
          ${title ? `<h4 style="margin-bottom:12px">${title}</h4>` : ""}
          <div style="display:flex;flex-direction:column;gap:4px">${children}</div>
        </div>
      `;
    });
    this.register("tree-node", (node, children) => {
      const label = node.attributes.label;
      const icon = node.attributes.icon ? renderIcon(String(node.attributes.icon), 16) : renderIcon("folder", 16);
      const open = node.attributes.open;
      return `
        <details class="wm-tree-node" style="padding-left:12px"${open ? " open" : ""}>
          <summary style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:4px 0;font-size:0.9rem">
            ${icon}
            <span>${label}</span>
          </summary>
          <div style="padding-left:16px;margin-top:4px">${children}</div>
        </details>
      `;
    });
    this.register("kanban", (node, children) => {
      const title = node.attributes.title;
      return `
        <div class="wm-kanban" style="margin-bottom:28px">
          ${title ? `<h3 style="margin-bottom:16px">${title}</h3>` : ""}
          <div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:12px">${children}</div>
        </div>
      `;
    });
    this.register("kanban-column", (node, children) => {
      const title = node.attributes.title;
      const badge = node.attributes.badge ? `<span class="wm-badge">${node.attributes.badge}</span>` : "";
      return `
        <div class="wm-kanban-col" style="flex:1;min-width:260px;background:var(--wm-surface-subtle);border-radius:var(--wm-radius-lg);padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h4 style="font-size:0.95rem;margin:0">${title}</h4>
            ${badge}
          </div>
          <div style="display:flex;flex-direction:column;gap:10px">${children}</div>
        </div>
      `;
    });
    this.register("kanban-card", (node, children) => {
      const title = node.attributes.title;
      const tag = node.attributes.tag ? `<span class="wm-badge wm-badge-accent">${node.attributes.tag}</span>` : "";
      return `
        <div class="wm-card" style="padding:12px;box-shadow:var(--wm-shadow-sm)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
            <strong style="font-size:0.9rem">${title}</strong>
            ${tag}
          </div>
          <div style="font-size:0.85rem;color:var(--wm-text-muted)">${children}</div>
        </div>
      `;
    });
    this.register("calendar", (node) => {
      const title = node.attributes.title || "Calendar Schedule";
      return `
        <div class="wm-card" style="padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h3>${title}</h3>
            <div class="wm-cluster">
              <button class="wm-button wm-button-outline wm-button-sm">${renderIcon("chevron-left", 14)}</button>
              <button class="wm-button wm-button-outline wm-button-sm">${renderIcon("chevron-right", 14)}</button>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(7, 1fr);gap:8px;text-align:center">
            ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => `<div style="font-size:0.8rem;font-weight:700;color:var(--wm-text-muted)">${d}</div>`).join("")}
            ${Array.from({ length: 31 }, (_, i) => `<div style="padding:10px 4px;border-radius:var(--wm-radius-md);background:var(--wm-surface-subtle);font-size:0.85rem">${i + 1}</div>`).join("")}
          </div>
        </div>
      `;
    });
  }
};
var componentRegistry = new ComponentRegistry();
function renderAST(ast, context = {}) {
  const layout = ast.frontmatter.layout || "default";
  function renderNode(node) {
    if (node.type === "MarkdownContent") {
      const interpolated = interpolateBindings(node.content, context);
      return renderMarkdown(interpolated);
    }
    let childrenHtml = "";
    if (node.type === "ContainerDirective" && node.children) {
      childrenHtml = node.children.map(renderNode).join("\n");
    }
    const renderer = componentRegistry.get(node.name);
    if (renderer) {
      return renderer(node, childrenHtml, context);
    }
    return `<div class="wm-${node.name}">${childrenHtml}</div>`;
  }
  const bodyHtml = ast.children.map(renderNode).join("\n");
  if (layout === "app") {
    return `<div class="wm-layout-app">${bodyHtml}</div>`;
  } else if (layout === "landing") {
    return `<div class="wm-layout-landing">${bodyHtml}</div>`;
  } else if (layout === "docs") {
    return `<div class="wm-layout-docs">${bodyHtml}</div>`;
  }
  return `<div class="wm-layout-${layout}">${bodyHtml}</div>`;
}

// ../parser/dist/frontmatter.js
function parseYamlSimple(yamlText) {
  const result = {};
  const lines = yamlText.split(/\r?\n/);
  let currentListKey = null;
  let currentList = [];
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    if (line.startsWith("- ") && currentListKey) {
      const itemVal = parseScalarValue(line.slice(2).trim());
      currentList.push(itemVal);
      continue;
    } else if (currentListKey) {
      result[currentListKey] = currentList;
      currentListKey = null;
      currentList = [];
    }
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const valStr = line.slice(colonIndex + 1).trim();
      const cleanedVal = stripTrailingComment(valStr);
      if (cleanedVal === "") {
        currentListKey = key;
        currentList = [];
      } else {
        result[key] = parseScalarValue(cleanedVal);
      }
    }
  }
  if (currentListKey) {
    result[currentListKey] = currentList;
  }
  return result;
}
function stripTrailingComment(str) {
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"' && !inSingle)
      inDouble = !inDouble;
    else if (char === "'" && !inDouble)
      inSingle = !inSingle;
    else if (char === "#" && !inDouble && !inSingle) {
      return str.slice(0, i).trim();
    }
  }
  return str.trim();
}
function parseScalarValue(val) {
  if (val === "true" || val === "true")
    return true;
  if (val === "false" || val === "false")
    return false;
  if (val === "null" || val === "~")
    return null;
  if (val.startsWith("[") && val.endsWith("]")) {
    const inner = val.slice(1, -1).trim();
    if (!inner)
      return [];
    return inner.split(",").map((s) => parseScalarValue(s.trim()));
  }
  if (val.startsWith('"') && val.endsWith('"') || val.startsWith("'") && val.endsWith("'")) {
    return val.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(val)) {
    return Number(val);
  }
  return val;
}
function extractFrontmatter(source, file) {
  const defaultFrontmatter = {
    type: "Frontmatter",
    title: "Wovemark",
    description: "",
    layout: "default",
    theme: "system",
    variance: 5,
    motion: 5,
    density: 5,
    accent: "blue",
    data: {},
    loc: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 },
      file
    }
  };
  const lines = source.split(/\r?\n/);
  if (lines.length === 0 || lines[0].trim() !== "---") {
    return {
      frontmatter: defaultFrontmatter,
      body: source,
      bodyLineOffset: 0
    };
  }
  let endLineIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endLineIndex = i;
      break;
    }
  }
  if (endLineIndex === -1) {
    return {
      frontmatter: defaultFrontmatter,
      body: source,
      bodyLineOffset: 0
    };
  }
  const yamlLines = lines.slice(1, endLineIndex);
  const yamlText = yamlLines.join("\n");
  const parsedData = parseYamlSimple(yamlText);
  const frontmatterNode = {
    type: "Frontmatter",
    title: typeof parsedData.title === "string" ? parsedData.title : defaultFrontmatter.title,
    description: typeof parsedData.description === "string" ? parsedData.description : "",
    layout: typeof parsedData.layout === "string" ? parsedData.layout : defaultFrontmatter.layout,
    theme: typeof parsedData.theme === "string" ? parsedData.theme : defaultFrontmatter.theme,
    variance: typeof parsedData.variance === "number" ? Math.min(10, Math.max(1, parsedData.variance)) : 5,
    motion: typeof parsedData.motion === "number" ? Math.min(10, Math.max(0, parsedData.motion)) : 5,
    density: typeof parsedData.density === "number" ? Math.min(10, Math.max(1, parsedData.density)) : 5,
    accent: typeof parsedData.accent === "string" ? parsedData.accent : defaultFrontmatter.accent,
    data: parsedData,
    loc: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: endLineIndex + 1, column: 4, offset: 0 },
      file
    }
  };
  const bodyLines = lines.slice(endLineIndex + 1);
  const body = bodyLines.join("\n");
  return {
    frontmatter: frontmatterNode,
    body,
    bodyLineOffset: endLineIndex + 1
  };
}

// ../parser/dist/attributes.js
function parseAttributes(rawAttrs) {
  const attributes = {};
  if (!rawAttrs || !rawAttrs.trim()) {
    return attributes;
  }
  const str = rawAttrs.trim();
  let i = 0;
  const len = str.length;
  while (i < len) {
    while (i < len && /\s/.test(str[i])) {
      i++;
    }
    if (i >= len)
      break;
    const keyStart = i;
    while (i < len && /[a-zA-Z0-9_\-:]/.test(str[i])) {
      i++;
    }
    const key = str.slice(keyStart, i).trim();
    if (!key) {
      i++;
      continue;
    }
    while (i < len && /\s/.test(str[i])) {
      i++;
    }
    if (i < len && str[i] === "=") {
      i++;
      while (i < len && /\s/.test(str[i])) {
        i++;
      }
      if (i >= len) {
        attributes[key] = "";
        break;
      }
      const quoteChar = str[i];
      if (quoteChar === '"' || quoteChar === "'") {
        i++;
        const valStart = i;
        let val = "";
        while (i < len && str[i] !== quoteChar) {
          if (str[i] === "\\" && i + 1 < len) {
            val += str[i + 1];
            i += 2;
          } else {
            val += str[i];
            i++;
          }
        }
        if (i < len && str[i] === quoteChar) {
          i++;
        }
        attributes[key] = parseAttributeValue(val, key);
      } else {
        const valStart = i;
        while (i < len && !/\s/.test(str[i])) {
          i++;
        }
        const valStr = str.slice(valStart, i);
        attributes[key] = parseAttributeValue(valStr, key);
      }
    } else {
      attributes[key] = true;
    }
  }
  return attributes;
}
var LIST_ATTRIBUTE_KEYS = /* @__PURE__ */ new Set(["options", "tags", "categories", "items", "keys"]);
function parseAttributeValue(val, key) {
  if (val === "true")
    return true;
  if (val === "false")
    return false;
  if (/^-?\d+(\.\d+)?$/.test(val)) {
    return Number(val);
  }
  if (val.startsWith("{") && val.endsWith("}") || val.startsWith("[") && val.endsWith("]")) {
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
    }
  }
  if (key && LIST_ATTRIBUTE_KEYS.has(key.toLowerCase()) && val.includes(",") && !val.includes("\n")) {
    const items = val.split(",").map((s) => s.trim());
    if (items.length > 1) {
      return items;
    }
  }
  return val;
}

// ../parser/dist/bindings.js
var BINDING_REGEX = /\{\{\s*([^{}]+?)\s*\}\}/g;
function extractBindings(text, baseLine = 1, file) {
  const bindings = [];
  if (!text.includes("{{"))
    return bindings;
  let match;
  const regex = new RegExp(BINDING_REGEX);
  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    const expression = match[1].trim();
    const matchIndex = match.index;
    const beforeText = text.slice(0, matchIndex);
    const lines = beforeText.split("\n");
    const lineOffset = lines.length - 1;
    const startLine = baseLine + lineOffset;
    const lastLine = lines[lines.length - 1];
    const startCol = lines.length === 1 ? matchIndex + 1 : lastLine.length + 1;
    bindings.push({
      type: "Binding",
      raw,
      expression,
      loc: {
        start: { line: startLine, column: startCol, offset: matchIndex },
        end: {
          line: startLine,
          column: startCol + raw.length,
          offset: matchIndex + raw.length
        },
        file
      }
    });
  }
  return bindings;
}

// ../parser/dist/parser.js
var CONTAINER_OPEN_REGEX = /^:{3,}\s*([a-zA-Z0-9_\-]+)(.*)$/;
var CONTAINER_CLOSE_REGEX = /^:{3,}\s*$/;
var ELEMENT_DIRECTIVE_REGEX = /^::([a-zA-Z0-9_\-]+)(.*)$/;
var CODE_FENCE_REGEX = /^(`{3,}|~{3,})/;
function parseWovemark(source, options = {}) {
  const file = options.file || "inline.wovemark.md";
  const diagnostics = [];
  const { frontmatter, body, bodyLineOffset } = extractFrontmatter(source, file);
  const lines = body.split(/\r?\n/);
  const rootChildren = [];
  const dataSources = [];
  const containerStack = [];
  let pendingMarkdownLines = [];
  let pendingMarkdownStartLine = 1 + bodyLineOffset;
  let inCodeFence = false;
  let codeFenceChar = "";
  let codeFenceLength = 0;
  function flushPendingMarkdown() {
    if (pendingMarkdownLines.length === 0)
      return;
    const content = pendingMarkdownLines.join("\n");
    const trimmed = content.trim();
    if (trimmed.length > 0) {
      const lineCount = pendingMarkdownLines.length;
      const endLine = pendingMarkdownStartLine + lineCount - 1;
      const bindings = extractBindings(content, pendingMarkdownStartLine, file);
      const node = {
        type: "MarkdownContent",
        content,
        bindings,
        loc: {
          start: { line: pendingMarkdownStartLine, column: 1, offset: 0 },
          end: {
            line: endLine,
            column: pendingMarkdownLines[lineCount - 1].length + 1,
            offset: 0
          },
          file
        }
      };
      if (containerStack.length > 0) {
        containerStack[containerStack.length - 1].node.children.push(node);
      } else {
        rootChildren.push(node);
      }
    }
    pendingMarkdownLines = [];
  }
  for (let idx = 0; idx < lines.length; idx++) {
    const currentLineNumber = idx + 1 + bodyLineOffset;
    const rawLine = lines[idx];
    const trimmedLine = rawLine.trim();
    const codeMatch = trimmedLine.match(CODE_FENCE_REGEX);
    if (codeMatch) {
      const marker = codeMatch[1];
      if (!inCodeFence) {
        inCodeFence = true;
        codeFenceChar = marker[0];
        codeFenceLength = marker.length;
      } else if (marker[0] === codeFenceChar && marker.length >= codeFenceLength) {
        inCodeFence = false;
      }
      if (pendingMarkdownLines.length === 0) {
        pendingMarkdownStartLine = currentLineNumber;
      }
      pendingMarkdownLines.push(rawLine);
      continue;
    }
    if (inCodeFence) {
      if (pendingMarkdownLines.length === 0) {
        pendingMarkdownStartLine = currentLineNumber;
      }
      pendingMarkdownLines.push(rawLine);
      continue;
    }
    if (CONTAINER_CLOSE_REGEX.test(trimmedLine)) {
      flushPendingMarkdown();
      if (containerStack.length === 0) {
        diagnostics.push({
          severity: "warning",
          code: "UNMATCHED_CLOSING_DIRECTIVE",
          message: `Unmatched closing container directive ':::' with no open container.`,
          file,
          loc: {
            start: { line: currentLineNumber, column: 1, offset: 0 },
            end: { line: currentLineNumber, column: trimmedLine.length + 1, offset: 0 },
            file
          }
        });
      } else {
        const closed = containerStack.pop();
        closed.node.loc.end = {
          line: currentLineNumber,
          column: trimmedLine.length + 1,
          offset: 0
        };
        if (containerStack.length > 0) {
          containerStack[containerStack.length - 1].node.children.push(closed.node);
        } else {
          rootChildren.push(closed.node);
        }
      }
      continue;
    }
    const containerMatch = trimmedLine.match(CONTAINER_OPEN_REGEX);
    if (containerMatch) {
      flushPendingMarkdown();
      const name = containerMatch[1];
      const rawAttrs = containerMatch[2].trim();
      const attributes = parseAttributes(rawAttrs);
      const containerNode = {
        type: "ContainerDirective",
        name,
        attributes,
        rawAttributes: rawAttrs,
        children: [],
        loc: {
          start: { line: currentLineNumber, column: 1, offset: 0 },
          end: { line: currentLineNumber, column: rawLine.length + 1, offset: 0 },
          file
        }
      };
      containerStack.push({
        node: containerNode,
        fenceLength: trimmedLine.indexOf(name)
      });
      continue;
    }
    const elementMatch = trimmedLine.match(ELEMENT_DIRECTIVE_REGEX);
    if (elementMatch) {
      flushPendingMarkdown();
      const name = elementMatch[1];
      const rawAttrs = elementMatch[2].trim();
      const attributes = parseAttributes(rawAttrs);
      const elementNode = {
        type: "ElementDirective",
        name,
        attributes,
        rawAttributes: rawAttrs,
        loc: {
          start: { line: currentLineNumber, column: 1, offset: 0 },
          end: { line: currentLineNumber, column: rawLine.length + 1, offset: 0 },
          file
        }
      };
      if (name === "data") {
        dataSources.push(elementNode);
      }
      if (containerStack.length > 0) {
        containerStack[containerStack.length - 1].node.children.push(elementNode);
      } else {
        rootChildren.push(elementNode);
      }
      continue;
    }
    if (pendingMarkdownLines.length === 0) {
      pendingMarkdownStartLine = currentLineNumber;
    }
    pendingMarkdownLines.push(rawLine);
  }
  flushPendingMarkdown();
  while (containerStack.length > 0) {
    const unclosed = containerStack.pop();
    diagnostics.push({
      severity: "warning",
      code: "UNCLOSED_CONTAINER_DIRECTIVE",
      message: `Container directive ':::${unclosed.node.name}' was not closed with ':::'.`,
      file,
      loc: unclosed.node.loc
    });
    if (containerStack.length > 0) {
      containerStack[containerStack.length - 1].node.children.push(unclosed.node);
    } else {
      rootChildren.push(unclosed.node);
    }
  }
  const rootLoc = {
    start: { line: 1, column: 1, offset: 0 },
    end: {
      line: lines.length + bodyLineOffset,
      column: (lines[lines.length - 1] || "").length + 1,
      offset: 0
    },
    file
  };
  return {
    type: "Root",
    frontmatter,
    children: rootChildren,
    dataSources,
    errors: diagnostics,
    loc: rootLoc
  };
}

// ../parser/dist/schema.js
var COMPONENT_SCHEMAS = {
  // Foundation
  container: {
    name: "container",
    kind: "container",
    category: "foundation",
    props: {
      size: { type: "enum", enum: ["sm", "md", "lg", "xl", "full"], default: "lg" },
      class: { type: "string" }
    }
  },
  section: {
    name: "section",
    kind: "container",
    category: "foundation",
    props: {
      variant: { type: "enum", enum: ["default", "muted", "surface", "accent"], default: "default" },
      id: { type: "string" },
      class: { type: "string" }
    }
  },
  stack: {
    name: "stack",
    kind: "container",
    category: "foundation",
    props: {
      gap: { type: "enum", enum: ["xs", "sm", "md", "lg", "xl"], default: "md" },
      align: { type: "enum", enum: ["start", "center", "end", "stretch"], default: "stretch" }
    }
  },
  cluster: {
    name: "cluster",
    kind: "container",
    category: "foundation",
    props: {
      gap: { type: "enum", enum: ["xs", "sm", "md", "lg"], default: "sm" },
      align: { type: "enum", enum: ["start", "center", "end", "baseline"], default: "center" },
      justify: { type: "enum", enum: ["start", "center", "end", "between"], default: "start" }
    }
  },
  grid: {
    name: "grid",
    kind: "container",
    category: "foundation",
    props: {
      columns: { type: "any", default: "3" },
      gap: { type: "enum", enum: ["sm", "md", "lg", "xl"], default: "md" }
    }
  },
  split: {
    name: "split",
    kind: "container",
    category: "foundation",
    props: {
      ratio: { type: "enum", enum: ["50-50", "60-40", "40-60", "70-30", "30-70"], default: "50-50" },
      reverseOnMobile: { type: "boolean", default: false }
    }
  },
  divider: {
    name: "divider",
    kind: "element",
    category: "foundation",
    props: {
      orientation: { type: "enum", enum: ["horizontal", "vertical"], default: "horizontal" },
      label: { type: "string" }
    }
  },
  spacer: {
    name: "spacer",
    kind: "element",
    category: "foundation",
    props: {
      size: { type: "enum", enum: ["xs", "sm", "md", "lg", "xl"], default: "md" }
    }
  },
  surface: {
    name: "surface",
    kind: "container",
    category: "foundation",
    props: {
      elevation: { type: "enum", enum: ["none", "sm", "md", "lg"], default: "sm" },
      border: { type: "boolean", default: true },
      padding: { type: "enum", enum: ["none", "sm", "md", "lg"], default: "md" }
    }
  },
  card: {
    name: "card",
    kind: "container",
    category: "foundation",
    props: {
      title: { type: "string" },
      description: { type: "string" },
      icon: { type: "string" },
      badge: { type: "string" },
      action: { type: "action" },
      elevation: { type: "enum", enum: ["none", "sm", "md", "lg"], default: "sm" },
      variant: { type: "enum", enum: ["default", "outline", "ghost", "gradient"], default: "default" }
    }
  },
  // Content
  heading: {
    name: "heading",
    kind: "both",
    category: "content",
    props: {
      level: { type: "enum", enum: ["1", "2", "3", "4", "5", "6", 1, 2, 3, 4, 5, 6], default: 2 },
      gradient: { type: "boolean", default: false },
      text: { type: "string" }
    }
  },
  text: {
    name: "text",
    kind: "both",
    category: "content",
    props: {
      variant: { type: "enum", enum: ["lead", "body", "muted", "small"], default: "body" },
      align: { type: "enum", enum: ["left", "center", "right"], default: "left" }
    }
  },
  badge: {
    name: "badge",
    kind: "element",
    category: "content",
    props: {
      label: { type: "string", required: true },
      variant: { type: "enum", enum: ["default", "accent", "success", "warning", "danger", "outline"], default: "default" },
      icon: { type: "string" }
    }
  },
  icon: {
    name: "icon",
    kind: "element",
    category: "content",
    props: {
      name: { type: "string", required: true },
      size: { type: "enum", enum: ["sm", "md", "lg", "xl"], default: "md" },
      class: { type: "string" }
    }
  },
  quote: {
    name: "quote",
    kind: "container",
    category: "content",
    props: {
      author: { type: "string" },
      role: { type: "string" },
      avatar: { type: "string" }
    }
  },
  image: {
    name: "image",
    kind: "element",
    category: "content",
    props: {
      src: { type: "string", required: true },
      alt: { type: "string", default: "" },
      aspect: { type: "enum", enum: ["16/9", "4/3", "1/1", "21/9", "auto"], default: "auto" },
      rounded: { type: "enum", enum: ["none", "sm", "md", "lg", "full"], default: "md" },
      shadow: { type: "boolean", default: false }
    }
  },
  video: {
    name: "video",
    kind: "element",
    category: "content",
    props: {
      src: { type: "string", required: true },
      poster: { type: "string" },
      autoplay: { type: "boolean", default: false },
      loop: { type: "boolean", default: false },
      controls: { type: "boolean", default: true }
    }
  },
  gallery: {
    name: "gallery",
    kind: "container",
    category: "content",
    props: {
      columns: { type: "any", default: 3 },
      motion: { type: "string", default: "stagger" }
    }
  },
  code: {
    name: "code",
    kind: "both",
    category: "content",
    props: {
      lang: { type: "string", default: "text" },
      filename: { type: "string" },
      code: { type: "string" },
      copyable: { type: "boolean", default: true }
    }
  },
  callout: {
    name: "callout",
    kind: "container",
    category: "content",
    props: {
      variant: { type: "enum", enum: ["info", "success", "warning", "danger", "tip", "note"], default: "info" },
      title: { type: "string" },
      icon: { type: "string" }
    }
  },
  accordion: {
    name: "accordion",
    kind: "container",
    category: "content",
    props: {
      type: { type: "enum", enum: ["single", "multiple"], default: "single" }
    }
  },
  "accordion-item": {
    name: "accordion-item",
    kind: "container",
    category: "content",
    props: {
      title: { type: "string", required: true },
      open: { type: "boolean", default: false }
    }
  },
  timeline: {
    name: "timeline",
    kind: "container",
    category: "content",
    props: {
      orientation: { type: "enum", enum: ["vertical", "horizontal"], default: "vertical" }
    }
  },
  "timeline-item": {
    name: "timeline-item",
    kind: "container",
    category: "content",
    props: {
      title: { type: "string", required: true },
      date: { type: "string" },
      icon: { type: "string" },
      status: { type: "enum", enum: ["completed", "current", "upcoming"], default: "completed" }
    }
  },
  // Navigation
  navbar: {
    name: "navbar",
    kind: "container",
    category: "navigation",
    props: {
      title: { type: "string" },
      logo: { type: "string" },
      sticky: { type: "boolean", default: true }
    }
  },
  "nav-link": {
    name: "nav-link",
    kind: "element",
    category: "navigation",
    props: {
      label: { type: "string", required: true },
      href: { type: "string", required: true },
      icon: { type: "string" },
      badge: { type: "string" },
      active: { type: "boolean", default: false }
    }
  },
  sidebar: {
    name: "sidebar",
    kind: "container",
    category: "navigation",
    props: {
      title: { type: "string" },
      logo: { type: "string" },
      collapsible: { type: "boolean", default: true }
    }
  },
  "sidebar-group": {
    name: "sidebar-group",
    kind: "container",
    category: "navigation",
    props: {
      label: { type: "string", required: true }
    }
  },
  "sidebar-item": {
    name: "sidebar-item",
    kind: "element",
    category: "navigation",
    props: {
      label: { type: "string", required: true },
      href: { type: "string", required: true },
      icon: { type: "string" },
      badge: { type: "string" },
      active: { type: "boolean", default: false }
    }
  },
  breadcrumbs: {
    name: "breadcrumbs",
    kind: "container",
    category: "navigation",
    props: {
      separator: { type: "string", default: "/" }
    }
  },
  "breadcrumb-item": {
    name: "breadcrumb-item",
    kind: "element",
    category: "navigation",
    props: {
      label: { type: "string", required: true },
      href: { type: "string" }
    }
  },
  tabs: {
    name: "tabs",
    kind: "container",
    category: "navigation",
    props: {
      id: { type: "string" },
      variant: { type: "enum", enum: ["underline", "pill", "enclosed"], default: "underline" },
      defaultTab: { type: "string" }
    }
  },
  "tab-item": {
    name: "tab-item",
    kind: "container",
    category: "navigation",
    props: {
      id: { type: "string", required: true },
      label: { type: "string", required: true },
      icon: { type: "string" }
    }
  },
  pagination: {
    name: "pagination",
    kind: "element",
    category: "navigation",
    props: {
      current: { type: "number", default: 1 },
      total: { type: "number", default: 1 },
      action: { type: "action" }
    }
  },
  footer: {
    name: "footer",
    kind: "container",
    category: "navigation",
    props: {
      copyright: { type: "string" },
      columns: { type: "any", default: 4 }
    }
  },
  "footer-column": {
    name: "footer-column",
    kind: "container",
    category: "navigation",
    props: {
      title: { type: "string", required: true }
    }
  },
  // Actions
  button: {
    name: "button",
    kind: "element",
    category: "actions",
    props: {
      label: { type: "string", required: true },
      action: { type: "action" },
      href: { type: "string" },
      variant: { type: "enum", enum: ["primary", "secondary", "outline", "ghost", "danger"], default: "primary" },
      size: { type: "enum", enum: ["sm", "md", "lg"], default: "md" },
      icon: { type: "string" },
      iconRight: { type: "string" },
      type: { type: "enum", enum: ["button", "submit", "reset"], default: "button" },
      disabled: { type: "boolean", default: false },
      loading: { type: "boolean", default: false }
    }
  },
  "button-group": {
    name: "button-group",
    kind: "container",
    category: "actions",
    props: {
      size: { type: "enum", enum: ["sm", "md", "lg"], default: "md" }
    }
  },
  dropdown: {
    name: "dropdown",
    kind: "container",
    category: "actions",
    props: {
      label: { type: "string", required: true },
      icon: { type: "string" },
      variant: { type: "enum", enum: ["primary", "secondary", "outline", "ghost"], default: "outline" }
    }
  },
  "dropdown-item": {
    name: "dropdown-item",
    kind: "element",
    category: "actions",
    props: {
      label: { type: "string", required: true },
      action: { type: "action" },
      href: { type: "string" },
      icon: { type: "string" },
      danger: { type: "boolean", default: false }
    }
  },
  // Feedback
  alert: {
    name: "alert",
    kind: "container",
    category: "feedback",
    props: {
      variant: { type: "enum", enum: ["info", "success", "warning", "danger"], default: "info" },
      title: { type: "string" },
      dismissible: { type: "boolean", default: false }
    }
  },
  progress: {
    name: "progress",
    kind: "element",
    category: "feedback",
    props: {
      value: { type: "number", required: true },
      max: { type: "number", default: 100 },
      label: { type: "string" },
      showValue: { type: "boolean", default: true },
      variant: { type: "enum", enum: ["default", "accent", "success", "warning", "danger"], default: "accent" }
    }
  },
  skeleton: {
    name: "skeleton",
    kind: "element",
    category: "feedback",
    props: {
      type: { type: "enum", enum: ["text", "circle", "rect", "card", "table"], default: "text" },
      width: { type: "string" },
      height: { type: "string" },
      count: { type: "number", default: 1 }
    }
  },
  "empty-state": {
    name: "empty-state",
    kind: "container",
    category: "feedback",
    props: {
      icon: { type: "string", default: "inbox" },
      title: { type: "string", required: true },
      description: { type: "string" },
      actionLabel: { type: "string" },
      action: { type: "action" }
    }
  },
  loading: {
    name: "loading",
    kind: "element",
    category: "feedback",
    props: {
      label: { type: "string", default: "Loading..." },
      size: { type: "enum", enum: ["sm", "md", "lg"], default: "md" }
    }
  },
  // Overlay
  dialog: {
    name: "dialog",
    kind: "container",
    category: "overlay",
    props: {
      id: { type: "string", required: true },
      title: { type: "string", required: true },
      description: { type: "string" },
      size: { type: "enum", enum: ["sm", "md", "lg", "xl", "full"], default: "md" }
    }
  },
  drawer: {
    name: "drawer",
    kind: "container",
    category: "overlay",
    props: {
      id: { type: "string", required: true },
      title: { type: "string", required: true },
      position: { type: "enum", enum: ["left", "right", "bottom"], default: "right" },
      size: { type: "enum", enum: ["sm", "md", "lg"], default: "md" }
    }
  },
  // Marketing Blocks
  hero: {
    name: "hero",
    kind: "container",
    category: "marketing",
    props: {
      variant: { type: "enum", enum: ["split", "centered", "editorial", "product", "minimal"], default: "split" },
      badge: { type: "string" },
      image: { type: "string" },
      align: { type: "enum", enum: ["left", "center"], default: "left" },
      motion: { type: "string", default: "reveal" }
    }
  },
  "logo-wall": {
    name: "logo-wall",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      variant: { type: "enum", enum: ["marquee", "grid"], default: "grid" }
    }
  },
  "logo-item": {
    name: "logo-item",
    kind: "element",
    category: "marketing",
    props: {
      src: { type: "string", required: true },
      alt: { type: "string", default: "Partner logo" },
      name: { type: "string" }
    }
  },
  "feature-grid": {
    name: "feature-grid",
    kind: "container",
    category: "marketing",
    props: {
      columns: { type: "any", default: 3 },
      title: { type: "string" },
      badge: { type: "string" },
      description: { type: "string" },
      align: { type: "enum", enum: ["left", "center"], default: "left" }
    }
  },
  "feature-list": {
    name: "feature-list",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      description: { type: "string" }
    }
  },
  bento: {
    name: "bento",
    kind: "container",
    category: "marketing",
    props: {
      columns: { type: "any", default: 3 },
      title: { type: "string" },
      description: { type: "string" }
    }
  },
  "bento-item": {
    name: "bento-item",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string", required: true },
      description: { type: "string" },
      span: { type: "string", default: "1" },
      icon: { type: "string" },
      image: { type: "string" },
      badge: { type: "string" },
      variant: { type: "enum", enum: ["default", "accent", "surface", "gradient"], default: "default" }
    }
  },
  stats: {
    name: "stats",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      columns: { type: "any", default: 4 },
      variant: { type: "enum", enum: ["grid", "split"], default: "grid" }
    }
  },
  "stat-item": {
    name: "stat-item",
    kind: "element",
    category: "marketing",
    props: {
      value: { type: "string", required: true },
      label: { type: "string", required: true },
      change: { type: "string" },
      trend: { type: "enum", enum: ["up", "down", "neutral"] }
    }
  },
  testimonials: {
    name: "testimonials",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      description: { type: "string" },
      columns: { type: "any", default: 3 },
      variant: { type: "enum", enum: ["grid", "masonry", "carousel"], default: "grid" }
    }
  },
  "testimonial-item": {
    name: "testimonial-item",
    kind: "container",
    category: "marketing",
    props: {
      name: { type: "string", required: true },
      role: { type: "string" },
      company: { type: "string" },
      avatar: { type: "string" },
      rating: { type: "number", default: 5 }
    }
  },
  pricing: {
    name: "pricing",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      badge: { type: "string" },
      description: { type: "string" },
      billingToggle: { type: "boolean", default: true }
    }
  },
  "pricing-card": {
    name: "pricing-card",
    kind: "container",
    category: "marketing",
    props: {
      name: { type: "string", required: true },
      price: { type: "string", required: true },
      period: { type: "string", default: "/mo" },
      description: { type: "string" },
      popular: { type: "boolean", default: false },
      badge: { type: "string" },
      ctaLabel: { type: "string", default: "Get Started" },
      ctaAction: { type: "action" },
      ctaVariant: { type: "enum", enum: ["primary", "outline", "secondary"], default: "primary" }
    }
  },
  faq: {
    name: "faq",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string", default: "Frequently Asked Questions" },
      description: { type: "string" },
      columns: { type: "any", default: 1 }
    }
  },
  "faq-item": {
    name: "faq-item",
    kind: "container",
    category: "marketing",
    props: {
      question: { type: "string", required: true }
    }
  },
  cta: {
    name: "cta",
    kind: "container",
    category: "marketing",
    props: {
      variant: { type: "enum", enum: ["centered", "split", "card", "accent"], default: "card" },
      badge: { type: "string" },
      title: { type: "string" },
      description: { type: "string" }
    }
  },
  newsletter: {
    name: "newsletter",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      description: { type: "string" },
      submit: { type: "string" },
      buttonLabel: { type: "string", default: "Subscribe" }
    }
  },
  contact: {
    name: "contact",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string", default: "Contact Us" },
      description: { type: "string" },
      submit: { type: "string" }
    }
  },
  // Product UI
  "app-shell": {
    name: "app-shell",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" },
      logo: { type: "string" },
      sidebarWidth: { type: "string", default: "260px" }
    }
  },
  "page-header": {
    name: "page-header",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string", required: true },
      description: { type: "string" },
      badge: { type: "string" }
    }
  },
  metric: {
    name: "metric",
    kind: "element",
    category: "product",
    props: {
      label: { type: "string", required: true },
      value: { type: "string", required: true },
      change: { type: "string" },
      trend: { type: "enum", enum: ["up", "down", "neutral"], default: "neutral" },
      icon: { type: "string" },
      helpText: { type: "string" }
    }
  },
  "metric-grid": {
    name: "metric-grid",
    kind: "container",
    category: "product",
    props: {
      columns: { type: "any", default: 4 }
    }
  },
  chart: {
    name: "chart",
    kind: "element",
    category: "product",
    props: {
      title: { type: "string" },
      type: { type: "enum", enum: ["line", "bar", "area", "pie", "donut"], default: "line" },
      source: { type: "source" },
      xField: { type: "string" },
      yField: { type: "string" },
      height: { type: "number", default: 280 }
    }
  },
  "activity-feed": {
    name: "activity-feed",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" },
      source: { type: "source" }
    }
  },
  "activity-item": {
    name: "activity-item",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string", required: true },
      time: { type: "string" },
      user: { type: "string" },
      avatar: { type: "string" },
      badge: { type: "string" }
    }
  },
  "quick-actions": {
    name: "quick-actions",
    kind: "container",
    category: "product",
    props: {
      columns: { type: "any", default: 4 }
    }
  },
  "status-overview": {
    name: "status-overview",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" }
    }
  },
  "data-table": {
    name: "data-table",
    kind: "container",
    category: "product",
    props: {
      source: { type: "source", required: true },
      searchable: { type: "boolean", default: true },
      sortable: { type: "boolean", default: true },
      pagination: { type: "boolean", default: true },
      pageSize: { type: "number", default: 10 },
      emptyTitle: { type: "string", default: "No records found" }
    }
  },
  column: {
    name: "column",
    kind: "element",
    category: "product",
    props: {
      field: { type: "string", required: true },
      label: { type: "string", required: true },
      sortable: { type: "boolean", default: true },
      format: { type: "enum", enum: ["text", "currency", "date", "badge", "number", "boolean"], default: "text" },
      align: { type: "enum", enum: ["left", "center", "right"], default: "left" }
    }
  },
  "row-action": {
    name: "row-action",
    kind: "element",
    category: "product",
    props: {
      label: { type: "string", required: true },
      action: { type: "action", required: true },
      icon: { type: "string" },
      danger: { type: "boolean", default: false }
    }
  },
  list: {
    name: "list",
    kind: "container",
    category: "product",
    props: {
      divided: { type: "boolean", default: true },
      hoverable: { type: "boolean", default: true }
    }
  },
  "list-item": {
    name: "list-item",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string", required: true },
      description: { type: "string" },
      avatar: { type: "string" },
      badge: { type: "string" },
      action: { type: "action" }
    }
  },
  "description-list": {
    name: "description-list",
    kind: "container",
    category: "product",
    props: {
      columns: { type: "any", default: 2 }
    }
  },
  "description-item": {
    name: "description-item",
    kind: "element",
    category: "product",
    props: {
      label: { type: "string", required: true },
      value: { type: "string", required: true }
    }
  },
  // Forms
  form: {
    name: "form",
    kind: "container",
    category: "forms",
    props: {
      id: { type: "string" },
      submit: { type: "string", required: true },
      success: { type: "string" },
      error: { type: "string" },
      layout: { type: "enum", enum: ["vertical", "horizontal", "inline"], default: "vertical" }
    }
  },
  field: {
    name: "field",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string", required: true },
      type: {
        type: "enum",
        enum: ["text", "email", "password", "number", "tel", "url", "textarea", "select", "combobox", "checkbox", "radio", "switch", "date", "file", "slider"],
        default: "text"
      },
      placeholder: { type: "string" },
      required: { type: "boolean", default: false },
      options: { type: "any" },
      value: { type: "any" },
      min: { type: "number" },
      max: { type: "number" },
      step: { type: "number" },
      helpText: { type: "string" },
      disabled: { type: "boolean", default: false }
    }
  },
  input: {
    name: "input",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      type: { type: "enum", enum: ["text", "email", "password", "number", "tel", "url"], default: "text" },
      placeholder: { type: "string" },
      value: { type: "string" },
      required: { type: "boolean", default: false }
    }
  },
  textarea: {
    name: "textarea",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      placeholder: { type: "string" },
      rows: { type: "number", default: 4 },
      required: { type: "boolean", default: false }
    }
  },
  select: {
    name: "select",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      options: { type: "any", required: true },
      placeholder: { type: "string" },
      required: { type: "boolean", default: false }
    }
  },
  combobox: {
    name: "combobox",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      options: { type: "any", required: true },
      placeholder: { type: "string" },
      required: { type: "boolean", default: false }
    }
  },
  checkbox: {
    name: "checkbox",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string", required: true },
      checked: { type: "boolean", default: false }
    }
  },
  radio: {
    name: "radio",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string", required: true },
      value: { type: "string", required: true },
      checked: { type: "boolean", default: false }
    }
  },
  "radio-group": {
    name: "radio-group",
    kind: "container",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string" }
    }
  },
  switch: {
    name: "switch",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string", required: true },
      checked: { type: "boolean", default: false }
    }
  },
  date: {
    name: "date",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string" },
      required: { type: "boolean", default: false }
    }
  },
  file: {
    name: "file",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string" },
      accept: { type: "string" },
      multiple: { type: "boolean", default: false }
    }
  },
  slider: {
    name: "slider",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string" },
      min: { type: "number", default: 0 },
      max: { type: "number", default: 100 },
      step: { type: "number", default: 1 },
      value: { type: "number", default: 50 }
    }
  },
  // Content Extensions
  figure: {
    name: "figure",
    kind: "container",
    category: "content",
    props: {
      caption: { type: "string" },
      src: { type: "string" },
      alt: { type: "string" }
    }
  },
  // Navigation & Shell Extensions
  "command-menu": {
    name: "command-menu",
    kind: "container",
    category: "navigation",
    props: {
      id: { type: "string", default: "command-palette" },
      placeholder: { type: "string", default: "Type a command or search..." }
    }
  },
  "workspace-switcher": {
    name: "workspace-switcher",
    kind: "element",
    category: "navigation",
    props: {
      current: { type: "string", required: true },
      options: { type: "any", required: true }
    }
  },
  "user-menu": {
    name: "user-menu",
    kind: "container",
    category: "navigation",
    props: {
      name: { type: "string", required: true },
      email: { type: "string" },
      avatar: { type: "string" }
    }
  },
  topbar: {
    name: "topbar",
    kind: "container",
    category: "product",
    props: {}
  },
  // Action Extensions
  menu: {
    name: "menu",
    kind: "container",
    category: "actions",
    props: {
      label: { type: "string" }
    }
  },
  "menu-item": {
    name: "menu-item",
    kind: "element",
    category: "actions",
    props: {
      label: { type: "string", required: true },
      action: { type: "action" },
      href: { type: "string" },
      icon: { type: "string" },
      danger: { type: "boolean", default: false }
    }
  },
  "context-menu": {
    name: "context-menu",
    kind: "container",
    category: "actions",
    props: {
      target: { type: "string" }
    }
  },
  // Feedback Extensions
  "error-state": {
    name: "error-state",
    kind: "container",
    category: "feedback",
    props: {
      title: { type: "string", default: "Something went wrong" },
      description: { type: "string" },
      retryAction: { type: "action" },
      retryLabel: { type: "string", default: "Try Again" }
    }
  },
  // Overlay Extensions
  popover: {
    name: "popover",
    kind: "container",
    category: "overlay",
    props: {
      trigger: { type: "string", required: true },
      position: { type: "enum", enum: ["top", "bottom", "left", "right"], default: "bottom" }
    }
  },
  tooltip: {
    name: "tooltip",
    kind: "container",
    category: "overlay",
    props: {
      content: { type: "string", required: true },
      position: { type: "enum", enum: ["top", "bottom", "left", "right"], default: "top" }
    }
  },
  sheet: {
    name: "sheet",
    kind: "container",
    category: "overlay",
    props: {
      id: { type: "string", required: true },
      title: { type: "string", required: true }
    }
  },
  confirm: {
    name: "confirm",
    kind: "container",
    category: "overlay",
    props: {
      id: { type: "string", required: true },
      title: { type: "string", required: true },
      confirmLabel: { type: "string", default: "Confirm" },
      cancelLabel: { type: "string", default: "Cancel" },
      confirmAction: { type: "action", required: true }
    }
  },
  // Marketing Extensions
  "feature-showcase": {
    name: "feature-showcase",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      description: { type: "string" }
    }
  },
  "sticky-features": {
    name: "sticky-features",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" }
    }
  },
  comparison: {
    name: "comparison",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      description: { type: "string" }
    }
  },
  "comparison-row": {
    name: "comparison-row",
    kind: "element",
    category: "marketing",
    props: {
      feature: { type: "string", required: true },
      tier1: { type: "string", required: true },
      tier2: { type: "string", required: true },
      tier3: { type: "string", required: true }
    }
  },
  "case-study": {
    name: "case-study",
    kind: "container",
    category: "marketing",
    props: {
      client: { type: "string", required: true },
      metric: { type: "string" },
      metricLabel: { type: "string" },
      logo: { type: "string" }
    }
  },
  // Product Extensions
  "recent-items": {
    name: "recent-items",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string", default: "Recent Items" },
      source: { type: "source" }
    }
  },
  "progress-overview": {
    name: "progress-overview",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" },
      percentage: { type: "number" }
    }
  },
  tree: {
    name: "tree",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" }
    }
  },
  "tree-node": {
    name: "tree-node",
    kind: "container",
    category: "product",
    props: {
      label: { type: "string", required: true },
      icon: { type: "string", default: "folder" },
      open: { type: "boolean", default: false }
    }
  },
  kanban: {
    name: "kanban",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" }
    }
  },
  "kanban-column": {
    name: "kanban-column",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string", required: true },
      badge: { type: "string" }
    }
  },
  "kanban-card": {
    name: "kanban-card",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string", required: true },
      tag: { type: "string" },
      priority: { type: "enum", enum: ["low", "medium", "high", "urgent"], default: "medium" }
    }
  },
  calendar: {
    name: "calendar",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" },
      view: { type: "enum", enum: ["month", "week", "day"], default: "month" }
    }
  },
  // Data
  data: {
    name: "data",
    kind: "element",
    category: "data",
    props: {
      id: { type: "string", required: true },
      src: { type: "string", required: true },
      autoRefresh: { type: "number" },
      mock: { type: "any" }
    }
  }
};

// ../parser/dist/validator.js
function levenshtein(a, b) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0)
    return bn;
  if (bn === 0)
    return an;
  const matrix = [];
  for (let i = 0; i <= bn; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          // substitution
          matrix[i][j - 1] + 1,
          // insertion
          matrix[i - 1][j] + 1
          // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}
function findClosestMatch(target, candidates, maxDistance = 3) {
  let closest = void 0;
  let minDistance = maxDistance + 1;
  for (const candidate of candidates) {
    const dist = levenshtein(target.toLowerCase(), candidate.toLowerCase());
    if (dist < minDistance) {
      minDistance = dist;
      closest = candidate;
    }
  }
  return closest;
}
var KNOWN_ACTION_PREFIXES = [
  "open:",
  "close:",
  "toggle:",
  "refresh:",
  "delete:",
  "navigate:",
  "submit:",
  "toast:",
  "theme:",
  "copy:"
];
function validateAST(ast) {
  const diagnostics = [...ast.errors];
  const file = ast.loc.file || "unknown.wovemark.md";
  const fm = ast.frontmatter;
  if (fm.variance < 1 || fm.variance > 10) {
    diagnostics.push({
      severity: "warning",
      code: "INVALID_DIAL_RANGE",
      message: `Frontmatter dial 'variance' should be between 1 and 10, got ${fm.variance}.`,
      file,
      loc: fm.loc
    });
  }
  if (fm.motion < 0 || fm.motion > 10) {
    diagnostics.push({
      severity: "warning",
      code: "INVALID_DIAL_RANGE",
      message: `Frontmatter dial 'motion' should be between 0 and 10, got ${fm.motion}.`,
      file,
      loc: fm.loc
    });
  }
  if (fm.density < 1 || fm.density > 10) {
    diagnostics.push({
      severity: "warning",
      code: "INVALID_DIAL_RANGE",
      message: `Frontmatter dial 'density' should be between 1 and 10, got ${fm.density}.`,
      file,
      loc: fm.loc
    });
  }
  const declaredDataSources = /* @__PURE__ */ new Set();
  const declaredElementIds = /* @__PURE__ */ new Set();
  const allKnownComponentNames = Object.keys(COMPONENT_SCHEMAS);
  function walk(node) {
    if (node.type === "MarkdownContent") {
      return;
    }
    const isContainer = node.type === "ContainerDirective";
    const componentName = node.name;
    const loc = node.loc;
    const schema = COMPONENT_SCHEMAS[componentName];
    if (!schema) {
      const suggestion = findClosestMatch(componentName, allKnownComponentNames);
      diagnostics.push({
        severity: "error",
        code: "UNKNOWN_COMPONENT",
        message: `Unknown component '${componentName}'.`,
        suggestion: suggestion ? `Did you mean '${suggestion}'?` : void 0,
        file,
        loc
      });
    } else {
      if (isContainer && schema.kind === "element") {
        diagnostics.push({
          severity: "warning",
          code: "INVALID_COMPONENT_KIND",
          message: `Component '${componentName}' is an element directive, but was used as a container ':::${componentName}'. Use '::${componentName}' instead.`,
          file,
          loc
        });
      } else if (!isContainer && schema.kind === "container") {
        diagnostics.push({
          severity: "warning",
          code: "INVALID_COMPONENT_KIND",
          message: `Component '${componentName}' is a container directive, but was used as an element '::${componentName}'. Use ':::${componentName} ... :::' instead.`,
          file,
          loc
        });
      }
      if (typeof node.attributes.id === "string") {
        const idVal = node.attributes.id;
        if (componentName === "data") {
          declaredDataSources.add(idVal);
        }
        if (declaredElementIds.has(idVal)) {
          diagnostics.push({
            severity: "warning",
            code: "DUPLICATE_ID",
            message: `Duplicate ID '${idVal}' found on '${componentName}'.`,
            file,
            loc
          });
        } else {
          declaredElementIds.add(idVal);
        }
      }
      for (const [propName, propDef] of Object.entries(schema.props)) {
        if (propDef.required && !(propName in node.attributes)) {
          if (componentName === "button" && propName === "label" && isContainer) {
            continue;
          }
          diagnostics.push({
            severity: "error",
            code: "MISSING_REQUIRED_PROP",
            message: `Component '${componentName}' is missing required property '${propName}'.`,
            file,
            loc
          });
        }
      }
      const validProps = Object.keys(schema.props);
      const genericAllowedProps = ["id", "class", "key", "motion", "action", "style"];
      for (const [attrName, attrVal] of Object.entries(node.attributes)) {
        if (!schema.props[attrName] && !genericAllowedProps.includes(attrName)) {
          const suggestion = findClosestMatch(attrName, validProps);
          diagnostics.push({
            severity: "warning",
            code: "UNKNOWN_PROPERTY",
            message: `Component '${componentName}' has unknown property '${attrName}'.`,
            suggestion: suggestion ? `Did you mean '${suggestion}'?` : void 0,
            file,
            loc
          });
        } else if (schema.props[attrName]) {
          const propDef = schema.props[attrName];
          if (propDef.type === "enum" && propDef.enum && typeof attrVal === "string") {
            const match = propDef.enum.find((e) => String(e).toLowerCase() === attrVal.toLowerCase());
            if (!match) {
              const suggestion = findClosestMatch(attrVal, propDef.enum.map(String));
              diagnostics.push({
                severity: "warning",
                code: "INVALID_ENUM_VALUE",
                message: `Invalid value '${attrVal}' for property '${attrName}' on '${componentName}'. Allowed values: ${propDef.enum.join(", ")}.`,
                suggestion: suggestion ? `Did you mean '${suggestion}'?` : void 0,
                file,
                loc
              });
            }
          }
          if (propDef.type === "action" && typeof attrVal === "string") {
            validateActionString(attrVal, componentName, file, loc, diagnostics);
          }
        }
      }
    }
    if (node.type === "ContainerDirective" && node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }
  for (const child of ast.children) {
    walk(child);
  }
  return diagnostics;
}
function validateActionString(actionVal, componentName, file, loc, diagnostics) {
  const actions = actionVal.split(";").map((a) => a.trim()).filter(Boolean);
  for (const action of actions) {
    const hasKnownPrefix = KNOWN_ACTION_PREFIXES.some((prefix) => action.startsWith(prefix));
    if (!hasKnownPrefix && !action.startsWith("http://") && !action.startsWith("https://") && !action.startsWith("#")) {
      diagnostics.push({
        severity: "warning",
        code: "INVALID_ACTION_SYNTAX",
        message: `Unrecognized action format '${action}' on '${componentName}'. Expected action command like 'open:<id>', 'refresh:<id>', 'navigate:<path>', etc.`,
        file,
        loc
      });
    }
  }
}
function formatDiagnostic(diag) {
  const filePart = diag.file ? `${diag.file}:${diag.loc.start.line}:${diag.loc.start.column}` : `Line ${diag.loc.start.line}`;
  const severityTag = diag.severity === "error" ? "ERROR" : diag.severity === "warning" ? "WARNING" : "INFO";
  let out = `[${severityTag}] ${filePart} \u2014 ${diag.message}`;
  if (diag.suggestion) {
    out += `
  \u{1F4A1} ${diag.suggestion}`;
  }
  return out;
}

// src/theme/tokens.ts
var ACCENT_COLORS = {
  blue: { main: "#2563eb", hover: "#1d4ed8", light: "#eff6ff", text: "#ffffff" },
  indigo: { main: "#4f46e5", hover: "#4338ca", light: "#eef2ff", text: "#ffffff" },
  purple: { main: "#7c3aed", hover: "#6d28d9", light: "#f5f3ff", text: "#ffffff" },
  violet: { main: "#8b5cf6", hover: "#7c3aed", light: "#f5f3ff", text: "#ffffff" },
  rose: { main: "#e11d48", hover: "#be123c", light: "#fff1f2", text: "#ffffff" },
  red: { main: "#dc2626", hover: "#b91c1c", light: "#fef2f2", text: "#ffffff" },
  amber: { main: "#d97706", hover: "#b45309", light: "#fffbeb", text: "#ffffff" },
  emerald: { main: "#059669", hover: "#047857", light: "#ecfdf5", text: "#ffffff" },
  cyan: { main: "#0891b2", hover: "#0e7490", light: "#ecfeff", text: "#ffffff" },
  neutral: { main: "#27272a", hover: "#18181b", light: "#f4f4f5", text: "#ffffff" }
};
function applyThemeDials(container, config) {
  const root = container;
  const variance = Math.min(10, Math.max(1, config.variance ?? 5));
  const motion = Math.min(10, Math.max(0, config.motion ?? 5));
  const density = Math.min(10, Math.max(1, config.density ?? 5));
  const accentName = (config.accent || "blue").toLowerCase();
  const accent = ACCENT_COLORS[accentName] || ACCENT_COLORS.blue;
  root.style.setProperty("--wm-dial-variance", String(variance));
  root.style.setProperty("--wm-dial-motion", String(motion));
  root.style.setProperty("--wm-dial-density", String(density));
  const spaceBase = 1 - (density - 5) * 0.08;
  root.style.setProperty("--wm-density-factor", spaceBase.toFixed(2));
  root.style.setProperty("--wm-pad-base", `${Math.round(16 * spaceBase)}px`);
  root.style.setProperty("--wm-pad-sm", `${Math.round(8 * spaceBase)}px`);
  root.style.setProperty("--wm-pad-lg", `${Math.round(24 * spaceBase)}px`);
  root.style.setProperty("--wm-pad-xl", `${Math.round(36 * spaceBase)}px`);
  root.style.setProperty("--wm-gap-base", `${Math.round(16 * spaceBase)}px`);
  const motionDuration = motion === 0 ? "0ms" : `${Math.round(50 + motion * 40)}ms`;
  root.style.setProperty("--wm-motion-duration", motionDuration);
  root.style.setProperty("--wm-motion-scale", motion === 0 ? "0" : (motion / 5).toFixed(2));
  root.style.setProperty("--wm-color-accent", accent.main);
  root.style.setProperty("--wm-color-accent-hover", accent.hover);
  root.style.setProperty("--wm-color-accent-light", accent.light);
  root.style.setProperty("--wm-color-accent-text", accent.text);
  const theme = config.theme || "system";
  root.setAttribute("data-wm-theme", theme);
}

// src/router/router.ts
var WovemarkRouter = class {
  mountEl = null;
  basePath = "";
  debug = true;
  pageCache = /* @__PURE__ */ new Map();
  currentFilePath = "";
  scrollPositions = /* @__PURE__ */ new Map();
  lastRoute = "";
  constructor(options) {
    if (typeof document !== "undefined") {
      this.mountEl = typeof options.mount === "string" ? document.querySelector(options.mount) : options.mount;
      this.basePath = options.basePath || "";
      this.debug = options.debug !== false;
      this.init();
    }
  }
  init() {
    window.addEventListener("hashchange", () => {
      if (this.lastRoute) {
        this.scrollPositions.set(this.lastRoute, window.scrollY || window.pageYOffset || 0);
      }
      this.handleRouteChange();
    });
    dataStore.subscribe((snapshot) => {
      this.reRenderCurrentPage(snapshot);
    });
    this.handleRouteChange();
  }
  async handleRouteChange() {
    const rawHash = window.location.hash.replace(/^#\/?/, "");
    const [routePart, queryPart] = rawHash.split("?");
    const cleanRoute = (routePart || "").trim();
    this.lastRoute = cleanRoute || "index";
    const fileName = cleanRoute ? `${cleanRoute}.wovemark.md` : "index.wovemark.md";
    const filePath = this.basePath ? `${this.basePath.replace(/\/$/, "")}/${fileName}` : fileName;
    const queryParams = {};
    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      searchParams.forEach((val, key) => {
        queryParams[key] = val;
      });
    }
    await this.loadPage(filePath, queryParams);
  }
  async loadPage(filePath, queryParams = {}) {
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
    } catch (err) {
      this.render404(filePath, err.message);
    }
  }
  async renderPage(source, filePath, queryParams = {}) {
    if (!this.mountEl) return;
    const ast = parseWovemark(source, { file: filePath });
    const diagnostics = validateAST(ast);
    for (const ds of ast.dataSources) {
      const id = String(ds.attributes.id || "");
      const src = String(ds.attributes.src || "");
      const mock = ds.attributes.mock;
      const autoRefresh = typeof ds.attributes.autoRefresh === "number" ? ds.attributes.autoRefresh : void 0;
      if (id && src) {
        dataStore.registerSource(id, src, mock, autoRefresh);
      }
    }
    if (ast.frontmatter.title) {
      document.title = ast.frontmatter.title;
    }
    applyThemeDials(document.documentElement, {
      theme: ast.frontmatter.theme,
      variance: ast.frontmatter.variance,
      motion: ast.frontmatter.motion,
      density: ast.frontmatter.density,
      accent: ast.frontmatter.accent
    });
    await motionEngine.transitionPage(() => {
      if (!this.mountEl) return;
      const context = {
        ...dataStore.getStateSnapshot(),
        $query: queryParams
      };
      const html = renderAST(ast, context);
      const errorOverlayHtml = this.debug && diagnostics.length > 0 ? this.renderErrorOverlay(diagnostics, filePath) : "";
      this.mountEl.innerHTML = `${html}${errorOverlayHtml}`;
      this.syncActiveNavLinks();
      motionEngine.attach(this.mountEl);
      const savedScroll = this.scrollPositions.get(this.lastRoute);
      if (typeof savedScroll === "number") {
        window.scrollTo(0, savedScroll);
      } else {
        window.scrollTo(0, 0);
      }
    });
  }
  syncActiveNavLinks() {
    if (!this.mountEl) return;
    const currentHash = window.location.hash || "#";
    const cleanHash = currentHash.split("?")[0];
    this.mountEl.querySelectorAll(".wm-nav-link, .wm-sidebar-item").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      const isMatch = cleanHash === "#" && (href === "#" || href === "" || href === "#/") || href === cleanHash;
      if (isMatch) {
        link.classList.add("wm-active");
      } else {
        link.classList.remove("wm-active");
      }
    });
  }
  reRenderCurrentPage(snapshot) {
    if (!this.mountEl || !this.currentFilePath) return;
    const source = this.pageCache.get(this.currentFilePath);
    if (!source) return;
    const ast = parseWovemark(source, { file: this.currentFilePath });
    const html = renderAST(ast, snapshot);
    this.mountEl.innerHTML = html;
    this.syncActiveNavLinks();
    motionEngine.attach(this.mountEl);
  }
  renderErrorOverlay(diagnostics, filePath) {
    const errorCount = diagnostics.filter((d) => d.severity === "error").length;
    const warnCount = diagnostics.filter((d) => d.severity === "warning").length;
    const items = diagnostics.map(
      (d) => `
      <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1)">
        <div style="display:flex;gap:8px;align-items:center">
          <span style="background:${d.severity === "error" ? "#ef4444" : "#f59e0b"};color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700">${d.severity.toUpperCase()}</span>
          <span style="color:#94a3b8;font-family:monospace;font-size:12px">${filePath}:${d.loc.start.line}:${d.loc.start.column}</span>
        </div>
        <div style="color:#f8fafc;margin-top:4px;font-size:13px">${d.message}</div>
        ${d.suggestion ? `<div style="color:#38bdf8;font-size:12px;margin-top:2px">\u{1F4A1} ${d.suggestion}</div>` : ""}
      </div>
    `
    ).join("");
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
  render404(filePath, message) {
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
};

// src/index.ts
function createWovemark(options = { mount: "#app" }) {
  const router = new WovemarkRouter(options);
  return router;
}
function use(plugin) {
  plugin.install({
    componentRegistry,
    dataStore,
    actionEngine,
    motionEngine
  });
}
if (typeof window !== "undefined" && typeof document !== "undefined") {
  window.Wovemark = {
    createWovemark,
    use,
    dataStore,
    actionEngine,
    motionEngine,
    componentRegistry,
    renderAST,
    applyThemeDials
  };
}
export {
  ACCENT_COLORS,
  ActionEngine,
  COMPONENT_SCHEMAS,
  ComponentRegistry,
  DataStore,
  MotionEngine,
  WovemarkRouter,
  actionEngine,
  applyThemeDials,
  componentRegistry,
  createWovemark,
  dataStore,
  evaluateExpression,
  extractBindings,
  extractFrontmatter,
  findClosestMatch,
  formatDiagnostic,
  getNestedValue,
  interpolateBindings,
  levenshtein,
  motionEngine,
  parseAttributes,
  parseWovemark,
  parseYamlSimple,
  renderAST,
  renderIcon,
  renderInlineMarkdown,
  renderMarkdown,
  renderSvgChart,
  sanitizeHtml,
  use,
  validateAST
};
//# sourceMappingURL=index.js.map
