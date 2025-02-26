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

3. You have two options to test the analyzer:

### Option 1: Analyze the provided sample listing
```bash
python analyze_sample.py
```

### Option 2: Analyze your own listing
```bash
python test_listing_analyzer.py
```
When prompted, paste the LoopNet property description and type 'DONE' on a new line when finished.

4. Review the analysis results, which will also be saved to the `results/` directory.

## How the Analyzer Works

The analyzer uses keyword matching and contextual analysis to evaluate commercial real estate listings based on three main criteria:

1. **Seller Motivation**: Looks for indicators that the seller is motivated to close a deal quickly, potentially at favorable terms.
2. **Transaction Complexity**: Identifies complex transaction situations that might reduce competition or create unique opportunities.
3. **Property Characteristics**: Finds properties with value-add potential or situations where perceived risk exceeds actual risk.

### Scoring System

Each category receives a score from 1-10 based on the keywords detected:
- The more keywords identified, the higher the score (max 10 per category)
- The total investment score is a weighted average of the three category scores
- Default weights: Seller Motivation (40%), Transaction Complexity (30%), Property Characteristics (30%)

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

## Customizing the Analysis

### Adding or Modifying Keywords

You can customize the keywords used for analysis by editing the `config/simple_config.yaml` file:

```yaml
nlp:
  keywords:
    seller_motivation:
      - "motivated"
      - "must sell"
      # Add more keywords here
    
    transaction_complexity:
      - "foreclosure"
      - "bankruptcy"
      # Add more keywords here
    
    property_characteristics:
      - "below market"
      - "value add"
      # Add more keywords here
```

### Adjusting Scoring Weights

You can adjust the importance of each category by changing the weights in the `config/simple_config.yaml` file:

```yaml
scoring:
  seller_motivation_weight: 0.4
  transaction_complexity_weight: 0.3
  property_characteristics_weight: 0.3
```

## Full Functionality (Requires API Keys)

For the complete automated solution that scrapes LoopNet listings daily:

1. Copy the example config file:
```bash
cp config/simple_config.yaml config/config.yaml
```

2. Edit `config/config.yaml` to add your API keys and customize settings:
   - Apify API Key for LoopNet Scraper
   - OpenAI API Key for advanced NLP (optional)
   - Google Sheets credentials for results output

3. Set up Google Sheets API access:
   - Follow the Google Sheets API quickstart guide
   - Download credentials.json and place it in the project root
   - Share your Google Sheet with the client_email in credentials.json

4. Run the main script:
```bash
python main.py
```

## Project Structure

```
cre-deal-finder/
├── main.py                    # Main script (full automation)
├── test_listing_analyzer.py   # Interactive test script
├── analyze_sample.py          # Sample analysis script
├── scraper/
│   └── loopnet.py             # LoopNet scraper integration
├── analyzer/
│   ├── simple_nlp.py          # Basic NLP processing
│   └── scoring.py             # Scoring algorithms
├── output/
│   └── sheets.py              # Google Sheets integration
├── utils/
│   └── filtering.py           # Geographic filtering
├── config/
│   └── simple_config.yaml     # Configuration settings
├── sample_listings/           # Sample LoopNet listings
│   └── motivated_seller.txt   # Example listing with investment signals
└── requirements.txt           # Project dependencies
```

## Future Enhancements

Planned enhancements for this tool include:

1. **Advanced NLP**: Integration with OpenAI's API for more sophisticated language understanding
2. **Multi-Source Scraping**: Add support for other CRE listing sites (e.g., Crexi)
3. **Email Notifications**: Automatic alerts for high-potential properties
4. **Historical Tracking**: Database storage for tracking listing history and price changes
5. **Web Dashboard**: Interactive UI for managing and reviewing deal opportunities

## License

MIT License