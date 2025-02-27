#!/bin/bash

# Check if node-fetch is installed
if ! npm list node-fetch > /dev/null 2>&1; then
  echo "Installing node-fetch..."
  npm install node-fetch
fi

# Check if API key is provided as an argument
if [ -z "$1" ]; then
  echo "Error: API key is required."
  echo "Usage: ./run-model-tests.sh YOUR_API_KEY"
  exit 1
fi

# Run the test script with the API key
echo "Running model tests..."
node test-models.js "$1"

# Remind user to delete the API key
echo ""
echo "Tests completed. Remember to remove your API key from your command history:"
echo "history -c  # This will clear your command history"
echo ""
echo "Or you can edit your history file manually:"
echo "~/.bash_history or ~/.zsh_history"
