# PFISH CRE AI DEAL FINDER

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
   - Fixed in v1.3.0: o1-mini does not support response_format parameter
   - We now handle these model-specific requirements correctly

2. **API Reliability**: 
   - Occasional timeouts or rate-limiting from OpenAI API
   - Model availability may vary based on your account permissions
   - Multi-model cascade system ensures some model will work

3. **JSON Parsing Challenges**:
   - AI models sometimes return improperly formatted JSON
   - Implemented robust JSON cleaning and parsing logic
   - Added fallback mechanisms for various response formats

4. **Error Details**:
   - We now log detailed error information for better diagnosis
   - Implemented proper error handling for each model type
   - Added fallback mechanisms to ensure analysis is always available

### 🔧 Troubleshooting

- **API Key Issues**: 
  - Ensure you're using a valid OpenAI API key with appropriate quota and model access
  - Check that your API key is correctly set in the environment variables
  - Verify your OpenAI account has access to the models being used (o1, o1-mini, gpt-3.5-turbo)

- **Model Access**: 
  - o1 and o1-mini models require specific account permissions
  - If you don't have access to o1 models, the system will fall back to gpt-3.5-turbo
  - Check your OpenAI account dashboard to see which models you have access to

- **JSON Parsing Errors**:
  - If you see "Failed to parse response" errors, try again as the model may generate better JSON on retry
  - Consider using a simpler property description with fewer special characters
  - The system includes automatic JSON repair for common formatting issues

- **Fallback Mode**: 
  - If encountering persistent API issues, use the "Sample Analysis" mode toggle
  - This provides a pre-generated analysis for testing the interface

- **Error Details**: 
  - Check browser console for more detailed error messages
  - The API returns specific error information to help diagnose issues
  - Common errors include: invalid API key, model not available, rate limiting

- **Rate Limiting**: 
  - If you receive errors, wait a few minutes before trying again
  - Consider implementing a retry mechanism with exponential backoff
  - Reduce the frequency of API calls if you're hitting rate limits

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

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env to add your OpenAI API key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to see the application

### Deploying to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to **next-app** (important!)
4. Add environment variables in the Vercel dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
5. Deploy with a single click

## Implementation Details

### How It Works

1. **Model Cascade System**: 
   - The application tries models in this order: o1 → o1-mini → GPT-3.5-Turbo
   - Each model is attempted in sequence until one succeeds
   - If all models fail, a fallback analysis is provided
   - The system tracks which models were attempted and which one succeeded

2. **Model-Specific Handling**: 
   - **o1**: Uses `max_completion_tokens` instead of `max_tokens`, supports response_format
   - **o1-mini**: Cannot use 'system' role messages, requires `max_completion_tokens`, doesn't support response_format
   - **GPT-3.5-Turbo**: Uses standard parameters with `max_tokens` and supports all features
   - Each model has custom prompts optimized for its capabilities

3. **Prompt Engineering**: 
   - Carefully crafted prompts guide the AI to evaluate specific investment criteria
   - Prompts are optimized for each model type
   - System includes instructions to focus on objective signals in the listing

4. **Scoring System**: 
   - Each property receives scores (1-10) across three categories:
     - Seller Motivation (40% of total score)
     - Transaction Complexity (30% of total score)
     - Property Characteristics (30% of total score)
   - A weighted total score is calculated based on these individual scores
   - Scores are accompanied by detailed explanations and relevant keywords

5. **JSON Handling**: 
   - Robust JSON parsing with automatic cleanup of common AI-generated JSON issues
   - Handles various response formats and structures
   - Normalizes different response formats into a consistent structure

6. **Fallback Mechanism**: 
   - In case of API errors, the system uses predefined sample analyses
   - Intelligent fallbacks based on error type (timeout, authentication, etc.)
   - Keyword extraction from listing text when AI analysis fails

### Technical Architecture

- **Frontend**: 
  - React with Next.js for server-side rendering
  - TailwindCSS for responsive styling
  - Component-based architecture for maintainability

- **API Integration**: 
  - OpenAI API via Next.js API routes (serverless functions)
  - Model cascade system with fallbacks
  - Comprehensive error handling

- **State Management**: 
  - React hooks for local state
  - Context API for shared state (when needed)

- **Styling**: 
  - TailwindCSS with custom components
  - Responsive design for all device sizes
  - Apple-inspired premium UI

