#!/usr/bin/env python3
"""
Streamlit UI for CRE Deal Finder

This provides a web interface for analyzing commercial real estate listings
using OpenAI to identify investment opportunities.
"""

import os
import json
import yaml
import streamlit as st
from datetime import datetime
from analyzer.openai_analyzer import OpenAIAnalyzer

# Set page configuration
st.set_page_config(
    page_title="PFISH LOBSTER COIN CRE Deal Finder",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown('''
<style>
    .main-header {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }
    .subheader {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }
    .score-container {
        padding: 1rem;
        border-radius: 5px;
        margin-bottom: 1rem;
    }
    .high-score {
        background-color: rgba(0, 255, 0, 0.1);
        border-left: 5px solid green;
    }
    .medium-score {
        background-color: rgba(255, 255, 0, 0.1);
        border-left: 5px solid gold;
    }
    .low-score {
        background-color: rgba(255, 0, 0, 0.1);
        border-left: 5px solid red;
    }
</style>
''', unsafe_allow_html=True)

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
        st.error(f"Error loading configuration: {e}")
        return create_default_config()

def create_default_config():
    """Create default configuration"""
    config = {
        'openai': {
            'model': 'o1',  # Using the most advanced model available with free credits
            'api_key': None,
        },
        'scoring': {
            'seller_motivation_weight': 0.4,
            'transaction_complexity_weight': 0.3,
            'property_characteristics_weight': 0.3,
            'highlight_threshold': 7
        }
    }
    return config

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
        st.error(f"Error loading sample listing: {e}")
        return None

def save_result(listing, results):
    """Save analysis results to a file and return the path"""
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
    
    return filename

def display_results(listing, results):
    """Display analysis results in a readable format"""
    # Main info
    st.markdown(f"<h2 class='subheader'>Analysis Results for: {listing['name']}</h2>", unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.write("**Property Type:**", listing['property_type'])
    with col2:
        st.write("**Location:**", listing['location'])
    with col3:
        st.write("**Price:**", listing['price'])
    
    # Scores section
    st.markdown("### Scores")
    
    score_cols = st.columns(4)
    
    with score_cols[0]:
        seller_score = results['seller_motivation_score']
        score_class = "high-score" if seller_score >= 7 else "medium-score" if seller_score >= 4 else "low-score"
        st.markdown(f"<div class='score-container {score_class}'>"
                    f"<h4>Seller Motivation</h4>"
                    f"<h2>{seller_score:.1f}/10</h2>"
                    f"</div>", unsafe_allow_html=True)
    
    with score_cols[1]:
        transaction_score = results['transaction_complexity_score']
        score_class = "high-score" if transaction_score >= 7 else "medium-score" if transaction_score >= 4 else "low-score"
        st.markdown(f"<div class='score-container {score_class}'>"
                    f"<h4>Transaction Complexity</h4>"
                    f"<h2>{transaction_score:.1f}/10</h2>"
                    f"</div>", unsafe_allow_html=True)
    
    with score_cols[2]:
        property_score = results['property_characteristics_score']
        score_class = "high-score" if property_score >= 7 else "medium-score" if property_score >= 4 else "low-score"
        st.markdown(f"<div class='score-container {score_class}'>"
                    f"<h4>Property Characteristics</h4>"
                    f"<h2>{property_score:.1f}/10</h2>"
                    f"</div>", unsafe_allow_html=True)
    
    with score_cols[3]:
        total_score = results['total_score']
        score_class = "high-score" if total_score >= 7 else "medium-score" if total_score >= 4 else "low-score"
        st.markdown(f"<div class='score-container {score_class}'>"
                    f"<h4>TOTAL SCORE</h4>"
                    f"<h2>{total_score:.1f}/10</h2>"
                    f"</div>", unsafe_allow_html=True)
    
    # Detailed analysis sections with expandable areas
    st.markdown("### Detailed Analysis")
    
    with st.expander("Seller Motivation Analysis", expanded=True):
        st.write(results['seller_motivation_analysis']['explanation'])
        st.write("**Keywords detected:**")
        keywords = results['seller_motivation_analysis']['keywords']
        if keywords:
            for keyword in keywords:
                st.markdown(f"- {keyword}")
        else:
            st.write("No specific keywords detected")
    
    with st.expander("Transaction Complexity Analysis", expanded=True):
        st.write(results['transaction_complexity_analysis']['explanation'])
        st.write("**Keywords detected:**")
        keywords = results['transaction_complexity_analysis']['keywords']
        if keywords:
            for keyword in keywords:
                st.markdown(f"- {keyword}")
        else:
            st.write("No specific keywords detected")
    
    with st.expander("Property Characteristics Analysis", expanded=True):
        st.write(results['property_characteristics_analysis']['explanation'])
        st.write("**Keywords detected:**")
        keywords = results['property_characteristics_analysis']['keywords']
        if keywords:
            for keyword in keywords:
                st.markdown(f"- {keyword}")
        else:
            st.write("No specific keywords detected")
    
    # Summary recommendation
    st.markdown("### Investment Recommendation")
    st.info(results['summary'])
    
    # Show JSON option
    if st.button("View Raw JSON Results"):
        st.json(results)

def main():
    """Main application function"""
    st.markdown("<h1 class='main-header'>🏢 PFISH LOBSTER COIN CRE Deal Finder</h1>", unsafe_allow_html=True)
    st.markdown(
        "AI-powered analysis of commercial real estate listings to identify investment opportunities "
        "based on seller motivation, transaction complexity, and property characteristics."
    )
    
    # Sidebar for configuration
    st.sidebar.markdown("## Configuration")
    
    # Load config
    config = load_config()
    
    # API Key input
    api_key = st.sidebar.text_input(
        "OpenAI API Key", 
        value=os.environ.get("OPENAI_API_KEY", ""),
        type="password",
        help="Enter your OpenAI API key. The key is not stored and only used for this session."
    )
    
    # OpenAI model selection
    model_options = [
        "o1",
        "gpt-4o",
        "gpt-4o-mini",
        "o1-mini",
        "o3-mini"
    ]
    selected_model = st.sidebar.selectbox(
        "OpenAI Model",
        options=model_options,
        index=model_options.index(config['openai'].get('model', 'o1')) if config['openai'].get('model') in model_options else 0,
        help="Select the OpenAI model to use. o1 is the most advanced model available with free credits."
    )
    
    # Source selection
    st.sidebar.markdown("## Listing Source")
    listing_source = st.sidebar.radio(
        "Select listing source",
        options=["Sample Listing", "Paste Listing", "Upload File"],
        index=0
    )
    
    # Main area for listing input and results
    st.markdown("## Property Listing")
    
    listing = None
    if listing_source == "Sample Listing":
        listing = load_sample_listing()
        st.text_area("Sample Listing", listing['description'], height=300, disabled=True)
        
    elif listing_source == "Paste Listing":
        listing = {}
        col1, col2 = st.columns(2)
        with col1:
            listing['name'] = st.text_input("Property Name", "Unknown Property")
            listing['location'] = st.text_input("Location (City, State)", "Unknown")
        with col2:
            listing['property_type'] = st.text_input("Property Type", "Commercial")
            listing['price'] = st.text_input("Price", "Unknown")
            
        listing['description'] = st.text_area("Paste the property listing description here", height=300)
        
    elif listing_source == "Upload File":
        uploaded_file = st.file_uploader("Choose a text file", type="txt")
        if uploaded_file is not None:
            listing = {}
            listing['description'] = uploaded_file.getvalue().decode("utf-8")
            
            col1, col2 = st.columns(2)
            with col1:
                listing['name'] = st.text_input("Property Name", "Unknown Property")
                listing['location'] = st.text_input("Location (City, State)", "Unknown")
            with col2:
                listing['property_type'] = st.text_input("Property Type", "Commercial")
                listing['price'] = st.text_input("Price", "Unknown")
    
    # Analysis section
    st.markdown("## Analysis")
    
    analyze_button = st.button("Analyze Listing")
    
    if analyze_button:
        if not api_key:
            st.error("Please enter your OpenAI API key in the sidebar.")
        elif not listing or not listing.get('description'):
            st.error("Please provide a property listing to analyze.")
        else:
            with st.spinner(f"Analyzing listing with OpenAI's {selected_model} model..."):
                try:
                    # Set API key in environment variable for this session
                    os.environ["OPENAI_API_KEY"] = api_key
                    
                    # Create analyzer with selected model
                    analyzer = OpenAIAnalyzer(api_key=api_key, model=selected_model)
                    
                    # Analyze the listing
                    results = analyzer.analyze_listing(listing)
                    
                    # Save results
                    filename = save_result(listing, results)
                    st.success(f"Analysis complete! Results saved to {filename}")
                    
                    # Display results
                    display_results(listing, results)
                    
                except Exception as e:
                    st.error(f"Error during analysis: {str(e)}")
    
    # Add information about model
    st.sidebar.markdown("---")
    st.sidebar.markdown("### About the Model")
    st.sidebar.markdown(
        "This application uses OpenAI's o1 model by default, which is their most advanced model available. "
        "You have free daily usage allowance for this model through your OpenAI account."
    )

if __name__ == "__main__":
    main()
