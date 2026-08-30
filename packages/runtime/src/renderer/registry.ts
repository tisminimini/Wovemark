import {
  ContainerDirectiveNode,
  ElementDirectiveNode,
  MarkdownContentNode,
  RootNode,
  WovemarkChildNode,
} from "@wovemark/parser";
import { renderSvgChart } from "./charts.js";
import { interpolateBindings } from "../data/evaluator.js";
import { renderIcon } from "../icons/icons.js";
import { renderInlineMarkdown, renderMarkdown } from "./markdown.js";

export type ComponentRenderer = (
  node: ContainerDirectiveNode | ElementDirectiveNode,
  childrenHtml: string,
  context: Record<string, any>
) => string;

export class ComponentRegistry {
  private renderers: Map<string, ComponentRenderer> = new Map();

  constructor() {
    this.registerDefaults();
  }

  public register(name: string, renderer: ComponentRenderer) {
    this.renderers.set(name, renderer);
  }

  public get(name: string): ComponentRenderer | undefined {
    return this.renderers.get(name);
  }

  private registerDefaults() {
    // Foundation
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
          ${(title || icon || badge) ? `
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

    // Content
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

    // Navigation
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
      const tabItems: Array<{ id: string; label: string }> = [];
      if (node.type === "ContainerDirective" && node.children) {
        node.children.forEach((c, idx) => {
          if (c.type === "ContainerDirective" && c.name === "tab-item") {
            const id = String(c.attributes.id || `tab-${idx}`);
            const label = String(c.attributes.label || `Tab ${idx + 1}`);
            tabItems.push({ id, label });
          }
        });
      }

      const headerHtml = tabItems.length > 0
        ? `<div class="wm-tabs-header">
            ${tabItems.map((t, idx) => `
              <button type="button" class="wm-tab-btn ${idx === 0 ? "wm-active" : ""}" data-target="${t.id}">
                ${t.label}
              </button>
            `).join("")}
          </div>`
        : "";

      // Ensure the first tab panel has wm-active if none have it
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
      const copyright = node.attributes.copyright || `© ${new Date().getFullYear()} Wovemark. All rights reserved.`;
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

    // Actions
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

    // Feedback
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
      const pct = Math.min(100, Math.max(0, Math.round((val / max) * 100)));
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

    // Overlay
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

    // Marketing Blocks
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
            ${(title || badge || desc) ? `
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

    // Product UI
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
      const type = (node.attributes.type as any) || "line";
      const sourceKey = node.attributes.source ? String(node.attributes.source) : "";

      let chartData: any[] = [];
      if (sourceKey && context[sourceKey]) {
        chartData = context[sourceKey];
      } else {
        // Sample default data points
        chartData = [
          { label: "Mon", value: 34 },
          { label: "Tue", value: 52 },
          { label: "Wed", value: 48 },
          { label: "Thu", value: 71 },
          { label: "Fri", value: 65 },
          { label: "Sat", value: 89 },
          { label: "Sun", value: 95 },
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
      const items: any[] = Array.isArray(context[sourceKey]) ? context[sourceKey] : [];
      const pageSize = Number(node.attributes.pageSize || 10);
      const isPaginationEnabled = node.attributes.pagination !== false && items.length > pageSize;

      // Extract explicit column fields if defined in node children
      const explicitFields: string[] = [];
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
                ${items.length === 0
                  ? `<tr><td colspan="12" style="text-align:center;padding:32px;color:var(--wm-text-muted)">${node.attributes.emptyTitle || "No records found"}</td></tr>`
                  : items.map((item: any, idx: number) => {
                      const fieldsToRender = explicitFields.length > 0 ? explicitFields : Object.keys(item);
                      const isVisible = idx < pageSize;
                      return `
                        <tr data-row-index="${idx}" style="${isVisible ? "" : "display:none"}">
                          ${fieldsToRender.map((k) => {
                            const val = item[k];
                            if (val === null || val === undefined) return `<td></td>`;
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

    // Forms
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
        const optionsList = Array.isArray(optionsRaw)
          ? optionsRaw
          : typeof optionsRaw === "string"
          ? optionsRaw.split(",").map((s) => s.trim())
          : [];

        inputHtml = `
          <select name="${name}" class="wm-select" ${required ? "required" : ""}>
            <option value="">Select option...</option>
            ${optionsList.map((opt: any) => `<option value="${opt}">${opt}</option>`).join("")}
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

    // Form Inputs & Fields
    this.register("combobox", (node) => {
      const name = node.attributes.name || "";
      const optionsRaw = node.attributes.options;
      const optionsList = Array.isArray(optionsRaw)
        ? optionsRaw
        : typeof optionsRaw === "string"
        ? optionsRaw.split(",").map((s) => s.trim())
        : [];
      return `
        <div class="wm-combobox-wrapper">
          <input list="list-${name}" name="${name}" class="wm-input" placeholder="${node.attributes.placeholder || 'Type or select...'}" />
          <datalist id="list-${name}">
            ${optionsList.map((opt: any) => `<option value="${opt}"></option>`).join("")}
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

    // Content Extensions
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

    // Navigation & Shell Extensions
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

    // Action Extensions
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

    // Feedback Extensions
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

    // Overlay Extensions
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

    // Marketing Extensions
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

    // Product UI Extensions: Kanban, Tree, Calendar
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
}

export const componentRegistry = new ComponentRegistry();

export function renderAST(ast: RootNode, context: Record<string, any> = {}): string {
  const layout = ast.frontmatter.layout || "default";

  function renderNode(node: WovemarkChildNode): string {
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

    // Fallback container
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
