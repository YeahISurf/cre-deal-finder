#!/bin/bash

# Check if node-fetch and dotenv are installed
if ! npm list node-fetch > /dev/null 2>&1; then
  echo "Installing node-fetch..."
  npm install node-fetch
fi

if ! npm list dotenv > /dev/null 2>&1; then
  echo "Installing dotenv..."
  npm install dotenv
fi

# Check if .env file exists
if [ ! -f .env ] && [ ! -f .env.local ]; then
  # If API key is provided as an argument, create a temporary .env file
  if [ -n "$1" ]; then
    echo "Creating temporary .env file with provided API key..."
    echo "OPENAI_API_KEY=$1" > .env.temp
    
    # Run the test script with the temporary .env file
    echo "Running model tests with dotenv configuration..."
    DOTENV_CONFIG_PATH=.env.temp node test-models-dotenv.js
    
    # Remove the temporary .env file
    rm .env.temp
  else
    # No API key provided and no .env file exists
    echo "Error: No .env file found and no API key provided."
    echo "Usage: ./run-model-tests-dotenv.sh [YOUR_API_KEY]"
    echo ""
    echo "You can either:"
    echo "1. Provide your API key as a command line argument"
    echo "2. Create a .env or .env.local file with your API key"
    echo ""
    echo "Example .env file:"
    echo "OPENAI_API_KEY=your_api_key_here"
    echo "DEFAULT_MODEL=o1  # Optional: test only one model"
    echo "API_TIMEOUT=30000  # Optional: set API timeout in milliseconds"
    exit 1
  fi
else
  # .env file exists, run the test script
  echo "Running model tests with dotenv configuration..."
  node test-models-dotenv.js
fi

# Remind user about API key security
echo ""
echo "Tests completed."
if [ -n "$1" ]; then
  echo "Remember to remove your API key from your command history:"
  echo "history -c  # This will clear your command history"
  echo ""
  echo "Or you can edit your history file manually:"
  echo "~/.bash_history or ~/.zsh_history"
fi
