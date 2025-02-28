# PFISH CRE AI DEAL FINDER - Next.js Frontend

A modern React-based frontend for the CRE Deal Finder tool, optimized for deployment on Vercel.

## Features

- **React Components**: Modern, responsive UI built with React and Next.js
- **Chakra UI**: Polished, accessible component library with custom theming
- **API Routes**: Serverless functions for OpenAI integration
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Optimized for Vercel**: Ready for one-click deployment
- **Model Cascade System**: Automatically tries multiple OpenAI models (o1 → o1-mini → GPT-3.5-Turbo)
- **Robust Error Handling**: Comprehensive error management with fallbacks
- **JSON Parsing**: Automatic cleanup of AI-generated JSON responses

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deployment on Vercel

The easiest way to deploy this application is to use Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Click Deploy

Vercel will automatically detect the Next.js project and configure all necessary build settings.

## Configuration

#### Chakra UI Theme

The application uses a custom Chakra UI theme with branded colors:

```js
// In /theme.js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    primary: {
      50: '#f0f7ff',
      100: '#e0eefe',
      200: '#bae0fd',
      300: '#7cc8fb',
      400: '#36aaf4',
      500: '#0d96e6',
      600: '#0077c2',
      700: '#015fa0',
      800: '#065285',
      900: '#08426e',
    }
  }
});

export default theme;
```

#### OpenAI Models

The application supports multiple OpenAI models with model-specific parameter handling:

```js
// In /pages/api/analyze.js
// Model-specific parameters are automatically applied
if (modelToUse === "o1") {
  params.max_completion_tokens = 1500;
  params.response_format = { type: "json_object" };
} else if (modelToUse === "o1-mini") {
  params.max_completion_tokens = 1500;
  // o1-mini doesn't support response_format
} else if (modelToUse === "gpt-3.5-turbo") {
  params.max_tokens = 1500;
  params.temperature = 0.1;
  params.response_format = { type: "json_object" };
  // Add system message for GPT models
  params.messages.unshift({
    role: "system",
    content: `You are a commercial real estate investment analyst...`
  });
}
```

### Environment Variables

Create a `.env` file in the root directory with your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

For testing different models, you can use the included test scripts (see README-model-tests.md).

## Project Structure

- `pages/` - Next.js pages and API routes
  - `index.js` - Main application page with property form
  - `api/analyze.js` - OpenAI integration endpoint with model cascade
- `components/` - React components
  - `AnalysisResults.js` - Displays property analysis with scores and explanations
  - `PropertyForm.js` - Form for entering property details
- `styles/` - Global styles and Tailwind CSS configuration
- `public/` - Static assets
- `test-*.js` - Various test scripts for model testing and validation

## Testing

The project includes comprehensive testing scripts:

- Basic model tests: `test-models.js`, `test-models-env.js`, `test-models-dotenv.js`
- Fixed model tests: `test-models-fixed.js`, `test-models-final.js`
- Specific model tests: `test-opus-model.js`
- Comprehensive property tests: `test-comprehensive.js`, `test-edge-cases.js`

See `README-tests.md` and `README-model-tests.md` for detailed testing instructions.

## Environment Variables

For production, you should add your OpenAI API key. This can be configured in Vercel's dashboard under Project Settings > Environment Variables:

- `OPENAI_API_KEY`: Your OpenAI API key with access to o1, o1-mini, and gpt-3.5-turbo models

## Troubleshooting

If you encounter issues with the OpenAI API:

1. Check that your API key has access to the models being used
2. Verify that your account has sufficient quota
3. Check the browser console for detailed error messages
4. Try using a different model by modifying the `forceModel` parameter

See the main README.md for more detailed troubleshooting information.
