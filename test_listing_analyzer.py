#!/usr/bin/env python3
"""
Simple Test Script for CRE Deal Finder

This script allows testing the core NLP analysis and scoring functionality
by manually pasting a LoopNet listing description.
"""

import os
import json
import yaml
from datetime import datetime
from analyzer.simple_nlp import analyze_listing_text
from analyzer.scoring import score_listing

def load_config():
    """Load configuration from config file or use defaults"""
    config_path = 'config/config.yaml'
    
    # Use default config if file doesn't exist
    if not os.path.exists(config_path):
        config_path = 'config/simple_config.yaml'
        if not os.path.exists(config_path):
            return create_default_config()
    
    try:
        with open(config_path, 'r') as file:
            return yaml.safe_load(file)
    except Exception as e:
        print(f"Error loading configuration: {e}")
        return create_default_config()

def create_default_config():
    """Create default configuration for testing"""
    config = {
        'nlp': {
            'keywords': {
                'seller_motivation': [
                    "motivated", "must sell", "priced to sell", "urgent", "distressed",
                    "liquidation", "bankruptcy", "foreclosure", "below market", "quick sale",
                    "owner retiring", "relocating", "estate sale"
                ],
                'transaction_complexity': [
                    "foreclosure", "bankruptcy", "short sale", "legal issues", "title issues",
                    "tax sale", "auction", "portfolio", "multiple parcels", "complex", 
                    "special purpose", "encumbrance"
                ],
                'property_characteristics': [
                    "below market", "value add", "upside", "fixer upper", "vacant",
                    "deferred maintenance", "renovation", "redevelopment", "reposition",
                    "class b", "class c", "distressed", "underperforming"
                ]
            }
        },
        'scoring': {
            'seller_motivation_weight': 0.4,
            'transaction_complexity_weight': 0.3,
            'property_characteristics_weight': 0.3,
            'highlight_threshold': 7
        }
    }
    return config

def show_welcome():
    """Display welcome message"""
    print("\n" + "=" * 80)
    print("CRE DEAL FINDER - TEST MODE")
    print("=" * 80)
    print("This tool analyzes commercial real estate listings to identify potential opportunities")
    print("based on seller motivation, transaction complexity, and property characteristics.")
    print("\nInstructions:")
    print("  1. Paste a LoopNet property description below")
    print("  2. The system will analyze and score the listing")
    print("  3. Review the detailed scores and matched keywords")
    print("=" * 80 + "\n")

def get_listing_input():
    """Get listing details from user input"""
    print("Enter the property details below (address, price, description, etc.)")
    print("Type 'DONE' on a new line when finished:\n")
    
    lines = []
    while True:
        line = input()
        if line.strip().upper() == 'DONE':
            break
        lines.append(line)
    
    text = "\n".join(lines)
    
    # Get additional metadata if available
    property_name = input("\nProperty Name (optional): ").strip()
    property_type = input("Property Type (e.g., office, retail, industrial) (optional): ").strip()
    location = input("Location (City, State) (optional): ").strip()
    price = input("Price (optional): ").strip()
    
    listing = {
        'name': property_name or 'Test Property',
        'property_type': property_type or 'Unknown',
        'location': location or 'Unknown',
        'price': price or 'Unknown',
        'description': text
    }
    
    return listing

def save_result(listing, results):
    """Save analysis results to a file"""
    # Create results directory if it doesn't exist
    os.makedirs('results', exist_ok=True)
    
    # Generate a timestamp for the filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"results/analysis_{timestamp}.json"
    
    # Combine listing and results
    output = {
        'listing': listing,
        'analysis': results
    }
    
    # Save to file
    with open(filename, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nResults saved to {filename}")

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
    try:
        # Load configuration
        config = load_config()
        
        # Display welcome message
        show_welcome()
        
        # Get listing details from user
        listing = get_listing_input()
        
        # Analyze the listing text
        print("\nAnalyzing listing...")
        analysis_results = analyze_listing_text(listing['description'], config['nlp']['keywords'])
        
        # Score the listing
        scores = score_listing(analysis_results, config['scoring'])
        
        # Display the results
        display_results(listing, scores)
        
        # Save results to file
        save_result(listing, scores)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
