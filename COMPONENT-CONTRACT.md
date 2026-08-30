# Wovemark Component Contract (CONTRACT-1.0)

Every component registered in Wovemark satisfies this formal contract.

---

## 1. Component Specification Structure

A registered component definition includes:

```typescript
export interface WovemarkComponentContract {
  name: string;
  category: "foundation" | "content" | "navigation" | "actions" | "feedback" | "overlay" | "marketing" | "product" | "forms";
  kind: "container" | "element";
  purpose: string;
  props: Record<string, PropDefinition>;
  defaultProps?: Record<string, unknown>;
  variants?: string[];
  supportedDials: {
    variance?: boolean; // Does it adjust structure based on variance dial?
    motion?: boolean;   // Does it animate according to motion dial?
    density?: boolean;  // Does it pack tighter according to density dial?
  };
  responsiveBehavior: string;
  accessibilityRules: string[];
  antiPatterns: string[];
}

export interface PropDefinition {
  type: "string" | "number" | "boolean" | "enum" | "array" | "action" | "source";
  required?: boolean;
  default?: unknown;
  enum?: string[];
  description: string;
}
```

---

## 2. Core Families & Component Directory

### 2.1 Foundation Components
- `container`: Semantic page width constraining wrapper (`size="sm" | "md" | "lg" | "xl" | "full"`).
- `section`: Major vertical slice with background styling (`variant="default" | "muted" | "surface" | "accent"`).
- `stack`: Vertical flex layout with automatic token-based gap (`gap="sm" | "md" | "lg"`, `align="start" | "center" | "end"`).
- `cluster`: Horizontal wrap flex layout for tags, button groups, badge lists.
- `grid`: Responsive column grid (`columns="1" | "2" | "3" | "4" | "auto"`, `gap="sm" | "md" | "lg"`).
- `split`: Two-column split layout (`ratio="50-50" | "60-40" | "70-30" | "40-60" | "30-70"`).
- `divider`: Horizontal or vertical separator (`orientation="horizontal" | "vertical"`, `label="Or"`).
- `spacer`: Vertical breathing room (`size="sm" | "md" | "lg" | "xl"`).
- `surface`: Elevated card/panel background container (`elevation="none" | "sm" | "md" | "lg"`).

### 2.2 Content Components
- `heading`: Semantic title with automatic ID anchor generation (`level="1" | "2" | "3" | "4"`, `gradient=true`).
- `text`: Typography paragraph with muted/lead styling (`variant="lead" | "body" | "muted" | "small"`).
- `quote`: Blockquote with author and citation (`author="Ada Lovelace"`, `role="Mathematician"`).
- `image`: Responsive image with lazy loading, aspect ratio, and lightbox (`src`, `alt`, `aspect="16/9" | "4/3" | "1/1"`).
- `video`: Embeddable responsive video or self-hosted MP4/WebM (`src`, `autoplay`, `loop`, `poster`).
- `gallery`: Masonry or carousel image gallery (`columns="3"`, `lightbox=true`).
- `figure`: Image with caption and decorative border.
- `code`: Code snippet with syntax highlighting, copy button, and line numbers (`lang="ts"`, `filename="app.ts"`).
- `callout`: Highlighted message box (`variant="info" | "success" | "warning" | "danger" | "tip"`, `icon`, `title`).
- `accordion`: Collapsible accordion panels (`type="single" | "multiple"`).
- `timeline`: Chronological step list with icons and statuses.

### 2.3 Navigation Components
- `navbar`: Top navigation bar with logo, links, action buttons, mobile hamburger menu.
- `sidebar`: Collapsible vertical navigation drawer for dashboards and doc sites.
- `breadcrumbs`: Route history breadcrumb hierarchy.
- `tabs`: Segmented tab switcher (`variant="underline" | "pill" | "enclosed"`).
- `pagination`: Page switcher with previous/next and page count buttons.
- `command-menu`: Search modal triggered with `Cmd+K` / `Ctrl+K`.
- `footer`: Multi-column site footer with copyright, links, and newsletter embed.

### 2.4 Actions Components
- `button`: Interactive button (`variant="primary" | "secondary" | "outline" | "ghost" | "danger"`, `size="sm" | "md" | "lg"`, `action="..."`, `icon="..."`, `loading=false`).
- `button-group`: Attached group of related buttons.
- `dropdown`: Floating trigger menu with item list.
- `menu`: Context or embedded action list.
- `context-menu`: Right-click contextual action menu.

### 2.5 Feedback Components
- `alert`: In-page status banner.
- `toast`: Auto-dismissing notification toaster.
- `progress`: Linear or radial progress indicator (`value=75`, `max=100`, `label="75%"`).
- `skeleton`: Placeholder shimmering skeleton screen during data fetch.
- `empty-state`: Empty data display with icon, title, description, and primary CTA.
- `loading`: Spinner or pulse loader with accessibility announcement.
- `error-state`: Friendly error recovery view with retry button.

