/**
 * Quick start server for Replit to immediately open port 5000
 * We need this because Replit times out if the port isn't opened within 20 seconds.
 * This server opens port 5000 immediately while Next.js builds in the background.
 */
const http = require('http');
const { spawn } = require('child_process');

// Start Next.js in the background
console.log('Starting Next.js application...');
const nextApp = spawn('npm', ['run', 'dev'], {
  detached: true,
  stdio: 'inherit'
});

// Create a simple HTTP server to open port 5000 immediately
const server = http.createServer((req, res) => {
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
        <p>Next.js application is starting up, please wait...</p>
        <div class="loader"></div>
        <p>This page will refresh automatically.</p>
      </body>
    </html>
  `);
});

server.listen(5000, '0.0.0.0', () => {
  console.log('Quick start server running on port 5000');
});

// Forward the real requests after Next.js is ready
setTimeout(() => {
  // After 10 seconds, start the port forwarding
  require('./port-forwarding.js');
  
  // Close this quick start server to let the port forwarding take over
  server.close(() => {
    console.log('Quick start server closed, port forwarding active');
  });
}, 10000);