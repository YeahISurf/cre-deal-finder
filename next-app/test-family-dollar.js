// Test script to analyze the Family Dollar property listing
const fetch = require('node-fetch');

// Family Dollar property listing
const property = {
  name: "Family Dollar",
  property_type: "Retail",
  location: "Wellsville, OH",
  price: "N/A",
  description: "NNN Pro is pleased to present the exclusive listing for a Family Dollar located at 1230 Main St.​, Wellsville, OH 43953.​ The site consists of roughly 8,000 rentable square feet of building space on an estimated 0.78-acre parcel of land.​ This Family Dollar is subject to a 20-year Double Net (NN) lease, which commenced 10/28/1999.​ The current annual rent is $44,000 and has scheduled increases of Throughout Options: 10% Every 5 Years."
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
    
    const irrelevantKeywords = [
      "motivated seller", "price reduced", "must sell", "urgent sale"
    ];
    
    const foundIrrelevantKeywords = allKeywords.filter(keyword => 
      irrelevantKeywords.includes(keyword)
    );
    
    if (foundIrrelevantKeywords.length > 0) {
      console.log('WARNING: Found irrelevant keywords:', foundIrrelevantKeywords);
    } else {
      console.log('SUCCESS: No irrelevant keywords found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the analysis
analyzeProperty();
