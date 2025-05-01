// Express server for Replit deployment
const express = require('express');
const { spawn } = require('child_process');
const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy
const proxy = httpProxy.createProxy();

// Create an Express app
const app = express();

// Start Next.js in the background
console.log('Starting Next.js development server...');
const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
  stdio: 'inherit'
});

// Handle Next.js process exit
nextProcess.on('exit', (code) => {
  console.log(`Next.js process exited with code: ${code}`);
  process.exit(code || 0);
});

// Proxy middleware
app.use('/', (req, res) => {
  // Forward the request to Next.js
  proxy.web(req, res, { target: 'http://localhost:3000' });
});

// Create HTTP server
const server = http.createServer(app);

// Handle WebSocket connections
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, { target: 'http://localhost:3000' });
});

// Start the server
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Express proxy server running on port ${PORT}`);
});