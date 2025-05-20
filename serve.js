import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "src", "web-ui");

const mime = {
      ".html": "text/html",
        ".js":   "text/javascript",
          ".css":  "text/css",
            ".map":  "application/json",
              ".png":  "image/png",
                ".svg":  "image/svg+xml"
};

http.createServer(async (req, res) => {
      try {
            let filePath = req.url === "/" ? "/index.html" : req.url;
                filePath = path.join(root, filePath);
                    await stat(filePath);                                  // throws if 404

                        const data = await readFile(filePath);
                            const ext  = path.extname(filePath);
                                res.writeHead(200, { "Content-Type": mime[ext] ?? "text/plain" });
                                    res.end(data);
      } catch {
            res.writeHead(404).end("404 Not Found");
      }
}).listen(8080, '0.0.0.0', () => console.log("▶ UI on http://localhost:8080"));
