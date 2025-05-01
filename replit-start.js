/**
 * Replit startup script for Next.js applications
 * Opens port 5000 instantly, then starts Next.js on port 3000
 */

const http = require('http');
const { spawn } = require('child_process');

// Define ports
const REPLIT_PORT = 5000;
const NEXTJS_PORT = 3000;

// Log startup
console.log(`Starting Replit port forwarding (${REPLIT_PORT} → ${NEXTJS_PORT})...`);

// Create a minimal server that immediately opens port 5000
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Starting Next.js Application</title>
        <meta http-equiv="refresh" content="2">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
          .spinner { display: inline-block; width: 50px; height: 50px; border: 3px solid rgba(0,0,0,.1); border-radius: 50%; border-top-color: #333; animation: spin 1s ease-in-out infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <h1>Starting Next.js</h1>
        <div class="spinner"></div>
        <p>Please wait while the application initializes...</p>
      </body>
    </html>
  `);
});

// Start the server immediately
server.listen(REPLIT_PORT, '0.0.0.0', () => {
  console.log(`✅ PORT ${REPLIT_PORT} OPENED - Starting Next.js`);
  
  // Start Next.js on port 3000
  const nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: NEXTJS_PORT.toString() }
  });
  
  // Handle Next.js exit
  nextProcess.on('exit', (code) => {
    console.log(`Next.js process exited with code ${code}`);
    process.exit(code || 0);
  });
});