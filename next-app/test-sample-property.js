// Test script to analyze the sample property listing
const fetch = require('node-fetch');

// Sample property listing from PropertyForm.js
const property = {
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

// Function to analyze the property
async function analyzeProperty() {
  try {
    // Make a request to the API endpoint
    const response = await fetch('http://localhost:3003/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: 'dummy-key', // This will trigger the fallback analysis
        property: property
      }),
    });

    // Parse the response
    const data = await response.json();
    
    // Print the results
    console.log('Analysis Results:');
    console.log('Model Used:', data.model_used);
    
    // Check if the results have the expected structure
    if (data.scores) {
      // New format
      console.log('Seller Motivation Score:', data.scores.sellerMotivation?.score || 'N/A');
      console.log('Seller Motivation Keywords:', data.scores.sellerMotivation?.keywords || []);
      
      console.log('Transaction Complexity Score:', data.scores.transactionComplexity?.score || 'N/A');
      console.log('Transaction Complexity Keywords:', data.scores.transactionComplexity?.keywords || []);
      
      console.log('Property Characteristics Score:', data.scores.propertyCharacteristics?.score || 'N/A');
      console.log('Property Characteristics Keywords:', data.scores.propertyCharacteristics?.keywords || []);
    } else {
      // Old format
      console.log('Seller Motivation Score:', data.seller_motivation_score || 'N/A');
      console.log('Seller Motivation Keywords:', 
        data.seller_motivation_analysis?.keywords || []);
      
      console.log('Transaction Complexity Score:', data.transaction_complexity_score || 'N/A');
      console.log('Transaction Complexity Keywords:', 
        data.transaction_complexity_analysis?.keywords || []);
      
      console.log('Property Characteristics Score:', data.property_characteristics_score || 'N/A');
      console.log('Property Characteristics Keywords:', 
        data.property_characteristics_analysis?.keywords || []);
    }
    
    console.log('Total Score:', data.total_score || data.totalWeightedScore || 'N/A');
    
    // Check if there are any irrelevant keywords
    const allKeywords = [
      ...(data.scores?.sellerMotivation?.keywords || []),
      ...(data.scores?.transactionComplexity?.keywords || []),
      ...(data.scores?.propertyCharacteristics?.keywords || []),
      ...(data.seller_motivation_analysis?.keywords || []),
      ...(data.transaction_complexity_analysis?.keywords || []),
      ...(data.property_characteristics_analysis?.keywords || [])
    ];
    
    console.log('All Keywords:', allKeywords);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the analysis
analyzeProperty();
