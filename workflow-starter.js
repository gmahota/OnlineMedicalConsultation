// Immediate server for port 5000 to satisfy Replit workflow requirements
// This server opens port 5000 right away, then starts Next.js

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

// Create a simple HTTP server to open port 5000 immediately
console.log('Starting server on port 5000...');
const server = http.createServer((req, res) => {
  res.writeHead(302, {
    'Location': `http://localhost:3000${req.url || '/'}`
  });
  res.end();
});

// Listen on port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
  
  // Start Next.js directly (don't use npm run dev to avoid workflow confusion)
  console.log('Starting Next.js...');
  const nextProcess = spawn('npx', ['next', 'dev'], {
    stdio: 'inherit', // Show Next.js output in console
    env: { ...process.env, PORT: '3000' }
  });
  
  // Handle Next.js process exit
  nextProcess.on('exit', (code) => {
    console.log(`Next.js process exited with code ${code}`);
    server.close(() => {
      console.log('Server closed');
      process.exit(code || 0);
    });
  });
  
  // Handle script termination
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down...');
    nextProcess.kill();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});