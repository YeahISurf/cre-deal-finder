#!/usr/bin/env python3
"""
Scoring Module

This module provides functions for scoring and ranking LoopNet listings
based on investment criteria.
"""

import logging
import pandas as pd

logger = logging.getLogger(__name__)

def score_listings(listings, scoring_config):
    """
    Score and rank listings based on investment criteria.
    
    Args:
        listings (list): List of listings with NLP analysis
        scoring_config (dict): Scoring configuration
        
    Returns:
        list: Scored and ranked listings
    """
    try:
        logger.info(f"Scoring {len(listings)} listings")
        
        # Extract weights from config
        seller_motivation_weight = scoring_config.get('seller_motivation_weight', 0.4)
        transaction_complexity_weight = scoring_config.get('transaction_complexity_weight', 0.3)
        property_characteristics_weight = scoring_config.get('property_characteristics_weight', 0.3)
        
        # Process each listing
        for listing in listings:
            # Check if NLP analysis is present
            if not all(k in listing for k in ['seller_motivation', 'transaction_complexity', 'property_characteristics']):
                logger.warning(f"Listing {listing.get('id', 'unknown')} missing NLP analysis. Adding default scores.")
                listing.update({
                    'seller_motivation': {'score': 0, 'factors': []},
                    'transaction_complexity': {'score': 0, 'factors': []},
                    'property_characteristics': {'score': 0, 'factors': []}
                })
            
            # Extract scores
            seller_score = listing['seller_motivation'].get('score', 0)
            transaction_score = listing['transaction_complexity'].get('score', 0)
            property_score = listing['property_characteristics'].get('score', 0)
            
            # Calculate weighted total score
            weighted_score = (
                seller_score * seller_motivation_weight +
                transaction_score * transaction_complexity_weight +
                property_score * property_characteristics_weight
            )
            
            # Round to one decimal place
            weighted_score = round(weighted_score, 1)
            
            # Add total score to listing
            listing['total_investment_score'] = weighted_score
        
        # Sort listings by total score (descending)
        sorted_listings = sorted(listings, key=lambda x: x.get('total_investment_score', 0), reverse=True)
        
        logger.info(f"Completed scoring for {len(sorted_listings)} listings")
        return sorted_listings
        
    except Exception as e:
        logger.error(f"Error scoring listings: {e}")
        return listings

def add_highlight_flags(listings, threshold):
    """
    Add highlight flags to listings that meet or exceed the score threshold.
    
    Args:
        listings (list): List of scored listings
        threshold (float): Score threshold for highlighting
        
    Returns:
        list: Listings with highlight flags added
    """
    try:
        logger.info(f"Adding highlight flags for listings with score >= {threshold}")
        
        highlighted_count = 0
        for listing in listings:
            # Check if score meets threshold
            score = listing.get('total_investment_score', 0)
            listing['highlight'] = score >= threshold
            
            if listing['highlight']:
                highlighted_count += 1
        
        logger.info(f"Highlighted {highlighted_count} out of {len(listings)} listings")
        return listings
        
    except Exception as e:
        logger.error(f"Error adding highlight flags: {e}")
        return listings

def generate_investment_summary(listing):
    """
    Generate an investment summary for a listing based on analysis.
    
    Args:
        listing (dict): Scored listing
        
    Returns:
        str: Summary text highlighting key investment points
    """
    try:
        # Get factors from analysis
        seller_factors = listing.get('seller_motivation', {}).get('factors', [])
        transaction_factors = listing.get('transaction_complexity', {}).get('factors', [])
        property_factors = listing.get('property_characteristics', {}).get('factors', [])
        
        # Build summary
        summary_parts = []
        
        if seller_factors:
            summary_parts.append(f"Seller: {', '.join(seller_factors)}")
        
        if transaction_factors:
            summary_parts.append(f"Transaction: {', '.join(transaction_factors)}")
        
        if property_factors:
            summary_parts.append(f"Property: {', '.join(property_factors)}")
        
        # Combine parts
        if summary_parts:
            summary = "Investment Potential: " + "; ".join(summary_parts)
        else:
            summary = "No specific investment factors identified."
        
        return summary
        
    except Exception as e:
        logger.error(f"Error generating investment summary: {e}")
        return "Error generating summary."