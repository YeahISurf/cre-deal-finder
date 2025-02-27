// Comprehensive test script to analyze multiple property listings
const fetch = require('node-fetch');

// OpenAI API key should be provided as an environment variable or through a secure method
// DO NOT hardcode API keys in source code
const API_KEY = process.env.OPENAI_API_KEY || 'your-api-key-here'; // Replace with your API key when testing locally


// Test property listings with different characteristics
const testProperties = [
  // Test Case 1: Strong Seller Motivation
  {
    name: "Distressed Office Building",
    property_type: "Office",
    location: "Downtown Metro Area",
    price: "$2,850,000",
    description: `PRICE DRASTICALLY REDUCED! OWNER MUST SELL IMMEDIATELY!

This 25,000 SF office building is being offered at a significant discount due to the owner's urgent need to liquidate assets following bankruptcy proceedings. Originally listed at $3.5M, now priced at only $2.85M for quick sale.

The property is currently 65% occupied with tenants on month-to-month leases. The owner has been managing the property remotely and has not raised rents in over 5 years, resulting in rates approximately 25% below market.

Located in a growing downtown district with excellent access to public transportation and amenities. The building requires some cosmetic updates but has been well-maintained structurally with a new roof installed in 2020.

This is an exceptional opportunity for an investor looking to acquire a distressed asset with significant value-add potential. The seller is highly motivated and will consider all reasonable offers. Proof of funds required for showings.`
  },
  
  // Test Case 2: High Transaction Complexity
  {
    name: "Mixed-Use Portfolio",
    property_type: "Mixed-Use",
    location: "Multiple Locations",
    price: "$8,500,000",
    description: `Rare opportunity to acquire a portfolio of 5 mixed-use properties across 3 different municipalities. This complex transaction includes:

1. Main Street Building: 3-story mixed-use with retail on ground floor and 6 apartments above
2. Riverside Complex: 2 adjacent retail buildings with development rights for additional stories
3. Parkview Property: Small office building with zoning issues currently being resolved
4. Industrial Flex Space: Former manufacturing facility with environmental remediation in progress
5. Suburban Strip Center: Fully leased retail center with complex lease structures including percentage rent provisions

The portfolio is being sold as part of a court-ordered settlement between partners. Some properties have title issues that will need to be resolved during escrow. The industrial property has Phase I environmental issues that are currently being addressed.

This transaction will require coordination with multiple municipal authorities regarding permits and zoning variances. Several tenants have right of first refusal options that must be addressed.

Ideal for experienced investors comfortable with complex transactions and with the capacity to handle multiple closing timelines. The court has set a deadline of 90 days to complete the transaction.`
  },
  
  // Test Case 3: Strong Property Characteristics
  {
    name: "Value-Add Apartment Complex",
    property_type: "Multifamily",
    location: "Growing Suburban Market",
    price: "$12,750,000",
    description: `Well-maintained 85-unit apartment complex in a rapidly appreciating submarket with excellent fundamentals.

Built in 1985, this property features a mix of one and two-bedroom units with an average size of 850 SF. Current rents are approximately 20% below market due to long-term ownership with minimal rent increases.

The property is 95% occupied with stable tenants, many of whom have been in place for 5+ years. All major systems are in good working order, though units feature dated finishes and appliances.

Value-add opportunity through:
- Interior unit renovations ($8,000/unit cost with projected $200/month rent premium)
- Addition of in-unit washer/dryers ($3,500/unit cost with projected $75/month premium)
- Upgrading common areas and adding amenities such as a fitness center and business center
- Implementing utility billbacks (currently all utilities included in rent)
- Professional management to replace current mom-and-pop operation

The property is located in a strong school district with excellent access to major employers, retail, and transportation corridors. The submarket has seen 15% population growth over the past 5 years with projected continued growth.

This offering represents an excellent opportunity to acquire a stable asset with significant upside through strategic improvements and professional management.`
  },
  
  // Test Case 4: Mixed Signals
  {
    name: "Neighborhood Shopping Center",
    property_type: "Retail",
    location: "Suburban Location",
    price: "$5,200,000",
    description: `Neighborhood shopping center anchored by a regional grocery chain with 8 years remaining on their lease. The property consists of 45,000 SF on 4.5 acres with ample parking.

The center is currently 82% occupied with a mix of national and local tenants. The anchor tenant occupies 25,000 SF, with the remaining space divided among 10 smaller units ranging from 1,000-3,000 SF.

The current owner is an out-of-state investor who has owned the property for 15 years and is now looking to divest as part of their retirement planning. While not distressed, they are motivated to complete a transaction within the next 6 months.

The property requires some deferred maintenance, including parking lot resurfacing and HVAC replacements for several units. Rents for the smaller units are approximately 10% below market, providing upside potential upon lease renewal.

The center is located in a stable middle-class neighborhood with limited competition within a 3-mile radius. Traffic counts on the main road exceed 18,000 vehicles per day.

Some complexity exists with the anchor lease, which includes restrictive covenants regarding competing tenants and approval rights for certain exterior modifications.

This investment offers a balanced opportunity with stable cash flow from the anchor tenant while providing value-add potential through addressing deferred maintenance, lease-up of vacant space, and rent increases for smaller tenants.`
  },
  
  // Test Case 5: Minimal Investment Signals
  {
    name: "Class A Office Building",
    property_type: "Office",
    location: "Prime Business District",
    price: "$28,500,000",
    description: `Prestigious Class A office building in the heart of the central business district. This 12-story, 120,000 SF building was constructed in 2015 with high-end finishes and state-of-the-art systems.

The property is currently 96% leased to a diverse tenant roster including law firms, financial services companies, and corporate headquarters. The weighted average lease term is 6.5 years with staggered expirations to minimize rollover risk.

Building features include:
- LEED Gold certification
- Floor-to-ceiling windows with panoramic city views
- High-end lobby with 24/7 security
- Conference center and tenant lounge
- Four-level parking garage with 3:1,000 parking ratio
- Efficient floor plates with minimal common area factor

Current ownership has professionally managed the property since completion, maintaining the building in excellent condition with no deferred maintenance. All rents are at or slightly above market rates with standard annual escalations of 2.5-3%.

The property is being offered as part of the owner's normal portfolio rebalancing strategy. This represents an opportunity to acquire a trophy asset with stable, predictable cash flow in a prime location.`
  }
];

