// Edge case test script to analyze property listings with unusual characteristics
const fetch = require('node-fetch');

// OpenAI API key should be provided as an environment variable or through a secure method
// DO NOT hardcode API keys in source code
const API_KEY = process.env.OPENAI_API_KEY || 'REPLACE_WITH_YOUR_KEY'; // Replace with your API key when testing locally


// Test property listings with edge case characteristics
const testProperties = [
  // Test Case 1: Very Short Description
  {
    name: "Minimal Description Property",
    property_type: "Retail",
    location: "Urban Location",
    price: "$1,200,000",
    description: `Retail space for sale. 5,000 SF. Good location. Owner retiring.`
  },
  
  // Test Case 2: Very Long Description
  {
    name: "Extremely Detailed Property",
    property_type: "Industrial",
    location: "Industrial Park",
    price: "$4,750,000",
    description: `INDUSTRIAL MANUFACTURING FACILITY WITH EXCELLENT ACCESSIBILITY

This 45,000 square foot industrial manufacturing facility is strategically located in the heart of the region's premier industrial corridor with immediate access to major transportation routes including Interstate 75, Highway 41, and the regional airport. The property sits on a 3.8-acre parcel with expansion potential for an additional 15,000 square feet.

BUILDING SPECIFICATIONS:
- Year Built: 1998, Renovated: 2012
- Construction: Tilt-up concrete panels with steel frame
- Clear Height: 24' throughout main warehouse
- Column Spacing: 40' x 40' providing excellent flexibility
- Loading: 4 dock-high doors (8' x 10') with levelers and seals, 2 drive-in doors (12' x 14')
- Floor: 6" reinforced concrete slab capable of supporting heavy machinery
- Power: 2,000 Amp, 480/277V, 3-phase service
- HVAC: Warehouse is heated and ventilated, office areas fully air-conditioned
- Sprinkler System: ESFR system throughout
- Lighting: LED high-bay fixtures in warehouse, upgraded in 2018
- Office Space: 5,000 SF of well-appointed office space on two levels
- Parking: 65 marked spaces with room for expansion
- Security: Fully fenced and gated perimeter with card access and CCTV system
- Telecommunications: Fiber optic connectivity with redundant providers

PROPERTY HIGHLIGHTS:
The facility was previously occupied by a precision metal fabrication company and includes several valuable infrastructure improvements including:
- Compressed air system throughout
- 10-ton bridge crane in the main production area
- Reinforced concrete pads for heavy equipment
- Chemical storage area with containment systems
- 3,000 SF climate-controlled quality control room
- Employee amenities including break room, locker rooms, and training space

MARKET POSITION:
The property is being offered at $105/SF, which represents a competitive price point for the submarket where comparable facilities have traded between $110-125/SF over the past 24 months. The current owner has maintained the property to a high standard with regular preventative maintenance and system upgrades.

TRANSACTION DETAILS:
The seller is a family-owned manufacturing business that has operated at this location for 22 years and is consolidating operations to their larger facility in a neighboring state. They are seeking a sale-leaseback arrangement for a portion of the facility (approximately 15,000 SF) for a period of 12-18 months while they complete their transition, but this is not a requirement for the transaction.

The property is free and clear of any debt encumbrances and the seller is willing to consider providing short-term seller financing for a qualified buyer with a substantial down payment. All building systems have been recently inspected and maintenance records are available for review during due diligence.

ZONING AND ENTITLEMENTS:
The property is zoned I-2 Heavy Industrial, which permits a wide range of manufacturing, processing, assembly, warehousing, and distribution uses. The site includes unused land that could accommodate future expansion or outside storage. All necessary environmental permits are current and transferable to a new owner.

LABOR MARKET:
The facility is located within 20 minutes of three major population centers, providing access to a diverse workforce with experience in manufacturing, logistics, and technical trades. The area is served by a community college with specialized training programs in advanced manufacturing, automation, and industrial maintenance.

ECONOMIC INCENTIVES:
The property is located within a designated Economic Opportunity Zone, potentially offering significant tax advantages for capital investments. Additionally, the local economic development authority has various incentive programs for businesses that create new jobs or make substantial capital investments.

This offering represents an excellent opportunity for an owner-occupant or investor to acquire a well-maintained, functional industrial facility in a strong market with limited competing inventory. The property's flexible layout, robust infrastructure, and strategic location make it suitable for a wide range of industrial users.`
  },
  
  // Test Case 3: Conflicting Signals
  {
    name: "Conflicting Signals Property",
    property_type: "Office",
    location: "Suburban Office Park",
    price: "$7,800,000",
    description: `PRIME CLASS A OFFICE BUILDING - DISTRESSED OPPORTUNITY

This 45,000 SF Class A office building presents a unique investment opportunity. The property features high-end finishes, modern systems, and is located in a prestigious office park with excellent accessibility.

Despite its premium quality and location, the current owner is facing financial distress due to circumstances unrelated to the property and must sell quickly. However, the property itself is performing exceptionally well with 95% occupancy, strong tenant roster, and above-market rents.

The building was constructed in 2018 with state-of-the-art systems and has been impeccably maintained. The weighted average lease term is 6.2 years with minimal rollover in the next 36 months. All tenants are current on rent payments with strong credit profiles.

While the seller is motivated due to external financial pressures, they are not willing to accept a significant discount from market value. Recent comparable sales in the submarket suggest a value of $175-185/SF, and the seller's pricing at $173/SF reflects only a modest discount to attract a timely sale.

This opportunity combines the stability and quality of a Class A asset with the potential for a slightly accelerated closing timeline. The property requires no capital improvements or lease-up costs, making it an ideal acquisition for investors seeking stable cash flow with minimal management requirements.`
  },
  
  // Test Case 4: No Clear Investment Signals
  {
    name: "Neutral Property",
    property_type: "Retail",
    location: "Suburban Strip Center",
    price: "$3,200,000",
    description: `Retail strip center for sale in established suburban location. The property consists of 12,000 SF divided among 6 retail units.

Currently 100% occupied with a mix of local tenants including a nail salon, dry cleaner, insurance office, sandwich shop, tutoring center, and yoga studio. Average tenant tenure is 4.5 years.

The property was built in 2005 and has been well-maintained with regular updates. The parking lot was resurfaced in 2019 and the roof was replaced in 2018. All mechanical systems are in good working order.

Rents are at market rate with standard annual increases of 3%. Current NOI is $256,000, representing an 8% cap rate at the asking price.

The property is being offered as part of the owner's normal portfolio rebalancing. Standard due diligence period and closing timeline apply.`
  },
  
  // Test Case 5: Unusual Property Type
  {
    name: "Self-Storage Facility",
    property_type: "Self-Storage",
    location: "Suburban Location",
    price: "$5,500,000",
    description: `Self-storage facility consisting of 450 units totaling 55,000 rentable square feet on 3.5 acres. The facility was built in phases between 2000-2005 and features a mix of unit sizes from 5x5 to 10x30, including 25 climate-controlled units and 15 covered RV/boat spaces.

The property is currently 87% occupied with average rental rates slightly below market, providing upside potential through strategic rate increases. The facility has been family-owned and operated since construction with minimal marketing efforts.

Property features include perimeter fencing, gated access with keypad entry, security cameras, and on-site management office. The site includes an additional 0.75 acres of undeveloped land that could accommodate expansion of approximately 100 additional units.

The current owners are approaching retirement age and are looking to divest this asset after 20+ years of ownership. They have maintained the property well but have not implemented modern management software, online rental capabilities, or aggressive marketing strategies that could enhance performance.

This offering represents an opportunity to acquire a stable self-storage asset with value-add potential through operational improvements, strategic rate increases, and physical expansion.`
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
  console.log('Starting edge case tests of CRE Deal Finder scoring analysis...');
  
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
  console.log('\n\n========== EDGE CASE ANALYSIS SUMMARY ==========\n');
  
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
  
  // Analyze edge cases
  console.log('\nEdge Case Analysis:');
  
  // Expected behaviors for each edge case
  const expectations = [
    { property: 'Minimal Description Property', test: 'Handles very short descriptions appropriately' },
    { property: 'Extremely Detailed Property', test: 'Processes very long descriptions without issues' },
    { property: 'Conflicting Signals Property', test: 'Balances conflicting signals in scoring' },
    { property: 'Neutral Property', test: 'Assigns appropriate scores to properties with few signals' },
    { property: 'Self-Storage Facility', test: 'Handles unusual property types effectively' }
  ];
  
  expectations.forEach(expectation => {
    const result = scores.find(s => s.property === expectation.property);
    if (!result) return;
    
    console.log(`• ${expectation.property}: ${expectation.test}`);
    console.log(`  Scores - Seller: ${result.seller_motivation.toFixed(1)}, Transaction: ${result.transaction_complexity.toFixed(1)}, Property: ${result.property_characteristics.toFixed(1)}, Total: ${result.total.toFixed(1)}`);
  });
  
  console.log('\nEdge case tests completed successfully!');
}

// Run all tests
runTests();
