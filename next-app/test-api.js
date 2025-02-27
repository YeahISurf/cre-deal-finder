// Simple test script to verify the API with model cascade
const fetch = require('node-fetch');

// Sample property data from PropertyForm.js
const SAMPLE_PROPERTY = {
  name: 'Retail Strip Center',
  property_type: 'Retail',
  location: 'Suburban Location',
  price: '$3,950,000',
  description: `PRICE REDUCED - OWNER MUST SELL! Retail Strip Center in Prime Location

Offering Summary
Sale Price: $3,950,000 (Reduced from $4,200,000)
Building Size: 15,400 SF
Price/SF: $256.49
Lot Size: 1.2 Acres
Year Built: 1985
Occupancy: 78%

Property Overview
Excellent value-add opportunity in a rapidly developing area! This retail strip center is being offered at below market price due to owner's urgent need to liquidate assets. The current owner is relocating out of state and needs a quick closing.

The property shows significant deferred maintenance but has solid bones and excellent upside potential. Current rents are approximately 15% below market, providing immediate upside for a new owner willing to implement a basic renovation program and more active management.

Property Highlights
- Prime corner location with excellent visibility and traffic counts of 25,000+ vehicles per day
- Below market rents with opportunity to increase by 15-20% upon lease renewal
- Value-add opportunity through renovation and repositioning
- Motivated seller - bring all offers!
- Strong tenant mix with national credit tenant as anchor (5-year lease remaining)
- High-growth area with new development nearby
- Potential for additional pad site development`
};

// Function to test the API with a real API key
async function testAPI(apiKey) {
  console.log('Testing API with model cascade...');
  
  if (!apiKey) {
    console.log('No API key provided. Using sample analysis mode instead.');
    testParsing();
    return;
  }
  
  try {
    console.log('Making API request to test model cascade...');
    
    const response = await fetch('http://localhost:3006/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        property: SAMPLE_PROPERTY
      }),
    });
    
    // Get the response as text first
    const text = await response.text();
    console.log('Raw response (first 200 chars):', text.substring(0, 200) + '...');
    
    try {
      // Try to parse as JSON
      const data = JSON.parse(text);
      
      console.log('\n=== API Response Analysis ===');
      console.log('Model used:', data.model_used);
      console.log('Models attempted:', data.models_attempted ? data.models_attempted.join(' → ') : 'Not specified');
      
      // Log the normalized scores
      console.log('\nExtracted scores:');
      console.log('Seller Motivation Score:', 
        data.seller_motivation_score || 
        (data.scores && data.scores.sellerMotivation) || 
        (data.scores && data.scores.seller_motivation) ||
        (data.seller_motivation && data.seller_motivation.score) || 0
      );
      
      console.log('Transaction Complexity Score:', 
        data.transaction_complexity_score || 
        (data.scores && data.scores.transactionComplexity) || 
        (data.scores && data.scores.transaction_complexity) ||
        (data.transaction_complexity && data.transaction_complexity.score) || 0
      );
      
      console.log('Property Characteristics Score:', 
        data.property_characteristics_score || 
        (data.scores && data.scores.propertyCharacteristics) || 
        (data.scores && data.scores.property_characteristics) ||
        (data.property_characteristics && data.property_characteristics.score) || 0
      );
      
      // Calculate total score if not provided
      let totalScore = data.total_score || 
                      (data.scores && data.scores.totalWeightedScore) || 
                      (data.scores && data.scores.total_weighted_score);
      
      if (!totalScore) {
        const sellerScore = data.seller_motivation_score || 
                           (data.scores && data.scores.sellerMotivation) || 
                           (data.scores && data.scores.seller_motivation) ||
                           (data.seller_motivation && data.seller_motivation.score) || 0;
        
        const complexityScore = data.transaction_complexity_score || 
                               (data.scores && data.scores.transactionComplexity) || 
                               (data.scores && data.scores.transaction_complexity) ||
                               (data.transaction_complexity && data.transaction_complexity.score) || 0;
        
        const propertyScore = data.property_characteristics_score || 
                             (data.scores && data.scores.propertyCharacteristics) || 
                             (data.scores && data.scores.property_characteristics) ||
                             (data.property_characteristics && data.property_characteristics.score) || 0;
        
        // Calculate weighted average (40% seller, 20% complexity, 40% property)
        totalScore = (sellerScore * 0.4) + (complexityScore * 0.2) + (propertyScore * 0.4);
        totalScore = parseFloat(totalScore.toFixed(1));
      }
      
      console.log('Total Score:', totalScore);
      
      console.log('\nAPI test completed successfully!');
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', text);
    }
  } catch (error) {
    console.error('Error making API request:', error);
  }
}