// Function to analyze a property and log results
async function analyzeProperty(property, index) {
  console.log(`\n========== ANALYZING PROPERTY ${index + 1}: ${property.name} ==========\n`);
  
  try {
    // Make a request to the API endpoint
    const response = await fetch('http://localhost:3003/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: API_KEY,
        property: property
      }),
    });

    // Parse the response
    const data = await response.json();
    
    // Print the results
    console.log('Analysis Results:');
    console.log('Model Used:', data.model_used || 'N/A');
    console.log('Models Attempted:', data.models_attempted?.join(' → ') || 'N/A');
    
    // Check if the results have the expected structure
    if (data.scores) {
      // New format
      console.log('\nSeller Motivation Score:', data.scores.sellerMotivation?.score || 'N/A');
      console.log('Seller Motivation Explanation:', data.scores.sellerMotivation?.explanation || 'N/A');
      console.log('Seller Motivation Keywords:', data.scores.sellerMotivation?.keywords || []);
      
      console.log('\nTransaction Complexity Score:', data.scores.transactionComplexity?.score || 'N/A');
      console.log('Transaction Complexity Explanation:', data.scores.transactionComplexity?.explanation || 'N/A');
      console.log('Transaction Complexity Keywords:', data.scores.transactionComplexity?.keywords || []);
      
      console.log('\nProperty Characteristics Score:', data.scores.propertyCharacteristics?.score || 'N/A');
      console.log('Property Characteristics Explanation:', data.scores.propertyCharacteristics?.explanation || 'N/A');
      console.log('Property Characteristics Keywords:', data.scores.propertyCharacteristics?.keywords || []);
      
      console.log('\nTotal Score:', data.totalWeightedScore || 'N/A');
    } else {
      // Old format
      console.log('\nSeller Motivation Score:', data.seller_motivation_score || 'N/A');
      console.log('Seller Motivation Explanation:', data.seller_motivation_analysis?.explanation || 'N/A');
      console.log('Seller Motivation Keywords:', data.seller_motivation_analysis?.keywords || []);
      
      console.log('\nTransaction Complexity Score:', data.transaction_complexity_score || 'N/A');
      console.log('Transaction Complexity Explanation:', data.transaction_complexity_analysis?.explanation || 'N/A');
      console.log('Transaction Complexity Keywords:', data.transaction_complexity_analysis?.keywords || []);
      
      console.log('\nProperty Characteristics Score:', data.property_characteristics_score || 'N/A');
      console.log('Property Characteristics Explanation:', data.property_characteristics_analysis?.explanation || 'N/A');
      console.log('Property Characteristics Keywords:', data.property_characteristics_analysis?.keywords || []);
      
      console.log('\nTotal Score:', data.total_score || 'N/A');
    }
    
    console.log('\nSummary:', data.summary || 'N/A');
    
    // Check if there are any irrelevant keywords
    const allKeywords = [
      ...(data.scores?.sellerMotivation?.keywords || []),
      ...(data.scores?.transactionComplexity?.keywords || []),
      ...(data.scores?.propertyCharacteristics?.keywords || []),
      ...(data.seller_motivation_analysis?.keywords || []),
      ...(data.transaction_complexity_analysis?.keywords || []),
      ...(data.property_characteristics_analysis?.keywords || [])
    ];
    
    console.log('\nAll Keywords:', allKeywords);
    
    // Return the results for further analysis
    return {
      property: property.name,
      results: data
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      property: property.name,
      error: error.message
    };
  }
}

