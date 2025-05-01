// Quick port opener for Replit
const http = require('http');
const { spawn } = require('child_process');

// Create a very simple server to open port 5000 immediately
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running');
});

// Open port 5000 immediately
server.listen(5000, '0.0.0.0', () => {
  console.log('Port 5000 is now open');
  
  // Start Next.js in a separate process
  const nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit'
  });
  
  // Handle Next.js process termination
  nextProcess.on('exit', (code) => {
    console.log(`Next.js process exited with code ${code}`);
    process.exit(code || 0);
  });
  
  // Handle this process termination
  process.on('SIGINT', () => {
    nextProcess.kill();
    server.close();
    process.exit(0);
  });
});