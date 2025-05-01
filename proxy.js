/**
 * Simple HTTP proxy server for Replit compatibility with Next.js
 * This script creates a proxy on port 5000 (required by Replit) that forwards to port 3000 (Next.js)
 */

const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:3000',
  ws: true
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res.writeHead) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + err.message);
  }
});

// Create server
const server = http.createServer((req, res) => {
  // Forward request to Next.js
  proxy.web(req, res);
});

// Handle WebSocket connections
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// Start server on port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('Proxy server running on port 5000, forwarding to port 3000');
});