import OpenAI from 'openai';

// Function to analyze property with o1 model using appropriate parameters
async function analyzeWithO1(apiKey, property) {
  console.log('Starting analysis with o1 model');
  
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // For o1, we need to use 'max_completion_tokens' instead of 'max_tokens'
    // and cannot use 'temperature' parameter
    const response = await openai.chat.completions.create({
      model: "o1",
      messages: [
        {
          role: "user",
          content: `You are a commercial real estate investment analyst. Analyze this property listing and provide scores from 1-10 for seller motivation, transaction complexity, and property characteristics, plus a total weighted score and analysis.

Property: ${property.name}
Type: ${property.property_type}
Location: ${property.location}
Price: ${property.price}

Description: ${property.description}

Provide your response as a JSON object with scores, explanations, and identified keywords. Return valid JSON format.`
        }
      ],
      max_completion_tokens: 1500,  // Correct parameter for o1
      response_format: { type: "json_object" }
    });
    
    console.log('Received response from o1');
    const content = response.choices[0].message.content;
    return {
      ...JSON.parse(content),
      model_used: "o1",
      models_attempted: ["o1"]
    };
  } catch (error) {
    console.error('Error with o1 model:', error);
    throw error;
  }
}

// Function to analyze property with o1-mini model using appropriate parameters
async function analyzeWithO1Mini(apiKey, property) {
  console.log('Starting analysis with o1-mini model');
  
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // For o1-mini, we can't use 'system' role and can't set temperature
    const response = await openai.chat.completions.create({
      model: "o1-mini",
      messages: [
        {
          // Using user role instead of system role
          role: "user",
          content: `You are a commercial real estate investment analyst. Analyze this property listing and provide scores from 1-10 for seller motivation, transaction complexity, and property characteristics, plus a total weighted score and analysis.

Property: ${property.name}
Type: ${property.property_type}
Location: ${property.location}
Price: ${property.price}

Description: ${property.description}

Provide your response as a JSON object with scores, explanations, and identified keywords. Return valid JSON format.`
        }
      ],
      max_completion_tokens: 1500,  // Correct parameter for o1-mini
      response_format: { type: "json_object" }
    });
    
    console.log('Received response from o1-mini');
    const content = response.choices[0].message.content;
    return {
      ...JSON.parse(content),
      model_used: "o1-mini",
      models_attempted: ["o1", "o1-mini"]
    };
  } catch (error) {
    console.error('Error with o1-mini model:', error);
    throw error;
  }
}

// Function to analyze property with GPT models (fallback)
async function analyzeWithGPT(apiKey, property) {
  console.log('Starting analysis with GPT-3.5-Turbo model');
  
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // Standard format for GPT models
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a commercial real estate investment analyst. Analyze the property listing and provide scores, explanations, and keywords for seller motivation, transaction complexity, and property characteristics. Your response must be in JSON format.`
        },
        {
          role: "user",
          content: `Property: ${property.name}
Type: ${property.property_type}
Location: ${property.location}
Price: ${property.price}

Description: ${property.description}

Analyze this listing and provide scores from 1-10 for each category. Return the results as JSON with scores, explanations, and keywords.`
        }
      ],
      temperature: 0.1,
      max_tokens: 1500,  // Correct parameter for GPT models
      response_format: { type: "json_object" }
    });
    
    console.log('Received response from GPT-3.5-Turbo');
    const content = response.choices[0].message.content;
    return {
      ...JSON.parse(content),
      model_used: "gpt-3.5-turbo",
      models_attempted: ["o1", "o1-mini", "gpt-3.5-turbo"]
    };
  } catch (error) {
    console.error('Error with GPT-3.5-Turbo model:', error);
    throw error;
  }
}

// Main API handler
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey, property } = req.body;

  // Validate request data
  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API key is required' });
  }

  if (!property || !property.description) {
    return res.status(400).json({ error: 'Property description is required' });
  }
  
  const modelsAttempted = [];
  
  try {
    // Try o1 first (most premium model)
    try {
      modelsAttempted.push("o1");
      const o1Result = await analyzeWithO1(apiKey, property);
      return res.status(200).json(o1Result);
    } catch (o1Error) {
      console.log("o1 model failed, falling back to o1-mini");
      console.error("O1 Error details:", o1Error);
      
      // If o1 fails, try o1-mini
      try {
        modelsAttempted.push("o1-mini");
        const o1MiniResult = await analyzeWithO1Mini(apiKey, property);
        return res.status(200).json(o1MiniResult);
      } catch (o1MiniError) {
        console.log("o1-mini model failed, falling back to GPT-3.5-Turbo");
        console.error("O1-mini Error details:", o1MiniError);
        
        // If o1-mini fails, use GPT-3.5-Turbo as reliable fallback
        try {
          modelsAttempted.push("gpt-3.5-turbo");
          const gptResult = await analyzeWithGPT(apiKey, property);
          return res.status(200).json(gptResult);
        } catch (gptError) {
          console.error("GPT-3.5-Turbo Error details:", gptError);
          throw new Error(`All models failed: O1 Error: ${o1Error.message}, O1-mini Error: ${o1MiniError.message}, GPT Error: ${gptError.message}`);
        }
      }
    }
  } catch (error) {
    console.error('All models failed:', error);
    
    // Return error details instead of fallback analysis
    return res.status(500).json({
      error: true,
      message: "API Error - Debug Information",
      error_details: error.toString(),
      error_message: error.message,
      models_attempted: modelsAttempted,
      stack_trace: error.stack
    });
  }
}