// Simple HTTP server that opens immediately on port 5000 and starts Next.js
const http = require('http');
const { spawn } = require('child_process');

// Port configuration
const LISTEN_PORT = 5000;
const NEXT_PORT = 3000;

// Create the server first to ensure port 5000 opens immediately
const server = http.createServer((req, res) => {
  // Immediately respond with a status message
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>Medical Consultation App</title>
        <meta http-equiv="refresh" content="2;url=http://localhost:5000">
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
        <p>Auto-refreshing in 2 seconds...</p>
      </body>
    </html>
  `);
});

// Start the server immediately
server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${LISTEN_PORT}`);
  
  // Start Next.js in the background AFTER server is ready
  console.log('Starting Next.js application...');
  const nextApp = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit'
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    nextApp.kill();
    server.close();
    process.exit(0);
  });
});