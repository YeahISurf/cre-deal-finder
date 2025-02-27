# Environment Variables Setup

This project uses environment variables to manage API keys and other sensitive information. This approach keeps sensitive data out of the codebase and allows for different configurations in different environments.

## Available Environment Variables

The following environment variables are used in this project:

- `OPENAI_API_KEY`: Your OpenAI API key for accessing the OpenAI API

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
   ```

### Production Deployment

For production environments, set the environment variables according to your hosting provider's instructions:

- **Vercel**: Set environment variables in the Vercel dashboard under Project Settings > Environment Variables
- **Heroku**: Use `heroku config:set OPENAI_API_KEY=your_key`
- **AWS**: Use AWS Parameter Store or Secrets Manager

## Security Notes

- Never commit your `.env` files to version control
- The `.env` files are already added to `.gitignore` to prevent accidental commits
- Regularly rotate your API keys for better security
- Use different API keys for development and production environments

## Troubleshooting

If you encounter issues with API access:

1. Verify that your `.env` files exist and contain the correct API keys
2. Ensure the application has permission to read the `.env` files
3. Check that the environment variables are being loaded correctly
4. For the Next.js app, you may need to restart the development server after changing environment variables
