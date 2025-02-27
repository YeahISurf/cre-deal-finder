// Test script specifically for Claude 3 Opus (o1) model
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

// Get API key from command line argument or environment variable
const API_KEY = process.argv[2] || process.env.OPENAI_API_KEY;

// Validate API key
if (!API_KEY) {
  console.error('Error: API key is required.');
  console.error('Usage: node test-opus-model.js YOUR_API_KEY');
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

// Function to analyze a property with Claude 3 Opus
async function analyzePropertyWithOpus(property) {
  console.log(`\n========== ANALYZING PROPERTY WITH MODEL: Claude 3 Opus (o1) ==========\n`);
  
  try {
    // Make a direct request to the OpenAI API
    const openaiUrl = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    };
    
    // Very simple prompt for Claude 3 Opus to ensure proper JSON formatting
    const body = JSON.stringify({
      model: 'o1',
      messages: [
        {
          role: "user",
          content: `Analyze this commercial real estate property and return a JSON object with scores (1-10) for seller motivation, transaction complexity, and property characteristics.

Property: ${property.name}
Type: ${property.property_type}
Location: ${property.location}
Price: ${property.price}
Description: ${property.description}

Return ONLY a JSON object with this exact structure:
{
  "seller_motivation_score": 9,
  "transaction_complexity_score": 7,
  "property_characteristics_score": 8,
  "total_score": 8.0
}`
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500
    });
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request timed out after 30000ms`)), 30000);
    });
    
    // Make the API request with timeout
    const fetchPromise = fetch(openaiUrl, {
      method: 'POST',
      headers: headers,
      body: body
    });
    
    // Race between the fetch and the timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Parse the response
    const data = await response.json();
    
    // Check for errors
    if (data.error) {
      console.error(`Error from Claude 3 Opus:`, data.error);
      return {
        error: data.error.message || 'Unknown error',
        issues: [`API Error: ${data.error.message || 'Unknown error'}`]
      };
    }
    
    // Extract the content
    const content = data.choices[0].message.content;
    console.log('Raw response:', content);
    
    try {
      // Parse the JSON response
      const parsedContent = JSON.parse(content);
      
      // Print scores
      console.log('\nScores:');
      console.log('Seller Motivation:', parsedContent.seller_motivation_score);
      console.log('Transaction Complexity:', parsedContent.transaction_complexity_score);
      console.log('Property Characteristics:', parsedContent.property_characteristics_score);
      console.log('Total Score:', parsedContent.total_score);
      
      // Check for issues
      const issues = [];
      
      // Check for zero scores
      if (parsedContent.seller_motivation_score === 0) issues.push('Seller Motivation score is 0');
      if (parsedContent.transaction_complexity_score === 0) issues.push('Transaction Complexity score is 0');
      if (parsedContent.property_characteristics_score === 0) issues.push('Property Characteristics score is 0');
      if (parsedContent.total_score === 0) issues.push('Total score is 0');
      
      // Print issues
      if (issues.length > 0) {
        console.log('\n⚠️ ISSUES DETECTED:');
        issues.forEach(issue => console.log(`- ${issue}`));
      } else {
        console.log('\n✅ No issues detected');
      }
      
      return {
        scores: {
          sellerMotivation: parsedContent.seller_motivation_score,
          transactionComplexity: parsedContent.transaction_complexity_score,
          propertyCharacteristics: parsedContent.property_characteristics_score
        },
        totalScore: parsedContent.total_score,
        issues,
        rawResponse: parsedContent
      };
    } catch (parseError) {
      console.error(`JSON parsing error:`, parseError.message);
      console.error('Raw content causing parse error:', content);
      return {
        error: `Failed to parse response: ${parseError.message}`,
        issues: [`JSON parsing error: ${parseError.message}`],
        rawContent: content
      };
    }
  } catch (error) {
    console.error(`Error with Claude 3 Opus model:`, error);
    return {
      error: error.message,
      issues: [`API request error: ${error.message}`]
    };
  }
}

// Main function
async function main() {
  console.log('Starting Claude 3 Opus model test for CRE Deal Finder...');
  console.log(`Using API key: ${API_KEY.substring(0, 5)}...${API_KEY.substring(API_KEY.length - 5)}`);
  
  // Test the model
  const result = await analyzePropertyWithOpus(testProperty);
  
  // Print summary
  console.log('\n\n========== SUMMARY ==========\n');
  console.log('Seller Motivation Score:', result.scores?.sellerMotivation || 'N/A');
  console.log('Transaction Complexity Score:', result.scores?.transactionComplexity || 'N/A');
  console.log('Property Characteristics Score:', result.scores?.propertyCharacteristics || 'N/A');
  console.log('Total Score:', result.totalScore || 'N/A');
  console.log('Issues:', result.issues?.length || 0);
  
  console.log('\nTest completed successfully!');
}

// Run the main function
main().catch(console.error);