- **Error Handling**: 
  - Comprehensive error management with fallbacks
  - Detailed error logging
  - User-friendly error messages

## Investment Criteria

The tool evaluates listings based on three main categories:

### Seller Characteristics
- **Highly Motivated Ownership** (8-10 points)
  - Explicit statements like "motivated seller," "must sell," "priced to sell"
  - Price reductions or below market pricing
  - Mentions of distress, bankruptcy, foreclosure, or liquidation
  
- **Distressed or Under-Capitalized Ownership** (7-9 points)
  - Signs of financial distress or inability to maintain the property
  - Mentions of deferred maintenance due to capital constraints
  - References to ownership's financial difficulties
  
- **Passive or Inexperienced Ownership** (6-8 points)
  - Indications of passive management or absentee ownership
  - Signs of mismanagement or operational inefficiencies
  - References to inherited properties or estate sales
  
- **Institutional and Corporate Sellers** (5-7 points)
  - Portfolio rationalization or strategy shifts
  - Corporate relocations or downsizing
  - Non-core asset dispositions
  
- **Time-Sensitive Sellers** (7-9 points)
  - Mentions of deadlines, time constraints, or urgent sales
  - References to tax considerations or year-end timing
  - Indications of life events necessitating quick sales

### Transaction Characteristics
- **Short Closing Timeframe** (7-9 points)
  - Explicit mentions of quick closing requirements
  - Indications of time sensitivity in the transaction
  
- **Portfolio and Multi-Market Deals** (6-8 points)
  - Bundled properties or portfolio sales
  - Properties across multiple markets or asset types
  
- **Distressed or Complex Sales** (8-10 points)
  - Foreclosures, short sales, REO properties
  - Bankruptcy or receivership sales
  - Properties with legal complications
  
- **Encumbrances or Legal Complexities** (7-9 points)
  - Title issues or easement complications
  - Zoning challenges or entitlement issues
  - Environmental concerns or remediation needs
  
- **Off-Market** (6-8 points)
  - Limited marketing or exposure
  - Pocket listings or quiet sales
  
- **Small Buyer Pool** (7-9 points)
  - Specialized property types with limited demand
  - Properties requiring specific expertise
  - Unusual locations or configurations

### Property Characteristics
- **Below Market Rents** (8-10 points)
  - Explicit mentions of below-market lease rates
  - Outdated leases or long-term leases without escalations
  - Opportunities for immediate rent increases
  
- **Deferred Maintenance or Poor Condition** (7-9 points)
  - Explicit mentions of needed repairs or renovations
  - References to "as-is" condition or fixer-upper status
  - Opportunities for value-add through physical improvements
  
- **Older or Class B/C Buildings** (6-8 points)
  - Older properties with modernization potential
  - Class B/C properties in improving locations
  - Buildings with good bones but outdated systems or finishes
  
- **High-Vacancy or Mismanaged Properties** (8-10 points)
  - Vacancy rates above market average
  - Signs of poor management or operational inefficiencies
  - Lease-up opportunities or repositioning potential
  
- **Low Floor Area Ratio (FAR)** (7-9 points)
  - Properties with unused development potential
  - Sites with zoning allowing for higher density
  - Opportunities for expansion or additional development
  
- **Offered for Land Value** (7-9 points)
  - Properties marketed primarily for their land value
  - Teardown opportunities or redevelopment plays
  - Sites with higher and better use potential
  
- **Below Replacement Cost** (8-10 points)
  - Properties offered at prices below construction costs
  - Opportunities to acquire at significant discount to replacement
  - Buildings with good physical condition at attractive price points
  
- **Unique/Niche Property Types** (6-8 points)
  - Specialized properties with limited buyer pool
  - Unusual configurations or designs
  - Properties requiring specific expertise to operate

## Version History

### v1.3.0 (Current)
- Fixed o1 and o1-mini model integration issues:
  - Now using `max_completion_tokens` instead of `max_tokens` for o1 models
  - Removed 'system' role messages for o1-mini model
  - Disabled response_format parameter for o1-mini model
- Enhanced model cascade system with better error handling
- Implemented robust JSON parsing with automatic cleanup
- Added detailed error logging for diagnostics
- Updated README with exact error details and fixes
- Improved fallback analysis with keyword extraction

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
- Add support for multiple property analysis in batch mode
- Implement property comparison features
- Add data persistence (save analyses to local storage)
- Enhance mobile responsiveness
- Add export functionality (PDF, CSV)
- Improve error reporting with more user-friendly messages

