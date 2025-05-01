// Production-ready port forwarding for Replit
// Forwards requests from port 5000 (Replit) to port 3000 (Next.js)
const http = require('http');
const httpProxy = require('http-proxy');
const { spawn } = require('child_process');

// Print startup message
console.log('Starting Replit port forwarding service...');

// Create a proxy server with custom error handling
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:3000',
  ws: true,
  changeOrigin: true
});

// Handle errors in the proxy to prevent crashes
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  
  // Only end the response if it hasn't been sent yet
  if (res && !res.headersSent && res.writeHead) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: Unable to connect to Next.js application');
  }
});

// Create HTTP server that forwards all traffic to Next.js
const server = http.createServer((req, res) => {
  // Print request info (useful for debugging)
  console.log(`Forwarding: ${req.method} ${req.url}`);
  
  // Forward the request to Next.js
  proxy.web(req, res);
});

// Handle WebSocket connections (needed for HMR)
server.on('upgrade', (req, socket, head) => {
  console.log(`WebSocket upgrade: ${req.url}`);
  proxy.ws(req, socket, head);
});

// Open port 5000 immediately (required by Replit)
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ PORT 5000 OPEN - Forwarding to Next.js on port 3000');
  
  // Start Next.js in a separate process
  const nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: 3000 }
  });
  
  // Handle Next.js process termination
  nextProcess.on('exit', (code) => {
    console.log(`Next.js process exited with code ${code}`);
    process.exit(code || 0);
  });
  
  // Handle this process termination
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    nextProcess.kill();
    server.close();
    process.exit(0);
  });
});