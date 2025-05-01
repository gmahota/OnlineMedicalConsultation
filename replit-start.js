// Super simple port forwarding server for Replit
// Immediately opens port 5000 and executes npm run dev in the background

const http = require('http');
const { exec } = require('child_process');

// Create an extremely simple HTTP server
const server = http.createServer((req, res) => {
  // Redirect to the Next.js app
  res.writeHead(302, {
    'Location': `http://localhost:3000${req.url || '/'}`
  });
  res.end();
});

// Start the server immediately on port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('Quick start server running on port 5000');
  
  // Start Next.js in the background
  console.log('Starting Next.js in the background...');
  exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting Next.js: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Next.js stderr: ${stderr}`);
    }
    console.log(`Next.js stdout: ${stdout}`);
  });
});