### 2.6 Overlay Components
- `dialog`: Accessible modal dialog with focus trap, backdrop blur, keyboard `Escape` dismissal (`id="..."`, `title="..."`).
- `drawer`: Slide-out panel from left or right edge.
- `popover`: Floating anchored contextual card.
- `tooltip`: Hover/focus hint bubble (`content="..."`).
- `sheet`: Bottom sliding action sheet on mobile.
- `confirm`: Action confirmation modal with confirm/cancel hooks.

### 2.7 Marketing Blocks
- `hero`: Header banner with variations (`variant="split" | "centered" | "editorial" | "product" | "minimal"`).
- `logo-wall`: Client / partner logos with automatic marquee or grid layout (`variant="marquee" | "grid"`).
- `feature-list`: Vertical feature showcase with icons and descriptions.
- `feature-grid`: Multi-column feature grid with hover highlights.
- `bento`: High-variance asymmetric Bento grid with mixed tile sizes.
- `feature-showcase`: Interactive tabbed or sticky feature showcase with screenshots.
- `sticky-features`: Scroll-pinned feature presentation.
- `comparison`: Feature comparison matrix / table.
- `stats`: Key metrics and KPI counters (`variant="grid" | "split"`).
- `testimonials`: Customer reviews, quotes, avatars, and star ratings (`variant="carousel" | "masonry" | "grid"`).
- `case-study`: In-depth customer story card with metrics and outcomes.
- `pricing`: Multi-tier pricing table with toggleable annual/monthly billing (`badge`, `popular`, `cta`).
- `faq`: Frequently asked questions accordion.
- `cta`: High-converting call-to-action banner.
- `newsletter`: Email subscription form with instant feedback.
- `contact`: Contact section with embedded form and contact details.

### 2.8 Product UI Components
- `app-shell`: Full application frame with sidebar, topbar, user profile, and content viewport.
- `page-header`: Application page title, breadcrumbs, badge, and right-aligned action buttons.
- `metric`: Dashboard KPI stat card with delta trend badge and mini sparkline.
- `metric-grid`: Multi-metric dashboard row.
- `chart`: Visual data visualization (`type="line" | "bar" | "pie" | "area"`, `source="..."`).
- `activity-feed`: Event timestamp stream with avatars and activity tags.
- `recent-items`: Quick access list of recent records.
- `progress-overview`: Multi-step milestone progress widget.
- `quick-actions`: Grid of fast shortcuts for frequent operational tasks.
- `status-overview`: System health and service status indicators.
- `data-table`: Interactive data table with sorting, search, pagination, bulk actions, row actions, loading skeleton, empty state.
- `list`: Interactive list view with avatars, status pills, and action triggers.
- `description-list`: Key-value record metadata table.
- `tree`: Hierarchical nested file/folder explorer.
- `kanban`: Multi-column board with draggable cards and status lanes.
- `calendar`: Event schedule and date selector.

### 2.9 Forms Components
- `form`: Form container managing validation, submission, and feedback states (`submit="POST /api/..."`, `success="..."`).
- `field`: Form field wrapper with auto-label, helper text, error message, and validation.
- `input`: Single-line text, email, password, number, or URL input.
- `textarea`: Multi-line text field with auto-grow capability.
- `select`: Native or customized dropdown select menu.
- `combobox`: Searchable autocomplete picker.
- `checkbox`: Accessible binary checkbox with label and description.
- `radio`: Radio button option group.
- `switch`: Toggle switch for binary settings.
- `date`: Date / time picker.
- `file`: Drag-and-drop file upload zone.
- `slider`: Numeric range slider with value bubble.

---

## 3. Responsive & Dial Contracts

### 3.1 Density Adaptation
- `density <= 3`: Extra padding (24-32px), large typography, generous white space.
- `density 4 - 6`: Standard comfortable web density (16-20px padding).
- `density >= 7`: Compact enterprise SaaS density (8-12px padding), dense tables, smaller buttons.

### 3.2 Variance Adaptation
- `variance <= 3`: Symmetrical grids, uniform cards, structured linear flow.
- `variance 4 - 7`: Subtle visual accents, staggered offsets, varied card elevations.
- `variance >= 8`: Editorial typography sizes, asymmetrical Bento layouts, dynamic background surfaces.

### 3.3 Motion Adaptation
- `motion = 0`: Instant DOM state changes (respects `prefers-reduced-motion`).
- `motion 1 - 4`: 150-200ms subtle opacity and translation micro-interactions.
- `motion 5 - 7`: 300-450ms smooth staggered reveals, card lift on hover, route slide transitions.
- `motion 8 - 10`: Choreographed scroll reveals, spring physics, parallax depth.
