import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSettings, saveSettings } from "./src/settings.js";

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

// Helper to parse JSON body from requests
async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    console.log(`Received request for: ${req.url}`);
    
    // Handle API requests
    if (req.url === "/api/settings") {
      // Set CORS headers for API endpoints
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      
      // Handle preflight OPTIONS request
      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }
      
      // GET /api/settings - Return current settings
      if (req.method === "GET") {
        const settings = await loadSettings();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(settings));
        console.log("Settings retrieved successfully");
        return;
      }
      
      // POST /api/settings - Save settings
      if (req.method === "POST") {
        try {
          const settings = await parseJsonBody(req);
          await saveSettings(settings);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
          console.log("Settings saved successfully");
        } catch (error) {
          console.error("Error saving settings:", error);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
        return;
      }
    }
    
    // Static file serving
    let filePath = req.url === "/" ? "/index.html" : req.url;
    filePath = path.join(root, filePath);
    console.log(`Resolved file path: ${filePath}`);
    
    await stat(filePath); // throws on 404
    
    const data = await readFile(filePath);
    const ext = path.extname(filePath);
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
