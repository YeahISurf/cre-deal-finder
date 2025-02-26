# AI-Powered Commercial Real Estate Deal Finder

This tool automatically scrapes LoopNet commercial real estate listings, analyzes them based on specific investment criteria, and identifies potential opportunities by evaluating seller motivation, transaction complexity, and property characteristics.

## Overview

The CRE Deal Finder is designed to:
- Scrape LoopNet listings daily using the [Apify LoopNet Scraper](https://apify.com/epctex/loopnet-scraper)
- Filter listings to focus on properties in the Western United States (from Ohio westward)
- Use NLP to analyze broker descriptions for signs of motivation and opportunity
- Score and rank listings based on investment potential
- Output results to a Google Sheet for easy review

## Key Features

- **Automated Data Collection**: Daily scraping of LoopNet listings
- **AI-Driven Analysis**: NLP processing of listing descriptions to identify opportunities
- **Intelligent Scoring**: Ranking system based on three key criteria:
  - Seller Motivation
  - Transaction Complexity
  - Property Characteristics
- **Streamlined Output**: Results automatically sent to Google Sheets with highlighting for top opportunities

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

## Quick Start

### Using the Setup Script

The easiest way to get started is to use the included setup script:

```bash
# Clone the repository
git clone https://github.com/YeahISurf/cre-deal-finder.git
cd cre-deal-finder

# Run the setup script
python setup.py
```

The setup script will:
1. Install all required dependencies
2. Create necessary directories
3. Help you configure the application
4. Set up Google API credentials
5. Run a test to verify everything works

### Manual Setup

If you prefer to set up manually:

1. Clone this repository:
```bash
git clone https://github.com/YeahISurf/cre-deal-finder.git
cd cre-deal-finder
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up configuration:
```bash
cp config/config.example.yaml config/config.yaml
# Edit config.yaml with your API keys and settings
```

4. Set up Google credentials:
```bash
cp credentials.json.example credentials.json
# Replace with your actual service account credentials
```

5. Run the test script to verify setup:
```bash
python test.py
```

## Required Accounts and APIs

To use this tool, you'll need:

1. **Apify Account**: Sign up at [apify.com](https://apify.com) and get an API key
2. **OpenAI API Key** (optional): For advanced NLP analysis using GPT-4 or GPT-3.5 Turbo
3. **Google Cloud Account**: For Google Sheets integration:
   - Create a project in Google Cloud Console
   - Enable Google Sheets API
   - Create a service account with appropriate permissions
   - Download JSON credentials
   - Share your Google Sheet with the service account email

## Running the Tool

After completing setup:

```bash
# Run the main script
python main.py
```

For automated daily runs, you can:

1. Set up a cron job (Linux/Mac):
```bash
0 6 * * * cd /path/to/cre-deal-finder && python main.py
```

2. Deploy to AWS Lambda with CloudWatch Events trigger (see deployment section below)

## Project Structure

```
cre-deal-finder/
├── main.py                # Main script orchestrating the workflow
├── test.py                # Test script to verify setup
├── setup.py               # Setup script for easy installation
├── scraper/
│   └── loopnet.py         # LoopNet scraper integration
├── analyzer/
│   ├── nlp.py             # NLP processing functions
│   └── scoring.py         # Scoring algorithms
├── output/
│   └── sheets.py          # Google Sheets integration
├── utils/
│   ├── filtering.py       # Geographic and property filtering
│   └── storage.py         # Data storage utilities
├── config/
│   └── config.yaml        # Configuration settings
├── data/                  # Directory for scraped and processed data
├── logs/                  # Directory for log files
└── credentials.json       # Google API credentials
```

## Deployment

The tool can be deployed as an AWS Lambda function with CloudWatch Events for daily triggering.

1. Package the application:
```bash
zip -r cre-deal-finder.zip . -x "*.git*" "*.env*" "venv/*"
```

2. Create an AWS Lambda function:
   - Runtime: Python 3.9+
   - Handler: main.main
   - Memory: 512 MB (min)
   - Timeout: 5 minutes (min)

3. Upload the zip file to Lambda

4. Set up environment variables in Lambda:
   - CONFIG_PATH: /tmp/config.yaml

5. Create a CloudWatch Events rule for daily execution:
   - Schedule expression: `cron(0 6 * * ? *)`
   - Target: Your Lambda function

## Customization

### NLP Providers

The tool supports three NLP analysis methods:

1. **Keyword-based** (default, no additional setup):
   ```yaml
   nlp:
     provider: "keyword"
   ```

2. **spaCy** (requires model download):
   ```yaml
   nlp:
     provider: "spacy"
   ```

3. **OpenAI API** (most powerful, requires API key):
   ```yaml
   nlp:
     provider: "openai"
     openai_api_key: "your-api-key"
     model: "gpt-4"  # or "gpt-3.5-turbo"
   ```

### Target Markets

Edit the `target_states` list in `config.yaml` to focus on specific markets:

```yaml
target_states: ["CA", "AZ", "NV", "OR", "WA"]  # West Coast only
```

## License

MIT License