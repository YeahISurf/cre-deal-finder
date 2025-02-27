# Environment Variables Setup

This project uses environment variables to manage API keys and other sensitive information. This approach keeps sensitive data out of the codebase and allows for different configurations in different environments.

## Available Environment Variables

### Required Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key for accessing the OpenAI API (required for all API functionality)

### Optional Environment Variables

- `DEFAULT_MODEL`: The default model to use (options: "o1", "o1-mini", "gpt-3.5-turbo")
- `API_TIMEOUT`: Timeout in milliseconds for API requests (default: 30000)
- `DEBUG`: Set to "true" to enable additional debug logging

## Setting Up Environment Variables

### Local Development

1. Copy the example environment files to create your own:
   ```bash
   cp .env.example .env
   cp next-app/.env.example next-app/.env
   ```

2. Edit the `.env` files and add your actual API keys:
   ```
   # .env and next-app/.env
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional configuration
   DEFAULT_MODEL=o1
   API_TIMEOUT=30000
   DEBUG=false
   ```

### Model-Specific Configuration

For testing different models, you can set the `DEFAULT_MODEL` environment variable:

```
# To use Claude 3 Opus
DEFAULT_MODEL=o1

# To use Claude 3 Haiku
DEFAULT_MODEL=o1-mini

# To use GPT-3.5 Turbo
DEFAULT_MODEL=gpt-3.5-turbo
```

The application will automatically apply the correct parameters for each model:
- o1: Uses `max_completion_tokens` and supports response_format
- o1-mini: Uses `max_completion_tokens` but no response_format or system messages
- gpt-3.5-turbo: Uses standard parameters with `max_tokens`

### Production Deployment

For production environments, set the environment variables according to your hosting provider's instructions:

- **Vercel**: Set environment variables in the Vercel dashboard under Project Settings > Environment Variables
- **Heroku**: Use `heroku config:set OPENAI_API_KEY=your_key`
- **AWS**: Use AWS Parameter Store or Secrets Manager
- **Docker**: Use environment variables in your docker-compose.yml or Dockerfile

Example for Vercel deployment:
1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - Name: `OPENAI_API_KEY`, Value: your actual OpenAI API key
   - Name: `DEFAULT_MODEL`, Value: `o1` (or your preferred default model)

## Security Notes

- Never commit your `.env` files to version control
- The `.env` files are already added to `.gitignore` to prevent accidental commits
- Regularly rotate your API keys for better security
- Use different API keys for development and production environments
- Consider using a secrets manager for production environments
- For testing scripts, use environment variables instead of hardcoded API keys
- Clear your command history after running commands with API keys:
  ```bash
  history -c  # This will clear your command history
  ```

## Troubleshooting

If you encounter issues with API access:

1. Verify that your `.env` files exist and contain the correct API keys
2. Ensure the application has permission to read the `.env` files
3. Check that the environment variables are being loaded correctly
4. For the Next.js app, you may need to restart the development server after changing environment variables
5. Check that your OpenAI API key has access to the models being used (o1, o1-mini, gpt-3.5-turbo)
6. Verify that your account has sufficient quota for the API calls
7. If using dotenv, make sure the package is installed: `npm install dotenv`
8. Check for any error messages in the console or server logs

### Common Error Messages

- **"Authentication error"**: Your API key is invalid or expired
- **"Model not found"**: Your account doesn't have access to the requested model
- **"Rate limit exceeded"**: You've hit the API rate limits for your account
- **"Insufficient quota"**: Your account doesn't have enough quota for the request
- **"Request timed out"**: The API request took too long to complete

### Testing API Key Access

You can test your API key and model access using the included test scripts:

```bash
cd next-app
./run-model-tests.sh YOUR_API_KEY
```

This will test all supported models and report any access issues.
