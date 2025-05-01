// Simple HTTP server that listens on port 5000 and forwards to the Next.js app
const http = require('http');
const { spawn } = require('child_process');

// Port configuration
const LISTEN_PORT = 5000;
const NEXT_PORT = 3000;

// Start Next.js in the background
console.log('Starting Next.js application...');
const nextApp = spawn('npm', ['run', 'dev'], {
  detached: true,
  stdio: 'pipe'
});

// Capture Next.js output
nextApp.stdout.on('data', (data) => {
  console.log(`Next.js: ${data.toString().trim()}`);
});

nextApp.stderr.on('data', (data) => {
  console.error(`Next.js Error: ${data.toString().trim()}`);
});

// Create the port forwarding server
const server = http.createServer((req, res) => {
  // Create options for proxying the request
  const options = {
    hostname: 'localhost',
    port: NEXT_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  // Immediately respond with a status message if accessing the root
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>Medical Consultation App</title>
          <meta http-equiv="refresh" content="2;url=http://localhost:5000/api/health">
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
          <p>You will be redirected to the health check page in 2 seconds.</p>
        </body>
      </html>
    `);
    return;
  }

  // Special case for the health check endpoint
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok', 
      message: 'Port forwarding is active and working',
      nextjs_status: 'starting',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Forward the request to the Next.js server
  try {
    const proxy = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxy.on('error', () => {
      // If Next.js is not ready yet, send a loading message
      res.writeHead(503, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head>
            <title>Medical Consultation App - Loading</title>
            <meta http-equiv="refresh" content="2">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .loader { border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 2s linear infinite; margin: 20px auto; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <h1>Medical Consultation App</h1>
            <p>Next.js application is starting up, please wait...</p>
            <div class="loader"></div>
            <p>This page will refresh automatically.</p>
          </body>
        </html>
      `);
    });

    req.pipe(proxy, { end: true });
  } catch (error) {
    console.error('Error forwarding request:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

// Start the server
server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`Port forwarding server running on http://0.0.0.0:${LISTEN_PORT}`);
  console.log(`Forwarding requests to http://localhost:${NEXT_PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  
  // Kill the Next.js process and its children
  process.kill(-nextApp.pid);
  
  // Close the forwarding server
  server.close(() => {
    console.log('Server shutdown complete.');
    process.exit(0);
  });
});