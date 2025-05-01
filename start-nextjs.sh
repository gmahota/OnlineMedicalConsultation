#!/bin/bash

# Start Next.js in the background
echo "Starting Next.js..."
next dev &
NEXT_PID=$!

# Give Next.js a moment to start
sleep 2

# Start the proxy server
echo "Starting proxy server on port 5000..."
node server.js

# If the proxy server exits, kill Next.js
kill $NEXT_PID