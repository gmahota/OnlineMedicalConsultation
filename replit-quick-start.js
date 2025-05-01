/**
 * Quick start server for Replit to immediately open port 5000
 * We need this because Replit times out if the port isn't opened within 20 seconds.
 * This server opens port 5000 immediately while Next.js builds in the background.
 */
const http = require('http');
const { spawn } = require('child_process');

// Create a minimal server that opens port 5000 immediately
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Medical Consultation App - Loading</title>
        <meta http-equiv="refresh" content="5">
        <style>
          body { 
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f9fafb;
            color: #1f2937;
          }
          .container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
            background-color: white;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          h1 { font-size: 1.875rem; margin-bottom: 1rem; color: #1e40af; }
          p { margin-bottom: 1.5rem; line-height: 1.6; color: #4b5563; }
          .loader {
            border: 5px solid #e5e7eb;
            border-top: 5px solid #1e40af;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 1.5rem auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .progress {
            height: 8px;
            background-color: #e5e7eb;
            border-radius: 4px;
            width: 100%;
            overflow: hidden;
            margin-bottom: 1rem;
          }
          .progress-bar {
            height: 100%;
            width: 0%;
            background-color: #1e40af;
            border-radius: 4px;
            animation: fill 25s linear forwards;
          }
          @keyframes fill {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Medical Consultation App</h1>
          <p>The Next.js application is starting up. This can take up to 30 seconds...</p>
          <div class="progress">
            <div class="progress-bar"></div>
          </div>
          <div class="loader"></div>
          <p>This page will automatically refresh.</p>
        </div>
      </body>
    </html>
  `);
});

// Open port 5000 immediately
server.listen(5000, '0.0.0.0', () => {
  console.log('Quick start server listening on port 5000');
  
  // Start Next.js in the background
  console.log('Starting Next.js in the background...');
  const nextProcess = spawn('npm', ['run', 'dev'], {
    env: {
      ...process.env,
      PORT: '3000'  // Have Next.js use port 3000
    },
    stdio: 'pipe'
  });
  
  // Log Next.js output
  nextProcess.stdout.on('data', (data) => {
    console.log(`Next.js: ${data.toString().trim()}`);
  });
  
  nextProcess.stderr.on('data', (data) => {
    console.error(`Next.js Error: ${data.toString().trim()}`);
    
    // When Next.js is ready, shut down our placeholder server
    if (data.toString().includes('Ready in')) {
      console.log('Next.js is ready! Setting up proxy...');
      
      // Create a proxy that forwards requests to Next.js
      const httpProxy = require('http-proxy');
      
      // Replace our server with a proxy
      server.close(() => {
        console.log('Quick start server closed, starting proxy...');
        
        // Create the proxy server
        const proxy = httpProxy.createProxyServer({
          target: {
            host: 'localhost',
            port: 3000
          },
          ws: true // Enable WebSocket proxying
        });
        
        // Handle proxy errors
        proxy.on('error', (err, req, res) => {
          console.error('Proxy error:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Proxy Error');
        });
        
        // Create server that uses the proxy
        const proxyServer = http.createServer((req, res) => {
          proxy.web(req, res);
        });
        
        // Handle WebSocket connections
        proxyServer.on('upgrade', (req, socket, head) => {
          proxy.ws(req, socket, head);
        });
        
        proxyServer.listen(5000, '0.0.0.0', () => {
          console.log('Proxy is running on port 5000, forwarding to Next.js on port 3000');
        });
      });
    }
  });
  
  // Clean up on exit
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    try {
      nextProcess.kill();
    } catch (e) {
      console.error('Error killing Next.js process:', e);
    }
    process.exit(0);
  });
});