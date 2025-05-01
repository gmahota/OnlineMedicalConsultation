#!/bin/bash

# Immediate port 5000 opener
echo "Starting temporary server on port 5000 to satisfy Replit..."
node -e "
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Starting...');
});
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ PORT 5000 IS OPEN');
});
" &
TEMP_SERVER_PID=$!

# Set env vars for Next.js
export PORT=3000
export NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Wait a moment to ensure port 5000 is opened
sleep 1

# Start Next.js
echo "Starting Next.js development server..."
npm run dev