#!/usr/bin/env python3
"""
Test Script for CRE Deal Finder

This script tests the CRE Deal Finder with sample data.
"""

import os
import sys
import logging
import yaml
from datetime import datetime
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def load_config():
    """Load configuration from config.yaml"""
    try:
        if os.path.exists('config/config.yaml'):
            with open('config/config.yaml', 'r') as file:
                return yaml.safe_load(file)
        else:
            logger.warning("config.yaml not found, using sample config")
            with open('config/config.example.yaml', 'r') as file:
                return yaml.safe_load(file)
    except Exception as e:
        logger.error(f"Error loading configuration: {e}")
        sys.exit(1)

def load_sample_data():
    """Load sample data for testing"""
    try:
        # Check if sample data exists
        if os.path.exists('data/sample_listings.json'):
            with open('data/sample_listings.json', 'r') as f:
                return json.load(f)
        else:
            # Generate minimal sample data
            logger.info("Sample data not found, generating test data")
            return generate_sample_data()
    except Exception as e:
        logger.error(f"Error loading sample data: {e}")
        return []

def generate_sample_data():
    """Generate sample data for testing"""
    # Create sample listings with various characteristics
    listings = [
        {
            "id": "sample-001",
            "title": "Motivated Seller - Office Building",
            "propertyType": "office",
            "address": "123 Main St, Columbus, OH 43215",
            "state": "OH",
            "price": "$2,500,000",
            "description": "Motivated seller must sell quickly! This office building has below market rents and significant upside potential. Owner retiring and needs to liquidate assets. Some deferred maintenance provides value-add opportunity.",
            "url": "https://www.loopnet.com/sample/001",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "id": "sample-002",
            "title": "Retail Center - Bankruptcy Sale",
            "propertyType": "retail",
            "address": "456 Market Ave, Las Vegas, NV 89109",
            "state": "NV",
            "price": "$4,800,000",
            "description": "Bankruptcy sale! Class B retail center with high vacancy. Property is being sold through bankruptcy court with a short closing timeframe required. Great opportunity for investors looking to reposition a distressed asset.",
            "url": "https://www.loopnet.com/sample/002",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "id": "sample-003",
            "title": "Prime Industrial Warehouse",
            "propertyType": "industrial",
            "address": "789 Industrial Pkwy, Phoenix, AZ 85001",
            "state": "AZ",
            "price": "$3,200,000",
            "description": "Class A industrial warehouse in prime location. Fully leased to credit tenant with 7 years remaining on NNN lease. 6% cap rate with annual escalations. Well-maintained property with recent roof replacement.",
            "url": "https://www.loopnet.com/sample/003",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "id": "sample-004",
            "title": "Multifamily Value-Add Opportunity",
            "propertyType": "multifamily",
            "address": "101 Apartment Lane, Denver, CO 80202",
            "state": "CO",
            "price": "$7,500,000",
            "description": "Value-add multifamily property with 60 units. Current rents approximately 20% below market. Owner is an out-of-state investor looking to exit quickly. Property has deferred maintenance and 25% vacancy rate. Great opportunity for repositioning.",
            "url": "https://www.loopnet.com/sample/004",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "id": "sample-005",
            "title": "Development Land - Foreclosure",
            "propertyType": "land",
            "address": "555 Development Rd, San Diego, CA 92101",
            "state": "CA",
            "price": "$1,800,000",
            "description": "Development land available through foreclosure. Bank-owned property with all entitlements in place for 120-unit apartment complex. Offered at below market value for quick sale. Transaction must close within 45 days.",
            "url": "https://www.loopnet.com/sample/005",
            "scraped_at": datetime.now().isoformat()
        }
    ]
    
    # Save sample data
    os.makedirs('data', exist_ok=True)
    with open('data/sample_listings.json', 'w') as f:
        json.dump(listings, f, indent=2)
    
    logger.info(f"Generated {len(listings)} sample listings")
    return listings

def test_nlp_analysis(listings, config):
    """Test NLP analysis functionality"""
    try:
        from analyzer.nlp import analyze_listings
        
        logger.info("Testing NLP analysis...")
        analyzed_listings = analyze_listings(listings, config['nlp'])
        
        logger.info(f"NLP analysis results for {len(analyzed_listings)} listings:")
        for i, listing in enumerate(analyzed_listings[:2]):  # Show first 2 for brevity
            logger.info(f"\nListing {i+1}: {listing['title']}")
            logger.info(f"Seller Motivation: {listing.get('seller_motivation', {})}")
            logger.info(f"Transaction Complexity: {listing.get('transaction_complexity', {})}")
            logger.info(f"Property Characteristics: {listing.get('property_characteristics', {})}")
        
        return analyzed_listings
    except Exception as e:
        logger.error(f"Error testing NLP analysis: {e}")
        return listings

def test_scoring(listings, config):
    """Test scoring functionality"""
    try:
        from analyzer.scoring import score_listings, add_highlight_flags, generate_investment_summary
        
        logger.info("\nTesting scoring...")
        scored_listings = score_listings(listings, config['scoring'])
        highlighted_listings = add_highlight_flags(scored_listings, config['scoring'].get('highlight_threshold', 7))
        
        logger.info(f"Scoring results for {len(highlighted_listings)} listings:")
        for i, listing in enumerate(highlighted_listings[:3]):  # Show first 3 for brevity
            logger.info(f"\nListing {i+1}: {listing['title']}")
            logger.info(f"Total Investment Score: {listing.get('total_investment_score', 0)}")
            logger.info(f"Highlight: {listing.get('highlight', False)}")
            logger.info(f"Investment Summary: {generate_investment_summary(listing)}")
        
        return highlighted_listings
    except Exception as e:
        logger.error(f"Error testing scoring: {e}")
        return listings

def test_google_sheets(listings, config):
    """Test Google Sheets export functionality (don't actually export)"""
    try:
        logger.info("\nTesting Google Sheets export (dry run)...")
        
        # Check if credentials file exists
        if os.path.exists(config['google_sheets'].get('credentials_file', 'credentials.json')):
            logger.info("Credentials file found, would export to Google Sheets")
            
            # Log export details
            sheet_id = config['google_sheets'].get('sheet_id', 'NOT_SET')
            worksheet = config['google_sheets'].get('worksheet_name', 'Opportunities')
            logger.info(f"Would export {len(listings)} listings to sheet ID {sheet_id}, worksheet '{worksheet}'")
            
            return True
        else:
            logger.warning("Credentials file not found, skipping Google Sheets export")
            return False
    except Exception as e:
        logger.error(f"Error testing Google Sheets export: {e}")
        return False

def main():
    """Main test function"""
    try:
        logger.info("Starting CRE Deal Finder test")
        
        # Load configuration
        config = load_config()
        logger.info("Configuration loaded successfully")
        
        # Load or generate sample data
        listings = load_sample_data()
        logger.info(f"Loaded {len(listings)} sample listings")
        
        # Test NLP analysis
        analyzed_listings = test_nlp_analysis(listings, config)
        
        # Test scoring
        scored_listings = test_scoring(analyzed_listings, config)
        
        # Test Google Sheets export (dry run)
        test_google_sheets(scored_listings, config)
        
        logger.info("\nCRE Deal Finder test completed successfully")
        
    except Exception as e:
        logger.error(f"Error in test execution: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()