// Sample response format from the API for testing parsing
const SAMPLE_RESPONSE = {
  "seller_motivation": {
    "score": 10,
    "explanation": "The seller's urgent need to liquidate assets, relocate out of state, and desire for a quick closing indicate high motivation.",
    "keywords": ["PRICE REDUCED", "OWNER MUST SELL", "urgent need", "quick closing", "motivated seller", "bring all offers"]
  },
  "transaction_complexity": {
    "score": 7,
    "explanation": "The property requires a value-add strategy, renovation, and active management, which may add complexity to the transaction.",
    "keywords": ["value-add opportunity", "deferred maintenance", "below market rents", "renovation program", "repositioning"]
  },
  "property_characteristics": {
    "score": 8,
    "explanation": "The property has prime location, high visibility, strong tenant mix, below market rents with upside potential, and additional development opportunities.",
    "keywords": ["prime location", "high visibility", "value-add opportunity", "strong tenant mix", "below market rents", "high-growth area", "additional development potential"]
  },
  "model_used": "o1",
  "models_attempted": ["o1"]
};

// Function to test the parsing logic with sample data
function testParsing() {
  console.log('Testing analysis results parsing with sample data...');
  
  try {
    // Use our sample response
    const data = SAMPLE_RESPONSE;
    console.log('Sample data:', JSON.stringify(data).substring(0, 200) + '...');
    
    // Log the normalized scores that our component would extract
    console.log('\nExtracted scores:');
    console.log('Seller Motivation Score:', 
      data.seller_motivation_score || 
      (data.scores && data.scores.sellerMotivation) || 
      (data.scores && data.scores.seller_motivation) ||
      (data.seller_motivation && data.seller_motivation.score) || 0
    );
    
    console.log('Transaction Complexity Score:', 
      data.transaction_complexity_score || 
      (data.scores && data.scores.transactionComplexity) || 
      (data.scores && data.scores.transaction_complexity) ||
      (data.transaction_complexity && data.transaction_complexity.score) || 0
    );
    
    console.log('Property Characteristics Score:', 
      data.property_characteristics_score || 
      (data.scores && data.scores.propertyCharacteristics) || 
      (data.scores && data.scores.property_characteristics) ||
      (data.property_characteristics && data.property_characteristics.score) || 0
    );
    
    // Calculate total score if not provided
    let totalScore = data.total_score || 
                    (data.scores && data.scores.totalWeightedScore) || 
                    (data.scores && data.scores.total_weighted_score);
    
    if (!totalScore) {
      const sellerScore = data.seller_motivation_score || 
                         (data.scores && data.scores.sellerMotivation) || 
                         (data.scores && data.scores.seller_motivation) ||
                         (data.seller_motivation && data.seller_motivation.score) || 0;
      
      const complexityScore = data.transaction_complexity_score || 
                             (data.scores && data.scores.transactionComplexity) || 
                             (data.scores && data.scores.transaction_complexity) ||
                             (data.transaction_complexity && data.transaction_complexity.score) || 0;
      
      const propertyScore = data.property_characteristics_score || 
                           (data.scores && data.scores.propertyCharacteristics) || 
                           (data.scores && data.scores.property_characteristics) ||
                           (data.property_characteristics && data.property_characteristics.score) || 0;
      
      // Calculate weighted average (40% seller, 20% complexity, 40% property)
      totalScore = (sellerScore * 0.4) + (complexityScore * 0.2) + (propertyScore * 0.4);
      totalScore = parseFloat(totalScore.toFixed(1));
    }
    
    console.log('Total Score:', totalScore);
    
    // Log explanations
    console.log('\nExplanations:');
    console.log('Seller Motivation:', 
      (data.seller_motivation_analysis && data.seller_motivation_analysis.explanation) ||
      (data.explanations && data.explanations.seller_motivation) ||
      (data.analysis && data.analysis.sellerMotivationExplanation) ||
      (data.seller_motivation && data.seller_motivation.explanation) || 'N/A'
    );
    
    console.log('Transaction Complexity:', 
      (data.transaction_complexity_analysis && data.transaction_complexity_analysis.explanation) ||
      (data.explanations && data.explanations.transaction_complexity) ||
      (data.analysis && data.analysis.transactionComplexityExplanation) ||
      (data.transaction_complexity && data.transaction_complexity.explanation) || 'N/A'
    );
    
    console.log('Property Characteristics:', 
      (data.property_characteristics_analysis && data.property_characteristics_analysis.explanation) ||
      (data.explanations && data.explanations.property_characteristics) ||
      (data.analysis && data.analysis.propertyCharacteristicsExplanation) ||
      (data.property_characteristics && data.property_characteristics.explanation) || 'N/A'
    );
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Get API key from command line arguments
const apiKey = process.argv[2];

// Run the test with the provided API key or in sample mode
testAPI(apiKey);
