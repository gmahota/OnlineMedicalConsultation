// Combined Next.js starter and port forwarding server for Replit
// This file handles both starting Next.js and opening port 5000
// to satisfy Replit's port requirements

const http = require('http');
const httpProxy = require('http-proxy');
const { spawn } = require('child_process');

// Start a simple HTTP server immediately on port 5000
// This ensures Replit doesn't time out waiting for the port to open
const quickServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>Medical Consultation App</title>
        <meta http-equiv="refresh" content="3">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .loader { border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 2s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <h1>Medical Consultation App</h1>
        <p>Starting Next.js application...</p>
        <div class="loader"></div>
        <p>This page will refresh automatically.</p>
      </body>
    </html>
  `);
});

// Start the quick server
quickServer.listen(5000, '0.0.0.0', () => {
  console.log('Quick start server running on port 5000');
  
  // Start Next.js in the background
  console.log('Starting Next.js application...');
  const nextApp = spawn('npm', ['run', 'dev'], {
    detached: false,
    stdio: 'inherit' // Show Next.js output in the console
  });
  
  // Wait for Next.js to be ready (approximately)
  setTimeout(() => {
    console.log('Setting up port forwarding to Next.js...');
    
    // Create a proxy server for forwarding traffic to Next.js
    const proxy = httpProxy.createProxyServer({
      target: 'http://localhost:3000',
      ws: true // Enable WebSocket proxying for video calls
    });
    
    // Handle proxy errors
    proxy.on('error', (err, req, res) => {
      console.error('Proxy error:', err);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Proxy error: ' + err.message);
      }
    });
    
    // Create the main HTTP server for proxying
    const server = http.createServer((req, res) => {
      // Special case for health check
      if (req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString()
        }));
        return;
      }
      
      // Forward all other requests to Next.js
      proxy.web(req, res);
    });
    
    // Handle WebSocket connections (crucial for video calls)
    server.on('upgrade', (req, socket, head) => {
      proxy.ws(req, socket, head);
    });
    
    // Close the quick server and start the real proxy server
    quickServer.close(() => {
      server.listen(5000, '0.0.0.0', () => {
        console.log('Port forwarding server running on port 5000');
        console.log('Forwarding requests to Next.js on port 3000');
      });
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('Shutting down servers...');
      
      if (nextApp.pid) {
        try {
          process.kill(nextApp.pid);
        } catch (err) {
          console.error('Error killing Next.js process:', err);
        }
      }
      
      proxy.close();
      server.close(() => {
        console.log('Server shutdown complete.');
        process.exit(0);
      });
    });
  }, 8000); // Wait 8 seconds for Next.js to be ready
});