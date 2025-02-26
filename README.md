# PFISH LOBSTER COIN CRE Deal Finder

This tool analyzes commercial real estate listings using OpenAI to identify potential investment opportunities based on seller motivation, transaction complexity, and property characteristics.

## Next.js Version (Recommended for Vercel)

![Next.js Version](https://i.imgur.com/placeholder-ui-screenshot.png)

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
3. Deploy with a single click

See the [Next.js README](./next-app/README.md) for more details.

## Python Version

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

## How It Works

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

## Project Structure

```
cre-deal-finder/
├── next-app/                   # Next.js version (Vercel optimized)
├── app.py                      # Streamlit web application
├── analyze_with_openai.py      # OpenAI-based analyzer script
├── test_listing_analyzer.py    # Basic keyword-based analyzer script
├── analyzer/
│   ├── openai_analyzer.py      # OpenAI integration for analysis
│   └── simple_nlp.py           # Basic keyword analysis
├── config/
│   └── openai_config.example.yaml # Example OpenAI configuration
└── sample_listings/            # Sample LoopNet listings
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