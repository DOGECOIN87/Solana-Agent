#!/usr/bin/env node

/**
 * Simple HTTP server to serve the Solana AI Agent Dashboard
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Define the port
const PORT = process.env.PORT || 3000;

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Parse URL to get the pathname
  let filePath = req.url === '/' ? './src/web-ui/index.html' : `./src/web-ui${req.url}`;

  // Handle any missing assets with default placeholders
  if (req.url.includes('-icon.svg')) {
    // For token icons, redirect to default if file doesn't exist
    if (!fs.existsSync(filePath)) {
      filePath = './src/web-ui/default-token-icon.svg';
    }
  }
  
  // Get file extension
  const extname = path.extname(filePath);
  
  // Set content type header
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Handle file not found
        if (req.url !== '/favicon.ico') {
          console.log(`File not found: ${filePath}`);
        }
        
        // For any routes, serve the index.html for SPA navigation
        if (req.url !== '/favicon.ico' && !req.url.includes('.')) {
          fs.readFile('./src/web-ui/index.html', (error, content) => {
            if (error) {
              res.writeHead(500);
              res.end('Server Error');
              return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          });
          return;
        }
        
        // For assets, return 404
        res.writeHead(404);
        res.end('Not Found');
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Solana AI Agent Dashboard Server Started 🚀         ║
║                                                           ║
║   Server is running at:                                   ║
║   http://localhost:${PORT}                                ${PORT === 3000 ? ' ' : ''}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);
});
