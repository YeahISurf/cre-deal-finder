#!/usr/bin/env python3
"""
LoopNet Scraper Module

This module integrates with the Apify LoopNet Scraper to extract
commercial real estate listings from LoopNet.
"""

import os
import logging
from datetime import datetime
import json
from apify_client import ApifyClient

logger = logging.getLogger(__name__)

class LoopNetScraper:
    """
    Class for interacting with Apify's LoopNet Scraper to extract commercial real estate listings.
    """
    
    def __init__(self, apify_api_key, actor_id="epctex/loopnet-scraper"):
        """
        Initialize the LoopNet scraper with API credentials.
        
        Args:
            apify_api_key (str): Apify API key
            actor_id (str): ID of the Apify actor to use (default: epctex/loopnet-scraper)
        """
        self.client = ApifyClient(apify_api_key)
        self.actor_id = actor_id
        self.output_dir = "data"
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
    
    def scrape_listings(self, property_types=None, search_terms=None, max_items=None):
        """
        Scrape LoopNet listings using the Apify actor.
        
        Args:
            property_types (list): List of property types to scrape (e.g., "office", "industrial")
            search_terms (list): Additional search terms (e.g., "for sale")
            max_items (int): Maximum number of items to scrape (None for all)
            
        Returns:
            list: List of scraped listings
        """
        try:
            # Default values if none provided
            property_types = property_types or ["office", "industrial", "retail", "multifamily", "land", "specialty"]
            search_terms = search_terms or ["for sale"]
            
            logger.info(f"Starting LoopNet scrape for {', '.join(property_types)} properties")
            
            # Prepare run input
            run_input = {
                "startUrls": self._generate_start_urls(property_types, search_terms),
                "maxItems": max_items,
                "extendOutputFunction": """
                    ({ data, item, itemIndex, page, request, customData, label }) => {
                        return {
                            ...item,
                            scraped_at: new Date().toISOString()
                        }
                    }
                """
            }
            
            # Run the Apify actor
            logger.info(f"Running Apify actor {self.actor_id} with {len(run_input['startUrls'])} start URLs")
            run = self.client.actor(self.actor_id).call(run_input=run_input)
            
            # Get dataset items
            dataset_items = self.client.dataset(run["defaultDatasetId"]).list_items().items
            logger.info(f"Scraped {len(dataset_items)} listings successfully")
            
            # Save raw data to file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{self.output_dir}/loopnet_raw_{timestamp}.json"
            with open(filename, 'w') as f:
                json.dump(dataset_items, f)
            logger.info(f"Raw data saved to {filename}")
            
            return dataset_items
            
        except Exception as e:
            logger.error(f"Error scraping LoopNet listings: {e}")
            return []
    
    def _generate_start_urls(self, property_types, search_terms):
        """
        Generate start URLs for the Apify actor based on property types and search terms.
        
        Args:
            property_types (list): List of property types
            search_terms (list): List of search terms
            
        Returns:
            list: List of start URL objects for the Apify actor
        """
        start_urls = []
        
        for prop_type in property_types:
            for term in search_terms:
                url = f"https://www.loopnet.com/search/{prop_type}-for-sale/?sk={term.replace(' ', '+')}" 
                start_urls.append({"url": url})
        
        return start_urls