#!/usr/bin/env python3
"""
Simple NLP Module for CRE Deal Finder

This module provides basic Natural Language Processing functionality
to analyze commercial real estate listings without requiring external APIs.
"""

import re
import logging

logger = logging.getLogger(__name__)

def analyze_listing_text(text, keywords):
    """
    Analyze listing text for investment criteria keywords
    
    Args:
        text (str): The listing description text
        keywords (dict): Dictionary of keywords by category
        
    Returns:
        dict: Analysis results with matches by category
    """
    # Convert text to lowercase for case-insensitive matching
    text_lower = text.lower()
    
    # Initialize results dictionary
    results = {
        'seller_motivation_matches': [],
        'transaction_complexity_matches': [],
        'property_characteristics_matches': []
    }
    
    # Check for seller motivation keywords
    for keyword in keywords['seller_motivation']:
        if keyword.lower() in text_lower:
            # Get the context around the keyword (up to 100 characters)
            match_index = text_lower.find(keyword.lower())
            start = max(0, match_index - 50)
            end = min(len(text), match_index + len(keyword) + 50)
            context = text[start:end]
            
            results['seller_motivation_matches'].append({
                'keyword': keyword,
                'context': context.strip()
            })
    
    # Check for transaction complexity keywords
    for keyword in keywords['transaction_complexity']:
        if keyword.lower() in text_lower:
            # Get the context around the keyword
            match_index = text_lower.find(keyword.lower())
            start = max(0, match_index - 50)
            end = min(len(text), match_index + len(keyword) + 50)
            context = text[start:end]
            
            results['transaction_complexity_matches'].append({
                'keyword': keyword,
                'context': context.strip()
            })
    
    # Check for property characteristics keywords
    for keyword in keywords['property_characteristics']:
        if keyword.lower() in text_lower:
            # Get the context around the keyword
            match_index = text_lower.find(keyword.lower())
            start = max(0, match_index - 50)
            end = min(len(text), match_index + len(keyword) + 50)
            context = text[start:end]
            
            results['property_characteristics_matches'].append({
                'keyword': keyword,
                'context': context.strip()
            })
    
    # Extract simple keywords for display
    results['seller_motivation_matches'] = [
        match['keyword'] for match in results['seller_motivation_matches']
    ]
    results['transaction_complexity_matches'] = [
        match['keyword'] for match in results['transaction_complexity_matches']
    ]
    results['property_characteristics_matches'] = [
        match['keyword'] for match in results['property_characteristics_matches']
    ]
    
    # Look for additional contextual clues
    additional_clues(text_lower, results)
    
    return results

def additional_clues(text, results):
    """
    Look for additional contextual clues beyond simple keyword matching
    
    Args:
        text (str): The lowercase listing text
        results (dict): Current results dictionary to update
    """
    # Check for price reduction mentions
    price_patterns = [
        r"price reduced", r"reduced price", r"price cut", r"discount", r"below market"
    ]
    for pattern in price_patterns:
        if re.search(pattern, text) and "price reduced" not in results['seller_motivation_matches']:
            results['seller_motivation_matches'].append("price reduced")
    
    # Check for urgency expressions
    urgency_patterns = [
        r"won'?t last", r"selling (?:fast|quickly)", r"immediate", r"limited time", 
        r"act (?:fast|quickly|now)"
    ]
    for pattern in urgency_patterns:
        if re.search(pattern, text) and "urgency" not in results['seller_motivation_matches']:
            results['seller_motivation_matches'].append("urgency")
    
    # Check for redevelopment potential
    redevelopment_patterns = [
        r"potential (?:for|to) (?:develop|redevelop|build)", r"development opportunity", 
        r"zoned for", r"build to suit", r"highest and best use"
    ]
    for pattern in redevelopment_patterns:
        if re.search(pattern, text) and "redevelopment potential" not in results['property_characteristics_matches']:
            results['property_characteristics_matches'].append("redevelopment potential")
    
    # Check for below market indicators
    market_patterns = [
        r"below market", r"undervalued", r"good deal", r"bargain", r"priced to sell", 
        r"competitive price", r"great price", r"favorable (?:terms|pricing)"
    ]
    for pattern in market_patterns:
        if re.search(pattern, text) and "below market" not in results['property_characteristics_matches']:
            results['property_characteristics_matches'].append("below market")
