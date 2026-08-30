import { COMPONENT_SCHEMAS } from "./schema.js";
import {
  ContainerDirectiveNode,
  DirectiveAttributes,
  ElementDirectiveNode,
  RootNode,
  SourceLocation,
  WovemarkChildNode,
  WovemarkDiagnostic,
} from "./types.js";

/**
 * Calculates Levenshtein edit distance between two strings.
 */
export function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];
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
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Finds the closest matching candidate from a list of strings if distance is small.
 */
export function findClosestMatch(target: string, candidates: string[], maxDistance: number = 3): string | undefined {
  let closest: string | undefined = undefined;
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

const KNOWN_ACTION_PREFIXES = [
  "open:",
  "close:",
  "toggle:",
  "refresh:",
  "delete:",
  "navigate:",
  "submit:",
  "toast:",
  "theme:",
  "copy:",
];

/**
 * Validates a parsed AST against standard schemas and rules.
 */
export function validateAST(ast: RootNode): WovemarkDiagnostic[] {
  const diagnostics: WovemarkDiagnostic[] = [...ast.errors];
  const file = ast.loc.file || "unknown.wovemark.md";

  // 1. Validate Frontmatter
  const fm = ast.frontmatter;
  if (fm.variance < 1 || fm.variance > 10) {
    diagnostics.push({
      severity: "warning",
      code: "INVALID_DIAL_RANGE",
      message: `Frontmatter dial 'variance' should be between 1 and 10, got ${fm.variance}.`,
      file,
      loc: fm.loc,
    });
  }
  if (fm.motion < 0 || fm.motion > 10) {
    diagnostics.push({
      severity: "warning",
      code: "INVALID_DIAL_RANGE",
      message: `Frontmatter dial 'motion' should be between 0 and 10, got ${fm.motion}.`,
      file,
      loc: fm.loc,
    });
  }
  if (fm.density < 1 || fm.density > 10) {
    diagnostics.push({
      severity: "warning",
      code: "INVALID_DIAL_RANGE",
      message: `Frontmatter dial 'density' should be between 1 and 10, got ${fm.density}.`,
      file,
      loc: fm.loc,
    });
  }

  // 2. Track Data Source IDs and Element IDs to verify duplicate IDs or broken bindings
  const declaredDataSources = new Set<string>();
  const declaredElementIds = new Set<string>();
  const allKnownComponentNames = Object.keys(COMPONENT_SCHEMAS);

  function walk(node: WovemarkChildNode) {
    if (node.type === "MarkdownContent") {
      return;
    }

    const isContainer = node.type === "ContainerDirective";
    const componentName = node.name;
    const loc = node.loc;
    const schema = COMPONENT_SCHEMAS[componentName];

    // Validate component name
    if (!schema) {
      const suggestion = findClosestMatch(componentName, allKnownComponentNames);
      diagnostics.push({
        severity: "error",
        code: "UNKNOWN_COMPONENT",
        message: `Unknown component '${componentName}'.`,
        suggestion: suggestion ? `Did you mean '${suggestion}'?` : undefined,
        file,
        loc,
      });
    } else {
      // Validate kind
      if (isContainer && schema.kind === "element") {
        diagnostics.push({
          severity: "warning",
          code: "INVALID_COMPONENT_KIND",
          message: `Component '${componentName}' is an element directive, but was used as a container ':::${componentName}'. Use '::${componentName}' instead.`,
          file,
          loc,
        });
      } else if (!isContainer && schema.kind === "container") {
        diagnostics.push({
          severity: "warning",
          code: "INVALID_COMPONENT_KIND",
          message: `Component '${componentName}' is a container directive, but was used as an element '::${componentName}'. Use ':::${componentName} ... :::' instead.`,
          file,
          loc,
        });
      }

      // Check ID uniqueness
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
            loc,
          });
        } else {
          declaredElementIds.add(idVal);
        }
      }

      // Check required attributes
      for (const [propName, propDef] of Object.entries(schema.props)) {
        if (propDef.required && !(propName in node.attributes)) {
          // Special case: button can have label or markdown children
          if (componentName === "button" && propName === "label" && isContainer) {
            continue;
          }
          diagnostics.push({
            severity: "error",
            code: "MISSING_REQUIRED_PROP",
            message: `Component '${componentName}' is missing required property '${propName}'.`,
            file,
            loc,
          });
        }
      }

      // Validate attributes and property typos
      const validProps = Object.keys(schema.props);
      // Allow common HTML-like attributes: id, class, key, motion, action
      const genericAllowedProps = ["id", "class", "key", "motion", "action", "style"];

      for (const [attrName, attrVal] of Object.entries(node.attributes)) {
        if (!schema.props[attrName] && !genericAllowedProps.includes(attrName)) {
          const suggestion = findClosestMatch(attrName, validProps);
          diagnostics.push({
            severity: "warning",
            code: "UNKNOWN_PROPERTY",
            message: `Component '${componentName}' has unknown property '${attrName}'.`,
            suggestion: suggestion ? `Did you mean '${suggestion}'?` : undefined,
            file,
            loc,
          });
        } else if (schema.props[attrName]) {
          const propDef = schema.props[attrName];

          // Enum validation
          if (propDef.type === "enum" && propDef.enum && typeof attrVal === "string") {
            const match = propDef.enum.find((e) => String(e).toLowerCase() === attrVal.toLowerCase());
            if (!match) {
              const suggestion = findClosestMatch(attrVal, propDef.enum.map(String));
              diagnostics.push({
                severity: "warning",
                code: "INVALID_ENUM_VALUE",
                message: `Invalid value '${attrVal}' for property '${attrName}' on '${componentName}'. Allowed values: ${propDef.enum.join(", ")}.`,
                suggestion: suggestion ? `Did you mean '${suggestion}'?` : undefined,
                file,
                loc,
              });
            }
          }

          // Action string validation
          if (propDef.type === "action" && typeof attrVal === "string") {
            validateActionString(attrVal, componentName, file, loc, diagnostics);
          }
        }
      }
    }

    // Recurse children
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

function validateActionString(
  actionVal: string,
  componentName: string,
  file: string,
  loc: SourceLocation,
  diagnostics: WovemarkDiagnostic[]
) {
  const actions = actionVal.split(";").map((a) => a.trim()).filter(Boolean);
  for (const action of actions) {
    const hasKnownPrefix = KNOWN_ACTION_PREFIXES.some((prefix) => action.startsWith(prefix));
    if (!hasKnownPrefix && !action.startsWith("http://") && !action.startsWith("https://") && !action.startsWith("#")) {
      diagnostics.push({
        severity: "warning",
        code: "INVALID_ACTION_SYNTAX",
        message: `Unrecognized action format '${action}' on '${componentName}'. Expected action command like 'open:<id>', 'refresh:<id>', 'navigate:<path>', etc.`,
        file,
        loc,
      });
    }
  }
}

/**
 * Formats a diagnostic into an agent-friendly CLI error string.
 */
export function formatDiagnostic(diag: WovemarkDiagnostic): string {
  const filePart = diag.file ? `${diag.file}:${diag.loc.start.line}:${diag.loc.start.column}` : `Line ${diag.loc.start.line}`;
  const severityTag = diag.severity === "error" ? "ERROR" : diag.severity === "warning" ? "WARNING" : "INFO";

  let out = `[${severityTag}] ${filePart} — ${diag.message}`;
  if (diag.suggestion) {
    out += `\n  💡 ${diag.suggestion}`;
  }
  return out;
}
