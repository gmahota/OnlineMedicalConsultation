/**
 * Minimal port forwarder for Replit
 * Opens port 5000 immediately and forwards all traffic to port 3000
 */

const http = require('http');
const { spawn } = require('child_process');

// Create simple HTTP server that immediately opens port 5000
const server = http.createServer((req, res) => {
  // Simple HTTP forwarding using a redirect
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);
});

// Listen on port 5000 immediately
server.listen(5000, '0.0.0.0', () => {
  console.log('PORT 5000 OPENED - Forwarding to Next.js on port 3000');
});