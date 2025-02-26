#!/usr/bin/env python3
"""
OpenAI Analyzer Test Script

This script allows testing the OpenAI-based analyzer for CRE listings.
You will need to provide an OpenAI API key.
"""

import os
import json
import yaml
from datetime import datetime
from analyzer.openai_analyzer import OpenAIAnalyzer

def load_config():
    """Load configuration from config file or use defaults"""
    config_path = 'config/openai_config.yaml'
    
    # Use default config if file doesn't exist
    if not os.path.exists(config_path):
        config_path = 'config/openai_config.example.yaml'
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
        'openai': {
            'model': 'o1',  # Using the most advanced model available with free credits
            'api_key': None,  # Will prompt for this
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
    print("PFISH LOBSTER COIN CRE DEAL FINDER - OPENAI ANALYZER")
    print("=" * 80)
    print("This tool analyzes commercial real estate listings using OpenAI to identify potential opportunities")
    print("based on seller motivation, transaction complexity, and property characteristics.")
    print("\nInstructions:")
    print("  1. You will need to provide an OpenAI API key")
    print("  2. Paste a LoopNet property description")
    print("  3. The system will analyze and score the listing using OpenAI's o1 model")
    print("  4. Review the detailed scores and AI analysis")
    print("=" * 80 + "\n")

def get_openai_key(config):
    """Get OpenAI API key from config, environment, or user input"""
    # Try to get from config first
    api_key = config['openai'].get('api_key')
    
    # Then try environment variable
    if not api_key:
        api_key = os.environ.get("OPENAI_API_KEY")
    
    # Finally, ask the user
    if not api_key:
        print("\nOpenAI API Key not found in config or environment variables.")
        api_key = input("Please enter your OpenAI API key: ").strip()
    
    return api_key

def get_listing_input():
    """Get listing details from user input"""
    print("\nEnter the property details below (address, price, description, etc.)")
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

def save_result(listing, results):
    """Save analysis results to a file"""
    # Create results directory if it doesn't exist
    os.makedirs('results', exist_ok=True)
    
    # Generate a timestamp for the filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"results/openai_analysis_{timestamp}.json"
    
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
    print(f"PFISH LOBSTER COIN CRE DEAL FINDER - ANALYSIS RESULTS FOR: {listing['name']}")
    print("=" * 80)
    
    print(f"Property Type: {listing['property_type']}")
    print(f"Location: {listing['location']}")
    print(f"Price: {listing['price']}")
    print("\nSCORES:")
    print(f"  Seller Motivation Score:       {results['seller_motivation_score']:.1f}/10")
    print(f"  Transaction Complexity Score:  {results['transaction_complexity_score']:.1f}/10")
    print(f"  Property Characteristics Score: {results['property_characteristics_score']:.1f}/10")
    print(f"  TOTAL INVESTMENT SCORE:        {results['total_score']:.1f}/10")
    
    print("\nSELLER MOTIVATION ANALYSIS:")
    print(f"  {results['seller_motivation_analysis']['explanation']}")
    print("  Keywords detected:")
    for keyword in results['seller_motivation_analysis']['keywords']:
        print(f"    - {keyword}")
    
    print("\nTRANSACTION COMPLEXITY ANALYSIS:")
    print(f"  {results['transaction_complexity_analysis']['explanation']}")
    print("  Keywords detected:")
    for keyword in results['transaction_complexity_analysis']['keywords']:
        print(f"    - {keyword}")
    
    print("\nPROPERTY CHARACTERISTICS ANALYSIS:")
    print(f"  {results['property_characteristics_analysis']['explanation']}")
    print("  Keywords detected:")
    for keyword in results['property_characteristics_analysis']['keywords']:
        print(f"    - {keyword}")
    
    print("\nSUMMARY RECOMMENDATION:")
    print(f"  {results['summary']}")
    
    print("=" * 80)

def main():
    """Main execution function"""
    try:
        # Display welcome message
        show_welcome()
        
        # Load configuration
        config = load_config()
        
        # Get OpenAI API key
        api_key = get_openai_key(config)
        
        # Create the OpenAI analyzer
        model = config['openai'].get('model', 'o1')
        print(f"\nUsing OpenAI model: {model} (most advanced model available)")
        analyzer = OpenAIAnalyzer(api_key=api_key, model=model)
        
        # Ask if user wants to use sample or paste their own
        use_sample = input("\nDo you want to use the sample listing? (y/n): ").strip().lower() == 'y'
        
        if use_sample:
            # Load sample listing
            listing = load_sample_listing()
            if not listing:
                print("Failed to load sample listing. Exiting.")
                return
        else:
            # Get listing details from user
            listing = get_listing_input()
        
        # Analyze the listing
        print("\nAnalyzing listing with OpenAI's o1 model...")
        results = analyzer.analyze_listing(listing)
        
        # Display the results
        display_results(listing, results)
        
        # Save results to file
        save_result(listing, results)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
