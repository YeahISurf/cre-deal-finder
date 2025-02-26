#!/usr/bin/env python3
"""
Sample Analysis Script

This script analyzes the sample LoopNet listing provided in the sample_listings directory.
Use this to quickly test the analyzer without manual input.
"""

import os
import yaml
from analyzer.simple_nlp import analyze_listing_text
from analyzer.scoring import score_listing

def load_config():
    """Load configuration"""
    config_path = 'config/simple_config.yaml'
    try:
        with open(config_path, 'r') as file:
            return yaml.safe_load(file)
    except Exception as e:
        print(f"Error loading configuration: {e}")
        return None

def load_sample_listing(filename="motivated_seller.txt"):
    """Load a sample listing from the sample_listings directory"""
    file_path = os.path.join('sample_listings', filename)
    try:
        with open(file_path, 'r') as file:
            text = file.read()
            
        # Extract basic info from the listing
        listing = {
            'name': 'Retail Strip Center',
            'property_type': 'Retail',
            'location': 'Unknown',
            'price': '$3,950,000',
            'description': text
        }
        return listing
    except Exception as e:
        print(f"Error loading sample listing: {e}")
        return None

def display_results(listing, results):
    """Display analysis results in a readable format"""
    print("\n" + "=" * 80)
    print(f"ANALYSIS RESULTS FOR: {listing['name']}")
    print("=" * 80)
    
    print(f"Property Type: {listing['property_type']}")
    print(f"Location: {listing['location']}")
    print(f"Price: {listing['price']}")
    print("\nSCORES:")
    print(f"  Seller Motivation Score:       {results['seller_motivation_score']:.1f}/10")
    print(f"  Transaction Complexity Score:  {results['transaction_complexity_score']:.1f}/10")
    print(f"  Property Characteristics Score: {results['property_characteristics_score']:.1f}/10")
    print(f"  TOTAL INVESTMENT SCORE:        {results['total_score']:.1f}/10")
    
    print("\nKEYWORDS DETECTED:")
    print("  Seller Motivation:")
    for keyword in results['seller_motivation_matches']:
        print(f"    - {keyword}")
    if not results['seller_motivation_matches']:
        print("    None detected")
    
    print("  Transaction Complexity:")
    for keyword in results['transaction_complexity_matches']:
        print(f"    - {keyword}")
    if not results['transaction_complexity_matches']:
        print("    None detected")
    
    print("  Property Characteristics:")
    for keyword in results['property_characteristics_matches']:
        print(f"    - {keyword}")
    if not results['property_characteristics_matches']:
        print("    None detected")
    
    # Add recommendation based on total score
    print("\nRECOMMENDATION:")
    if results['total_score'] >= 7.5:
        print("  HIGH POTENTIAL - This property shows strong investment signals")
    elif results['total_score'] >= 5.0:
        print("  MODERATE POTENTIAL - Consider further investigation")
    else:
        print("  LOW POTENTIAL - Limited investment signals detected")
    
    print("=" * 80)

def main():
    """Main execution function"""
    # Load configuration
    config = load_config()
    if not config:
        return
    
    # Load sample listing
    listing = load_sample_listing()
    if not listing:
        return
    
    print("Analyzing sample listing...")
    
    # Analyze the listing
    analysis_results = analyze_listing_text(listing['description'], config['nlp']['keywords'])
    
    # Score the listing
    scores = score_listing(analysis_results, config['scoring'])
    
    # Display results
    display_results(listing, scores)

if __name__ == "__main__":
    main()
