// Test script to run tests on all OpenAI models with improved JSON parsing
// Final version with proper parameter handling and JSON parsing for all models
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
  console.error('Usage: node test-models-final.js YOUR_API_KEY');
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

// Models to test
const models = [
  { name: 'o1', displayName: 'Claude 3 Opus (o1)' },
  { name: 'o1-mini', displayName: 'Claude 3 Haiku (o1-mini)' },
  { name: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo' }
];

// Function to analyze a property with a specific model
async function analyzePropertyWithModel(property, model) {
  console.log(`\n========== ANALYZING PROPERTY WITH MODEL: ${model.displayName} ==========\n`);
  
  try {
    // Make a direct request to the OpenAI API
    let openaiUrl, headers, body;
    
    if (model.name.startsWith('o1')) {
      // Claude models (via OpenAI API)
      openaiUrl = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      };
      
      // Simplified prompt for Claude models to ensure proper JSON formatting
      const params = {
        model: model.name,
        messages: [
          {
            role: "user",
            content: `You are a commercial real estate investment analyst. Analyze this property listing and provide scores from 1-10 for seller motivation, transaction complexity, and property characteristics.

Property: ${property.name || 'N/A'}
Type: ${property.property_type || 'N/A'}
Location: ${property.location || 'N/A'}
Price: ${property.price || 'N/A'}

Description: ${property.description || ''}

Provide your analysis in the following JSON format EXACTLY, with no additional text or explanation outside the JSON:

{
  "seller_motivation_score": 8,
  "seller_motivation_explanation": "Brief explanation here",
  "seller_motivation_keywords": ["keyword1", "keyword2"],
  
  "transaction_complexity_score": 7,
  "transaction_complexity_explanation": "Brief explanation here",
  "transaction_complexity_keywords": ["keyword1", "keyword2"],
  
  "property_characteristics_score": 6,
  "property_characteristics_explanation": "Brief explanation here",
  "property_characteristics_keywords": ["keyword1", "keyword2"],
  
  "total_score": 7.0
}

IMPORTANT: Ensure your response is properly formatted JSON without any unterminated strings or syntax errors. Do not include any text outside the JSON object.`
          }
        ],
        max_completion_tokens: 1500
      };
      
      // Add response_format for o1 (not supported by o1-mini)
      if (model.name === 'o1') {
        params.response_format = { type: "json_object" };
      }
      
      body = JSON.stringify(params);
    } else {
      // GPT models
      openaiUrl = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      };
      
      body = JSON.stringify({
        model: model.name,
        messages: [
          {
            role: "system",
            content: `You are a commercial real estate investment analyst. Analyze property listings and provide scores, explanations, and keywords for seller motivation, transaction complexity, and property characteristics.`
          },
          {
            role: "user",
            content: `Property: ${property.name || 'N/A'}
Type: ${property.property_type || 'N/A'}
Location: ${property.location || 'N/A'}
Price: ${property.price || 'N/A'}

Description: ${property.description || ''}

Analyze this listing and provide scores from 1-10 for each category. Return the results as JSON with scores, explanations, and keywords. 

IMPORTANT: Only include keywords that are actually relevant to the listing content. If you don't find relevant keywords for a category, return an empty array. Do not include generic keywords that aren't supported by the text.

Ensure your response is properly formatted JSON without any unterminated strings or syntax errors.`
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });
    }
    
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
      console.error(`Error from ${model.displayName}:`, data.error);
      return {
        model: model.name,
        modelDisplayName: model.displayName,
        error: data.error.message || 'Unknown error',
        issues: [`API Error: ${data.error.message || 'Unknown error'}`]
      };
    }
    
    // Extract the content
    const content = data.choices[0].message.content;
    console.log('Raw response:', content);
    
    try {
      // Clean up the content if it contains markdown code blocks
      let cleanContent = content;
      
      // Remove markdown code block syntax if present
      if (content.includes('```json')) {
        cleanContent = content.replace(/```json\n|\n```/g, '');
      } else if (content.includes('```')) {
        cleanContent = content.replace(/```\n|\n```/g, '');
      }
      
      // If content is empty, create a default empty object
      if (!cleanContent || cleanContent.trim() === '') {
        cleanContent = '{}';
      }
      
      console.log('Cleaned JSON:', cleanContent);
      
      // Try to parse the JSON
      let parsedContent;
      try {
        parsedContent = JSON.parse(cleanContent);
      } catch (error) {
        console.error(`JSON parsing error: ${error.message}`);
        
        // For Claude models, try to fix common JSON formatting issues
        if (model.name.startsWith('o1')) {
          // Replace single quotes with double quotes
          cleanContent = cleanContent.replace(/'/g, '"');
          
          // Add quotes around unquoted property names
          cleanContent = cleanContent.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
          
          // Fix missing commas between array elements
          cleanContent = cleanContent.replace(/"\s+"/g, '", "');
          
          // Add missing commas between properties
          cleanContent = cleanContent.replace(/"\s*\n\s*"/g, '",\n"');
          
          // Try parsing again
          try {
            console.log('Attempting to fix JSON:', cleanContent);
            parsedContent = JSON.parse(cleanContent);
          } catch (fixError) {
            console.error(`Failed to fix JSON: ${fixError.message}`);
            parsedContent = {};
          }
        } else {
          parsedContent = {};
        }
      }
      
      // Extract scores, explanations, and keywords
      let scores = {};
      let explanations = {};
      let keywords = {};
      let totalScore = 0;
      
    // Extract data from the parsed content
    if (model.name === 'gpt-3.5-turbo' && parsedContent.seller_motivation && typeof parsedContent.seller_motivation === 'object') {
        // Handle GPT-3.5 Turbo format
        if (parsedContent.seller_motivation && typeof parsedContent.seller_motivation === 'object') {
          scores.sellerMotivation = parsedContent.seller_motivation.score || 0;
          explanations.sellerMotivation = parsedContent.seller_motivation.explanation || null;
          keywords.sellerMotivation = parsedContent.seller_motivation.keywords || [];
        }
        
        if (parsedContent.transaction_complexity && typeof parsedContent.transaction_complexity === 'object') {
          scores.transactionComplexity = parsedContent.transaction_complexity.score || 0;
          explanations.transactionComplexity = parsedContent.transaction_complexity.explanation || null;
          keywords.transactionComplexity = parsedContent.transaction_complexity.keywords || [];
        }
        
        if (parsedContent.property_characteristics && typeof parsedContent.property_characteristics === 'object') {
          scores.propertyCharacteristics = parsedContent.property_characteristics.score || 0;
          explanations.propertyCharacteristics = parsedContent.property_characteristics.explanation || null;
          keywords.propertyCharacteristics = parsedContent.property_characteristics.keywords || [];
        }
        
        totalScore = parsedContent.total_score || 0;
      } else {
        // Handle Claude models format
        scores.sellerMotivation = parsedContent.seller_motivation_score || 0;
        scores.transactionComplexity = parsedContent.transaction_complexity_score || 0;
        scores.propertyCharacteristics = parsedContent.property_characteristics_score || 0;
        
        explanations.sellerMotivation = parsedContent.seller_motivation_explanation || null;
        explanations.transactionComplexity = parsedContent.transaction_complexity_explanation || null;
        explanations.propertyCharacteristics = parsedContent.property_characteristics_explanation || null;
        
        keywords.sellerMotivation = parsedContent.seller_motivation_keywords || [];
        keywords.transactionComplexity = parsedContent.transaction_complexity_keywords || [];
        keywords.propertyCharacteristics = parsedContent.property_characteristics_keywords || [];
        
        totalScore = parsedContent.total_score || 0;
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
      
      return {
        model: model.name,
        modelDisplayName: model.displayName,
        scores,
        explanations,
        keywords,
        totalScore,
        issues,
        rawResponse: parsedContent
      };
    } catch (parseError) {
      console.error(`JSON parsing error with ${model.displayName} response:`, parseError.message);
      console.error('Raw content causing parse error:', content);
      return {
        model: model.name,
        modelDisplayName: model.displayName,
        error: `Failed to parse response: ${parseError.message}`,
        issues: [`JSON parsing error: ${parseError.message}`],
        rawContent: content
      };
    }
  } catch (error) {
    console.error(`Error with ${model.displayName} model:`, error);
    return {
      model: model.name,
      modelDisplayName: model.displayName,
      error: error.message,
      issues: [`API request error: ${error.message}`]
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
      (r.keywords?.sellerMotivation?.length === 0 && r.property === "Distressed Office Building")
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

// Main function
async function main() {
  console.log('Starting comprehensive model testing for CRE Deal Finder...');
  console.log(`Using API key: ${API_KEY.substring(0, 5)}...${API_KEY.substring(API_KEY.length - 5)}`);
  
  // Array to store all results
  const allResults = [];
  
  // Test each model
  for (const model of models) {
    const result = await analyzePropertyWithModel(testProperty, model);
    allResults.push(result);
    
    // Add a small delay between requests to avoid rate limiting
    console.log('\nWaiting 2 seconds before next analysis...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Analyze AI quality
  analyzeAIQuality(allResults);
  
  // Print summary table
  console.log('\n\n========== SUMMARY TABLE ==========\n');
  console.log('Model              | Seller | Trans. | Prop.  | Total | Issues');
  console.log('--------------------| ------ | ------ | ------ | ----- | ------');
  
  allResults.forEach(result => {
    const modelName = result.modelDisplayName.padEnd(19).substring(0, 19);
    const sellerScore = result.scores?.sellerMotivation ? result.scores.sellerMotivation.toFixed(1).padStart(6) : '  N/A ';
    const transactionScore = result.scores?.transactionComplexity ? result.scores.transactionComplexity.toFixed(1).padStart(6) : '  N/A ';
    const propertyScore = result.scores?.propertyCharacteristics ? result.scores.propertyCharacteristics.toFixed(1).padStart(6) : '  N/A ';
    const totalScore = result.totalScore ? result.totalScore.toFixed(1).padStart(5) : ' N/A ';
    const issueCount = result.issues ? result.issues.length : 0;
    
    console.log(`${modelName} | ${sellerScore} | ${transactionScore} | ${propertyScore} | ${totalScore} | ${issueCount}`);
  });
  
  console.log('\nTest completed successfully!');
}

// Run the main function
main().catch(console.error);
