import { ComponentSchema } from "./types.js";

/**
 * Standard Wovemark Component Schemas
 */
export const COMPONENT_SCHEMAS: Record<string, ComponentSchema> = {
  // Foundation
  container: {
    name: "container",
    kind: "container",
    category: "foundation",
    props: {
      size: { type: "enum", enum: ["sm", "md", "lg", "xl", "full"], default: "lg" },
      class: { type: "string" },
    },
  },
  section: {
    name: "section",
    kind: "container",
    category: "foundation",
    props: {
      variant: { type: "enum", enum: ["default", "muted", "surface", "accent"], default: "default" },
      id: { type: "string" },
      class: { type: "string" },
    },
  },
  stack: {
    name: "stack",
    kind: "container",
    category: "foundation",
    props: {
      gap: { type: "enum", enum: ["xs", "sm", "md", "lg", "xl"], default: "md" },
      align: { type: "enum", enum: ["start", "center", "end", "stretch"], default: "stretch" },
    },
  },
  cluster: {
    name: "cluster",
    kind: "container",
    category: "foundation",
    props: {
      gap: { type: "enum", enum: ["xs", "sm", "md", "lg"], default: "sm" },
      align: { type: "enum", enum: ["start", "center", "end", "baseline"], default: "center" },
      justify: { type: "enum", enum: ["start", "center", "end", "between"], default: "start" },
    },
  },
  grid: {
    name: "grid",
    kind: "container",
    category: "foundation",
    props: {
      columns: { type: "any", default: "3" },
      gap: { type: "enum", enum: ["sm", "md", "lg", "xl"], default: "md" },
    },
  },
  split: {
    name: "split",
    kind: "container",
    category: "foundation",
    props: {
      ratio: { type: "enum", enum: ["50-50", "60-40", "40-60", "70-30", "30-70"], default: "50-50" },
      reverseOnMobile: { type: "boolean", default: false },
    },
  },
  divider: {
    name: "divider",
    kind: "element",
    category: "foundation",
    props: {
      orientation: { type: "enum", enum: ["horizontal", "vertical"], default: "horizontal" },
      label: { type: "string" },
    },
  },
  spacer: {
    name: "spacer",
    kind: "element",
    category: "foundation",
    props: {
      size: { type: "enum", enum: ["xs", "sm", "md", "lg", "xl"], default: "md" },
    },
  },
  surface: {
    name: "surface",
    kind: "container",
    category: "foundation",
    props: {
      elevation: { type: "enum", enum: ["none", "sm", "md", "lg"], default: "sm" },
      border: { type: "boolean", default: true },
      padding: { type: "enum", enum: ["none", "sm", "md", "lg"], default: "md" },
    },
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
      variant: { type: "enum", enum: ["default", "outline", "ghost", "gradient"], default: "default" },
    },
  },

  // Content
  heading: {
    name: "heading",
    kind: "both",
    category: "content",
    props: {
      level: { type: "enum", enum: ["1", "2", "3", "4", "5", "6", 1, 2, 3, 4, 5, 6], default: 2 },
      gradient: { type: "boolean", default: false },
      text: { type: "string" },
    },
  },
  text: {
    name: "text",
    kind: "both",
    category: "content",
    props: {
      variant: { type: "enum", enum: ["lead", "body", "muted", "small"], default: "body" },
      align: { type: "enum", enum: ["left", "center", "right"], default: "left" },
    },
  },
  badge: {
    name: "badge",
    kind: "element",
    category: "content",
    props: {
      label: { type: "string", required: true },
      variant: { type: "enum", enum: ["default", "accent", "success", "warning", "danger", "outline"], default: "default" },
      icon: { type: "string" },
    },
  },
  icon: {
    name: "icon",
    kind: "element",
    category: "content",
    props: {
      name: { type: "string", required: true },
      size: { type: "enum", enum: ["sm", "md", "lg", "xl"], default: "md" },
      class: { type: "string" },
    },
  },
  quote: {
    name: "quote",
    kind: "container",
    category: "content",
    props: {
      author: { type: "string" },
      role: { type: "string" },
      avatar: { type: "string" },
    },
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
      shadow: { type: "boolean", default: false },
    },
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
      controls: { type: "boolean", default: true },
    },
  },
  gallery: {
    name: "gallery",
    kind: "container",
    category: "content",
    props: {
      columns: { type: "any", default: 3 },
      motion: { type: "string", default: "stagger" },
    },
  },
  code: {
    name: "code",
    kind: "both",
    category: "content",
    props: {
      lang: { type: "string", default: "text" },
      filename: { type: "string" },
      code: { type: "string" },
      copyable: { type: "boolean", default: true },
    },
  },
  callout: {
    name: "callout",
    kind: "container",
    category: "content",
    props: {
      variant: { type: "enum", enum: ["info", "success", "warning", "danger", "tip", "note"], default: "info" },
      title: { type: "string" },
      icon: { type: "string" },
    },
  },
  accordion: {
    name: "accordion",
    kind: "container",
    category: "content",
    props: {
      type: { type: "enum", enum: ["single", "multiple"], default: "single" },
    },
  },
  "accordion-item": {
    name: "accordion-item",
    kind: "container",
    category: "content",
    props: {
      title: { type: "string", required: true },
      open: { type: "boolean", default: false },
    },
  },
  timeline: {
    name: "timeline",
    kind: "container",
    category: "content",
    props: {
      orientation: { type: "enum", enum: ["vertical", "horizontal"], default: "vertical" },
    },
  },
  "timeline-item": {
    name: "timeline-item",
    kind: "container",
    category: "content",
    props: {
      title: { type: "string", required: true },
      date: { type: "string" },
      icon: { type: "string" },
      status: { type: "enum", enum: ["completed", "current", "upcoming"], default: "completed" },
    },
  },

  // Navigation
  navbar: {
    name: "navbar",
    kind: "container",
    category: "navigation",
    props: {
      title: { type: "string" },
      logo: { type: "string" },
      sticky: { type: "boolean", default: true },
    },
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
      active: { type: "boolean", default: false },
    },
  },
  sidebar: {
    name: "sidebar",
    kind: "container",
    category: "navigation",
    props: {
      title: { type: "string" },
      logo: { type: "string" },
      collapsible: { type: "boolean", default: true },
    },
  },
  "sidebar-group": {
    name: "sidebar-group",
    kind: "container",
    category: "navigation",
    props: {
      label: { type: "string", required: true },
    },
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
      active: { type: "boolean", default: false },
    },
  },
  breadcrumbs: {
    name: "breadcrumbs",
    kind: "container",
    category: "navigation",
    props: {
      separator: { type: "string", default: "/" },
    },
  },
  "breadcrumb-item": {
    name: "breadcrumb-item",
    kind: "element",
    category: "navigation",
    props: {
      label: { type: "string", required: true },
      href: { type: "string" },
    },
  },
  tabs: {
    name: "tabs",
    kind: "container",
    category: "navigation",
    props: {
      id: { type: "string" },
      variant: { type: "enum", enum: ["underline", "pill", "enclosed"], default: "underline" },
      defaultTab: { type: "string" },
    },
  },
  "tab-item": {
    name: "tab-item",
    kind: "container",
    category: "navigation",
    props: {
      id: { type: "string", required: true },
      label: { type: "string", required: true },
      icon: { type: "string" },
    },
  },
  pagination: {
    name: "pagination",
    kind: "element",
    category: "navigation",
    props: {
      current: { type: "number", default: 1 },
      total: { type: "number", default: 1 },
      action: { type: "action" },
    },
  },
  footer: {
    name: "footer",
    kind: "container",
    category: "navigation",
    props: {
      copyright: { type: "string" },
      columns: { type: "any", default: 4 },
    },
  },
  "footer-column": {
    name: "footer-column",
    kind: "container",
    category: "navigation",
    props: {
      title: { type: "string", required: true },
    },
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
      loading: { type: "boolean", default: false },
    },
  },
  "button-group": {
    name: "button-group",
    kind: "container",
    category: "actions",
    props: {
      size: { type: "enum", enum: ["sm", "md", "lg"], default: "md" },
    },
  },
  dropdown: {
    name: "dropdown",
    kind: "container",
    category: "actions",
    props: {
      label: { type: "string", required: true },
      icon: { type: "string" },
      variant: { type: "enum", enum: ["primary", "secondary", "outline", "ghost"], default: "outline" },
    },
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
      danger: { type: "boolean", default: false },
    },
  },

  // Feedback
  alert: {
    name: "alert",
    kind: "container",
    category: "feedback",
    props: {
      variant: { type: "enum", enum: ["info", "success", "warning", "danger"], default: "info" },
      title: { type: "string" },
      dismissible: { type: "boolean", default: false },
    },
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
      variant: { type: "enum", enum: ["default", "accent", "success", "warning", "danger"], default: "accent" },
    },
  },
  skeleton: {
    name: "skeleton",
    kind: "element",
    category: "feedback",
    props: {
      type: { type: "enum", enum: ["text", "circle", "rect", "card", "table"], default: "text" },
      width: { type: "string" },
      height: { type: "string" },
      count: { type: "number", default: 1 },
    },
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
      action: { type: "action" },
    },
  },
  loading: {
    name: "loading",
    kind: "element",
    category: "feedback",
    props: {
      label: { type: "string", default: "Loading..." },
      size: { type: "enum", enum: ["sm", "md", "lg"], default: "md" },
    },
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
      size: { type: "enum", enum: ["sm", "md", "lg", "xl", "full"], default: "md" },
    },
  },
  drawer: {
    name: "drawer",
    kind: "container",
    category: "overlay",
    props: {
      id: { type: "string", required: true },
      title: { type: "string", required: true },
      position: { type: "enum", enum: ["left", "right", "bottom"], default: "right" },
      size: { type: "enum", enum: ["sm", "md", "lg"], default: "md" },
    },
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
      motion: { type: "string", default: "reveal" },
    },
  },
  "logo-wall": {
    name: "logo-wall",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      variant: { type: "enum", enum: ["marquee", "grid"], default: "grid" },
    },
  },
  "logo-item": {
    name: "logo-item",
    kind: "element",
    category: "marketing",
    props: {
      src: { type: "string", required: true },
      alt: { type: "string", default: "Partner logo" },
      name: { type: "string" },
    },
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
      align: { type: "enum", enum: ["left", "center"], default: "left" },
    },
  },
  "feature-list": {
    name: "feature-list",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      description: { type: "string" },
    },
  },
  bento: {
    name: "bento",
    kind: "container",
    category: "marketing",
    props: {
      columns: { type: "any", default: 3 },
      title: { type: "string" },
      description: { type: "string" },
    },
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
      variant: { type: "enum", enum: ["default", "accent", "surface", "gradient"], default: "default" },
    },
  },
  stats: {
    name: "stats",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      columns: { type: "any", default: 4 },
      variant: { type: "enum", enum: ["grid", "split"], default: "grid" },
    },
  },
  "stat-item": {
    name: "stat-item",
    kind: "element",
    category: "marketing",
    props: {
      value: { type: "string", required: true },
      label: { type: "string", required: true },
      change: { type: "string" },
      trend: { type: "enum", enum: ["up", "down", "neutral"] },
    },
  },
  testimonials: {
    name: "testimonials",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      description: { type: "string" },
      columns: { type: "any", default: 3 },
      variant: { type: "enum", enum: ["grid", "masonry", "carousel"], default: "grid" },
    },
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
      rating: { type: "number", default: 5 },
    },
  },
  pricing: {
    name: "pricing",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      badge: { type: "string" },
      description: { type: "string" },
      billingToggle: { type: "boolean", default: true },
    },
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
      ctaVariant: { type: "enum", enum: ["primary", "outline", "secondary"], default: "primary" },
    },
  },
  faq: {
    name: "faq",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string", default: "Frequently Asked Questions" },
      description: { type: "string" },
      columns: { type: "any", default: 1 },
    },
  },
  "faq-item": {
    name: "faq-item",
    kind: "container",
    category: "marketing",
    props: {
      question: { type: "string", required: true },
    },
  },
  cta: {
    name: "cta",
    kind: "container",
    category: "marketing",
    props: {
      variant: { type: "enum", enum: ["centered", "split", "card", "accent"], default: "card" },
      badge: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
    },
  },
  newsletter: {
    name: "newsletter",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      description: { type: "string" },
      submit: { type: "string" },
      buttonLabel: { type: "string", default: "Subscribe" },
    },
  },
  contact: {
    name: "contact",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string", default: "Contact Us" },
      description: { type: "string" },
      submit: { type: "string" },
    },
  },

  // Product UI
  "app-shell": {
    name: "app-shell",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" },
      logo: { type: "string" },
      sidebarWidth: { type: "string", default: "260px" },
    },
  },
  "page-header": {
    name: "page-header",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string", required: true },
      description: { type: "string" },
      badge: { type: "string" },
    },
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
      helpText: { type: "string" },
    },
  },
  "metric-grid": {
    name: "metric-grid",
    kind: "container",
    category: "product",
    props: {
      columns: { type: "any", default: 4 },
    },
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
      height: { type: "number", default: 280 },
    },
  },
  "activity-feed": {
    name: "activity-feed",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" },
      source: { type: "source" },
    },
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
      badge: { type: "string" },
    },
  },
  "quick-actions": {
    name: "quick-actions",
    kind: "container",
    category: "product",
    props: {
      columns: { type: "any", default: 4 },
    },
  },
  "status-overview": {
    name: "status-overview",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" },
    },
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
      emptyTitle: { type: "string", default: "No records found" },
    },
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
      align: { type: "enum", enum: ["left", "center", "right"], default: "left" },
    },
  },
  "row-action": {
    name: "row-action",
    kind: "element",
    category: "product",
    props: {
      label: { type: "string", required: true },
      action: { type: "action", required: true },
      icon: { type: "string" },
      danger: { type: "boolean", default: false },
    },
  },
  list: {
    name: "list",
    kind: "container",
    category: "product",
    props: {
      divided: { type: "boolean", default: true },
      hoverable: { type: "boolean", default: true },
    },
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
      action: { type: "action" },
    },
  },
  "description-list": {
    name: "description-list",
    kind: "container",
    category: "product",
    props: {
      columns: { type: "any", default: 2 },
    },
  },
  "description-item": {
    name: "description-item",
    kind: "element",
    category: "product",
    props: {
      label: { type: "string", required: true },
      value: { type: "string", required: true },
    },
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
      layout: { type: "enum", enum: ["vertical", "horizontal", "inline"], default: "vertical" },
    },
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
        default: "text",
      },
      placeholder: { type: "string" },
      required: { type: "boolean", default: false },
      options: { type: "any" },
      value: { type: "any" },
      min: { type: "number" },
      max: { type: "number" },
      step: { type: "number" },
      helpText: { type: "string" },
      disabled: { type: "boolean", default: false },
    },
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
      required: { type: "boolean", default: false },
    },
  },
  textarea: {
    name: "textarea",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      placeholder: { type: "string" },
      rows: { type: "number", default: 4 },
      required: { type: "boolean", default: false },
    },
  },
  select: {
    name: "select",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      options: { type: "any", required: true },
      placeholder: { type: "string" },
      required: { type: "boolean", default: false },
    },
  },
  combobox: {
    name: "combobox",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      options: { type: "any", required: true },
      placeholder: { type: "string" },
      required: { type: "boolean", default: false },
    },
  },
  checkbox: {
    name: "checkbox",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string", required: true },
      checked: { type: "boolean", default: false },
    },
  },
  radio: {
    name: "radio",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string", required: true },
      value: { type: "string", required: true },
      checked: { type: "boolean", default: false },
    },
  },
  "radio-group": {
    name: "radio-group",
    kind: "container",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string" },
    },
  },
  switch: {
    name: "switch",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string", required: true },
      checked: { type: "boolean", default: false },
    },
  },
  date: {
    name: "date",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string" },
      required: { type: "boolean", default: false },
    },
  },
  file: {
    name: "file",
    kind: "element",
    category: "forms",
    props: {
      name: { type: "string", required: true },
      label: { type: "string" },
      accept: { type: "string" },
      multiple: { type: "boolean", default: false },
    },
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
      value: { type: "number", default: 50 },
    },
  },

  // Content Extensions
  figure: {
    name: "figure",
    kind: "container",
    category: "content",
    props: {
      caption: { type: "string" },
      src: { type: "string" },
      alt: { type: "string" },
    },
  },

  // Navigation & Shell Extensions
  "command-menu": {
    name: "command-menu",
    kind: "container",
    category: "navigation",
    props: {
      id: { type: "string", default: "command-palette" },
      placeholder: { type: "string", default: "Type a command or search..." },
    },
  },
  "workspace-switcher": {
    name: "workspace-switcher",
    kind: "element",
    category: "navigation",
    props: {
      current: { type: "string", required: true },
      options: { type: "any", required: true },
    },
  },
  "user-menu": {
    name: "user-menu",
    kind: "container",
    category: "navigation",
    props: {
      name: { type: "string", required: true },
      email: { type: "string" },
      avatar: { type: "string" },
    },
  },
  topbar: {
    name: "topbar",
    kind: "container",
    category: "product",
    props: {},
  },

  // Action Extensions
  menu: {
    name: "menu",
    kind: "container",
    category: "actions",
    props: {
      label: { type: "string" },
    },
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
      danger: { type: "boolean", default: false },
    },
  },
  "context-menu": {
    name: "context-menu",
    kind: "container",
    category: "actions",
    props: {
      target: { type: "string" },
    },
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
      retryLabel: { type: "string", default: "Try Again" },
    },
  },

  // Overlay Extensions
  popover: {
    name: "popover",
    kind: "container",
    category: "overlay",
    props: {
      trigger: { type: "string", required: true },
      position: { type: "enum", enum: ["top", "bottom", "left", "right"], default: "bottom" },
    },
  },
  tooltip: {
    name: "tooltip",
    kind: "container",
    category: "overlay",
    props: {
      content: { type: "string", required: true },
      position: { type: "enum", enum: ["top", "bottom", "left", "right"], default: "top" },
    },
  },
  sheet: {
    name: "sheet",
    kind: "container",
    category: "overlay",
    props: {
      id: { type: "string", required: true },
      title: { type: "string", required: true },
    },
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
      confirmAction: { type: "action", required: true },
    },
  },

  // Marketing Extensions
  "feature-showcase": {
    name: "feature-showcase",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      description: { type: "string" },
    },
  },
  "sticky-features": {
    name: "sticky-features",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
    },
  },
  comparison: {
    name: "comparison",
    kind: "container",
    category: "marketing",
    props: {
      title: { type: "string" },
      description: { type: "string" },
    },
  },
  "comparison-row": {
    name: "comparison-row",
    kind: "element",
    category: "marketing",
    props: {
      feature: { type: "string", required: true },
      tier1: { type: "string", required: true },
      tier2: { type: "string", required: true },
      tier3: { type: "string", required: true },
    },
  },
  "case-study": {
    name: "case-study",
    kind: "container",
    category: "marketing",
    props: {
      client: { type: "string", required: true },
      metric: { type: "string" },
      metricLabel: { type: "string" },
      logo: { type: "string" },
    },
  },

  // Product Extensions
  "recent-items": {
    name: "recent-items",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string", default: "Recent Items" },
      source: { type: "source" },
    },
  },
  "progress-overview": {
    name: "progress-overview",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" },
      percentage: { type: "number" },
    },
  },
  tree: {
    name: "tree",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" },
    },
  },
  "tree-node": {
    name: "tree-node",
    kind: "container",
    category: "product",
    props: {
      label: { type: "string", required: true },
      icon: { type: "string", default: "folder" },
      open: { type: "boolean", default: false },
    },
  },
  kanban: {
    name: "kanban",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" },
    },
  },
  "kanban-column": {
    name: "kanban-column",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string", required: true },
      badge: { type: "string" },
    },
  },
  "kanban-card": {
    name: "kanban-card",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string", required: true },
      tag: { type: "string" },
      priority: { type: "enum", enum: ["low", "medium", "high", "urgent"], default: "medium" },
    },
  },
  calendar: {
    name: "calendar",
    kind: "container",
    category: "product",
    props: {
      title: { type: "string" },
      view: { type: "enum", enum: ["month", "week", "day"], default: "month" },
    },
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
      mock: { type: "any" },
    },
  },
};
