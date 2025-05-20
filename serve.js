import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "src", "web-ui");

const MIME = {
      ".html": "text/html",
        ".js":   "text/javascript",
          ".css":  "text/css",
            ".map":  "application/json",
              ".png":  "image/png",
                ".svg":  "image/svg+xml"
};

// Use environment variable or default to 8080
const PORT = process.env.PORT || 8080;

console.log(`Starting server with root directory: ${root}`);
console.log(`__dirname resolved to: ${__dirname}`);

// Check if the directory exists
try {
  const stats = await stat(root);
  console.log(`Directory exists: ${stats.isDirectory()}`);
  
  // List files in directory
  const fs = await import("node:fs/promises");
  const files = await fs.readdir(root);
  console.log(`Files in directory: ${files.join(", ")}`);
} catch (err) {
  console.error(`Error checking directory: ${err.message}`);
}

const server = http.createServer(async (req, res) => {
      try {
            console.log(`Received request for: ${req.url}`);
            let filePath = req.url === "/" ? "/index.html" : req.url;
                filePath = path.join(root, filePath);
                    console.log(`Resolved file path: ${filePath}`);
                    
                    await stat(filePath);                                 // throws on 404

                        const data = await readFile(filePath);
                            const ext  = path.extname(filePath);
                                res.writeHead(200, { "Content-Type": MIME[ext] ?? "text/plain" });
                                    res.end(data);
                                    console.log(`Served: ${filePath} (${MIME[ext] ?? "text/plain"})`);
      } catch (err) {
            console.error(`Error serving ${req?.url}: ${err.message}`);
            res.writeHead(404).end("404 Not Found");
      }
});

server.on('error', (e) => {
  console.error(`Server error: ${e.message}`);
});

server.listen(PORT, "0.0.0.0", () =>
  console.log(`▶ Static UI available on http://localhost:${PORT}`)
);
