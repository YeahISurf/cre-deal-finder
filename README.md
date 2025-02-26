# AI-Powered Commercial Real Estate Deal Finder

This tool automatically analyzes commercial real estate listings based on specific investment criteria, and identifies potential opportunities by evaluating seller motivation, transaction complexity, and property characteristics.

## Quick Start for Local Testing

To test the basic functionality without requiring API keys:

1. Clone this repository:
```bash
git clone https://github.com/YeahISurf/cre-deal-finder.git
cd cre-deal-finder
```

2. Create a virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Run the test analyzer:
```bash
python test_listing_analyzer.py
```

4. Paste a LoopNet property description when prompted and type 'DONE' on a new line when finished.

5. Review the analysis results, which will also be saved to the `results/` directory.

## Key Features

- **AI-Driven Analysis**: Processes listing descriptions to identify opportunities
- **Intelligent Scoring**: Ranking system based on three key criteria:
  - Seller Motivation
  - Transaction Complexity
  - Property Characteristics
- **Local Testing**: Analyze pasted listings without requiring API keys

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

## Full Functionality (Requires API Keys)

For the complete automated solution that scrapes LoopNet listings daily:

1. Copy the example config file:
```bash
cp config/simple_config.yaml config/config.yaml
```

2. Edit `config/config.yaml` to add your API keys and customize settings

3. Set up Google Sheets credentials (follow instructions in the full documentation)

4. Run the main script:
```bash
python main.py
```

## License

MIT License
