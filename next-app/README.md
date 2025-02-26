# CRE Deal Finder - Next.js Frontend

A modern React-based frontend for the CRE Deal Finder tool, optimized for deployment on Vercel.

## Features

- **React Components**: Modern, responsive UI built with React and Next.js
- **Tailwind CSS**: Clean, customizable styling
- **API Routes**: Serverless functions for OpenAI integration
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Optimized for Vercel**: Ready for one-click deployment

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

You can customize the OpenAI model used by editing the `/pages/api/analyze.js` file:

```js
const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo", // Change to "gpt-4" for higher accuracy
  // ... other options
});
```

## Project Structure

- `pages/` - Next.js pages and API routes
- `components/` - React components
- `styles/` - Global styles and Tailwind CSS configuration
- `public/` - Static assets

## Environment Variables

For production, you might want to add default API keys or other settings. These can be configured in Vercel's dashboard under Project Settings > Environment Variables.