### v1.5.0 (Planned)
- Add user authentication system
- Implement saved property portfolios
- Add custom scoring weights
- Enhance UI with dark mode support
- Add property image analysis capabilities

### v2.0.0 (Future)
- Integrate with LoopNet scraper for automated listing analysis
- Add geographic filtering and map visualization
- Implement trend tracking and market analysis
- Add portfolio analysis tools
- Integrate with property databases for additional data

## Python Version (Alternative)

The original Python implementation is also available with two interfaces:

### Web UI (Streamlit)

```bash
# Clone the repository
git clone https://github.com/yourusername/cre-deal-finder.git
cd cre-deal-finder

# Set up environment variables
cp .env.example .env
# Edit .env to add your OpenAI API key

# Install dependencies
pip install -r requirements.txt

# Run the Streamlit app
streamlit run app.py
```

### Command Line

```bash
# Set up environment (if not already done)
cp .env.example .env
# Edit .env to add your OpenAI API key

# Run the command-line analyzer
python analyze_with_openai.py
```

## Example Analysis

Here's an example of what the analysis looks like for a sample property:

```json
{
  "seller_motivation_score": 8.5,
  "transaction_complexity_score": 6.0,
  "property_characteristics_score": 7.5,
  "total_score": 7.4,
  "seller_motivation_analysis": {
    "explanation": "The listing shows clear signs of a motivated seller with explicit mentions of price reduction and needing to sell quickly.",
    "keywords": ["motivated seller", "must sell", "price reduced", "relocating"]
  },
  "transaction_complexity_analysis": {
    "explanation": "The transaction has moderate complexity due to deferred maintenance issues that might require negotiations.",
    "keywords": ["deferred maintenance", "below market"]
  },
  "property_characteristics_analysis": {
    "explanation": "The property shows good value-add potential through renovation and repositioning with below market rents.",
    "keywords": ["value-add", "below market rents", "deferred maintenance"]
  },
  "summary": "This property represents a strong investment opportunity with a motivated seller and clear value-add potential through addressing deferred maintenance and raising below-market rents."
}
```

## Project Structure

```
cre-deal-finder/
├── next-app/                   # Next.js version (Vercel optimized)
│   ├── pages/                  # Next.js pages and API routes
│   │   ├── _app.js             # Next.js app configuration
│   │   ├── _document.js        # HTML document setup
│   │   ├── index.js            # Main application page
│   │   └── api/                # API routes
│   │       └── analyze.js      # OpenAI analysis endpoint
│   ├── components/             # React components
│   │   ├── AnalysisResults.js  # Results display component
│   │   └── PropertyForm.js     # Property input form
│   ├── styles/                 # CSS and Tailwind styles
│   │   └── globals.css         # Global styles
│   ├── public/                 # Static assets
│   ├── package.json            # Dependencies and scripts
│   ├── next.config.js          # Next.js configuration
│   └── README.md               # Next.js specific documentation
├── analyzer/                   # Analysis modules
│   ├── __init__.py             # Package initialization
│   ├── openai_analyzer.py      # OpenAI integration for analysis
│   ├── scoring.py              # Scoring algorithms
│   ├── nlp.py                  # Natural language processing utilities
│   └── simple_nlp.py           # Basic keyword analysis
├── config/                     # Configuration files
│   ├── config.example.yaml     # Example configuration
│   └── openai_config.example.yaml # OpenAI configuration example
├── sample_listings/            # Sample LoopNet listings
│   └── motivated_seller.txt    # Example motivated seller listing
├── scraper/                    # Web scraping modules
│   ├── __init__.py             # Package initialization
│   └── loopnet.py              # LoopNet scraper
├── utils/                      # Utility functions
│   ├── __init__.py             # Package initialization
│   ├── filtering.py            # Data filtering utilities
│   └── storage.py              # Data storage utilities
├── output/                     # Output handling
│   ├── __init__.py             # Package initialization
│   └── sheets.py               # Google Sheets integration
├── app.py                      # Streamlit web application
├── analyze_with_openai.py      # OpenAI-based analyzer script
├── test_listing_analyzer.py    # Basic keyword-based analyzer script
├── requirements.txt            # Python dependencies
├── .env.example                # Example environment variables
└── README.md                   # Main documentation
```

## License

MIT License
