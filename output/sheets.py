#!/usr/bin/env python3
"""
Google Sheets Output Module

This module provides functions for exporting scored listings
to Google Sheets for review.
"""

import os
import logging
from datetime import datetime
import gspread
from oauth2client.service_account import ServiceAccountCredentials

logger = logging.getLogger(__name__)

class GoogleSheetsExporter:
    """Class for exporting data to Google Sheets."""
    
    def __init__(self, config):
        """
        Initialize the Google Sheets exporter with configuration.
        
        Args:
            config (dict): Google Sheets configuration
        """
        self.config = config
        self.credentials_file = config.get('credentials_file')
        self.sheet_id = config.get('sheet_id')
        self.worksheet_name = config.get('worksheet_name', 'Opportunities')
        
        # Initialize client
        self._init_client()
    
    def _init_client(self):
        """
        Initialize the Google Sheets client.
        
        Raises:
            Exception: If credentials file not found or invalid
        """
        try:
            # Define the scope
            scope = ['https://spreadsheets.google.com/feeds',
                     'https://www.googleapis.com/auth/drive']
            
            # Authenticate using service account credentials
            creds = ServiceAccountCredentials.from_json_keyfile_name(self.credentials_file, scope)
            self.client = gspread.authorize(creds)
            
            logger.info("Google Sheets client initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Google Sheets client: {e}")
            raise
    
    def export_listings(self, listings):
        """
        Export listings to Google Sheets.
        
        Args:
            listings (list): List of scored listings
            
        Returns:
            bool: True if export successful, False otherwise
        """
        try:
            logger.info(f"Exporting {len(listings)} listings to Google Sheets")
            
            # Open the spreadsheet and worksheet (create if doesn't exist)
            try:
                # Try to open existing spreadsheet
                spreadsheet = self.client.open_by_key(self.sheet_id)
                
                # Check if worksheet exists
                try:
                    worksheet = spreadsheet.worksheet(self.worksheet_name)
                    logger.info(f"Updating existing worksheet: {self.worksheet_name}")
                    self._clear_worksheet(worksheet)
                except gspread.exceptions.WorksheetNotFound:
                    # Create new worksheet if it doesn't exist
                    worksheet = spreadsheet.add_worksheet(title=self.worksheet_name, rows=1000, cols=20)
                    logger.info(f"Created new worksheet: {self.worksheet_name}")
                    
            except gspread.exceptions.SpreadsheetNotFound:
                logger.error(f"Spreadsheet with ID {self.sheet_id} not found")
                return False
            
            # Prepare header row
            headers = [
                'Listing ID',
                'Property Name',
                'Address',
                'State',
                'Property Type',
                'Price',
                'Seller Motivation Score',
                'Transaction Complexity Score',
                'Property Characteristics Score',
                'Total Investment Score',
                'Broker Description',
                'Investment Summary',
                'Link',
                'Scraped Date'
            ]
            
            # Update header row
            worksheet.update('A1', [headers])
            
            # Format header row
            header_format = {
                "textFormat": {"bold": True},
                "backgroundColor": {"red": 0.2, "green": 0.2, "blue": 0.2},
                "horizontalAlignment": "CENTER"
            }
            worksheet.format('A1:N1', {"textFormat": {"bold": True}})
            
            # Prepare data rows
            data_rows = []
            for listing in listings:
                # Create investment summary
                from analyzer.scoring import generate_investment_summary
                investment_summary = generate_investment_summary(listing)
                
                row = [
                    listing.get('id', ''),
                    listing.get('title', ''),
                    listing.get('address', ''),
                    listing.get('state', ''),
                    listing.get('propertyType', ''),
                    listing.get('price', ''),
                    listing.get('seller_motivation', {}).get('score', 0),
                    listing.get('transaction_complexity', {}).get('score', 0),
                    listing.get('property_characteristics', {}).get('score', 0),
                    listing.get('total_investment_score', 0),
                    listing.get('description', '')[:500] + ('...' if len(listing.get('description', '')) > 500 else ''),
                    investment_summary,
                    listing.get('url', ''),
                    listing.get('scraped_at', datetime.now().isoformat())
                ]
                data_rows.append(row)
            
            # Update data rows
            if data_rows:
                worksheet.update('A2', data_rows)
                logger.info(f"Updated {len(data_rows)} data rows")
                
                # Apply conditional formatting for high scores
                self._apply_conditional_formatting(worksheet, len(data_rows))
            else:
                logger.warning("No data rows to update")
            
            # Resize columns
            worksheet.columns_auto_resize(1, 14)
            
            logger.info("Google Sheets export completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error exporting to Google Sheets: {e}")
            return False
    
    def _clear_worksheet(self, worksheet):
        """
        Clear the contents of a worksheet except header row.
        
        Args:
            worksheet: gspread worksheet object
        """
        try:
            # Get worksheet dimensions
            cell_list = worksheet.findall(".*")
            if cell_list:
                # Find max row
                max_row = max([cell.row for cell in cell_list])
                
                # Clear from row 2 to max row
                if max_row > 1:
                    worksheet.batch_clear([f'A2:Z{max_row}'])
                    logger.info(f"Cleared worksheet data from row 2 to {max_row}")
            
        except Exception as e:
            logger.error(f"Error clearing worksheet: {e}")
    
    def _apply_conditional_formatting(self, worksheet, num_rows):
        """
        Apply conditional formatting to score columns.
        
        Args:
            worksheet: gspread worksheet object
            num_rows (int): Number of data rows
        """
        try:
            if num_rows <= 0:
                return
            
            # Get highlight threshold from config
            threshold = self.config.get('highlight_threshold', 7)
            
            # Apply formatting to score columns
            score_columns = ['G', 'H', 'I', 'J']  # Columns with scores
            last_row = 1 + num_rows
            
            for col in score_columns:
                # High scores (>= threshold) - green background
                worksheet.conditional_format(f"{col}2:{col}{last_row}", {
                    "type": "CUSTOM_FORMULA",
                    "values": [{"userEnteredValue": f"=AND({col}2>={threshold}, {col}2<=10)"}],
                    "backgroundColor": {"red": 0.7, "green": 0.9, "blue": 0.7}
                })
                
                # Medium scores (4-6.9) - yellow background
                worksheet.conditional_format(f"{col}2:{col}{last_row}", {
                    "type": "CUSTOM_FORMULA",
                    "values": [{"userEnteredValue": f"=AND({col}2>=4, {col}2<{threshold})"}],
                    "backgroundColor": {"red": 1.0, "green": 0.95, "blue": 0.7}
                })
                
                # Low scores (0-3.9) - light red background
                worksheet.conditional_format(f"{col}2:{col}{last_row}", {
                    "type": "CUSTOM_FORMULA",
                    "values": [{"userEnteredValue": f"=AND({col}2>=0, {col}2<4)"}],
                    "backgroundColor": {"red": 1.0, "green": 0.8, "blue": 0.8}
                })
                
            logger.info("Applied conditional formatting to score columns")
            
        except Exception as e:
            logger.error(f"Error applying conditional formatting: {e}")

def update_google_sheet(listings, sheet_config):
    """
    Update Google Sheet with scored listings.
    
    Args:
        listings (list): List of scored listings
        sheet_config (dict): Google Sheets configuration
        
    Returns:
        bool: True if update successful, False otherwise
    """
    try:
        logger.info("Updating Google Sheet with scored listings")
        
        # Initialize exporter
        exporter = GoogleSheetsExporter(sheet_config)
        
        # Export listings
        success = exporter.export_listings(listings)
        
        return success
        
    except Exception as e:
        logger.error(f"Error updating Google Sheet: {e}")
        return False