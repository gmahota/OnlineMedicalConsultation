// Custom Next.js server for Replit
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Start servers on both port 3000 and 5000 for Replit compatibility
const PORT_3000 = 3000;
const PORT_5000 = 5000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create server on port 3000
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT_3000, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${PORT_3000}`);
  });

  // Create a proxy server on port 5000 that forwards to 3000
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT_5000, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${PORT_5000}`);
  });
});