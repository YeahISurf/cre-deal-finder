#!/bin/bash

# Check if node-fetch is installed
if ! npm list node-fetch > /dev/null 2>&1; then
  echo "Installing node-fetch..."
  npm install node-fetch
fi

# Check if API key is provided as an argument
if [ -z "$1" ]; then
  echo "Error: API key is required."
  echo "Usage: ./run-model-tests-env.sh YOUR_API_KEY"
  exit 1
fi

# Set the API key as an environment variable
export OPENAI_API_KEY="$1"

# Run the test script with the environment variable
echo "Running model tests with environment variable OPENAI_API_KEY..."
node test-models-env.js

# Unset the API key environment variable when done
unset OPENAI_API_KEY

# Remind user to delete the API key
echo ""
echo "Tests completed. The API key has been removed from the environment."
echo "Remember to remove your API key from your command history:"
echo "history -c  # This will clear your command history"
echo ""
echo "Or you can edit your history file manually:"
echo "~/.bash_history or ~/.zsh_history"
