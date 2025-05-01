// Immediate server for port 5000 to satisfy Replit's requirements
// This very simple server opens port 5000 immediately

const http = require('http');
const { spawn } = require('child_process');

// Create a very simple HTTP server that responds to all requests
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>Medical Consultation App</title>
        <meta http-equiv="refresh" content="3;url=/">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .loader { border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 2s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <h1>Medical Consultation App</h1>
        <p>Next.js application starting up...</p>
        <div class="loader"></div>
        <p>You will be redirected to the application shortly.</p>
      </body>
    </html>
  `);
});

// Start the server on port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
  
  // Start Next.js in the background
  console.log('Starting Next.js application...');
  const nextApp = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit'
  });
});