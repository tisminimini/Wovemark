import fs from "node:fs";
import path from "node:path";
import { parseWovemark, WovemarkChildNode } from "@wovemark/parser";

export function inspectFile(filePath: string) {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`\x1b[31mError: File '${filePath}' not found.\x1b[0m`);
    process.exit(1);
  }

  const source = fs.readFileSync(resolved, "utf-8");
  const ast = parseWovemark(source, { file: filePath });

  console.log(`\n==================================================`);
  console.log(`🔎 Wovemark Document Inspection: ${filePath}`);
  console.log(`==================================================\n`);

  console.log(`📌 Frontmatter Metadata:`);
  console.log(`  - Title:       ${ast.frontmatter.title}`);
  console.log(`  - Description: ${ast.frontmatter.description || "(none)"}`);
  console.log(`  - Layout:      ${ast.frontmatter.layout}`);
  console.log(`  - Theme:       ${ast.frontmatter.theme}`);
  console.log(`  - Accent:      ${ast.frontmatter.accent}`);
  console.log(`  - Variance:    ${ast.frontmatter.variance} / 10`);
  console.log(`  - Motion:      ${ast.frontmatter.motion} / 10`);
  console.log(`  - Density:     ${ast.frontmatter.density} / 10`);

  if (ast.dataSources.length > 0) {
    console.log(`\n📦 Declared Data Sources (${ast.dataSources.length}):`);
    for (const ds of ast.dataSources) {
      console.log(`  - [::data] id="${ds.attributes.id}" src="${ds.attributes.src}"`);
    }
  }

  console.log(`\n🌳 Component Hierarchy:`);
  printTree(ast.children, "  ");

  console.log(`\n==================================================\n`);
}

function printTree(nodes: WovemarkChildNode[], prefix: string) {
  for (const node of nodes) {
    if (node.type === "ContainerDirective") {
      const attrs = Object.entries(node.attributes)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(" ");
      console.log(`${prefix}├─ \x1b[36m:::${node.name}\x1b[0m ${attrs ? `\x1b[90m(${attrs})\x1b[0m` : ""}`);
      printTree(node.children, prefix + "│  ");
    } else if (node.type === "ElementDirective") {
      const attrs = Object.entries(node.attributes)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(" ");
      console.log(`${prefix}├─ \x1b[32m::${node.name}\x1b[0m ${attrs ? `\x1b[90m(${attrs})\x1b[0m` : ""}`);
    } else if (node.type === "MarkdownContent") {
      const snippet = node.content.split("\n")[0].slice(0, 40);
      const bindingCount = node.bindings.length;
      const bInfo = bindingCount > 0 ? ` \x1b[35m[${bindingCount} binding(s)]\x1b[0m` : "";
      console.log(`${prefix}├─ \x1b[90mMarkdown: "${snippet}..."${bInfo}\x1b[0m`);
    }
  }
}
