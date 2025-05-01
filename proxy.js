// Simple HTTP proxy to forward traffic from port 5000 to the Next.js server on port 3000
const http = require('http');

const PORT = 5000;
const TARGET_PORT = 3000;

const server = http.createServer((req, res) => {
  console.log(`Received request for ${req.url}`);
  
  const options = {
    hostname: 'localhost',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  req.pipe(proxyReq, { end: true });
  
  proxyReq.on('error', (err) => {
    console.error('Proxy request error:', err);
    res.writeHead(502);
    res.end('Bad Gateway - Next.js server may not be running');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Forwarding requests to http://localhost:${TARGET_PORT}`);
});