/**
 * Wovemark AST & Diagnostic Type Definitions
 */

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

export interface BindingNode {
  type: "Binding";
  raw: string;
  expression: string;
  loc: SourceLocation;
}

export interface MarkdownContentNode {
  type: "MarkdownContent";
  content: string;
  bindings: BindingNode[];
  loc: SourceLocation;
}

export interface ElementDirectiveNode {
  type: "ElementDirective";
  name: string;
  attributes: DirectiveAttributes;
  rawAttributes?: string;
  loc: SourceLocation;
}

export interface ContainerDirectiveNode {
  type: "ContainerDirective";
  name: string;
  attributes: DirectiveAttributes;
  rawAttributes?: string;
  children: WovemarkChildNode[];
  rawMarkdown?: string;
  loc: SourceLocation;
}

export type WovemarkChildNode =
  | ContainerDirectiveNode
  | ElementDirectiveNode
  | MarkdownContentNode;

export interface FrontmatterData {
  title?: string;
  description?: string;
  layout?: "default" | "landing" | "app" | "docs" | "minimal" | "blank" | string;
  theme?: "system" | "light" | "dark" | string;
  variance?: number; // 1-10
  motion?: number;   // 0-10
  density?: number;  // 1-10
  accent?: string;
  [key: string]: unknown;
}

export interface FrontmatterNode {
  type: "Frontmatter";
  title: string;
  description: string;
  layout: string;
  theme: string;
  variance: number;
  motion: number;
  density: number;
  accent: string;
  data: FrontmatterData;
  loc: SourceLocation;
}

export interface WovemarkDiagnostic {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  suggestion?: string;
  file?: string;
  loc: SourceLocation;
}

export interface RootNode {
  type: "Root";
  frontmatter: FrontmatterNode;
  children: WovemarkChildNode[];
  dataSources: ElementDirectiveNode[];
  errors: WovemarkDiagnostic[];
  loc: SourceLocation;
}

export interface ParseOptions {
  file?: string;
  strict?: boolean;
}

export interface PropSchema {
  type?: "string" | "number" | "boolean" | "enum" | "array" | "action" | "source" | "any";
  required?: boolean;
  enum?: (string | number)[];
  default?: unknown;
  description?: string;
}

export interface ComponentSchema {
  name: string;
  kind: "container" | "element" | "both";
  category: "foundation" | "content" | "navigation" | "actions" | "feedback" | "overlay" | "marketing" | "product" | "forms" | "data";
  props: Record<string, PropSchema>;
  allowedChildren?: string[];
  allowedParents?: string[];
  description?: string;
}
