// Ultra simple HTTP server that listens on port 5000 to satisfy Replit
const http = require('http');

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Medical Consultation App</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
          h1 { color: #4a5568; }
          .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .success { color: #059669; }
          .button { 
            display: inline-block; 
            background: #4f46e5; 
            color: white; 
            padding: 10px 20px; 
            border-radius: 6px; 
            text-decoration: none;
            margin-top: 20px;
          }
          .button:hover { background: #4338ca; }
        </style>
      </head>
      <body>
        <h1>Medical Consultation App</h1>
        
        <div class="card">
          <h2>Development Status</h2>
          <p class="success">✓ Server is running on port 5000</p>
          <p>This is a placeholder page to satisfy Replit's port 5000 requirement.</p>
          <p>The Next.js application is running separately on port 3000.</p>
          
          <a href="/api/health" class="button">Check API Health</a>
        </div>
      </body>
    </html>
  `);
});

// Listen on port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ Simple server running on port 5000');
});