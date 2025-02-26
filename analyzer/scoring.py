#!/usr/bin/env python3
"""
Scoring Module for CRE Deal Finder

This module calculates investment scores based on the NLP analysis results.
"""

import logging

logger = logging.getLogger(__name__)

def score_listing(analysis_results, scoring_config):
    """
    Score a listing based on NLP analysis results
    
    Args:
        analysis_results (dict): The NLP analysis results
        scoring_config (dict): Scoring configuration
        
    Returns:
        dict: Scores for each category and total score
    """
    # Extract weights from config
    seller_weight = scoring_config.get('seller_motivation_weight', 0.4)
    transaction_weight = scoring_config.get('transaction_complexity_weight', 0.3)
    property_weight = scoring_config.get('property_characteristics_weight', 0.3)
    
    # Count matches in each category
    seller_matches = len(analysis_results['seller_motivation_matches'])
    transaction_matches = len(analysis_results['transaction_complexity_matches'])
    property_matches = len(analysis_results['property_characteristics_matches'])
    
    # Calculate base scores (0-10 scale)
    # The score calculation assumes a maximum of 5 keywords per category for a perfect 10 score
    # Adjust the multipliers below if you want to change this assumption
    seller_score = min(10, seller_matches * 2.0)
    transaction_score = min(10, transaction_matches * 2.0)
    property_score = min(10, property_matches * 2.0)
    
    # Calculate weighted total score
    total_score = (
        (seller_score * seller_weight) +
        (transaction_score * transaction_weight) +
        (property_score * property_weight)
    )
    
    # Create results dictionary
    results = {
        'seller_motivation_score': seller_score,
        'transaction_complexity_score': transaction_score,
        'property_characteristics_score': property_score,
        'total_score': total_score,
        'seller_motivation_matches': analysis_results['seller_motivation_matches'],
        'transaction_complexity_matches': analysis_results['transaction_complexity_matches'],
        'property_characteristics_matches': analysis_results['property_characteristics_matches']
    }
    
    return results
