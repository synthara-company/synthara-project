#!/bin/bash

# Install minimal dependencies
npm install express cors axios

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start the simple server
echo "Starting simple server..."
node simple-server.js
