#!/usr/bin/env python3
"""
NLP Analysis Module

This module provides functions for analyzing LoopNet listings using
Natural Language Processing techniques to identify investment opportunities.
"""

import logging
import re
import spacy
from openai import OpenAI

logger = logging.getLogger(__name__)

class NLPAnalyzer:
    """Class for analyzing real estate listings using NLP techniques."""
    
    def __init__(self, config):
        """
        Initialize the NLP analyzer with configuration.
        
        Args:
            config (dict): Configuration including provider, API keys, and keywords
        """
        self.config = config
        self.provider = config.get('provider', 'keyword')
        
        # Load keywords for keyword-based analysis
        self.keywords = config.get('keywords', {})
        
        # Initialize NLP models if needed
        if self.provider == 'spacy':
            logger.info("Initializing spaCy NLP model")
            try:
                self.nlp = spacy.load('en_core_web_md')
            except OSError:
                logger.warning("spaCy model not found. Downloading model...")
                spacy.cli.download('en_core_web_md')
                self.nlp = spacy.load('en_core_web_md')
        
        elif self.provider == 'openai':
            logger.info("Initializing OpenAI client")
            self.openai_client = OpenAI(api_key=config.get('openai_api_key'))
            self.model = config.get('model', 'gpt-4')
    
    def analyze_listing(self, listing):
        """
        Analyze a single listing description to identify investment criteria.
        
        Args:
            listing (dict): Listing data including description
            
        Returns:
            dict: Listing with added analysis results
        """
        # Extract text for analysis
        description = self._extract_text_for_analysis(listing)
        
        if not description:
            logger.warning(f"No description found for listing {listing.get('id', 'unknown')}")
            return self._add_empty_analysis(listing)
        
        # Choose analysis method based on provider
        if self.provider == 'keyword':
            analysis = self._analyze_with_keywords(description)
        elif self.provider == 'spacy':
            analysis = self._analyze_with_spacy(description)
        elif self.provider == 'openai':
            analysis = self._analyze_with_openai(description, listing)
        else:
            logger.error(f"Unknown NLP provider: {self.provider}")
            return self._add_empty_analysis(listing)
        
        # Add analysis results to listing
        listing.update(analysis)
        
        return listing
    
    def _extract_text_for_analysis(self, listing):
        """
        Extract text from listing for analysis.
        
        Args:
            listing (dict): Listing data
            
        Returns:
            str: Concatenated text for analysis
        """
        # Initialize empty text
        text = ""
        
        # Try different potential field names for description
        for field in ['description', 'brokerDescription', 'broker_description', 'details']:
            if field in listing and listing[field]:
                text += str(listing[field]) + " "
        
        # Add title if available
        if 'title' in listing and listing['title']:
            text += str(listing['title']) + " "
        
        # Add additional fields that might contain useful information
        for field in ['additionalInfo', 'additional_info', 'highlighted_features']:
            if field in listing and listing[field]:
                if isinstance(listing[field], list):
                    text += " ".join([str(item) for item in listing[field]]) + " "
                else:
                    text += str(listing[field]) + " "
        
        return text.strip()
    
    def _add_empty_analysis(self, listing):
        """
        Add empty analysis results to a listing.
        
        Args:
            listing (dict): Original listing
            
        Returns:
            dict: Listing with empty analysis results
        """
        listing.update({
            'seller_motivation': {
                'score': 0,
                'factors': []
            },
            'transaction_complexity': {
                'score': 0,
                'factors': []
            },
            'property_characteristics': {
                'score': 0,
                'factors': []
            },
            'total_score': 0
        })
        return listing
    
    def _analyze_with_keywords(self, text):
        """
        Analyze text using keyword matching.
        
        Args:
            text (str): Text to analyze
            
        Returns:
            dict: Analysis results
        """
        # Normalize text for consistent matching
        text = text.lower()
        
        results = {}
        
        # For each category of keywords
        for category, keywords in self.keywords.items():
            matches = []
            
            # Check each keyword for matches
            for keyword in keywords:
                # Use regex to find whole word matches
                pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
                if re.search(pattern, text):
                    matches.append(keyword)
            
            # Calculate score based on number of matches
            score = min(len(matches) * 2, 10) if matches else 0
            
            # Store results
            results[category] = {
                'score': score,
                'factors': matches
            }
        
        # Calculate total score
        total_score = 0
        for category in results:
            total_score += results[category]['score']
        
        # Normalize total score to 0-10 range
        category_count = len(results)
        if category_count > 0:
            total_score = min(round(total_score / category_count, 1), 10)
        
        results['total_score'] = total_score
        
        return results
    
    def _analyze_with_spacy(self, text):
        """
        Analyze text using spaCy NLP.
        
        Args:
            text (str): Text to analyze
            
        Returns:
            dict: Analysis results
        """
        # Process text with spaCy
        doc = self.nlp(text)
        
        # Similar structure to keyword matching, but with more sophisticated NLP
        results = {}
        
        # For each category of keywords
        for category, keywords in self.keywords.items():
            matches = []
            
            # Create a combined pattern for this category
            category_keywords = [k.lower() for k in keywords]
            
            # Find phrases that match keywords semantically
            for token in doc:
                if token.text.lower() in category_keywords:
                    matches.append(token.text)
                else:
                    # Check for semantic similarity
                    for keyword in keywords:
                        keyword_doc = self.nlp(keyword)
                        if token.has_vector and keyword_doc[0].has_vector:
                            similarity = token.similarity(keyword_doc[0])
                            if similarity > 0.7 and token.text not in matches:
                                matches.append(token.text)
            
            # Calculate score based on number of matches
            score = min(len(matches) * 2, 10) if matches else 0
            
            # Store results
            results[category] = {
                'score': score,
                'factors': matches
            }
        
        # Calculate total score
        total_score = 0
        for category in results:
            total_score += results[category]['score']
        
        # Normalize total score to 0-10 range
        category_count = len(results)
        if category_count > 0:
            total_score = min(round(total_score / category_count, 1), 10)
        
        results['total_score'] = total_score
        
        return results
    
    def _analyze_with_openai(self, text, listing):
        """
        Analyze text using OpenAI's API.
        
        Args:
            text (str): Text to analyze
            listing (dict): Original listing data
            
        Returns:
            dict: Analysis results
        """
        try:
            # Construct prompt for OpenAI
            prompt = f"""
            Analyze the following commercial real estate listing description to evaluate its investment potential.
            Focus on three key areas:
            1. Seller Motivation: Signs of distress, urgency, or financial issues (e.g., "must sell," "priced to sell quickly").
            2. Transaction Complexity: Indicators like legal complexities or title issues (e.g., "foreclosure," "bankruptcy").
            3. Property Characteristics: Upside potential factors (e.g., "below-market rents," "deferred maintenance").
            
            For each category, provide:
            - A score from 0-10 (higher = stronger indicators)
            - A list of specific factors found in the text
            
            Finally, calculate a total investment score (0-10).
            
            Respond in JSON format only.
            
            Property Type: {listing.get('propertyType', 'Unknown')}
            Price: {listing.get('price', 'Unknown')}
            Location: {listing.get('address', 'Unknown')}
            
            Description: {text}
            """
            
            # Make API call
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a commercial real estate investment analyst. Analyze listings for investment potential."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            # Parse response
            result = response.choices[0].message.content
            import json
            analysis = json.loads(result)
            
            # Ensure proper structure
            if not all(k in analysis for k in ['seller_motivation', 'transaction_complexity', 'property_characteristics', 'total_score']):
                logger.warning("OpenAI response missing required fields")
                return self._add_empty_analysis(listing)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing with OpenAI: {e}")
            return self._add_empty_analysis(listing)

def analyze_listings(listings, nlp_config):
    """
    Analyze a list of listings using NLP techniques.
    
    Args:
        listings (list): List of listings from LoopNet
        nlp_config (dict): NLP configuration
        
    Returns:
        list: Listings with added analysis
    """
    try:
        logger.info(f"Analyzing {len(listings)} listings with NLP")
        
        # Initialize NLP analyzer
        analyzer = NLPAnalyzer(nlp_config)
        
        # Process each listing
        analyzed_listings = []
        for listing in listings:
            analyzed_listing = analyzer.analyze_listing(listing)
            analyzed_listings.append(analyzed_listing)
        
        logger.info(f"Completed NLP analysis for {len(analyzed_listings)} listings")
        return analyzed_listings
        
    except Exception as e:
        logger.error(f"Error in NLP analysis: {e}")
        return listings