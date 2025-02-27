import OpenAI from 'openai';

// Main API handler
export default async function handler(req, res) {
  console.log('Received request:', { method: req.method, body: req.body ? true : false });
  const start = Date.now();

  // Set a timeout to ensure we respond within Vercel's function timeout limit
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

    const { apiKey, property, forceModel } = req.body;

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
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // Sanitize property description to prevent JSON parsing issues
    const sanitizedDescription = property.description
      ? property.description.replace(/[\r\n]+/g, ' ').replace(/"/g, '\\"')
      : '';
    
    // Determine which model to use
    const modelToUse = forceModel || "o1";
    console.log(`Using model: ${modelToUse}`);
    
    try {
      // Create appropriate parameters based on the model
      let params = {};
      
      if (modelToUse === "o1") {
        // Simplified prompt for o1 model to ensure proper JSON formatting
        params = {
          model: modelToUse,
          messages: [
            {
              role: "user",
              content: `You are a commercial real estate investment analyst. Analyze this property listing and provide scores from 1-10 for seller motivation, transaction complexity, and property characteristics.

Property: ${property.name || 'N/A'}
Type: ${property.property_type || 'N/A'}
Location: ${property.location || 'N/A'}
Price: ${property.price || 'N/A'}

Description: ${sanitizedDescription}

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
          max_completion_tokens: 25000, // Increased to ensure enough tokens for both reasoning and output
          reasoning_effort: "medium", // Control how many tokens are used for reasoning
          response_format: { type: "json_object" }
        };
      } else if (modelToUse === "o1-mini") {
        params = {
          model: modelToUse,
          messages: [
            {
              role: "user",
              content: `You are a commercial real estate investment analyst. Analyze this property listing and provide scores from 1-10 for seller motivation, transaction complexity, and property characteristics.

Property: ${property.name || 'N/A'}
Type: ${property.property_type || 'N/A'}
Location: ${property.location || 'N/A'}
Price: ${property.price || 'N/A'}

Description: ${sanitizedDescription}

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
          max_completion_tokens: 25000 // Increased to ensure enough tokens for both reasoning and output
        };
      } else if (modelToUse === "gpt-3.5-turbo") {
        params = {
          model: modelToUse,
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

Description: ${sanitizedDescription}

Analyze this listing and provide scores from 1-10 for each category. Return the results as JSON with scores, explanations, and keywords. 

IMPORTANT: Only include keywords that are actually relevant to the listing content. If you don't find relevant keywords for a category, return an empty array. Do not include generic keywords that aren't supported by the text.

Ensure your response is properly formatted JSON without any unterminated strings or syntax errors.`
            }
          ],
          max_tokens: 1500,
          temperature: 0.1,
          response_format: { type: "json_object" }
        };
      } else {
        // Default parameters for other models
        params = {
          model: modelToUse,
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
          max_tokens: 1500,
          temperature: 0.1
        };
      }
      
      // Call OpenAI API
      console.log(`Sending request to ${modelToUse} with params:`, JSON.stringify(params, null, 2));
      const response = await Promise.race([
        openai.chat.completions.create(params),
        timeoutPromise
      ]);
      
      console.log(`Received response from ${modelToUse}:`, JSON.stringify(response, null, 2));
      
      // Check if the response has the expected structure
      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error(`Invalid response structure from ${modelToUse}`);
      }
      
      const content = response.choices[0].message.content || '';
      
      // Check if content is empty
      if (!content || content.trim() === '') {
        console.error(`Empty content received from ${modelToUse}`);
        throw new Error(`Empty content received from ${modelToUse}`);
      }
      
      // Log the raw content for debugging
      console.log('Raw content length:', content.length);
      console.log('Raw content preview:', content.substring(0, 200) + '...');
      
      try {
        // Define parsedContent at the top level of the try block
        let parsedContent;
        
        // For GPT-3.5-turbo, use a custom parser
        if (modelToUse === "gpt-3.5-turbo") {
          console.log("Using custom parser for GPT-3.5-turbo response");
          
          // Create a default structure
          parsedContent = {
            seller_motivation: {
              score: 0,
              explanation: "",
              keywords: []
            },
            transaction_complexity: {
              score: 0,
              explanation: "",
              keywords: []
            },
            property_characteristics: {
              score: 0,
              explanation: "",
              keywords: []
            },
            total_score: 0
          };
          
          // Extract seller motivation score
          const sellerMotivationScoreMatch = content.match(/"seller_motivation"[^}]*"score":\s*(\d+)/);
          if (sellerMotivationScoreMatch) {
            parsedContent.seller_motivation.score = parseInt(sellerMotivationScoreMatch[1]);
          }
          
          // Extract transaction complexity score
          const transactionComplexityScoreMatch = content.match(/"transaction_complexity"[^}]*"score":\s*(\d+)/);
          if (transactionComplexityScoreMatch) {
            parsedContent.transaction_complexity.score = parseInt(transactionComplexityScoreMatch[1]);
          }
          
          // Extract property characteristics score
          const propertyCharacteristicsScoreMatch = content.match(/"property_characteristics"[^}]*"score":\s*(\d+)/);
          if (propertyCharacteristicsScoreMatch) {
            parsedContent.property_characteristics.score = parseInt(propertyCharacteristicsScoreMatch[1]);
          }
          
          // Extract seller motivation explanation
          const sellerMotivationExplanationMatch = content.match(/"seller_motivation"[^}]*"explanation":\s*"([^"]*)"/);
          if (sellerMotivationExplanationMatch) {
            parsedContent.seller_motivation.explanation = sellerMotivationExplanationMatch[1];
          }
          
          // Extract transaction complexity explanation
          const transactionComplexityExplanationMatch = content.match(/"transaction_complexity"[^}]*"explanation":\s*"([^"]*)"/);
          if (transactionComplexityExplanationMatch) {
            parsedContent.transaction_complexity.explanation = transactionComplexityExplanationMatch[1];
          }
          
          // Extract property characteristics explanation
          const propertyCharacteristicsExplanationMatch = content.match(/"property_characteristics"[^}]*"explanation":\s*"([^"]*)"/);
          if (propertyCharacteristicsExplanationMatch) {
            parsedContent.property_characteristics.explanation = propertyCharacteristicsExplanationMatch[1];
          }
          
          // Extract seller motivation keywords
          const sellerMotivationKeywordsMatch = content.match(/"seller_motivation"[^}]*"keywords":\s*\[(.*?)\]/s);
          if (sellerMotivationKeywordsMatch) {
            const keywordsStr = sellerMotivationKeywordsMatch[1];
            const keywords = keywordsStr.match(/"([^"]*)"/g);
            if (keywords) {
              parsedContent.seller_motivation.keywords = keywords.map(k => k.replace(/"/g, ''));
            }
          }
          
          // Extract transaction complexity keywords
          const transactionComplexityKeywordsMatch = content.match(/"transaction_complexity"[^}]*"keywords":\s*\[(.*?)\]/s);
          if (transactionComplexityKeywordsMatch) {
            const keywordsStr = transactionComplexityKeywordsMatch[1];
            const keywords = keywordsStr.match(/"([^"]*)"/g);
            if (keywords) {
              parsedContent.transaction_complexity.keywords = keywords.map(k => k.replace(/"/g, ''));
            }
          }
          
          // Extract property characteristics keywords
          const propertyCharacteristicsKeywordsMatch = content.match(/"property_characteristics"[^}]*"keywords":\s*\[(.*?)\]/s);
          if (propertyCharacteristicsKeywordsMatch) {
            const keywordsStr = propertyCharacteristicsKeywordsMatch[1];
            const keywords = keywordsStr.match(/"([^"]*)"/g);
            if (keywords) {
              parsedContent.property_characteristics.keywords = keywords.map(k => k.replace(/"/g, ''));
            }
          }
          
          console.log("Custom parsed content:", JSON.stringify(parsedContent, null, 2));
          
          // For other models, try to parse the JSON normally
        } else {
          console.log("Using standard JSON parser");
          
          // Clean up the content if it contains markdown code blocks
          let cleanContent = content;
          
          // Remove markdown code block syntax if present
          if (content.includes('```json')) {
            cleanContent = content.replace(/```json\n|\n```/g, '');
          } else if (content.includes('```')) {
            cleanContent = content.replace(/```\n|\n```/g, '');
          }
          
          // Enhanced JSON cleaning for all models
          // Fix missing commas in JSON if present (common issue with AI-generated JSON)
          cleanContent = cleanContent.replace(/"\s*\n\s*"/g, '",\n"');
          cleanContent = cleanContent.replace(/}\s*\n\s*"/g, '},\n"');
          cleanContent = cleanContent.replace(/}\s*\n\s*{/g, '},\n{');
          cleanContent = cleanContent.replace(/(\d+)\s*\n\s*"/g, '$1,\n"');
          
          // Replace single quotes with double quotes (common issue)
          cleanContent = cleanContent.replace(/'/g, '"');
          
          // Add quotes around unquoted property names
          cleanContent = cleanContent.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
          
          // Fix missing commas between array elements
          cleanContent = cleanContent.replace(/"\s+"/g, '", "');
          
          // Add missing commas between properties
          cleanContent = cleanContent.replace(/"\s*\n\s*"/g, '",\n"');
          
          // Fix missing commas between properties (more aggressive)
          cleanContent = cleanContent.replace(/"([^"]*)"(\s*)(\n?)(\s*)"([^"]*)"/g, '"$1",$3"$5"');
          cleanContent = cleanContent.replace(/(\d+)(\s*)(\n?)(\s*)"([^"]*)"/g, '$1,$3"$5"');
          cleanContent = cleanContent.replace(/(\d+)(\s*)(\n?)(\s*){/g, '$1,$3{');
          cleanContent = cleanContent.replace(/"([^"]*)"(\s*)(\n?)(\s*){/g, '"$1",$3{');
          
          // Log the cleaned content for debugging
          console.log('Cleaned JSON preview:', cleanContent.substring(0, 200) + '...');
          
          // Try to parse the JSON with a fallback mechanism
          try {
            parsedContent = JSON.parse(cleanContent);
          } catch (initialParseError) {
            console.error(`Initial JSON parsing error: ${initialParseError.message}`);
            
            // Try more aggressive JSON fixing
            try {
              // Remove any text before the first { and after the last }
              const jsonStartIndex = cleanContent.indexOf('{');
              const jsonEndIndex = cleanContent.lastIndexOf('}') + 1;
              
              if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
                const extractedJson = cleanContent.substring(jsonStartIndex, jsonEndIndex);
                console.log('Extracted JSON:', extractedJson.substring(0, 100) + '...');
                parsedContent = JSON.parse(extractedJson);
              } else {
                throw new Error('Could not locate valid JSON object in response');
              }
            } catch (extractError) {
              console.error(`JSON extraction error: ${extractError.message}`);
              
              // If all parsing attempts fail, create a default structure
              parsedContent = {
                seller_motivation_score: 0,
                transaction_complexity_score: 0,
                property_characteristics_score: 0,
                total_score: 0,
                seller_motivation_explanation: "Error parsing response",
                transaction_complexity_explanation: "Error parsing response",
                property_characteristics_explanation: "Error parsing response",
                seller_motivation_keywords: [],
                transaction_complexity_keywords: [],
                property_characteristics_keywords: []
              };
            }
          }
        }
        
        // Normalize the response structure
        let normalizedResponse = {};
        
        // Check if the response has the nested structure from gpt-3.5-turbo
        if (parsedContent.seller_motivation && typeof parsedContent.seller_motivation === 'object') {
          // Get scores from the nested structure
          const sellerMotivationScore = parsedContent.seller_motivation?.score || 0;
          const transactionComplexityScore = parsedContent.transaction_complexity?.score || 0;
          const propertyCharacteristicsScore = parsedContent.property_characteristics?.score || 0;
          
          // Calculate total score if not provided (weighted average: 40% seller motivation, 30% transaction complexity, 30% property characteristics)
          const totalScore = parsedContent.total_score || 
            (sellerMotivationScore * 0.4 + transactionComplexityScore * 0.3 + propertyCharacteristicsScore * 0.3);
          
          // GPT-3.5-turbo format with nested objects
          normalizedResponse = {
            seller_motivation_score: sellerMotivationScore,
            transaction_complexity_score: transactionComplexityScore,
            property_characteristics_score: propertyCharacteristicsScore,
            total_score: totalScore,
            seller_motivation_analysis: {
              explanation: parsedContent.seller_motivation?.explanation || "",
              keywords: parsedContent.seller_motivation?.keywords || []
            },
            transaction_complexity_analysis: {
              explanation: parsedContent.transaction_complexity?.explanation || "",
              keywords: parsedContent.transaction_complexity?.keywords || []
            },
            property_characteristics_analysis: {
              explanation: parsedContent.property_characteristics?.explanation || "",
              keywords: parsedContent.property_characteristics?.keywords || []
            }
          };
        } else {
          // Standard format with flat properties
          normalizedResponse = {
            seller_motivation_score: parsedContent.seller_motivation_score || 0,
            transaction_complexity_score: parsedContent.transaction_complexity_score || 0,
            property_characteristics_score: parsedContent.property_characteristics_score || 0,
            total_score: parsedContent.total_score || 0,
            seller_motivation_analysis: {
              explanation: parsedContent.seller_motivation_explanation || "",
              keywords: parsedContent.seller_motivation_keywords || []
            },
            transaction_complexity_analysis: {
              explanation: parsedContent.transaction_complexity_explanation || "",
              keywords: parsedContent.transaction_complexity_keywords || []
            },
            property_characteristics_analysis: {
              explanation: parsedContent.property_characteristics_explanation || "",
              keywords: parsedContent.property_characteristics_keywords || []
            }
          };
        }
        
        // Add model information
        const result = {
          ...normalizedResponse,
          model_used: modelToUse,
          models_attempted: [modelToUse]
        };
        
        clearTimeout(timeoutId);
        console.log(`Analysis succeeded, sending response`);
        console.log(`Execution time: ${Date.now() - start}ms`);
        return res.status(200).json(result);
      } catch (parseError) {
        console.error(`JSON parsing error with ${modelToUse} response:`, parseError.message);
        console.error('Raw content causing parse error:', content);
        throw new Error(`Failed to parse ${modelToUse} response: ${parseError.message}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Error with ${modelToUse} model:`, error);
      
      // Return a fallback response
      return res.status(500).json({
        error: true,
        message: `Error with ${modelToUse} model`,
        error_details: error.toString(),
        error_message: error.message,
        models_attempted: [modelToUse]
      });
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
