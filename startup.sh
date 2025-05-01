#!/bin/bash
# Start the Next.js server in the background
npm run dev &
NEXTJS_PID=$!

# Give Next.js time to start
sleep 5

# Start the proxy server to forward port 5000 -> 3000
node proxy.js &
PROXY_PID=$!

# Wait for either process to exit
wait $NEXTJS_PID $PROXY_PID