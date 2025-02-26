#!/usr/bin/env python3
"""
OpenAI-based Analyzer for CRE Deal Finder

This module uses OpenAI's language models to analyze commercial real estate listings
and identify investment opportunities based on seller motivation, transaction complexity,
and property characteristics.
"""

import logging
import os
import json
from openai import OpenAI

logger = logging.getLogger(__name__)

class OpenAIAnalyzer:
    """
    Class for analyzing commercial real estate listings using OpenAI
    """
    
    def __init__(self, api_key=None, model="o1"):
        """
        Initialize the OpenAI analyzer
        
        Args:
            api_key (str, optional): OpenAI API key. If not provided, will look for OPENAI_API_KEY environment variable
            model (str, optional): OpenAI model to use. Defaults to 'o1'
        """
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key not provided and not found in environment variables")
        
        self.model = model
        self.client = OpenAI(api_key=self.api_key)
        logger.info(f"Initialized OpenAI analyzer with model: {model}")
    
    def analyze_listing(self, listing_data):
        """
        Analyze a listing using OpenAI
        
        Args:
            listing_data (dict): Dictionary containing listing details
                Should include at least 'description' key, but can also have:
                'name', 'property_type', 'location', 'price'
        
        Returns:
            dict: Analysis results with scores and explanations
        """
        # Extract the description and any other relevant fields
        description = listing_data['description']
        property_name = listing_data.get('name', 'Unknown')
        property_type = listing_data.get('property_type', 'Unknown')
        location = listing_data.get('location', 'Unknown')
        price = listing_data.get('price', 'Unknown')
        
        # Create prompt for OpenAI
        system_prompt = self._create_system_prompt()
        user_prompt = self._create_user_prompt(description, property_name, property_type, location, price)
        
        try:
            # Call OpenAI API
            logger.info(f"Sending request to OpenAI for listing: {property_name}")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,  # Lower temperature for more consistent results
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Extract and parse the response
            result_text = response.choices[0].message.content
            logger.debug(f"OpenAI response: {result_text}")
            
            # Parse JSON response
            result = json.loads(result_text)
            
            return result
            
        except Exception as e:
            logger.error(f"Error in OpenAI API call: {e}")
            # Return a default response structure in case of error
            return {
                "seller_motivation_score": 0,
                "transaction_complexity_score": 0,
                "property_characteristics_score": 0,
                "total_score": 0,
                "seller_motivation_analysis": {
                    "explanation": f"Error analyzing listing: {e}",
                    "keywords": []
                },
                "transaction_complexity_analysis": {
                    "explanation": f"Error analyzing listing: {e}",
                    "keywords": []
                },
                "property_characteristics_analysis": {
                    "explanation": f"Error analyzing listing: {e}",
                    "keywords": []
                },
                "summary": f"Error analyzing listing: {e}"
            }
    
    def _create_system_prompt(self):
        """
        Create system prompt for OpenAI
        
        Returns:
            str: System prompt describing the task
        """
        return """
        You are a commercial real estate investment analyst specializing in identifying value-add and opportunistic investments. 
        Your task is to analyze property listing descriptions and identify signals related to three key investment criteria categories:
        
        1. Seller Motivation: Signs that the seller may be motivated to sell quickly or at favorable terms.
        2. Transaction Complexity: Factors that might reduce buyer competition or create unique opportunities.
        3. Property Characteristics: Features indicating value-add potential or situations where perceived risk exceeds actual risk.
        
        For each category, score the property on a scale of 1-10 based on the strength and number of signals present.
        Also provide a brief explanation of why you assigned that score and list any keywords or phrases that support your analysis.
        
        Calculate a total score as a weighted average: 40% Seller Motivation + 30% Transaction Complexity + 30% Property Characteristics.
        
        Provide your response in JSON format with the following structure:
        {
            "seller_motivation_score": <1-10>,
            "transaction_complexity_score": <1-10>,
            "property_characteristics_score": <1-10>,
            "total_score": <1-10>,
            "seller_motivation_analysis": {
                "explanation": "<brief explanation>",
                "keywords": ["<keyword1>", "<keyword2>", ...]
            },
            "transaction_complexity_analysis": {
                "explanation": "<brief explanation>",
                "keywords": ["<keyword1>", "<keyword2>", ...]
            },
            "property_characteristics_analysis": {
                "explanation": "<brief explanation>",
                "keywords": ["<keyword1>", "<keyword2>", ...]
            },
            "summary": "<brief investment recommendation>"
        }
        
        Here are examples of what to look for in each category:
        
        Seller Motivation:
        - Explicit statements like "motivated seller", "must sell", "priced to sell", "urgent sale", "relocating"
        - Price reductions or below market pricing
        - Mentions of distress, bankruptcy, foreclosure, or liquidation
        - Signs of aging or retiring ownership
        - Estate sales or inherited properties
        - Passive or inexperienced ownership
        - Time constraints or deadlines
        
        Transaction Complexity:
        - Legal complications or title issues
        - Foreclosures, short sales, REO properties
        - Portfolio sales with multiple properties
        - Complicated zoning or entitlement issues
        - Environmental concerns
        - Special financing considerations
        - Off-market properties or limited marketing
        - Unusual or complex lease structures
        
        Property Characteristics:
        - Below market rents or occupancy
        - Deferred maintenance or renovation needs
        - Mismanagement or operational inefficiencies
        - Outdated amenities or systems
        - Repositioning opportunities
        - Expansion potential or excess land
        - Properties offered at below replacement cost
        - Older Class B/C properties with value-add potential
        - Unusual property types with limited buyer pool
        
        Be thorough but concise in your analysis. Focus on objective signals in the listing description.
        """
    
    def _create_user_prompt(self, description, property_name, property_type, location, price):
        """
        Create user prompt for OpenAI with listing details
        
        Args:
            description (str): The listing description
            property_name (str): Name of the property
            property_type (str): Type of property (e.g., retail, office)
            location (str): Property location
            price (str): Property price
            
        Returns:
            str: User prompt with listing details
        """
        return f"""
        Please analyze the following commercial real estate listing:
        
        Property Name: {property_name}
        Property Type: {property_type}
        Location: {location}
        Price: {price}
        
        Listing Description:
        {description}
        
        Analyze this listing for signs of seller motivation, transaction complexity, and valuable property characteristics.
        Return your analysis in the requested JSON format with scores, explanations, and keywords for each category.
        """
