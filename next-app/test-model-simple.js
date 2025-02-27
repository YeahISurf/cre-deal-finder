// Simple test script to check if models are accessible
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
  console.error('Usage: node test-model-simple.js YOUR_API_KEY');
  process.exit(1);
}

// Models to test
const models = [
  { name: 'o1', displayName: 'Claude 3 Opus (o1)' },
  { name: 'o1-mini', displayName: 'Claude 3 Haiku (o1-mini)' },
  { name: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo' }
];

// Function to test a model
async function testModel(model) {
  console.log(`\n========== TESTING MODEL: ${model.displayName} ==========\n`);
  
  try {
    // Make a direct request to the OpenAI API
    const openaiUrl = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    };
    
    // Simple prompt for all models
    let requestBody = {
      model: model.name,
      messages: [
        {
          role: "user",
          content: "Please respond with 'Hello, I am working correctly.'"
        }
      ]
    };
    
    // Add the appropriate token limit parameter based on the model
    if (model.name.startsWith('o1')) {
      // Claude models use max_completion_tokens
      requestBody.max_completion_tokens = 20;
    } else {
      // GPT models use max_tokens
      requestBody.max_tokens = 20;
    }
    
    const body = JSON.stringify(requestBody);
    
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
        success: false,
        error: data.error.message || 'Unknown error'
      };
    }
    
    // Extract the content
    const content = data.choices[0].message.content;
    console.log('Response content:', content);
    
    return {
      model: model.name,
      success: true,
      content: content
    };
  } catch (error) {
    console.error(`Error with ${model.displayName} model:`, error);
    return {
      model: model.name,
      success: false,
      error: error.message
    };
  }
}

// Main function
async function main() {
  console.log('Starting simple model testing for CRE Deal Finder...');
  console.log(`Using API key: ${API_KEY.substring(0, 5)}...${API_KEY.substring(API_KEY.length - 5)}`);
  
  // Test each model
  for (const model of models) {
    const result = await testModel(model);
    
    // Print result
    if (result.success) {
      console.log(`✅ ${model.displayName} is working correctly.`);
    } else {
      console.log(`❌ ${model.displayName} encountered an error: ${result.error}`);
    }
    
    // Add a small delay between requests to avoid rate limiting
    console.log('\nWaiting 2 seconds before next test...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\nSimple model testing completed!');
}

// Run the main function
main().catch(console.error);
