#!/usr/bin/env python3
"""
Main script for CRE Deal Finder

This script orchestrates the entire workflow:
1. Scrapes LoopNet listings
2. Filters by geography
3. Analyzes listings with NLP
4. Scores based on investment criteria
5. Exports results to Google Sheets
"""

import os
import sys
import logging
import yaml
from datetime import datetime

# Internal imports
from scraper.loopnet import LoopNetScraper
from utils.filtering import filter_by_geography
from analyzer.nlp import analyze_listings
from analyzer.scoring import score_listings
from output.sheets import update_google_sheet

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f"logs/cre_deal_finder_{datetime.now().strftime('%Y%m%d')}.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def load_config():
    """Load configuration from config.yaml"""
    try:
        with open('config/config.yaml', 'r') as file:
            return yaml.safe_load(file)
    except Exception as e:
        logger.error(f"Error loading configuration: {e}")
        sys.exit(1)

def main():
    """Main execution function"""
    try:
        # Create logs directory if it doesn't exist
        os.makedirs('logs', exist_ok=True)
        
        logger.info("Starting CRE Deal Finder")
        
        # Load configuration
        config = load_config()
        logger.info("Configuration loaded successfully")
        
        # 1. Scrape LoopNet listings
        logger.info("Initiating LoopNet scraping")
        scraper = LoopNetScraper(config['apify']['api_key'])
        listings = scraper.scrape_listings()
        logger.info(f"Successfully scraped {len(listings)} listings")
        
        # 2. Filter listings by geography
        logger.info("Filtering listings by geography")
        filtered_listings = filter_by_geography(listings, config['target_states'])
        logger.info(f"Filtered to {len(filtered_listings)} listings in target states")
        
        # 3. Analyze listings with NLP
        logger.info("Analyzing listings with NLP")
        analyzed_listings = analyze_listings(filtered_listings, config['nlp'])
        logger.info("NLP analysis complete")
        
        # 4. Score listings based on investment criteria
        logger.info("Scoring listings")
        scored_listings = score_listings(analyzed_listings, config['scoring'])
        logger.info("Scoring complete")
        
        # 5. Export results to Google Sheets
        logger.info("Exporting results to Google Sheets")
        update_google_sheet(scored_listings, config['google_sheets'])
        logger.info("Export complete")
        
        logger.info("CRE Deal Finder completed successfully")
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
