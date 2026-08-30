# Wovemark Abstract Syntax Tree (AST-1.0)

This document defines the structural representation produced by `@wovemark/parser` and consumed by `@wovemark/runtime` and `@wovemark/cli`.

---

## 1. Node Types

```typescript
export type WovemarkNodeType =
  | "Root"
  | "Frontmatter"
  | "ContainerDirective"
  | "ElementDirective"
  | "MarkdownContent"
  | "Binding";

export interface SourcePosition {
  line: number;    // 1-indexed
  column: number;  // 1-indexed
  offset: number;  // 0-indexed byte offset
}

export interface SourceLocation {
  start: SourcePosition;
  end: SourcePosition;
  file?: string;
}

export type DirectiveAttributeValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>
  | Record<string, unknown>;

export interface DirectiveAttributes {
  [key: string]: DirectiveAttributeValue;
}
```

---

## 2. AST Interfaces

### 2.1 `RootNode`
Top-level representation of a parsed `.wovemark.md` file.

```typescript
export interface RootNode {
  type: "Root";
  frontmatter: FrontmatterNode;
  children: WovemarkChildNode[];
  loc: SourceLocation;
  dataSources: DataDirectiveNode[];
  errors: WovemarkDiagnostic[];
}

export type WovemarkChildNode =
  | ContainerDirectiveNode
  | ElementDirectiveNode
  | MarkdownContentNode;
```

### 2.2 `FrontmatterNode`
Metadata extracted from YAML block at top of file.

```typescript
export interface FrontmatterNode {
  type: "Frontmatter";
  title: string;
  description: string;
  layout: "default" | "landing" | "app" | "docs" | "minimal" | "blank";
  theme: "system" | "light" | "dark" | string;
  variance: number; // 1 - 10
  motion: number;   // 0 - 10
  density: number;  // 1 - 10
  accent: string;
  raw: Record<string, unknown>;
  loc: SourceLocation;
}
```

### 2.3 `ContainerDirectiveNode`
Container elements declared with `:::name ... :::`.

```typescript
export interface ContainerDirectiveNode {
  type: "ContainerDirective";
  name: string; // e.g., "hero", "feature-grid", "form", "dialog"
  attributes: DirectiveAttributes;
  children: WovemarkChildNode[];
  rawMarkdown?: string;
  loc: SourceLocation;
}
```

### 2.4 `ElementDirectiveNode`
Atomic elements declared with `::name ...`.

```typescript
export interface ElementDirectiveNode {
  type: "ElementDirective";
  name: string; // e.g., "button", "metric", "field", "column"
  attributes: DirectiveAttributes;
  loc: SourceLocation;
}
```

### 2.5 `MarkdownContentNode`
Native CommonMark content (headings, paragraphs, lists, code, blockquotes).

```typescript
export interface MarkdownContentNode {
  type: "MarkdownContent";
  content: string;
  html?: string;
  bindings: BindingNode[];
  loc: SourceLocation;
}
```

### 2.6 `BindingNode`
Dynamic interpolated token inside text or attribute (`{{ expr }}`).

```typescript
export interface BindingNode {
  type: "Binding";
  raw: string;        // e.g. "{{ users.length }}"
  expression: string; // e.g. "users.length"
  loc: SourceLocation;
}
```

---

## 3. Diagnostics & Error Model

Parser and Validator populate structured diagnostics rather than throwing fatal crashes where possible:

```typescript
export interface WovemarkDiagnostic {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  suggestion?: string; // e.g. "Did you mean 'data-table'?"
  file?: string;
  loc: SourceLocation;
}
```
