import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const LIVE_RELOAD_SCRIPT = `
<script>
  (() => {
    const sse = new EventSource('/__wm_live');
    sse.onmessage = (e) => {
      if (e.data === 'reload') {
        console.log('[Wovemark Dev] File changed, reloading...');
        window.location.reload();
      }
    };
    sse.onerror = () => {
      // Reconnect automatically
    };
  })();
</script>
`;

export interface DevServerOptions {
  port?: number;
  dir?: string;
}

export function startDevServer(options: DevServerOptions = {}) {
  const port = options.port || 3000;
  const rootDir = path.resolve(process.cwd(), options.dir || ".");

  const sseClients: http.ServerResponse[] = [];

  // Watch for changes in rootDir
  let debounceTimer: any = null;
  fs.watch(rootDir, { recursive: true }, (_eventType, filename) => {
    if (!filename) return;
    if (filename.includes("node_modules") || filename.includes(".git") || filename.includes("dist")) {
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`\x1b[36m[Wovemark Dev] File modified: ${filename}\x1b[0m`);
      for (const client of sseClients) {
        client.write(`data: reload\n\n`);
      }
    }, 100);
  });

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(url.pathname);

    // SSE Endpoint for Live Reload
    if (pathname === "/__wm_live") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(`data: connected\n\n`);
      sseClients.push(res);

      req.on("close", () => {
        const idx = sseClients.indexOf(res);
        if (idx !== -1) sseClients.splice(idx, 1);
      });
      return;
    }

    // Serve files with runtime fallback support
    let targetFilePath = path.join(rootDir, pathname);

    // Fallback: Check if requesting runtime assets directly
    if (!fs.existsSync(targetFilePath)) {
      const monorepoRuntimeDist = path.resolve(__dirname, "../../../runtime/dist");
      if (pathname === "/wovemark.js" || pathname === "/@wovemark/runtime") {
        targetFilePath = path.join(monorepoRuntimeDist, "index.js");
      } else if (pathname === "/styles.css" || pathname === "/@wovemark/runtime/styles.css") {
        targetFilePath = path.join(monorepoRuntimeDist, "styles.css");
      } else if (pathname.includes("/packages/runtime/dist/")) {
        const subPath = pathname.split("/packages/runtime/dist/")[1];
        targetFilePath = path.join(monorepoRuntimeDist, subPath);
      }
    }

    if (fs.existsSync(targetFilePath) && fs.statSync(targetFilePath).isDirectory()) {
      targetFilePath = path.join(targetFilePath, "index.html");
    }

    if (!fs.existsSync(targetFilePath) || !fs.statSync(targetFilePath).isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    const ext = path.extname(targetFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    try {
      if (ext === ".html") {
        let htmlContent = fs.readFileSync(targetFilePath, "utf-8");
        // Inject live reload script
        if (htmlContent.includes("</body>")) {
          htmlContent = htmlContent.replace("</body>", `${LIVE_RELOAD_SCRIPT}</body>`);
        } else {
          htmlContent += LIVE_RELOAD_SCRIPT;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(htmlContent);
      } else {
        const fileStream = fs.createReadStream(targetFilePath);
        res.writeHead(200, { "Content-Type": contentType });
        fileStream.pipe(res);
      }
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`500 Internal Server Error: ${err.message}`);
    }
  });

  server.listen(port, () => {
    console.log(`\n🚀 \x1b[32mWovemark Dev Server running at:\x1b[0m`);
    console.log(`   \x1b[1mhttp://localhost:${port}\x1b[0m`);
    console.log(`   Watching \x1b[90m${rootDir}\x1b[0m for live updates...\n`);
  });

  return server;
}
