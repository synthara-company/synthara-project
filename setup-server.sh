#!/bin/bash

# Copy the server package.json to the root
cp package-server.json package.json

# Install dependencies
npm install

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start the server
echo "Starting server..."
node server.js