// Function to run all tests and analyze results
async function runTests() {
  console.log('Starting comprehensive tests of CRE Deal Finder scoring analysis...');
  
  // Start the Next.js server if it's not already running
  console.log('Ensure the Next.js server is running on port 3003 before continuing...');
  
  // Array to store all results for comparison
  const allResults = [];
  
  // Analyze each property
  for (let i = 0; i < testProperties.length; i++) {
    const result = await analyzeProperty(testProperties[i], i);
    allResults.push(result);
    
    // Add a small delay between requests to avoid rate limiting
    if (i < testProperties.length - 1) {
      console.log('\nWaiting 2 seconds before next analysis...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Compare and analyze results
  console.log('\n\n========== ANALYSIS SUMMARY ==========\n');
  
    // Extract scores for comparison
    const scores = allResults.map(result => {
      const data = result.results;
      
      // Handle different response formats
      if (data.scores) {
        // New format with nested scores
        return {
          property: result.property,
          seller_motivation: typeof data.scores.sellerMotivation === 'object' 
            ? data.scores.sellerMotivation.score || 0 
            : data.scores.sellerMotivation || 0,
          transaction_complexity: typeof data.scores.transactionComplexity === 'object'
            ? data.scores.transactionComplexity.score || 0
            : data.scores.transactionComplexity || 0,
          property_characteristics: typeof data.scores.propertyCharacteristics === 'object'
            ? data.scores.propertyCharacteristics.score || 0
            : data.scores.propertyCharacteristics || 0,
          total: data.totalWeightedScore || data.total_score || 0
        };
      } else if (data.seller_motivation_score !== undefined) {
        // Old format with direct score properties
        return {
          property: result.property,
          seller_motivation: data.seller_motivation_score || 0,
          transaction_complexity: data.transaction_complexity_score || 0,
          property_characteristics: data.property_characteristics_score || 0,
          total: data.total_score || 0
        };
      } else if (data.sellerMotivationScore !== undefined) {
        // Alternative format with camelCase properties
        return {
          property: result.property,
          seller_motivation: data.sellerMotivationScore || 0,
          transaction_complexity: data.transactionComplexityScore || 0,
          property_characteristics: data.propertyCharacteristicsScore || 0,
          total: data.totalScore || 0
        };
      } else {
        // Fallback for unknown format
        console.log('Warning: Unknown response format for property:', result.property);
        return {
          property: result.property,
          seller_motivation: 0,
          transaction_complexity: 0,
          property_characteristics: 0,
          total: 0
        };
      }
    });
  
  // Print score comparison table
  console.log('Score Comparison:');
  console.log('--------------------------------------------------------------------------------');
  console.log('Property                  | Seller | Transaction | Property | Total');
  console.log('                          | Motiv. | Complexity  | Charact. | Score');
  console.log('--------------------------------------------------------------------------------');
  
  scores.forEach(score => {
    const propertyName = score.property.padEnd(25).substring(0, 25);
    const sellerScore = score.seller_motivation.toFixed(1).padStart(6);
    const transactionScore = score.transaction_complexity.toFixed(1).padStart(11);
    const propertyScore = score.property_characteristics.toFixed(1).padStart(9);
    const totalScore = score.total.toFixed(1).padStart(5);
    
    console.log(`${propertyName} | ${sellerScore} | ${transactionScore} | ${propertyScore} | ${totalScore}`);
  });
  
  console.log('--------------------------------------------------------------------------------');
  
  // Analyze if scores match expectations
  console.log('\nScore Analysis:');
  
  // Expected high scores for each property
  const expectations = [
    { property: 'Distressed Office Building', category: 'seller_motivation', expected: 'high' },
    { property: 'Mixed-Use Portfolio', category: 'transaction_complexity', expected: 'high' },
    { property: 'Value-Add Apartment Complex', category: 'property_characteristics', expected: 'high' },
    { property: 'Class A Office Building', category: 'total', expected: 'low' }
  ];
  
  expectations.forEach(expectation => {
    const result = scores.find(s => s.property === expectation.property);
    if (!result) return;
    
    const score = result[expectation.category];
    const isHighScore = score >= 7.0;
    const isLowScore = score <= 4.0;
    
    if ((expectation.expected === 'high' && isHighScore) || 
        (expectation.expected === 'low' && isLowScore)) {
      console.log(`✅ ${expectation.property}: ${expectation.category.replace('_', ' ')} score is ${score.toFixed(1)} (Expected: ${expectation.expected})`);
    } else {
      console.log(`❌ ${expectation.property}: ${expectation.category.replace('_', ' ')} score is ${score.toFixed(1)} (Expected: ${expectation.expected})`);
    }
  });
  
  console.log('\nTest completed successfully!');
}

// Run all tests
runTests();
