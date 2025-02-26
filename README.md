# PFISH LOBSTER COIN CRE Deal Finder v1.3.0

![Project Status](https://img.shields.io/badge/status-beta-yellow)
![Version](https://img.shields.io/badge/version-1.3.0-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-o1%20%7C%20o1--mini%20%7C%20GPT--3.5--turbo-green)

Premium AI-powered analysis of commercial real estate listings to identify investment opportunities based on seller motivation, transaction complexity, and property characteristics.

![Screenshot](https://i.imgur.com/placeholder-screenshot.png)

## Overview

This tool automatically analyzes commercial real estate listings using OpenAI to identify potential investment opportunities. It evaluates properties based on three key criteria:

1. **Seller Motivation**: Signs that the seller may be motivated to sell quickly or at favorable terms
2. **Transaction Complexity**: Factors that might reduce buyer competition or create unique opportunities
3. **Property Characteristics**: Features indicating value-add potential or situations where perceived risk exceeds actual risk

## Project Status and Known Issues

**Current Status**: Beta (v1.3.0)

### 🐛 Known Issues

1. **OpenAI o1 Model Parameter Issues**: 
   - Fixed in v1.3.0: o1 models require `max_completion_tokens` instead of `max_tokens`
   - Fixed in v1.3.0: o1-mini does not support 'system' role in messages
   - We now handle these model-specific requirements correctly

2. **API Reliability**: 
   - Occasional timeouts or rate-limiting from OpenAI API
   - Model availability may vary based on your account permissions
   - Multi-model cascade system ensures some model will work

3. **Error Details**:
   - We now log detailed error information for better diagnosis
   - Implemented proper error handling for each model type
   - Added fallback mechanisms to ensure analysis is always available

### 🔧 Troubleshooting

- **API Key Issues**: Ensure you're using a valid OpenAI API key with appropriate quota and model access
- **Model Access**: Check your OpenAI account to see which models you have access to
- **Fallback Mode**: If encountering persistent API issues, use the "Sample Analysis" mode toggle
- **Error Details**: Check browser console for more detailed error messages
- **Rate Limiting**: If you receive errors, wait a few minutes before trying again

## Next.js Version (Recommended for Vercel)

A modern React-based version optimized for Vercel deployment is available in the `next-app` directory:

1. Navigate to the Next.js app:
```bash
cd next-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the application

### Deploying to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to **next-app** (important!)
4. Deploy with a single click

## Implementation Details

### How It Works

1. **Model Cascade**: The application tries models in this order: o1 → o1-mini → GPT-3.5-Turbo
2. **Model-Specific Handling**: Each model has custom parameters and prompt formats
3. **Prompt Engineering**: Carefully crafted prompts guide the AI to evaluate specific investment criteria
4. **Scoring System**: Each property receives scores (1-10) across three categories and a weighted total
5. **Fallback Mechanism**: In case of API errors, the system uses predefined sample analyses

### Technical Architecture

- **Frontend**: React with Next.js and TailwindCSS
- **API Integration**: OpenAI API via API routes (serverless functions)
- **State Management**: React hooks for local state
- **Styling**: TailwindCSS with custom components
- **Error Handling**: Comprehensive error management with fallbacks

## Investment Criteria

The tool evaluates listings based on three main categories:

### Seller Characteristics
- Highly Motivated Ownership
- Distressed or Under-Capitalized Ownership
- Passive or Inexperienced Ownership
- Institutional and Corporate Sellers
- Time-Sensitive Sellers

### Transaction Characteristics
- Short Closing Timeframe
- Portfolio and Multi-Market Deals
- Distressed or Complex Sales
- Encumbrances or Legal Complexities
- Off-Market
- Small Buyer Pool

### Property Characteristics
- Below Market Rents
- Deferred Maintenance or Poor Condition
- Older or Class B/C Buildings
- High-Vacancy or Mismanaged Properties
- Low Floor Area Ratio (FAR)
- Offered for Land Value
- Below Replacement Cost
- Unique/Niche Property Types

## Version History

### v1.3.0 (Current)
- Fixed o1 and o1-mini model integration issues:
  - Now using `max_completion_tokens` instead of `max_tokens` for o1 models
  - Removed 'system' role messages for o1-mini model
- Enhanced model cascade system with better error handling
- Added detailed error logging for diagnostics
- Updated README with exact error details and fixes

### v1.2.0
- Simplified API approach to use only GPT-3.5-Turbo for reliability
- Fixed JSON parsing errors with improved error handling
- Enhanced premium Apple-inspired UI
- Added detailed error reporting
- Improved fallback mechanisms

### v1.1.0
- Implemented model cascade system (o1 → o1-mini → gpt-4o → gpt-3.5-turbo)
- Added model tracking information to results
- Added sample analysis mode toggle
- Enhanced error handling

### v1.0.0
- Initial release with basic OpenAI integration
- Implemented scoring system for CRE properties
- Added React/Next.js frontend
- Created sample property functionality

## Future Roadmap

### v1.4.0 (Planned)
- Add support for multiple property analysis
- Improve error reporting and handling
- Add property comparison features
- Implement data persistence (save analyses)

### v2.0.0 (Future)
- Integrate with LoopNet scraper for automated listing analysis
- Add geographic filtering
- Implement trend tracking
- Add portfolio analysis tools

## Python Version (Alternative)

The original Python implementation is also available with two interfaces:

### Web UI (Streamlit)

```bash
pip install -r requirements.txt
streamlit run app.py
```

### Command Line

```bash
python analyze_with_openai.py
```

## Project Structure

```
cre-deal-finder/
├── next-app/                   # Next.js version (Vercel optimized)
│   ├── pages/                  # Next.js pages and API routes
│   ├── components/             # React components
│   ├── styles/                 # CSS and Tailwind styles
│   └── public/                 # Static assets
├── app.py                      # Streamlit web application
├── analyze_with_openai.py      # OpenAI-based analyzer script
├── test_listing_analyzer.py    # Basic keyword-based analyzer script
├── analyzer/                   # Analysis modules
│   ├── openai_analyzer.py      # OpenAI integration for analysis
│   └── simple_nlp.py           # Basic keyword analysis
├── config/                     # Configuration files
└── sample_listings/            # Sample LoopNet listings
```

## License

MIT License