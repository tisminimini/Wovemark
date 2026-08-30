import fs from "node:fs";
import path from "node:path";
import { formatDiagnostic, parseWovemark, validateAST, WovemarkDiagnostic } from "@wovemark/parser";

export interface ValidationSummary {
  filesChecked: number;
  totalErrors: number;
  totalWarnings: number;
  diagnosticsByFile: Map<string, WovemarkDiagnostic[]>;
  isValid: boolean;
}

export function findWovemarkFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== "dist") {
          walk(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith(".wovemark.md") || entry.name.endsWith(".wm.md"))) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

export function validateProject(targetDirOrFile: string = "."): ValidationSummary {
  const resolved = path.resolve(process.cwd(), targetDirOrFile);
  const targetFiles: string[] = [];

  if (fs.existsSync(resolved)) {
    const stat = fs.statSync(resolved);
    if (stat.isFile()) {
      targetFiles.push(resolved);
    } else {
      targetFiles.push(...findWovemarkFiles(resolved));
    }
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  const diagnosticsByFile = new Map<string, WovemarkDiagnostic[]>();

  for (const file of targetFiles) {
    const relativePath = path.relative(process.cwd(), file);
    const source = fs.readFileSync(file, "utf-8");

    const ast = parseWovemark(source, { file: relativePath });
    const diagnostics = validateAST(ast);

    if (diagnostics.length > 0) {
      diagnosticsByFile.set(relativePath, diagnostics);
      for (const d of diagnostics) {
        if (d.severity === "error") totalErrors++;
        if (d.severity === "warning") totalWarnings++;
      }
    }
  }

  const isValid = totalErrors === 0;

  return {
    filesChecked: targetFiles.length,
    totalErrors,
    totalWarnings,
    diagnosticsByFile,
    isValid,
  };
}

export function printValidationReport(summary: ValidationSummary): void {
  console.log(`\n🔍 Validated ${summary.filesChecked} Wovemark file(s)...`);

  if (summary.diagnosticsByFile.size === 0) {
    console.log(`\x1b[32m✔ All Wovemark files passed validation with zero errors or warnings!\x1b[0m\n`);
    return;
  }

  for (const [file, diags] of summary.diagnosticsByFile.entries()) {
    console.log(`\n📄 ${file}:`);
    for (const d of diags) {
      const formatted = formatDiagnostic(d);
      if (d.severity === "error") {
        console.log(`  \x1b[31m${formatted}\x1b[0m`);
      } else if (d.severity === "warning") {
        console.log(`  \x1b[33m${formatted}\x1b[0m`);
      } else {
        console.log(`  \x1b[36m${formatted}\x1b[0m`);
      }
    }
  }

  console.log(`\n--------------------------------------------------`);
  if (summary.isValid) {
    console.log(`\x1b[33mResult: Passed with ${summary.totalWarnings} warning(s).\x1b[0m\n`);
  } else {
    console.log(`\x1b[31mResult: FAILED with ${summary.totalErrors} error(s) and ${summary.totalWarnings} warning(s).\x1b[0m\n`);
  }
}
