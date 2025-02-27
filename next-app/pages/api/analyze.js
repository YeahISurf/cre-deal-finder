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
      let params = {
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
        ]
      };
      
      // Add model-specific parameters
      if (modelToUse === "o1") {
        params.max_completion_tokens = 1500;
        params.response_format = { type: "json_object" };
      } else if (modelToUse === "o1-mini") {
        params.max_completion_tokens = 1500;
        // o1-mini doesn't support response_format
      } else if (modelToUse === "gpt-3.5-turbo") {
        params.max_tokens = 1500;
        params.temperature = 0.1;
        params.response_format = { type: "json_object" };
        // Add system message for GPT models
        params.messages.unshift({
          role: "system",
          content: `You are a commercial real estate investment analyst. Analyze property listings and provide scores, explanations, and keywords for seller motivation, transaction complexity, and property characteristics.`
        });
      }
      
      // Call OpenAI API
      const response = await Promise.race([
        openai.chat.completions.create(params),
        timeoutPromise
      ]);
      
      console.log(`Received response from ${modelToUse}`);
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
        
        // Parse the cleaned JSON response
        const parsedContent = JSON.parse(cleanContent);
        
        // Add model information
        const result = {
          ...parsedContent,
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
