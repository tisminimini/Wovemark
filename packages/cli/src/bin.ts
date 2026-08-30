#!/usr/bin/env node

import { buildProject } from "./commands/build.js";
import { initProject } from "./commands/init.js";
import { inspectFile } from "./commands/inspect.js";
import { printValidationReport, validateProject } from "./commands/validate.js";
import { startDevServer } from "./server/dev-server.js";

const args = process.argv.slice(2);
const command = args[0] || "help";

function printHelp() {
  console.log(`
\x1b[1mWovemark CLI\x1b[0m — Declarative Markdown Frontend for AI Coding Agents

\x1b[33mUsage:\x1b[0m
  wovemark <command> [options]

\x1b[33mCommands:\x1b[0m
  \x1b[32minit\x1b[0m [dir]              Scaffold a new Wovemark project with starter pages
  \x1b[32mdev\x1b[0m [--port 3000]       Start local development server with hot live reload
  \x1b[32mvalidate\x1b[0m [dir|file]     Validate .wovemark.md files and report diagnostics
  \x1b[32minspect\x1b[0m <file>           Inspect AST, frontmatter, and component hierarchy
  \x1b[32mbuild\x1b[0m [--out dist]       Package static website for deployment
  \x1b[32mhelp\x1b[0m                    Show this help message
  \x1b[32mversion\x1b[0m                 Show CLI version

\x1b[33mExamples:\x1b[0m
  npx wovemark init my-site
  npx wovemark dev
  npx wovemark validate .
  npx wovemark inspect index.wovemark.md
  npx wovemark build --out dist
`);
}

switch (command) {
  case "init": {
    const targetDir = args[1] || ".";
    const res = initProject(targetDir);
    console.log(`\n\x1b[32m✔ Successfully initialized Wovemark project in '${res.root}'!\x1b[0m`);
    console.log(`Created files:`);
    for (const f of res.files) {
      console.log(`  - ${f}`);
    }
    console.log(`\nTo get started:\n  cd ${targetDir}\n  npx wovemark dev\n`);
    break;
  }

  case "dev": {
    let port = 3000;
    let dir = ".";
    for (let i = 1; i < args.length; i++) {
      if (args[i] === "--port" && args[i + 1]) {
        port = Number(args[i + 1]);
        i++;
      } else if (args[i] === "--dir" && args[i + 1]) {
        dir = args[i + 1];
        i++;
      }
    }
    startDevServer({ port, dir });
    break;
  }

  case "validate": {
    const target = args[1] || ".";
    const summary = validateProject(target);
    printValidationReport(summary);
    if (!summary.isValid) {
      process.exit(1);
    }
    break;
  }

  case "inspect": {
    const targetFile = args[1];
    if (!targetFile) {
      console.error(`\x1b[31mError: Please specify a file to inspect. Example: wovemark inspect index.wovemark.md\x1b[0m`);
      process.exit(1);
    }
    inspectFile(targetFile);
    break;
  }

  case "build": {
    let outDir = "dist";
    let rootDir = ".";
    for (let i = 1; i < args.length; i++) {
      if (args[i] === "--out" && args[i + 1]) {
        outDir = args[i + 1];
        i++;
      } else if (args[i] === "--dir" && args[i + 1]) {
        rootDir = args[i + 1];
        i++;
      }
    }
    buildProject({ outDir, rootDir });
    break;
  }

  case "--version":
  case "-v":
  case "version": {
    console.log("wovemark v1.0.0");
    break;
  }

  case "--help":
  case "-h":
  case "help":
  default: {
    printHelp();
    break;
  }
}
