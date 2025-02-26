#!/usr/bin/env python3
"""
Setup Script for CRE Deal Finder

This script helps set up the CRE Deal Finder by:
1. Installing required dependencies
2. Creating necessary directories
3. Generating a configuration file
"""

import os
import sys
import subprocess
import shutil
import yaml
import getpass
from datetime import datetime

def print_header(message):
    """Print a formatted header message"""
    print("\n" + "=" * 80)
    print(f" {message}")
    print("=" * 80)

def install_dependencies():
    """Install required Python dependencies"""
    print_header("Installing dependencies")
    
    try:
        # Check if requirements.txt exists
        if not os.path.exists('requirements.txt'):
            print("Error: requirements.txt not found!")
            return False
        
        # Install dependencies using pip
        print("Installing required Python packages...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    print_header("Creating directories")
    
    directories = ['data', 'logs', 'config']
    
    for directory in directories:
        try:
            os.makedirs(directory, exist_ok=True)
            print(f"✅ Created directory: {directory}")
        except Exception as e:
            print(f"❌ Error creating directory {directory}: {e}")

def create_config_file():
    """Create configuration file from template"""
    print_header("Setting up configuration")
    
    config_path = 'config/config.yaml'
    example_config_path = 'config/config.example.yaml'
    
    # Check if config already exists
    if os.path.exists(config_path):
        overwrite = input("Configuration file already exists. Overwrite? (y/n): ").lower()
        if overwrite != 'y':
            print("Skipping configuration setup.")
            return
    
    # Check if example config exists
    if not os.path.exists(example_config_path):
        print(f"❌ Error: Example configuration file not found at {example_config_path}")
        return
    
    try:
        # Load example config
        with open(example_config_path, 'r') as file:
            config = yaml.safe_load(file)
        
        # Get user input for key configurations
        print("Please provide the following information for configuration:")
        
        # Apify configuration
        config['apify']['api_key'] = input("Apify API Key (press Enter to skip): ") or config['apify']['api_key']
        
        # NLP configuration
        if config.get('nlp', {}).get('provider') == 'openai':
            config['nlp']['openai_api_key'] = input("OpenAI API Key (press Enter to skip): ") or config['nlp'].get('openai_api_key', '')
        
        # Google Sheets configuration
        config['google_sheets']['sheet_id'] = input("Google Sheet ID (press Enter to skip): ") or config['google_sheets'].get('sheet_id', '')
        
        # Write updated config
        with open(config_path, 'w') as file:
            yaml.dump(config, file, default_flow_style=False)
        
        print(f"✅ Configuration saved to {config_path}")
    except Exception as e:
        print(f"❌ Error creating configuration file: {e}")

def setup_credentials():
    """Set up Google API credentials"""
    print_header("Setting up Google API credentials")
    
    credentials_example = 'credentials.json.example'
    credentials_file = 'credentials.json'
    
    # Check if credentials already exist
    if os.path.exists(credentials_file):
        overwrite = input("Credentials file already exists. Overwrite? (y/n): ").lower()
        if overwrite != 'y':
            print("Skipping credentials setup.")
            return
    
    print("To use Google Sheets integration, you need to:")
    print("1. Create a Google Cloud project")
    print("2. Enable the Google Sheets API")
    print("3. Create a service account")
    print("4. Download the JSON credentials file")
    print("5. Share your Google Sheet with the service account email")
    print("\nFor detailed instructions, visit: https://docs.gspread.org/en/latest/oauth2.html")
    
    has_credentials = input("\nDo you have a Google service account credentials file? (y/n): ").lower()
    
    if has_credentials == 'y':
        file_path = input("Enter the path to your credentials file: ")
        if os.path.exists(file_path):
            try:
                shutil.copy(file_path, credentials_file)
                print(f"✅ Credentials copied to {credentials_file}")
            except Exception as e:
                print(f"❌ Error copying credentials file: {e}")
        else:
            print(f"❌ File not found: {file_path}")
    else:
        print("\nYou can set up credentials later by:")
        print(f"1. Renaming {credentials_example} to {credentials_file}")
        print("2. Updating the file with your service account details")

def test_setup():
    """Run a simple test to verify setup"""
    print_header("Testing setup")
    
    print("Running test script to verify setup...")
    try:
        # Run the test script
        subprocess.run([sys.executable, "test.py"], check=True)
        print("\n✅ Setup test completed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Setup test failed: {e}")
    except Exception as e:
        print(f"\n❌ Unexpected error during test: {e}")

def main():
    """Main setup function"""
    print_header("CRE Deal Finder Setup")
    print("This script will help you set up the CRE Deal Finder tool.")
    
    # Install dependencies
    if not install_dependencies():
        print("\nSetup cannot continue due to dependency installation failure.")
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Create configuration file
    create_config_file()
    
    # Set up credentials
    setup_credentials()
    
    # Test setup
    run_test = input("\nWould you like to run a test to verify setup? (y/n): ").lower()
    if run_test == 'y':
        test_setup()
    
    print_header("Setup Complete")
    print("The CRE Deal Finder has been set up successfully!")
    print("\nTo run the tool:")
    print("1. Ensure your configuration in config/config.yaml is complete")
    print("2. Run the main script: python main.py")
    print("\nFor more information, refer to the README.md file.")

if __name__ == "__main__":
    main()