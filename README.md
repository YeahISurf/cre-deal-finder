# AI-Powered Commercial Real Estate Deal Finder

This tool analyzes commercial real estate listings using OpenAI to identify potential investment opportunities based on seller motivation, transaction complexity, and property characteristics.

## Quick Start

To analyze listings using OpenAI:

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

3. Run the OpenAI analyzer script:
```bash
python analyze_with_openai.py
```

4. When prompted, enter your OpenAI API key and paste a property listing

5. Review the detailed AI analysis results

## OpenAI Integration

The tool uses OpenAI's language models to perform a sophisticated analysis of property listings:

### Available Models

- **GPT-3.5 Turbo** (default): Good balance of performance and cost
- **GPT-4**: More accurate but more expensive and slower

### Configuration

You can configure the OpenAI integration by creating a `config/openai_config.yaml` file based on the example:

```bash
cp config/openai_config.example.yaml config/openai_config.yaml
```

Then edit the configuration file to set your API key and preferred model:

```yaml
openai:
  api_key: "your-api-key-here"  # Your OpenAI API key
  model: "gpt-3.5-turbo"        # Model to use
```

## How the Analyzer Works

The OpenAI-based analyzer evaluates commercial real estate listings based on three main criteria:

1. **Seller Motivation**: Identifies signs that the seller may be motivated to sell quickly or at favorable terms.

2. **Transaction Complexity**: Detects factors that might reduce buyer competition or create unique opportunities.

3. **Property Characteristics**: Recognizes features indicating value-add potential or situations where perceived risk exceeds actual risk.

### Analysis Output

For each listing, the analyzer provides:

- Numerical scores (1-10) for each investment criteria category
- A total investment score based on weighted averages
- Detailed explanations for each score
- Identified keywords and signals in each category
- An overall investment recommendation

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

## Alternative: Basic Keyword Analysis

If you prefer not to use OpenAI, the repository also includes a basic keyword-matching analyzer:

```bash
python test_listing_analyzer.py
```

Or to analyze the included sample listing:

```bash
python analyze_sample.py
```

## Project Structure

```
cre-deal-finder/
├── main.py                    # Main script for full automation (future)
├── analyze_with_openai.py      # OpenAI-based analyzer script
├── test_listing_analyzer.py   # Basic keyword-based analyzer script
├── analyze_sample.py          # Sample analysis script
├── analyzer/
│   ├── openai_analyzer.py      # OpenAI integration for analysis
│   ├── simple_nlp.py          # Basic keyword analysis
│   └── scoring.py             # Scoring algorithms
├── config/
│   ├── openai_config.example.yaml # Example OpenAI configuration
│   └── simple_config.yaml     # Configuration for keyword analysis
├── sample_listings/           # Sample LoopNet listings
│   └── motivated_seller.txt   # Example listing with investment signals
└── requirements.txt           # Project dependencies
```

## Future Enhancements

Planned enhancements for this tool include:

1. **Automated Scraping**: Integration with the Apify LoopNet Scraper
2. **Geographic Filtering**: Focus on properties in specific regions
3. **Google Sheets Integration**: Automatic export of analyzed opportunities
4. **Multi-Source Scraping**: Support for other CRE listing sites (e.g., Crexi)
5. **Email Notifications**: Automatic alerts for high-potential properties

## License

MIT License