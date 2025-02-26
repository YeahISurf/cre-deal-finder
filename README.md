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

## Setup and Installation

### Prerequisites
- Python 3.8+
- Apify account
- Google Cloud account with Sheets API enabled
- AWS account (for deployment)

### Installation

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
cp config.example.yaml config.yaml
# Edit config.yaml with your API keys and settings
```

4. Run the tool:
```bash
python main.py
```

## Project Structure

```
cre-deal-finder/
├── main.py                # Main script orchestrating the workflow
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
└── requirements.txt       # Project dependencies
```

## Deployment

The tool can be deployed as an AWS Lambda function with CloudWatch Events for daily triggering.

1. Package the application:
```bash
zip -r cre-deal-finder.zip . -x "*.git*" "*.env*"
```

2. Upload to AWS Lambda and configure a CloudWatch Event trigger for daily execution.

## License

MIT License
