// Simplest possible port 5000 opener
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Port 5000 is open');
}).listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});