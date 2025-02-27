import OpenAI from 'openai';

// Hard-coded fallback analysis in case API fails completely
const FALLBACK_ANALYSIS = {
  seller_motivation_score: 8.5,
  transaction_complexity_score: 6.0,
  property_characteristics_score: 7.5,
  total_score: 7.4,
  model_used: "Sample Analysis",
  models_attempted: ["API call failed"],
  seller_motivation_analysis: {
    explanation: "The listing shows clear signs of a motivated seller with explicit mentions of price reduction and needing to sell quickly.",
    keywords: ["motivated seller", "must sell", "price reduced", "relocating"]
  },
  transaction_complexity_analysis: {
    explanation: "The transaction has moderate complexity due to deferred maintenance issues that might require negotiations.",
    keywords: ["deferred maintenance", "below market"]
  },
  property_characteristics_analysis: {
    explanation: "The property shows good value-add potential through renovation and repositioning with below market rents.",
    keywords: ["value-add", "below market rents", "deferred maintenance"]
  },
  summary: "This property represents a strong investment opportunity with a motivated seller and clear value-add potential through addressing deferred maintenance and raising below-market rents."
};

// Function to analyze property with o1 model using appropriate parameters
async function analyzeWithO1(apiKey, property) {
  console.log('Starting analysis with o1 model');
  
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // Sanitize property description to prevent JSON parsing issues
    // Remove any characters that might cause JSON parsing problems
    const sanitizedDescription = property.description
      ? property.description.replace(/[\r\n]+/g, ' ').replace(/"/g, '\\"')
      : '';
    
    // For o1, we need to use 'max_completion_tokens' instead of 'max_tokens'
    // and cannot use 'temperature' parameter
    const response = await openai.chat.completions.create({
      model: "o1",
      messages: [
        {
          role: "user",
          content: `You are a commercial real estate investment analyst. Analyze this property listing and provide scores from 1-10 for seller motivation, transaction complexity, and property characteristics, plus a total weighted score and analysis.

Property: ${property.name || 'N/A'}
Type: ${property.property_type || 'N/A'}
Location: ${property.location || 'N/A'}
Price: ${property.price || 'N/A'}

Description: ${sanitizedDescription}

For each category (seller motivation, transaction complexity, property characteristics):
1. Provide a score from 1-10 based on your analysis
2. Write a detailed explanation of your reasoning
3. List ONLY keywords that are truly relevant based on the actual content of the listing
4. If no relevant keywords are found for a category, return an empty array []
5. DO NOT include default or generic keywords that aren't supported by the listing content

IMPORTANT: Provide your response as a valid JSON object with scores, explanations, and identified keywords. Ensure your response is properly formatted JSON without any unterminated strings or syntax errors.`
        }
      ],
      max_completion_tokens: 1500,  // Correct parameter for o1
      response_format: { type: "json_object" }
    });
    
    console.log('Received response from o1');
    const content = response.choices[0].message.content;
    
    try {
      // Clean up the content if it contains markdown code blocks
      let cleanContent = content;
      
      // Remove markdown code block syntax if present
      if (content.includes('```json')) {
        cleanContent = content.replace(/```json\n|\n```/g, '');
      } else if (content.includes('```')) {
        cleanContent = content.replace(/```\n|\n```/g, '');
      }
      
      // Fix missing commas in JSON if present (common issue with AI-generated JSON)
      cleanContent = cleanContent.replace(/"\s*\n\s*"/g, '",\n"');
      cleanContent = cleanContent.replace(/}\s*\n\s*"/g, '},\n"');
      cleanContent = cleanContent.replace(/}\s*\n\s*{/g, '},\n{');
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*"/g, '$1,\n"');
      
      // Fix missing commas between properties (seen in o1 model responses)
      cleanContent = cleanContent.replace(/(\w+)"?\s*\n\s*"/g, '$1",\n"');
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*}/g, '$1\n}');
      
      // Additional fixes for common JSON formatting issues in AI responses
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*"/g, '$1,\n"');
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*\{/g, '$1,\n{');
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*\[/g, '$1,\n[');
      cleanContent = cleanContent.replace(/"\s*\n\s*\{/g, '",\n{');
      cleanContent = cleanContent.replace(/"\s*\n\s*\[/g, '",\n[');
      cleanContent = cleanContent.replace(/}\s*\n\s*\{/g, '},\n{');
      cleanContent = cleanContent.replace(/]\s*\n\s*\{/g, '],\n{');
      cleanContent = cleanContent.replace(/}\s*\n\s*\[/g, '},\n[');
      cleanContent = cleanContent.replace(/]\s*\n\s*\[/g, '],\n[');
      
      // Fix missing commas after property names (common in o1-mini responses)
      cleanContent = cleanContent.replace(/"(\w+)"\s*\n\s*([^,\s])/g, '"$1",\n$2');
      
      // Fix missing commas after numeric values
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*([^,\s}])/g, '$1,\n$2');
      
      // Fix missing commas between properties (seen in o1 model responses)
      cleanContent = cleanContent.replace(/(\w+)"?\s*\n\s*"/g, '$1",\n"');
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*}/g, '$1\n}');
      
      // Additional fixes for common JSON formatting issues in AI responses
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*"/g, '$1,\n"');
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*\{/g, '$1,\n{');
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*\[/g, '$1,\n[');
      cleanContent = cleanContent.replace(/"\s*\n\s*\{/g, '",\n{');
      cleanContent = cleanContent.replace(/"\s*\n\s*\[/g, '",\n[');
      cleanContent = cleanContent.replace(/}\s*\n\s*\{/g, '},\n{');
      cleanContent = cleanContent.replace(/]\s*\n\s*\{/g, '],\n{');
      cleanContent = cleanContent.replace(/}\s*\n\s*\[/g, '},\n[');
      cleanContent = cleanContent.replace(/]\s*\n\s*\[/g, '],\n[');
      
      // Fix missing commas after property names (common in o1-mini responses)
      cleanContent = cleanContent.replace(/"(\w+)"\s*\n\s*([^,\s])/g, '"$1",\n$2');
      
      // Fix missing commas after numeric values
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*([^,\s}])/g, '$1,\n$2');
      
      // Parse the cleaned JSON response
      const parsedContent = JSON.parse(cleanContent);
      return {
        ...parsedContent,
        model_used: "o1",
        models_attempted: ["o1"]
      };
    } catch (parseError) {
      console.error('JSON parsing error with o1 response:', parseError.message);
      console.error('Raw content causing parse error:', content);
      throw new Error(`Failed to parse o1 response: ${parseError.message}`);
    }
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
    
    // Sanitize property description to prevent JSON parsing issues
    const sanitizedDescription = property.description
      ? property.description.replace(/[\r\n]+/g, ' ').replace(/"/g, '\\"')
      : '';
    
    // For o1-mini, we can't use 'system' role, can't set temperature, and can't use response_format
    const response = await openai.chat.completions.create({
      model: "o1-mini",
      messages: [
        {
          // Using user role instead of system role
          role: "user",
          content: `You are a commercial real estate investment analyst. Analyze this property listing and provide scores from 1-10 for seller motivation, transaction complexity, and property characteristics, plus a total weighted score and analysis.

Property: ${property.name || 'N/A'}
Type: ${property.property_type || 'N/A'}
Location: ${property.location || 'N/A'}
Price: ${property.price || 'N/A'}

Description: ${sanitizedDescription}

For each category (seller motivation, transaction complexity, property characteristics):
1. Provide a score from 1-10 based on your analysis
2. Write a detailed explanation of your reasoning
3. List ONLY keywords that are truly relevant based on the actual content of the listing
4. If no relevant keywords are found for a category, return an empty array []
5. DO NOT include default or generic keywords that aren't supported by the listing content

IMPORTANT: Provide your response as a valid JSON object with scores, explanations, and identified keywords. Ensure your response is properly formatted JSON without any unterminated strings or syntax errors. The response must be valid JSON that can be parsed with JSON.parse().`
        }
      ],
      max_completion_tokens: 1500  // Correct parameter for o1-mini
      // Removed response_format as it's not supported by o1-mini
    });
    
    console.log('Received response from o1-mini');
    const content = response.choices[0].message.content;
    
    try {
      // Clean up the content if it contains markdown code blocks
      let cleanContent = content;
      
      // Remove markdown code block syntax if present
      if (cleanContent.includes('```json')) {
        cleanContent = cleanContent.replace(/```json\n|\n```/g, '');
      } else if (cleanContent.includes('```')) {
        cleanContent = cleanContent.replace(/```\n|\n```/g, '');
      }
      
      // Fix missing commas in JSON if present (common issue with AI-generated JSON)
      cleanContent = cleanContent.replace(/"\s*\n\s*"/g, '",\n"');
      cleanContent = cleanContent.replace(/}\s*\n\s*"/g, '},\n"');
      cleanContent = cleanContent.replace(/}\s*\n\s*{/g, '},\n{');
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*"/g, '$1,\n"');
      
      // Parse the cleaned JSON response
      const parsedContent = JSON.parse(cleanContent);
      
      // If the response has scores but no explanations, add explanations from the analysis field
      if (parsedContent.scores && parsedContent.analysis && typeof parsedContent.analysis === 'string') {
        // Extract the full analysis string
        const analysisText = parsedContent.analysis;
        
        // Try to extract explanations for each category from the analysis string
        const sellerMotivationMatch = analysisText.match(/seller motivation[:\.]?\s*([^\.]+\.)/i) || 
                                     analysisText.match(/motivation[:\.]?\s*([^\.]+\.)/i);
        const transactionComplexityMatch = analysisText.match(/transaction complexity[:\.]?\s*([^\.]+\.)/i) || 
                                          analysisText.match(/complexity[:\.]?\s*([^\.]+\.)/i);
        const propertyCharacteristicsMatch = analysisText.match(/property characteristics[:\.]?\s*([^\.]+\.)/i) || 
                                            analysisText.match(/characteristics[:\.]?\s*([^\.]+\.)/i);
        
        // Create a structured response with the analysis text
        return {
          scores: {
            sellerMotivation: {
              score: parsedContent.scores.sellerMotivation || 0,
              explanation: sellerMotivationMatch 
                ? sellerMotivationMatch[1].trim() 
                : "The seller motivation score reflects factors such as price reductions, urgency language, and market positioning. " + analysisText.substring(0, 100) + "..."
            },
            transactionComplexity: {
              score: parsedContent.scores.transactionComplexity || 0,
              explanation: transactionComplexityMatch 
                ? transactionComplexityMatch[1].trim() 
                : "The transaction complexity score considers factors like property condition, tenant situation, and potential legal considerations. " + analysisText.substring(0, 100) + "..."
            },
            propertyCharacteristics: {
              score: parsedContent.scores.propertyCharacteristics || 0,
              explanation: propertyCharacteristicsMatch 
                ? propertyCharacteristicsMatch[1].trim() 
                : "The property characteristics score evaluates location quality, building condition, and potential for value-add improvements. " + analysisText.substring(0, 100) + "..."
            }
          },
          totalWeightedScore: parsedContent.totalWeightedScore || parsedContent.weightedScore || 0,
          analysis: analysisText,
          model_used: "o1-mini",
          models_attempted: ["o1", "o1-mini"]
        };
      }
      
      // If we have scores but no explanations at all, create default explanations
      if (parsedContent.scores && 
          (!parsedContent.scores.sellerMotivation?.explanation && 
           !parsedContent.scores.transactionComplexity?.explanation && 
           !parsedContent.scores.propertyCharacteristics?.explanation)) {
        
        // Create a structured response with default explanations
        return {
          scores: {
            sellerMotivation: {
              score: parsedContent.scores.sellerMotivation || 0,
              explanation: "Based on the property listing, the seller motivation score reflects factors such as price reductions, urgency language, and market positioning."
            },
            transactionComplexity: {
              score: parsedContent.scores.transactionComplexity || 0,
              explanation: "The transaction complexity score considers factors like property condition, tenant situation, financing requirements, and potential legal considerations."
            },
            propertyCharacteristics: {
              score: parsedContent.scores.propertyCharacteristics || 0,
              explanation: "The property characteristics score evaluates location quality, building condition, tenant mix, and potential for value-add improvements."
            }
          },
          totalWeightedScore: parsedContent.totalWeightedScore || parsedContent.weightedScore || 0,
          model_used: "o1-mini",
          models_attempted: ["o1", "o1-mini"]
        };
      }
      
      // Ensure we always return a consistent structure with the required properties
      // This handles the case where parsedContent doesn't have the expected structure
      if (!parsedContent.scores) {
        // Try to extract scores from different possible formats
        const sellerMotivationScore = parsedContent.seller_motivation_score || 
                                     parsedContent.sellerMotivationScore || 
                                     (parsedContent.seller_motivation && typeof parsedContent.seller_motivation === 'object' ? 
                                      parsedContent.seller_motivation.score : parsedContent.seller_motivation) || 
                                     0;
        
        const transactionComplexityScore = parsedContent.transaction_complexity_score || 
                                          parsedContent.transactionComplexityScore || 
                                          (parsedContent.transaction_complexity && typeof parsedContent.transaction_complexity === 'object' ? 
                                           parsedContent.transaction_complexity.score : parsedContent.transaction_complexity) || 
                                          0;
        
        const propertyCharacteristicsScore = parsedContent.property_characteristics_score || 
                                            parsedContent.propertyCharacteristicsScore || 
                                            (parsedContent.property_characteristics && typeof parsedContent.property_characteristics === 'object' ? 
                                             parsedContent.property_characteristics.score : parsedContent.property_characteristics) || 
                                            0;
        
        // Extract explanations if available
        const sellerMotivationExplanation = parsedContent.seller_motivation_analysis?.explanation || 
                                           (parsedContent.seller_motivation && typeof parsedContent.seller_motivation === 'object' ? 
                                            parsedContent.seller_motivation.explanation : null) || 
                                           "Based on the property listing, the seller motivation score reflects factors such as price reductions, urgency language, and market positioning.";
        
        const transactionComplexityExplanation = parsedContent.transaction_complexity_analysis?.explanation || 
                                                (parsedContent.transaction_complexity && typeof parsedContent.transaction_complexity === 'object' ? 
                                                 parsedContent.transaction_complexity.explanation : null) || 
                                                "The transaction complexity score considers factors like property condition, tenant situation, financing requirements, and potential legal considerations.";
        
        const propertyCharacteristicsExplanation = parsedContent.property_characteristics_analysis?.explanation || 
                                                  (parsedContent.property_characteristics && typeof parsedContent.property_characteristics === 'object' ? 
                                                   parsedContent.property_characteristics.explanation : null) || 
                                                  "The property characteristics score evaluates location quality, building condition, tenant mix, and potential for value-add improvements.";
        
        // Extract keywords if available
        const sellerMotivationKeywords = parsedContent.seller_motivation_analysis?.keywords || 
                                        (parsedContent.seller_motivation && typeof parsedContent.seller_motivation === 'object' ? 
                                         parsedContent.seller_motivation.keywords : null) || 
                                        [];
        
        const transactionComplexityKeywords = parsedContent.transaction_complexity_analysis?.keywords || 
                                             (parsedContent.transaction_complexity && typeof parsedContent.transaction_complexity === 'object' ? 
                                              parsedContent.transaction_complexity.keywords : null) || 
                                             [];
        
        const propertyCharacteristicsKeywords = parsedContent.property_characteristics_analysis?.keywords || 
                                               (parsedContent.property_characteristics && typeof parsedContent.property_characteristics === 'object' ? 
                                                parsedContent.property_characteristics.keywords : null) || 
                                               [];
        
        // Calculate total score if not provided
        const totalScore = parsedContent.total_score || 
                          parsedContent.totalScore || 
                          parsedContent.totalWeightedScore || 
                          ((sellerMotivationScore * 0.4) + (transactionComplexityScore * 0.2) + (propertyCharacteristicsScore * 0.4));
        
        return {
          scores: {
            sellerMotivation: {
              score: sellerMotivationScore,
              explanation: sellerMotivationExplanation,
              keywords: sellerMotivationKeywords
            },
            transactionComplexity: {
              score: transactionComplexityScore,
              explanation: transactionComplexityExplanation,
              keywords: transactionComplexityKeywords
            },
            propertyCharacteristics: {
              score: propertyCharacteristicsScore,
              explanation: propertyCharacteristicsExplanation,
              keywords: propertyCharacteristicsKeywords
            }
          },
          totalWeightedScore: parseFloat(totalScore.toFixed(1)),
          summary: parsedContent.summary || parsedContent.analysis || "This property has been analyzed based on the provided information.",
          model_used: "o1-mini",
          models_attempted: ["o1", "o1-mini"]
        };
      }
      
      // If we already have a scores object with the expected structure, just add model info
      return {
        ...parsedContent,
        model_used: "o1-mini",
        models_attempted: ["o1", "o1-mini"]
      };
    } catch (parseError) {
      console.error('JSON parsing error with o1-mini response:', parseError.message);
      console.error('Raw content causing parse error:', content);
      throw new Error(`Failed to parse o1-mini response: ${parseError.message}`);
    }
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
    
    // Sanitize property description to prevent JSON parsing issues
    const sanitizedDescription = property.description
      ? property.description.replace(/[\r\n]+/g, ' ').replace(/"/g, '\\"')
      : '';
    
    // Standard format for GPT models
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a commercial real estate investment analyst. Analyze the property listing and provide scores, explanations, and keywords for seller motivation, transaction complexity, and property characteristics. 

For each category, you must:
1. Provide a score from 1-10 based on your analysis
2. Write a detailed explanation of your reasoning
3. List ONLY keywords that are truly relevant based on the actual content of the listing
4. If no relevant keywords are found for a category, return an empty array []
5. DO NOT include default or generic keywords that aren't supported by the listing content

Your response must be in valid JSON format without any syntax errors.`
        },
        {
          role: "user",
          content: `Property: ${property.name || 'N/A'}
Type: ${property.property_type || 'N/A'}
Location: ${property.location || 'N/A'}
Price: ${property.price || 'N/A'}

Description: ${sanitizedDescription}

Analyze this listing and provide scores from 1-10 for each category. Return the results as JSON with scores, explanations, and keywords. 

IMPORTANT: Only include keywords that are actually relevant to the listing content. If you don't find relevant keywords for a category, return an empty array. Do not include generic keywords that aren't supported by the text.

Ensure your response is properly formatted JSON without any unterminated strings or syntax errors.`
        }
      ],
      temperature: 0.1,
      max_tokens: 1500,  // Correct parameter for GPT models
      response_format: { type: "json_object" }
    });
    
    console.log('Received response from GPT-3.5-Turbo');
    const content = response.choices[0].message.content;
    
    try {
      // Clean up the content if it contains markdown code blocks
      let cleanContent = content;
      
      // Remove markdown code block syntax if present
      if (cleanContent.includes('```json')) {
        cleanContent = cleanContent.replace(/```json\n|\n```/g, '');
      } else if (cleanContent.includes('```')) {
        cleanContent = cleanContent.replace(/```\n|\n```/g, '');
      }
      
      // Fix missing commas in JSON if present (common issue with AI-generated JSON)
      cleanContent = cleanContent.replace(/"\s*\n\s*"/g, '",\n"');
      cleanContent = cleanContent.replace(/}\s*\n\s*"/g, '},\n"');
      cleanContent = cleanContent.replace(/}\s*\n\s*{/g, '},\n{');
      cleanContent = cleanContent.replace(/(\d+)\s*\n\s*"/g, '$1,\n"');
      
      // Parse the cleaned JSON response
      const parsedContent = JSON.parse(cleanContent);
      return {
        ...parsedContent,
        model_used: "gpt-3.5-turbo",
        models_attempted: ["o1", "o1-mini", "gpt-3.5-turbo"]
      };
    } catch (parseError) {
      console.error('JSON parsing error with GPT-3.5-Turbo response:', parseError.message);
      console.error('Raw content causing parse error:', content);
      throw new Error(`Failed to parse GPT-3.5-Turbo response: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error with GPT-3.5-Turbo model:', error);
    throw error;
  }
}

// Main API handler
export default async function handler(req, res) {
  console.log('Received request:', { method: req.method, body: req.body ? true : false });
  const start = Date.now();

  // Set a timeout to ensure we respond within Vercel's function timeout limit
  // This will return a fallback response if the analysis takes too long
  const TIMEOUT_MS = 55000; // 55 seconds (Vercel now has a 60s limit)
  let timeoutId;
  
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('FUNCTION_TIMEOUT'));
    }, TIMEOUT_MS);
  });

  // Always ensure we set JSON content type
  res.setHeader('Content-Type', 'application/json');

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('Method not allowed');
      clearTimeout(timeoutId);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { apiKey, property } = req.body;

    // Validate request data
    if (!apiKey) {
      console.log('Missing API key');
      clearTimeout(timeoutId);
      return res.status(400).json({ error: 'OpenAI API key is required' });
    }

    if (!property || !property.description) {
      console.log('Missing property description');
      clearTimeout(timeoutId);
      return res.status(400).json({ error: 'Property description is required' });
    }
    
    // Implement model cascade: try o1 first, then o1-mini, then GPT-3.5-Turbo
    try {
      // Race between the analysis and the timeout
      let result;
      let modelsAttempted = [];
      
      // Try o1 model first
      try {
        console.log('Attempting analysis with o1 model');
        result = await analyzeWithO1(apiKey, property);
        clearTimeout(timeoutId);
        console.log('o1 analysis succeeded, sending response');
        console.log(`Execution time: ${Date.now() - start}ms`);
        return res.status(200).json(result);
      } catch (o1Error) {
        console.error('o1 model failed, falling back to o1-mini:', o1Error.message);
        modelsAttempted.push("o1");
        
        // Try o1-mini model next
        try {
          console.log('Attempting analysis with o1-mini model');
          result = await analyzeWithO1Mini(apiKey, property);
          clearTimeout(timeoutId);
          console.log('o1-mini analysis succeeded, sending response');
          console.log(`Execution time: ${Date.now() - start}ms`);
          return res.status(200).json(result);
        } catch (o1MiniError) {
          console.error('o1-mini model failed, falling back to GPT-3.5-Turbo:', o1MiniError.message);
          modelsAttempted.push("o1-mini");
          
          // Finally try GPT-3.5-Turbo
          console.log('Attempting analysis with GPT-3.5-Turbo model');
          result = await Promise.race([
            analyzeWithGPT(apiKey, property),
            timeoutPromise
          ]);
          
          // Update models attempted in the result
          result.models_attempted = modelsAttempted.concat(["gpt-3.5-turbo"]);
          
          clearTimeout(timeoutId);
          console.log('GPT-3.5-Turbo analysis succeeded, sending response');
          console.log(`Execution time: ${Date.now() - start}ms`);
          return res.status(200).json(result);
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('All models failed, analysis error:', error);
      
      // If we hit our internal timeout, return a simplified fallback response
      if (error.message === 'FUNCTION_TIMEOUT') {
        console.log('Function timeout reached, sending fallback response');
        
        // Create a simplified response based on the property description
        // This ensures we return something useful even if the full analysis times out
        const description = property.description || '';
        const hasMotivatedSeller = /urgent|must sell|reduced|motivated|quick sale/i.test(description);
        
        return res.status(200).json({
          scores: {
            sellerMotivation: {
              score: hasMotivatedSeller ? 8 : 5,
              explanation: hasMotivatedSeller 
                ? "The listing shows signs of a motivated seller based on key phrases in the description."
                : "The listing doesn't show clear signs of seller motivation.",
              keywords: []
            },
            transactionComplexity: {
              score: 6,
              explanation: "The transaction appears to have moderate complexity based on the available information.",
              keywords: []
            },
            propertyCharacteristics: {
              score: 7,
              explanation: "The property shows potential based on the provided description.",
              keywords: []
            }
          },
          totalWeightedScore: hasMotivatedSeller ? 7 : 6,
          model_used: "Fallback Analysis (Timeout)",
          models_attempted: ["Analysis timed out"]
        });
      }
      
      // For authentication errors, return a fallback analysis with relevant keywords
      if (error.code === 'invalid_api_key') {
        console.log('Authentication error, returning fallback analysis with relevant keywords');
        
        // Check for keywords in the property description
        const description = property.description || '';
        
        // Check for seller motivation keywords
        const hasMotivatedSeller = /motivated seller|must sell|price reduced|urgent|quick sale|liquidation|distressed|bankruptcy|foreclosure|below market|owner retiring|relocating|estate sale/i.test(description);
        const sellerMotivationKeywords = [];
        if (/motivated seller/i.test(description)) sellerMotivationKeywords.push("motivated seller");
        if (/must sell/i.test(description)) sellerMotivationKeywords.push("must sell");
        if (/price reduced/i.test(description)) sellerMotivationKeywords.push("price reduced");
        if (/urgent/i.test(description)) sellerMotivationKeywords.push("urgent");
        if (/quick sale/i.test(description)) sellerMotivationKeywords.push("quick sale");
        if (/liquidation/i.test(description)) sellerMotivationKeywords.push("liquidation");
        if (/distressed/i.test(description)) sellerMotivationKeywords.push("distressed");
        if (/bankruptcy/i.test(description)) sellerMotivationKeywords.push("bankruptcy");
        if (/foreclosure/i.test(description)) sellerMotivationKeywords.push("foreclosure");
        if (/below market/i.test(description)) sellerMotivationKeywords.push("below market");
        if (/owner retiring/i.test(description)) sellerMotivationKeywords.push("owner retiring");
        if (/relocating/i.test(description)) sellerMotivationKeywords.push("relocating");
        if (/estate sale/i.test(description)) sellerMotivationKeywords.push("estate sale");
        
        // Check for transaction complexity keywords
        const transactionComplexityKeywords = [];
        if (/foreclosure/i.test(description)) transactionComplexityKeywords.push("foreclosure");
        if (/bankruptcy/i.test(description)) transactionComplexityKeywords.push("bankruptcy");
        if (/short sale/i.test(description)) transactionComplexityKeywords.push("short sale");
        if (/legal issues/i.test(description)) transactionComplexityKeywords.push("legal issues");
        if (/title issues/i.test(description)) transactionComplexityKeywords.push("title issues");
        if (/tax sale/i.test(description)) transactionComplexityKeywords.push("tax sale");
        if (/auction/i.test(description)) transactionComplexityKeywords.push("auction");
        if (/portfolio/i.test(description)) transactionComplexityKeywords.push("portfolio");
        if (/multiple parcels/i.test(description)) transactionComplexityKeywords.push("multiple parcels");
        if (/complex/i.test(description)) transactionComplexityKeywords.push("complex");
        if (/special purpose/i.test(description)) transactionComplexityKeywords.push("special purpose");
        if (/encumbrance/i.test(description)) transactionComplexityKeywords.push("encumbrance");
        if (/lease restrictions/i.test(description)) transactionComplexityKeywords.push("lease restrictions");
        if (/environmental/i.test(description)) transactionComplexityKeywords.push("environmental");
        if (/double net lease|nn lease|triple net lease|nnn lease/i.test(description)) transactionComplexityKeywords.push("net lease");
        
        // Check for property characteristics keywords
        const propertyCharacteristicsKeywords = [];
        if (/below market/i.test(description)) propertyCharacteristicsKeywords.push("below market");
        if (/value[- ]add/i.test(description)) propertyCharacteristicsKeywords.push("value-add");
        if (/upside/i.test(description)) propertyCharacteristicsKeywords.push("upside potential");
        if (/fixer upper/i.test(description)) propertyCharacteristicsKeywords.push("fixer upper");
        if (/vacant/i.test(description)) propertyCharacteristicsKeywords.push("vacant");
        if (/deferred maintenance/i.test(description)) propertyCharacteristicsKeywords.push("deferred maintenance");
        if (/renovation/i.test(description)) propertyCharacteristicsKeywords.push("renovation");
        if (/redevelopment/i.test(description)) propertyCharacteristicsKeywords.push("redevelopment");
        if (/reposition/i.test(description)) propertyCharacteristicsKeywords.push("reposition");
        if (/class b/i.test(description)) propertyCharacteristicsKeywords.push("class b");
        if (/class c/i.test(description)) propertyCharacteristicsKeywords.push("class c");
        if (/distressed/i.test(description)) propertyCharacteristicsKeywords.push("distressed");
        if (/underperforming/i.test(description)) propertyCharacteristicsKeywords.push("underperforming");
        if (/outdated/i.test(description)) propertyCharacteristicsKeywords.push("outdated");
        if (/high vacancy/i.test(description)) propertyCharacteristicsKeywords.push("high vacancy");
        if (/mismanaged/i.test(description)) propertyCharacteristicsKeywords.push("mismanaged");
        if (/national tenant/i.test(description)) propertyCharacteristicsKeywords.push("national tenant");
        if (/long-term lease/i.test(description)) propertyCharacteristicsKeywords.push("long-term lease");
        
        // Create a response with relevant keywords
        return res.status(200).json({
          scores: {
            sellerMotivation: {
              score: hasMotivatedSeller ? 8 : 5,
              explanation: hasMotivatedSeller 
                ? "The listing shows clear signs of a motivated seller based on key phrases in the description."
                : "Based on the property listing, there are no clear indicators of seller motivation.",
              keywords: sellerMotivationKeywords
            },
            transactionComplexity: {
              score: 6,
              explanation: "The transaction complexity score considers factors like property condition, tenant situation, and lease terms.",
              keywords: transactionComplexityKeywords.length > 0 ? transactionComplexityKeywords : []
            },
            propertyCharacteristics: {
              score: 7,
              explanation: "The property characteristics score evaluates location quality, building condition, and potential for value-add improvements.",
              keywords: propertyCharacteristicsKeywords.length > 0 ? propertyCharacteristicsKeywords : []
            }
          },
          totalWeightedScore: hasMotivatedSeller ? 7 : 6,
          model_used: "Fallback Analysis (API Error)",
          models_attempted: ["o1", "o1-mini", "gpt-3.5-turbo"]
        });
      } else {
        // Return error details with status 500 for other errors
        const errorResponse = {
          error: true,
          message: "API Error - Debug Information",
          error_details: error.toString(),
          error_message: error.message,
          models_attempted: ["o1", "o1-mini", "gpt-3.5-turbo"],
          stack_trace: error.stack,
          execution_time_ms: Date.now() - start
        };
        
        console.log('Sending error response:', errorResponse.message);
        return res.status(500).json(errorResponse);
      }
    }
  } catch (globalError) {
    // Global error handler as a safety net
    clearTimeout(timeoutId);
    console.error('Unhandled error in API handler:', globalError);
    
    // Ensure we always return JSON, even for unhandled errors
    return res.status(500).json({
      error: true,
      message: "Unhandled server error",
      error_details: globalError.toString(),
      error_message: globalError.message || "Unknown error",
      stack_trace: globalError.stack
    });
  } finally {
    // Ensure headers aren't sent twice
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}
