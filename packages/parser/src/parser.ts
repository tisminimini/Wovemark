import { parseAttributes } from "./attributes.js";
import { extractBindings } from "./bindings.js";
import { extractFrontmatter } from "./frontmatter.js";
import {
  ContainerDirectiveNode,
  DirectiveAttributes,
  ElementDirectiveNode,
  MarkdownContentNode,
  ParseOptions,
  RootNode,
  SourceLocation,
  WovemarkChildNode,
  WovemarkDiagnostic,
} from "./types.js";

const CONTAINER_OPEN_REGEX = /^:{3,}\s*([a-zA-Z0-9_\-]+)(.*)$/;
const CONTAINER_CLOSE_REGEX = /^:{3,}\s*$/;
const ELEMENT_DIRECTIVE_REGEX = /^::([a-zA-Z0-9_\-]+)(.*)$/;
const CODE_FENCE_REGEX = /^(`{3,}|~{3,})/;

interface ContainerStackItem {
  node: ContainerDirectiveNode;
  fenceLength: number;
}

/**
 * Parses a Wovemark document into an AST with frontmatter, directives, markdown, and bindings.
 */
export function parseWovemark(source: string, options: ParseOptions = {}): RootNode {
  const file = options.file || "inline.wovemark.md";
  const diagnostics: WovemarkDiagnostic[] = [];

  // 1. Extract Frontmatter
  const { frontmatter, body, bodyLineOffset } = extractFrontmatter(source, file);

  const lines = body.split(/\r?\n/);
  const rootChildren: WovemarkChildNode[] = [];
  const dataSources: ElementDirectiveNode[] = [];

  const containerStack: ContainerStackItem[] = [];
  let pendingMarkdownLines: string[] = [];
  let pendingMarkdownStartLine = 1 + bodyLineOffset;

  let inCodeFence = false;
  let codeFenceChar = "";
  let codeFenceLength = 0;

  function flushPendingMarkdown() {
    if (pendingMarkdownLines.length === 0) return;

    // Don't create empty markdown content nodes if all lines are empty whitespace
    const content = pendingMarkdownLines.join("\n");
    const trimmed = content.trim();

    if (trimmed.length > 0) {
      const lineCount = pendingMarkdownLines.length;
      const endLine = pendingMarkdownStartLine + lineCount - 1;
      const bindings = extractBindings(content, pendingMarkdownStartLine, file);

      const node: MarkdownContentNode = {
        type: "MarkdownContent",
        content,
        bindings,
        loc: {
          start: { line: pendingMarkdownStartLine, column: 1, offset: 0 },
          end: {
            line: endLine,
            column: pendingMarkdownLines[lineCount - 1].length + 1,
            offset: 0,
          },
          file,
        },
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

    // Check for code fences (``` or ~~~)
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

    // Inside code fence, all directive syntax is treated as literal code markdown
    if (inCodeFence) {
      if (pendingMarkdownLines.length === 0) {
        pendingMarkdownStartLine = currentLineNumber;
      }
      pendingMarkdownLines.push(rawLine);
      continue;
    }

    // Check for container close: :::
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
            file,
          },
        });
      } else {
        const closed = containerStack.pop()!;
        closed.node.loc.end = {
          line: currentLineNumber,
          column: trimmedLine.length + 1,
          offset: 0,
        };

        if (containerStack.length > 0) {
          containerStack[containerStack.length - 1].node.children.push(closed.node);
        } else {
          rootChildren.push(closed.node);
        }
      }
      continue;
    }

    // Check for container open: :::name ...
    const containerMatch = trimmedLine.match(CONTAINER_OPEN_REGEX);
    if (containerMatch) {
      flushPendingMarkdown();

      const name = containerMatch[1];
      const rawAttrs = containerMatch[2].trim();
      const attributes = parseAttributes(rawAttrs);

      const containerNode: ContainerDirectiveNode = {
        type: "ContainerDirective",
        name,
        attributes,
        rawAttributes: rawAttrs,
        children: [],
        loc: {
          start: { line: currentLineNumber, column: 1, offset: 0 },
          end: { line: currentLineNumber, column: rawLine.length + 1, offset: 0 },
          file,
        },
      };

      containerStack.push({
        node: containerNode,
        fenceLength: trimmedLine.indexOf(name),
      });
      continue;
    }

    // Check for element directive: ::name ...
    const elementMatch = trimmedLine.match(ELEMENT_DIRECTIVE_REGEX);
    if (elementMatch) {
      flushPendingMarkdown();

      const name = elementMatch[1];
      const rawAttrs = elementMatch[2].trim();
      const attributes = parseAttributes(rawAttrs);

      const elementNode: ElementDirectiveNode = {
        type: "ElementDirective",
        name,
        attributes,
        rawAttributes: rawAttrs,
        loc: {
          start: { line: currentLineNumber, column: 1, offset: 0 },
          end: { line: currentLineNumber, column: rawLine.length + 1, offset: 0 },
          file,
        },
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

    // Standard markdown line
    if (pendingMarkdownLines.length === 0) {
      pendingMarkdownStartLine = currentLineNumber;
    }
    pendingMarkdownLines.push(rawLine);
  }

  // Flush remaining markdown
  flushPendingMarkdown();

  // Close any unclosed containers gracefully
  while (containerStack.length > 0) {
    const unclosed = containerStack.pop()!;
    diagnostics.push({
      severity: "warning",
      code: "UNCLOSED_CONTAINER_DIRECTIVE",
      message: `Container directive ':::${unclosed.node.name}' was not closed with ':::'.`,
      file,
      loc: unclosed.node.loc,
    });

    if (containerStack.length > 0) {
      containerStack[containerStack.length - 1].node.children.push(unclosed.node);
    } else {
      rootChildren.push(unclosed.node);
    }
  }

  const rootLoc: SourceLocation = {
    start: { line: 1, column: 1, offset: 0 },
    end: {
      line: lines.length + bodyLineOffset,
      column: (lines[lines.length - 1] || "").length + 1,
      offset: 0,
    },
    file,
  };

  return {
    type: "Root",
    frontmatter,
    children: rootChildren,
    dataSources,
    errors: diagnostics,
    loc: rootLoc,
  };
}
