// Comprehensive test script to analyze property listings with all OpenAI models
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Load the API key from command line argument
const API_KEY = process.argv[2];

// Validate API key
if (!API_KEY) {
  console.error('Error: OpenAI API key is required. Please provide it as a command line argument.');
  console.error('Usage: node test-all-models.js YOUR_API_KEY');
  process.exit(1);
}

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
  
  // Test Case 2: Very Short Description
  {
    name: "Minimal Description Property",
    property_type: "Retail",
    location: "Urban Location",
    price: "$1,200,000",
    description: `Retail space for sale. 5,000 SF. Good location. Owner retiring.`
  },
  
  // Test Case 3: Unusual Property Type
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

// Models to test
const models = [
  { name: 'o1', displayName: 'Claude 3 Opus (o1)' },
  { name: 'o1-mini', displayName: 'Claude 3 Haiku (o1-mini)' },
  { name: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo' }
];

// Function to analyze a property with a specific model
async function analyzePropertyWithModel(property, model) {
  console.log(`\n========== ANALYZING PROPERTY: ${property.name} WITH MODEL: ${model.displayName} ==========\n`);
  
  try {
    // Make a request to the API endpoint with forced model
    const response = await fetch('http://localhost:3003/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: API_KEY,
        property: property,
        forceModel: model.name // Force specific model
      }),
    });

    // Parse the response
    const data = await response.json();
    
    // Print the results
    console.log('Analysis Results:');
    console.log('Model Used:', data.model_used || 'N/A');
    
    // Check if the results have the expected structure
    let scores = {};
    let explanations = {};
    let keywords = {};
    let totalScore = 0;
    
    if (data.scores) {
      // New format
      scores.sellerMotivation = typeof data.scores.sellerMotivation === 'object' 
        ? data.scores.sellerMotivation.score 
        : data.scores.sellerMotivation;
      
      scores.transactionComplexity = typeof data.scores.transactionComplexity === 'object'
        ? data.scores.transactionComplexity.score
        : data.scores.transactionComplexity;
      
      scores.propertyCharacteristics = typeof data.scores.propertyCharacteristics === 'object'
        ? data.scores.propertyCharacteristics.score
        : data.scores.propertyCharacteristics;
      
      explanations.sellerMotivation = typeof data.scores.sellerMotivation === 'object'
        ? data.scores.sellerMotivation.explanation
        : null;
      
      explanations.transactionComplexity = typeof data.scores.transactionComplexity === 'object'
        ? data.scores.transactionComplexity.explanation
        : null;
      
      explanations.propertyCharacteristics = typeof data.scores.propertyCharacteristics === 'object'
        ? data.scores.propertyCharacteristics.explanation
        : null;
      
      keywords.sellerMotivation = typeof data.scores.sellerMotivation === 'object'
        ? data.scores.sellerMotivation.keywords || []
        : [];
      
      keywords.transactionComplexity = typeof data.scores.transactionComplexity === 'object'
        ? data.scores.transactionComplexity.keywords || []
        : [];
      
      keywords.propertyCharacteristics = typeof data.scores.propertyCharacteristics === 'object'
        ? data.scores.propertyCharacteristics.keywords || []
        : [];
      
      totalScore = data.totalWeightedScore || 0;
    } else {
      // Old format
      scores.sellerMotivation = data.seller_motivation_score || 0;
      scores.transactionComplexity = data.transaction_complexity_score || 0;
      scores.propertyCharacteristics = data.property_characteristics_score || 0;
      
      explanations.sellerMotivation = data.seller_motivation_analysis?.explanation || null;
      explanations.transactionComplexity = data.transaction_complexity_analysis?.explanation || null;
      explanations.propertyCharacteristics = data.property_characteristics_analysis?.explanation || null;
      
      keywords.sellerMotivation = data.seller_motivation_analysis?.keywords || [];
      keywords.transactionComplexity = data.transaction_complexity_analysis?.keywords || [];
      keywords.propertyCharacteristics = data.property_characteristics_analysis?.keywords || [];
      
      totalScore = data.total_score || 0;
    }
    
    // Print scores
    console.log('\nScores:');
    console.log('Seller Motivation:', scores.sellerMotivation?.toFixed(1) || 'N/A');
    console.log('Transaction Complexity:', scores.transactionComplexity?.toFixed(1) || 'N/A');
    console.log('Property Characteristics:', scores.propertyCharacteristics?.toFixed(1) || 'N/A');
    console.log('Total Score:', totalScore?.toFixed(1) || 'N/A');
    
    // Print explanations
    console.log('\nExplanations:');
    if (explanations.sellerMotivation) {
      console.log('Seller Motivation:', explanations.sellerMotivation);
    }
    if (explanations.transactionComplexity) {
      console.log('Transaction Complexity:', explanations.transactionComplexity);
    }
    if (explanations.propertyCharacteristics) {
      console.log('Property Characteristics:', explanations.propertyCharacteristics);
    }
    
    // Print keywords
    console.log('\nKeywords:');
    console.log('Seller Motivation:', keywords.sellerMotivation);
    console.log('Transaction Complexity:', keywords.transactionComplexity);
    console.log('Property Characteristics:', keywords.propertyCharacteristics);
    
    // Check for issues
    const issues = [];
    
    // Check for zero scores
    if (scores.sellerMotivation === 0) issues.push('Seller Motivation score is 0');
    if (scores.transactionComplexity === 0) issues.push('Transaction Complexity score is 0');
    if (scores.propertyCharacteristics === 0) issues.push('Property Characteristics score is 0');
    if (totalScore === 0) issues.push('Total score is 0');
    
    // Check for missing explanations
    if (!explanations.sellerMotivation) issues.push('Seller Motivation explanation is missing');
    if (!explanations.transactionComplexity) issues.push('Transaction Complexity explanation is missing');
    if (!explanations.propertyCharacteristics) issues.push('Property Characteristics explanation is missing');
    
    // Check for missing keywords when they should be present
    if (property.name === "Distressed Office Building" && keywords.sellerMotivation.length === 0) {
      issues.push('Seller Motivation keywords missing for property with clear motivation signals');
    }
    
    // Print issues
    if (issues.length > 0) {
      console.log('\n⚠️ ISSUES DETECTED:');
      issues.forEach(issue => console.log(`- ${issue}`));
    } else {
      console.log('\n✅ No issues detected');
    }
    
    // Return the results and issues for further analysis
    return {
      property: property.name,
      model: model.name,
      modelDisplayName: model.displayName,
      scores,
      explanations,
      keywords,
      totalScore,
      issues,
      rawResponse: data
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      property: property.name,
      model: model.name,
      modelDisplayName: model.displayName,
      error: error.message,
      issues: [`Failed to analyze with error: ${error.message}`]
    };
  }
}

