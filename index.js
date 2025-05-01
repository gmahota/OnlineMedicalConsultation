/**
 * Replit startup script for port 5000
 * This file is the main entry point for Replit
 */

const http = require('http');
const { spawn } = require('child_process');

// Create a server on port 5000
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Medical Consultation App</title>
        <meta http-equiv="refresh" content="1;url=http://localhost:3000${req.url || '/'}">
        <style>
          body { font-family: system-ui, sans-serif; text-align: center; padding-top: 20vh; }
          .spinner { display: inline-block; width: 50px; height: 50px; border: 3px solid rgba(0,0,0,.1); border-radius: 50%; border-top-color: #09f; animation: spin 1s linear infinite; margin: 20px auto; }
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <h1>Medical Consultation App</h1>
        <div class="spinner"></div>
        <p>Redirecting to application...</p>
      </body>
    </html>
  `);
});

// Listen on port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ PORT 5000 OPENED - Starting Next.js...');
  
  // Start Next.js on port 3000
  const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
    stdio: 'inherit'
  });
  
  nextProcess.on('exit', (code) => {
    console.log('Next.js process exited with code:', code);
    process.exit(code || 0);
  });
});