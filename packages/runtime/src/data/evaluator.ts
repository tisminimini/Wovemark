/**
 * Safe Binding & Expression Evaluator (Zero eval / Function)
 */

export function getNestedValue(obj: unknown, path: string): unknown {
  if (obj == null) return undefined;
  if (!path || path.trim() === "") return obj;

  const parts = path.trim().split(".");
  let current: any = obj;

  for (const part of parts) {
    if (current == null) return undefined;
    
    // Array index or object key
    current = current[part];
  }

  return current;
}

/**
 * Safely evaluates simple expressions like:
 * - "users.length"
 * - "profile.name"
 * - "user.displayName || 'Anonymous'"
 * - "isLoggedIn ? 'Welcome' : 'Sign in'"
 */
export function evaluateExpression(expr: string, context: Record<string, unknown>): unknown {
  const trimmed = expr.trim();
  if (!trimmed) return "";

  // 1. Ternary operator: condition ? exprA : exprB
  if (trimmed.includes("?") && trimmed.includes(":")) {
    const qIndex = trimmed.indexOf("?");
    const colonIndex = trimmed.lastIndexOf(":");
    if (qIndex !== -1 && colonIndex !== -1 && colonIndex > qIndex) {
      const conditionStr = trimmed.slice(0, qIndex).trim();
      const trueValStr = trimmed.slice(qIndex + 1, colonIndex).trim();
      const falseValStr = trimmed.slice(colonIndex + 1).trim();

      const conditionResult = evaluateExpression(conditionStr, context);
      const isTruthy = Boolean(conditionResult);
      return evaluateExpression(isTruthy ? trueValStr : falseValStr, context);
    }
  }

  // 2. Logical OR fallback: exprA || exprB
  if (trimmed.includes("||")) {
    const parts = trimmed.split("||").map((s) => s.trim());
    for (const part of parts) {
      const val = evaluateExpression(part, context);
      if (val !== undefined && val !== null && val !== "") {
        return val;
      }
    }
    return "";
  }

  // 3. String literals
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  // 4. Number literals
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  // 5. Boolean literals
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;

  // 6. Property lookup
  return getNestedValue(context, trimmed);
}

/**
 * Replaces all {{ expr }} occurrences in text with their evaluated value.
 */
export function interpolateBindings(text: string, context: Record<string, unknown>): string {
  if (!text || !text.includes("{{")) return text;

  return text.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_match, expr) => {
    const val = evaluateExpression(expr, context);
    if (val === undefined || val === null) return "";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  });
}