// Function to analyze AI quality
function analyzeAIQuality(results) {
  console.log('\n========== AI QUALITY ANALYSIS ==========\n');
  
  // Group results by model
  const resultsByModel = {};
  models.forEach(model => {
    resultsByModel[model.name] = results.filter(r => r.model === model.name);
  });
  
  // Analyze each model
  models.forEach(model => {
    const modelResults = resultsByModel[model.name];
    if (!modelResults || modelResults.length === 0) {
      console.log(`${model.displayName}: No results available`);
      return;
    }
    
    console.log(`\n${model.displayName}:`);
    
    // Count total issues
    const totalIssues = modelResults.reduce((sum, r) => sum + (r.issues ? r.issues.length : 0), 0);
    console.log(`- Total issues: ${totalIssues}`);
    
    // Check for zero scores
    const zeroScores = modelResults.filter(r => 
      r.scores?.sellerMotivation === 0 || 
      r.scores?.transactionComplexity === 0 || 
      r.scores?.propertyCharacteristics === 0 || 
      r.totalScore === 0
    );
    console.log(`- Properties with zero scores: ${zeroScores.length}`);
    
    // Check for missing explanations
    const missingExplanations = modelResults.filter(r => 
      !r.explanations?.sellerMotivation || 
      !r.explanations?.transactionComplexity || 
      !r.explanations?.propertyCharacteristics
    );
    console.log(`- Properties with missing explanations: ${missingExplanations.length}`);
    
    // Check for missing keywords
    const missingKeywords = modelResults.filter(r => 
      (r.keywords?.sellerMotivation?.length === 0 && r.property === "Distressed Office Building") ||
      (r.keywords?.transactionComplexity?.length === 0 && r.property === "Self-Storage Facility") ||
      (r.keywords?.propertyCharacteristics?.length === 0 && r.property === "Self-Storage Facility")
    );
    console.log(`- Properties with missing expected keywords: ${missingKeywords.length}`);
    
    // Overall assessment
    if (totalIssues === 0) {
      console.log(`✅ ${model.displayName} performed well with no issues detected`);
    } else {
      console.log(`⚠️ ${model.displayName} had ${totalIssues} issues that may need attention`);
    }
  });
}

// Function to run all tests
async function runTests() {
  console.log('Starting comprehensive model testing for CRE Deal Finder...');
  console.log(`Using API key: ${API_KEY.substring(0, 5)}...${API_KEY.substring(API_KEY.length - 4)}`);
  
  // Check if server is running
  try {
    await execPromise('curl -s -o /dev/null -w "%{http_code}" http://localhost:3003');
    console.log('Next.js server is running on port 3003');
  } catch (error) {
    console.error('Error: Next.js server is not running. Please start it with "npm run dev -- -p 3003"');
    process.exit(1);
  }
  
  // Array to store all results
  const allResults = [];
  
  // Test each property with each model
  for (const property of testProperties) {
    for (const model of models) {
      const result = await analyzePropertyWithModel(property, model);
      allResults.push(result);
      
      // Add a small delay between requests to avoid rate limiting
      console.log('\nWaiting 2 seconds before next analysis...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Analyze AI quality
  analyzeAIQuality(allResults);
  
  // Print summary table
  console.log('\n\n========== SUMMARY TABLE ==========\n');
  console.log('Property                  | Model              | Seller | Trans. | Prop.  | Total | Issues');
  console.log('--------------------------|--------------------| ------ | ------ | ------ | ----- | ------');
  
  allResults.forEach(result => {
    const propertyName = result.property.padEnd(25).substring(0, 25);
    const modelName = result.modelDisplayName.padEnd(19).substring(0, 19);
    const sellerScore = result.scores?.sellerMotivation ? result.scores.sellerMotivation.toFixed(1).padStart(6) : '  N/A ';
    const transactionScore = result.scores?.transactionComplexity ? result.scores.transactionComplexity.toFixed(1).padStart(6) : '  N/A ';
    const propertyScore = result.scores?.propertyCharacteristics ? result.scores.propertyCharacteristics.toFixed(1).padStart(6) : '  N/A ';
    const totalScore = result.totalScore ? result.totalScore.toFixed(1).padStart(5) : ' N/A ';
    const issueCount = result.issues ? result.issues.length : 0;
    
    console.log(`${propertyName} | ${modelName} | ${sellerScore} | ${transactionScore} | ${propertyScore} | ${totalScore} | ${issueCount}`);
  });
  
  console.log('\nTest completed successfully!');
  console.log('Remember to remove the API key from your environment after testing.');
}

// Run all tests
runTests();
