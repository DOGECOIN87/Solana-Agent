import * as http from "http";
import { readFile, stat } from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { loadSettings, saveSettings } from "./settings.js";
import { loadUserSettings } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "web-ui");

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".map": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml"
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
  if (err instanceof Error) {
    console.error(`Error checking directory: ${err.message}`);
  } else {
    console.error(`Unknown error checking directory`);
  }
}

// Helper to parse JSON body from requests
async function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', (chunk: Buffer) => {
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
    
    req.on('error', (error: Error) => {
      reject(error);
    });
  });
}

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    if (!req.url) {
      throw new Error("No URL in request");
    }

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
          
          // Reload user settings after changes
          try {
            await loadUserSettings();
            console.log("Config reloaded after settings update");
          } catch (configError) {
            console.warn("Could not reload config:", configError);
          }
          
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
          console.log("Settings saved successfully");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("Error saving settings:", errorMessage);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: errorMessage }));
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
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error serving ${req?.url}: ${errorMessage}`);
    res.writeHead(404).end("404 Not Found");
  }
});

server.on('error', (e: Error) => {
  console.error(`Server error: ${e.message}`);
});

server.listen(Number(PORT), "0.0.0.0", () =>
  console.log(`▶ Static UI available on http://localhost:${PORT}`)
);
