import { DirectiveAttributes, DirectiveAttributeValue } from "./types.js";

/**
 * Parses directive attribute strings into a typed key-value dictionary.
 * Example: `variant="split" image="/assets/hero.webp" columns=3 required`
 */
export function parseAttributes(rawAttrs: string): DirectiveAttributes {
  const attributes: DirectiveAttributes = {};
  if (!rawAttrs || !rawAttrs.trim()) {
    return attributes;
  }

  const str = rawAttrs.trim();
  let i = 0;
  const len = str.length;

  while (i < len) {
    // Skip whitespace
    while (i < len && /\s/.test(str[i])) {
      i++;
    }
    if (i >= len) break;

    // Read key identifier
    const keyStart = i;
    while (i < len && /[a-zA-Z0-9_\-:]/.test(str[i])) {
      i++;
    }
    const key = str.slice(keyStart, i).trim();
    if (!key) {
      // Advance to avoid infinite loop on unexpected characters
      i++;
      continue;
    }

    // Skip whitespace before possible '='
    while (i < len && /\s/.test(str[i])) {
      i++;
    }

    // Check if there is an '='
    if (i < len && str[i] === "=") {
      i++; // consume '='
      while (i < len && /\s/.test(str[i])) {
        i++;
      }

      if (i >= len) {
        attributes[key] = "";
        break;
      }

      const quoteChar = str[i];
      if (quoteChar === '"' || quoteChar === "'") {
        // Quoted string
        i++; // consume opening quote
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
          i++; // consume closing quote
        }
        attributes[key] = parseAttributeValue(val, key);
      } else {
        // Unquoted value (number, boolean, or bare word)
        const valStart = i;
        while (i < len && !/\s/.test(str[i])) {
          i++;
        }
        const valStr = str.slice(valStart, i);
        attributes[key] = parseAttributeValue(valStr, key);
      }
    } else {
      // Boolean flag without value: e.g. `required`, `disabled`
      attributes[key] = true;
    }
  }

  return attributes;
}

const LIST_ATTRIBUTE_KEYS = new Set(["options", "tags", "categories", "items", "keys"]);

function parseAttributeValue(val: string, key?: string): DirectiveAttributeValue {
  if (val === "true") return true;
  if (val === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(val)) {
    return Number(val);
  }

  // Check if valid JSON object/array
  if ((val.startsWith("{") && val.endsWith("}")) || (val.startsWith("[") && val.endsWith("]"))) {
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      // Not JSON, return as string
    }
  }

  // Comma-separated list only for specific array properties (e.g. options="Admin, Editor, Viewer")
  if (key && LIST_ATTRIBUTE_KEYS.has(key.toLowerCase()) && val.includes(",") && !val.includes("\n")) {
    const items = val.split(",").map((s) => s.trim());
    if (items.length > 1) {
      return items;
    }
  }

  return val;
}
