import { FrontmatterData, FrontmatterNode, SourceLocation } from "./types.js";

/**
 * Parses simple YAML-like frontmatter blocks.
 */
export function parseYamlSimple(yamlText: string): FrontmatterData {
  const result: FrontmatterData = {};
  const lines = yamlText.split(/\r?\n/);
  
  let currentListKey: string | null = null;
  let currentList: unknown[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Skip empty lines and full-line comments
    if (!line || line.startsWith("#")) {
      continue;
    }

    // List item for multiline list (- item)
    if (line.startsWith("- ") && currentListKey) {
      const itemVal = parseScalarValue(line.slice(2).trim());
      currentList.push(itemVal);
      continue;
    } else if (currentListKey) {
      result[currentListKey] = currentList;
      currentListKey = null;
      currentList = [];
    }

    // Key-value pair
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const valStr = line.slice(colonIndex + 1).trim();

      // Remove trailing comments if not in quotes
      const cleanedVal = stripTrailingComment(valStr);

      if (cleanedVal === "") {
        // Might be starting a multiline list on next line
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

function stripTrailingComment(str: string): string {
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === "#" && !inDouble && !inSingle) {
      return str.slice(0, i).trim();
    }
  }
  return str.trim();
}

function parseScalarValue(val: string): unknown {
  if (val === "true" || val === "true") return true;
  if (val === "false" || val === "false") return false;
  if (val === "null" || val === "~") return null;

  // Inline array: [a, b, c]
  if (val.startsWith("[") && val.endsWith("]")) {
    const inner = val.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((s) => parseScalarValue(s.trim()));
  }

  // Quoted string
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }

  // Number
  if (/^-?\d+(\.\d+)?$/.test(val)) {
    return Number(val);
  }

  return val;
}

export function extractFrontmatter(
  source: string,
  file?: string
): { frontmatter: FrontmatterNode; body: string; bodyLineOffset: number } {
  const defaultFrontmatter: FrontmatterNode = {
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
      file,
    },
  };

  const lines = source.split(/\r?\n/);
  if (lines.length === 0 || lines[0].trim() !== "---") {
    return {
      frontmatter: defaultFrontmatter,
      body: source,
      bodyLineOffset: 0,
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
    // Unclosed frontmatter, treat as regular markdown
    return {
      frontmatter: defaultFrontmatter,
      body: source,
      bodyLineOffset: 0,
    };
  }

  const yamlLines = lines.slice(1, endLineIndex);
  const yamlText = yamlLines.join("\n");
  const parsedData = parseYamlSimple(yamlText);

  const frontmatterNode: FrontmatterNode = {
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
      file,
    },
  };

  const bodyLines = lines.slice(endLineIndex + 1);
  const body = bodyLines.join("\n");

  return {
    frontmatter: frontmatterNode,
    body,
    bodyLineOffset: endLineIndex + 1,
  };
}
