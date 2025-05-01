// Simple wrapper to start Next.js directly on port 5000
// This helps avoid the timeout issue in Replit

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Define port explicitly to match Replit's expected port
const port = parseInt(process.env.PORT || '5000', 10);
const dev = process.env.NODE_ENV !== 'production';

// Create the Next.js app instance
console.log('Initializing Next.js app...');
const app = next({ dev });
const handle = app.getRequestHandler();

// First response flag to indicate server is ready
let firstResponseSent = false;

// Prepare the app
app.prepare().then(() => {
  // Create HTTP server that will forward requests to Next.js
  const server = createServer((req, res) => {
    // Respond immediately to the first request to show we're alive
    if (!firstResponseSent && req.url === '/') {
      firstResponseSent = true;
      console.log('Sending initial response to prevent timeout...');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head>
            <title>Medical Consultation App</title>
            <meta http-equiv="refresh" content="2">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .loader { border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 2s linear infinite; margin: 20px auto; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <h1>Medical Consultation App</h1>
            <p>Next.js application is starting...</p>
            <div class="loader"></div>
            <p>This page will automatically refresh when ready.</p>
          </body>
        </html>
      `);
      return;
    }
    
    // Parse the URL
    const parsedUrl = parse(req.url, true);
    
    // Let Next.js handle the request
    handle(req, res, parsedUrl);
  });
  
  // Start listening as soon as possible
  server.listen(port, '0.0.0.0', () => {
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
});