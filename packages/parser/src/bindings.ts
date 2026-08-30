import { BindingNode, SourceLocation } from "./types.js";

const BINDING_REGEX = /\{\{\s*([^{}]+?)\s*\}\}/g;

/**
 * Extracts all {{ expr }} bindings from a given text string.
 */
export function extractBindings(
  text: string,
  baseLine: number = 1,
  file?: string
): BindingNode[] {
  const bindings: BindingNode[] = [];
  if (!text.includes("{{")) return bindings;

  let match: RegExpExecArray | null;
  const regex = new RegExp(BINDING_REGEX);

  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    const expression = match[1].trim();
    const matchIndex = match.index;

    // Calculate approximate line/column
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
          offset: matchIndex + raw.length,
        },
        file,
      },
    });
  }

  return bindings;
}
