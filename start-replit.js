// Super simple HTTP server on port 5000 for Replit
const http = require('http');

console.log('🚀 Starting Medical Consultation App on port 5000 for Replit...');

// Create an ultra basic HTTP server that simply opens port 5000
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Medical Consultation App - Port 5000 is open');
});

// Explicitly bind to port 5000 - this is what Replit expects
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ SERVER RUNNING: Port 5000 is now open');
  console.log('The server is successfully running on port 5000');
});