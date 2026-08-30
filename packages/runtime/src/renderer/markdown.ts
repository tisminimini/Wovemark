/**
 * Lightweight, safe CommonMark renderer for Wovemark
 */

export function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderMarkdown(markdown: string): string {
  if (!markdown) return "";

  const lines = markdown.split(/\r?\n/);
  const out: string[] = [];

  let inList: "ul" | "ol" | null = null;
  let inBlockquote = false;
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block toggle
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      if (!inCodeBlock) {
        // Close list if open
        if (inList) {
          out.push(`</${inList}>`);
          inList = null;
        }
        if (inBlockquote) {
          out.push("</blockquote>");
          inBlockquote = false;
        }

        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
        codeBlockLines = [];
        continue;
      } else {
        inCodeBlock = false;
        const codeContent = sanitizeHtml(codeBlockLines.join("\n"));
        const langAttr = codeBlockLang ? ` class="language-${codeBlockLang}"` : "";
        const header = codeBlockLang
          ? `<div class="wm-code-header"><span class="wm-code-lang">${codeBlockLang}</span><button class="wm-code-copy" data-wm-action="copy:${escapeAttr(
              codeBlockLines.join("\n")
            )}">Copy</button></div>`
          : "";

        out.push(
          `<div class="wm-code-block">${header}<pre><code${langAttr}>${codeContent}</code></pre></div>`
        );
        continue;
      }
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Empty line
    if (!trimmed) {
      if (inList) {
        out.push(`</${inList}>`);
        inList = null;
      }
      if (inBlockquote) {
        out.push("</blockquote>");
        inBlockquote = false;
      }
      continue;
    }

    // Headings
    if (trimmed.startsWith("#")) {
      if (inList) {
        out.push(`</${inList}>`);
        inList = null;
      }
      if (inBlockquote) {
        out.push("</blockquote>");
        inBlockquote = false;
      }

      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const headingText = renderInlineMarkdown(match[2]);
        const id = slugify(match[2]);
        out.push(`<h${level} id="${id}">${headingText}</h${level}>`);
        continue;
      }
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      if (inList) {
        out.push(`</${inList}>`);
        inList = null;
      }
      if (!inBlockquote) {
        inBlockquote = true;
        out.push("<blockquote>");
      }
      const quoteText = renderInlineMarkdown(trimmed.replace(/^>\s?/, ""));
      out.push(`<p>${quoteText}</p>`);
      continue;
    } else if (inBlockquote) {
      out.push("</blockquote>");
      inBlockquote = false;
    }

    // Unordered List (- or *)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (inList === "ol") {
        out.push("</ol>");
        inList = null;
      }
      if (!inList) {
        inList = "ul";
        out.push("<ul>");
      }
      const itemText = renderInlineMarkdown(trimmed.slice(2));
      out.push(`<li>${itemText}</li>`);
      continue;
    }

    // Ordered List (1. 2.)
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (inList === "ul") {
        out.push("</ul>");
        inList = null;
      }
      if (!inList) {
        inList = "ol";
        out.push("<ol>");
      }
      const itemText = renderInlineMarkdown(olMatch[1]);
      out.push(`<li>${itemText}</li>`);
      continue;
    }

    // Close any open list
    if (inList) {
      out.push(`</${inList}>`);
      inList = null;
    }

    // Standard Paragraph
    out.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  }

  if (inList) {
    out.push(`</${inList}>`);
  }
  if (inBlockquote) {
    out.push("</blockquote>");
  }

  return out.join("\n");
}

export function renderInlineMarkdown(text: string): string {
  if (!text) return "";

  let out = sanitizeHtml(text);

  // Bold: **text** or __text__
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic: *text* or _text_
  out = out.replace(/\*([^*]+?)\*/g, "<em>$1</em>");
  out = out.replace(/_([^_]+?)_/g, "<em>$1</em>");

  // Strikethrough: ~~text~~
  out = out.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Inline code: `code`
  out = out.replace(/`([^`]+?)`/g, "<code>$1</code>");

  // Images: ![alt](url)
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, src) => {
    return `<img src="${src}" alt="${alt}" class="wm-inline-img" loading="lazy" />`;
  });

  // Links: [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    const isExternal = href.startsWith("http://") || href.startsWith("https://");
    const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${href}"${targetAttr}>${label}</a>`;
  });

  return out;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
