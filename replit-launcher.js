/**
 * Replit launcher for Next.js applications
 * 
 * This script:
 * 1. Immediately opens port 5000 with a loading page
 * 2. Starts Next.js on port 3000
 * 3. Once Next.js is ready, forwards all traffic from port 5000 to 3000
 */

const http = require('http');
const { spawn } = require('child_process');

// Create a simple HTTP server on port 5000
const server = http.createServer((req, res) => {
  // Forward requests to Next.js on port 3000
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  // Try to forward to Next.js
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    // If Next.js isn't ready yet, show a loading page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Consultation App</title>
          <meta http-equiv="refresh" content="3">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f0f4f8; }
            .container { max-width: 500px; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #3b82f6; margin-bottom: 1rem; }
            p { color: #4b5563; line-height: 1.5; }
            .spinner { display: inline-block; width: 50px; height: 50px; border: 3px solid rgba(0,0,0,.1); border-radius: 50%; border-top-color: #3b82f6; animation: spin 1s ease-in-out infinite; margin: 2rem 0; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Medical Consultation App</h1>
            <div class="spinner"></div>
            <p>Starting your application, please wait a moment...</p>
            <p>The page will refresh automatically when ready.</p>
          </div>
        </body>
      </html>
    `);
  });

  // Forward the request body
  req.pipe(proxyReq);
});

// Immediately open port 5000 for Replit
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ PORT 5000 IS OPEN - Starting Next.js on port 3000');
  
  // Start Next.js on port 3000
  const nextProcess = spawn('next', ['dev', '-p', '3000'], {
    stdio: 'inherit'
  });
  
  // Log when Next.js exits
  nextProcess.on('exit', (code) => {
    console.log(`Next.js process exited with code ${code}`);
    server.close(() => {
      process.exit(code || 0);
    });
  });
});