import { spawn } from 'child_process';
import * as fs from 'fs';

console.log('Starting SolScan Agent...');

// Check if build directory exists
if (!fs.existsSync('build') || !fs.existsSync('build/index.js')) {
  console.log('Build not found. Running force-build script...');
  
  try {
    // Run force build
    const result = require('child_process').execSync('node force-build.js');
    console.log(result.toString());
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

// Start the server
console.log('Starting server from build/index.js...');
const server = spawn('node', ['build/index.js'], { stdio: 'inherit' });

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle signals to properly close the server
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  server.kill('SIGTERM');
});
