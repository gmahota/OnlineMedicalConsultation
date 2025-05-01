#!/bin/bash

# Start the proxy server in the background
echo "Starting proxy server on port 5000..."
node proxy.js &
PROXY_PID=$!

# Wait a moment for the proxy to fully start
sleep 1

# Start Next.js
echo "Starting Next.js on port 3000..."
npm run dev

# If Next.js exits, kill the proxy server
kill $PROXY_PID