#!/usr/bin/env python3
"""
Filtering Utilities

This module provides functions for filtering LoopNet listings based on
geographic location and other criteria.
"""

import logging
import pandas as pd

logger = logging.getLogger(__name__)

def filter_by_geography(listings, target_states):
    """
    Filter listings to include only those in target states.
    
    Args:
        listings (list): List of listings from LoopNet
        target_states (list): List of state abbreviations to include
        
    Returns:
        list: Filtered list of listings
    """
    try:
        logger.info(f"Filtering {len(listings)} listings to include only states: {', '.join(target_states)}")
        
        # Convert target_states to uppercase for consistent matching
        target_states = [state.upper() for state in target_states]
        
        # Create a DataFrame for easier filtering
        df = pd.DataFrame(listings)
        
        # Check if 'state' column exists
        if 'state' in df.columns:
            # Filter by state column
            filtered_df = df[df['state'].str.upper().isin(target_states)]
            
        elif 'address' in df.columns:
            # Extract state from address if no state column
            # This assumes addresses end with state and zip code
            logger.info("No 'state' column found, extracting state from address")
            
            def extract_state(address):
                if not address or not isinstance(address, str):
                    return None
                
                # Try to extract state from address
                parts = address.strip().split()
                if len(parts) >= 2:
                    # Check if second-to-last part might be a state abbreviation
                    potential_state = parts[-2].strip().upper().rstrip(',')
                    if len(potential_state) == 2 and potential_state.isalpha():
                        return potential_state
                return None
            
            df['extracted_state'] = df['address'].apply(extract_state)
            filtered_df = df[df['extracted_state'].isin(target_states)]
            
        else:
            # If no state or address column, return empty DataFrame
            logger.warning("No 'state' or 'address' column found for filtering")
            return []
        
        filtered_listings = filtered_df.to_dict('records')
        logger.info(f"Filtered to {len(filtered_listings)} listings in target states")
        
        return filtered_listings
        
    except Exception as e:
        logger.error(f"Error filtering listings by geography: {e}")
        return []

def filter_by_property_type(listings, property_types):
    """
    Filter listings by property type.
    
    Args:
        listings (list): List of listings from LoopNet
        property_types (list): List of property types to include
        
    Returns:
        list: Filtered list of listings
    """
    try:
        logger.info(f"Filtering listings by property types: {', '.join(property_types)}")
        
        # Convert to lowercase for consistent matching
        property_types = [pt.lower() for pt in property_types]
        
        # Create a DataFrame for easier filtering
        df = pd.DataFrame(listings)
        
        # Check if 'propertyType' column exists
        if 'propertyType' in df.columns:
            # Filter by property type
            filtered_df = df[df['propertyType'].str.lower().isin(property_types)]
            
            filtered_listings = filtered_df.to_dict('records')
            logger.info(f"Filtered to {len(filtered_listings)} listings of specified property types")
            
            return filtered_listings
        else:
            logger.warning("No 'propertyType' column found for filtering")
            return listings
            
    except Exception as e:
        logger.error(f"Error filtering listings by property type: {e}")
        return listings