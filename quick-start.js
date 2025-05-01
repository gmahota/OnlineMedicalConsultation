// Advanced HTTP proxy server for Replit compatibility with Next.js
// This addresses the Replit port timeout issue while forwarding all traffic to Next.js

const http = require('http');
const httpProxy = require('http-proxy');
const { spawn } = require('child_process');
const { WebSocketServer } = require('ws');

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:3000',
  ws: true  // Enable WebSocket support
});

// Track Next.js readiness state
let nextjsReady = false;

// Create a simple HTTP server that proxies to Next.js once ready
const server = http.createServer((req, res) => {
  if (nextjsReady) {
    // Forward the request to Next.js
    proxy.web(req, res, {}, (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Proxy error');
    });
  } else {
    // Return a loading message while Next.js is starting
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Starting Application</title>
          <meta http-equiv="refresh" content="2">
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .loader { text-align: center; padding: 2rem; border-radius: 0.5rem; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            p { color: #666; }
            .spinner { border: 4px solid rgba(0, 0, 0, 0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #09f; animation: spin 1s linear infinite; margin: 20px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loader">
            <h1>Starting Application</h1>
            <div class="spinner"></div>
            <p>Please wait while the server initializes...</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Handle WebSocket connections
server.on('upgrade', (req, socket, head) => {
  if (nextjsReady) {
    proxy.ws(req, socket, head, (err) => {
      console.error('WebSocket proxy error:', err);
      socket.destroy();
    });
  }
});

// Listen on port 5000 (required by Replit)
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ PORT 5000 IS OPEN - Next.js is starting...');
  
  // Start Next.js on port 3000
  const nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: 3000 }
  });
  
  // Set a timeout to check if Next.js is ready
  const checkInterval = setInterval(() => {
    http.get('http://localhost:3000', (response) => {
      if (response.statusCode === 200) {
        clearInterval(checkInterval);
        nextjsReady = true;
        console.log('✅ Next.js is ready - Proxy forwarding enabled');
      }
    }).on('error', () => {
      // Next.js not ready yet, continue waiting
    });
  }, 1000);
  
  // Exit this process if Next.js exits
  nextProcess.on('exit', (code) => {
    clearInterval(checkInterval);
    console.log(`Next.js process exited with code ${code}`);
    process.exit(code || 0);
  });
});