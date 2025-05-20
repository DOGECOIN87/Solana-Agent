// Simple HTTP server for testing
import http from 'node:http';

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  console.log(`Received request for: ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Server</title>
      </head>
      <body>
        <h1>Test Server is Running!</h1>
        <p>This is a test page from the server running on port ${PORT}</p>
        <p>Current time: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running at http://localhost:${PORT}/`);
});
