#!/bin/bash

# Script to run the Next.js server and execute the comprehensive tests

# Check if the server is already running on port 3003
if nc -z localhost 3003 2>/dev/null; then
  echo "Next.js server is already running on port 3003"
else
  echo "Starting Next.js server on port 3003..."
  # Start the Next.js server in the background
  cd "$(dirname "$0")" # Navigate to the next-app directory
  npm run dev -- -p 3003 &
  SERVER_PID=$!
  
  # Wait for the server to start
  echo "Waiting for server to start..."
  while ! nc -z localhost 3003 2>/dev/null; do
    sleep 1
  done
  echo "Server started successfully!"
fi

# Ask which tests to run
echo "Which tests would you like to run?"
echo "1. Comprehensive tests (standard property types)"
echo "2. Edge case tests (unusual property scenarios)"
echo "3. Both comprehensive and edge case tests"
read -p "Enter your choice (1-3): " TEST_CHOICE

case $TEST_CHOICE in
  1)
    echo "Running comprehensive tests..."
    node test-comprehensive.js
    ;;
  2)
    echo "Running edge case tests..."
    node test-edge-cases.js
    ;;
  3)
    echo "Running comprehensive tests..."
    node test-comprehensive.js
    echo -e "\n\n"
    echo "Running edge case tests..."
    node test-edge-cases.js
    ;;
  *)
    echo "Invalid choice. Running comprehensive tests by default..."
    node test-comprehensive.js
    ;;
esac

# If we started the server, ask if we should stop it
if [ -n "$SERVER_PID" ]; then
  read -p "Tests completed. Stop the Next.js server? (y/n): " STOP_SERVER
  if [ "$STOP_SERVER" = "y" ]; then
    echo "Stopping Next.js server..."
    kill $SERVER_PID
    echo "Server stopped."
  else
    echo "Server is still running on port 3003. Remember to stop it manually when done."
  fi
else
  echo "Tests completed. The Next.js server was already running and will continue to run."
fi
