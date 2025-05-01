// Simplified server for Replit deployment
const http = require('http');
const httpProxy = require('http-proxy');
const { spawn } = require('child_process');

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:3000',
  ws: true
});

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Handle HTTP requests
  proxy.web(req, res, {
    target: 'http://localhost:3000'
  });
});

// Handle WebSocket connections
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// Start the proxy server
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ Proxy server running on port 5000');
  
  // Start Next.js as a child process
  console.log('Starting Next.js development server...');
  const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
    stdio: 'inherit'
  });
  
  // Handle Next.js process exit
  nextProcess.on('exit', (code) => {
    console.log(`Next.js process exited with code: ${code}`);
    process.exit(code || 0);
  });
});