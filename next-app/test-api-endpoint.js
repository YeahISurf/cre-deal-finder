// Simple script to test the analyze API endpoint
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Try to load from .env file if dotenv is available
try {
  if (fs.existsSync(path.join(__dirname, '.env'))) {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    console.log('Loaded API key from .env file');
  }
} catch (error) {
  console.warn('Warning: dotenv module not found or error loading .env file');
}

// Get API key from environment variable
const API_KEY = process.env.OPENAI_API_KEY;

// Validate API key
if (!API_KEY) {
  console.error('Error: API key is required.');
  console.error('Make sure OPENAI_API_KEY is set in your .env file');
  process.exit(1);
}

// Test property listing
const testProperty = {
  name: "Distressed Office Building",
  property_type: "Office",
  location: "Downtown Metro Area",
  price: "$2,850,000",
  description: `PRICE DRASTICALLY REDUCED! OWNER MUST SELL IMMEDIATELY!

This 25,000 SF office building is being offered at a significant discount due to the owner's urgent need to liquidate assets following bankruptcy proceedings. Originally listed at $3.5M, now priced at only $2.85M for quick sale.

The property is currently 65% occupied with tenants on month-to-month leases. The owner has been managing the property remotely and has not raised rents in over 5 years, resulting in rates approximately 25% below market.

Located in a growing downtown district with excellent access to public transportation and amenities. The building requires some cosmetic updates but has been well-maintained structurally with a new roof installed in 2020.

This is an exceptional opportunity for an investor looking to acquire a distressed asset with significant value-add potential. The seller is highly motivated and will consider all reasonable offers. Proof of funds required for showings.`
};

// Function to test the API endpoint
async function testApiEndpoint() {
  console.log('Testing API endpoint with sample property...');
  
  try {
    // Make a request to the local API endpoint
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: API_KEY,
        property: testProperty,
        forceModel: 'o1-mini' // Test with o1-mini model
      })
    });
    
    // Parse the response
    const data = await response.json();
    
    // Check for errors
    if (data.error) {
      console.error('API Error:', data.message);
      console.error('Error details:', data.error_details);
      return;
    }
    
    // Print the results
    console.log('\n========== API RESPONSE ==========\n');
    console.log('Model used:', data.model_used);
    console.log('\nScores:');
    console.log('Seller Motivation:', data.seller_motivation_score);
    console.log('Transaction Complexity:', data.transaction_complexity_score);
    console.log('Property Characteristics:', data.property_characteristics_score);
    console.log('Total Score:', data.total_score);
    
    console.log('\nSeller Motivation Analysis:');
    console.log('Explanation:', data.seller_motivation_analysis.explanation);
    console.log('Keywords:', data.seller_motivation_analysis.keywords);
    
    console.log('\nTransaction Complexity Analysis:');
    console.log('Explanation:', data.transaction_complexity_analysis.explanation);
    console.log('Keywords:', data.transaction_complexity_analysis.keywords);
    
    console.log('\nProperty Characteristics Analysis:');
    console.log('Explanation:', data.property_characteristics_analysis.explanation);
    console.log('Keywords:', data.property_characteristics_analysis.keywords);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing API endpoint:', error);
  }
}

// Run the test
testApiEndpoint();
