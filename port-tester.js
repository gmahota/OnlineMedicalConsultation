/**
 * Port Tester Script
 * This script simply tests if we can bind to port 5000 directly
 */

const http = require('http');

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Port 5000 is open!');
});

// Try binding to port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ SUCCESS: Server running at http://0.0.0.0:5000/');
  console.log('Press Ctrl+C to close the server');
});