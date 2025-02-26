#!/usr/bin/env python3
"""
Storage Utilities

This module provides functions for storing and retrieving data.
"""

import os
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def save_listings_to_json(listings, filename=None):
    """
    Save listings to a JSON file.
    
    Args:
        listings (list): List of listings
        filename (str, optional): Custom filename
        
    Returns:
        str: Path to saved file
    """
    try:
        # Create data directory if it doesn't exist
        os.makedirs('data', exist_ok=True)
        
        # Generate filename if not provided
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"data/listings_{timestamp}.json"
        
        # Save to file
        with open(filename, 'w') as f:
            json.dump(listings, f, indent=2)
        
        logger.info(f"Saved {len(listings)} listings to {filename}")
        return filename
        
    except Exception as e:
        logger.error(f"Error saving listings to JSON: {e}")
        return None

def load_listings_from_json(filename):
    """
    Load listings from a JSON file.
    
    Args:
        filename (str): Path to JSON file
        
    Returns:
        list: List of listings
    """
    try:
        # Check if file exists
        if not os.path.exists(filename):
            logger.error(f"File not found: {filename}")
            return []
        
        # Load from file
        with open(filename, 'r') as f:
            listings = json.load(f)
        
        logger.info(f"Loaded {len(listings)} listings from {filename}")
        return listings
        
    except Exception as e:
        logger.error(f"Error loading listings from JSON: {e}")
        return []

def list_saved_files(directory='data', pattern='listings_*.json'):
    """
    List saved data files matching a pattern.
    
    Args:
        directory (str): Directory to search
        pattern (str): File pattern to match
        
    Returns:
        list: List of matching file paths
    """
    try:
        import glob
        
        # Generate file pattern
        file_pattern = os.path.join(directory, pattern)
        
        # Find matching files
        files = glob.glob(file_pattern)
        
        # Sort by creation time (newest first)
        files.sort(key=os.path.getctime, reverse=True)
        
        return files
        
    except Exception as e:
        logger.error(f"Error listing saved files: {e}")
        return []