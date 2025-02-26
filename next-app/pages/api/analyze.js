import OpenAI from 'openai';

// Hard-coded fallback analysis in case API fails
const FALLBACK_ANALYSIS = {
  seller_motivation_score: 8.5,
  transaction_complexity_score: 6.0,
  property_characteristics_score: 7.5,
  total_score: 7.4,
  model_used: "Sample Analysis (Fallback)",
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

const analyzeProperty = async (apiKey, property, selectedModel = "gpt-3.5-turbo") => {
  // Create OpenAI client with the provided API key
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const systemPrompt = `
    You are a commercial real estate investment analyst specializing in identifying value-add and opportunistic investments. 
    Your task is to analyze property listing descriptions and identify signals related to three key investment criteria categories:
    
    1. Seller Motivation: Signs that the seller may be motivated to sell quickly or at favorable terms.
    2. Transaction Complexity: Factors that might reduce buyer competition or create unique opportunities.
    3. Property Characteristics: Features indicating value-add potential or situations where perceived risk exceeds actual risk.
    
    For each category, score the property on a scale of 1-10 based on the strength and number of signals present.
    Also provide a brief explanation of why you assigned that score and list any keywords or phrases that support your analysis.
    
    Calculate a total score as a weighted average: 40% Seller Motivation + 30% Transaction Complexity + 30% Property Characteristics.

    For your response, provide a VALID JSON object with the following structure and nothing else:
    {
      "seller_motivation_score": <number>,
      "transaction_complexity_score": <number>,
      "property_characteristics_score": <number>,
      "total_score": <number>,
      "seller_motivation_analysis": {
        "explanation": "<text>",
        "keywords": ["<keyword1>", "<keyword2>", ...]
      },
      "transaction_complexity_analysis": {
        "explanation": "<text>",
        "keywords": ["<keyword1>", "<keyword2>", ...]
      },
      "property_characteristics_analysis": {
        "explanation": "<text>",
        "keywords": ["<keyword1>", "<keyword2>", ...]
      },
      "summary": "<text>"
    }
  `;

  const userPrompt = `
    Please analyze this commercial real estate listing:
    
    Property Name: ${property.name}
    Property Type: ${property.property_type}
    Location: ${property.location}
    Price: ${property.price}
    
    Listing Description:
    ${property.description}
    
    Based on the listing, provide scores, explanations, and identified keywords for seller motivation, transaction complexity, and property characteristics.

    REMEMBER: Respond with ONLY a JSON object, no other text or formatting.
  `;

  // Define a list of models to try in order of preference
  const models = [selectedModel];
  if (selectedModel === "o1-mini" || selectedModel === "o1") {
    // If selected model is o1-mini/o1, add fallback models
    models.push("gpt-3.5-turbo");
  }

  for (const model of models) {
    try {
      console.log(`Attempting to call OpenAI API with model: ${model}...`);
      
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1, // Lower temperature for more predictable responses
        max_tokens: 1500, // Ensure enough tokens for a complete response
        response_format: { type: "json_object" }
      });
      
      console.log(`OpenAI API response received from model: ${model}`);
      
      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        console.error('Invalid response structure');
        continue; // Try next model
      }
      
      const content = response.choices[0].message.content;
      console.log('Response content preview:', 
        content.length > 150 ? 
        content.substring(0, 75) + '...' + content.substring(content.length - 75) : 
        content
      );
      
      try {
        const parsedContent = JSON.parse(content);
        return { ...parsedContent, model_used: model };
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        continue; // Try next model
      }
      
    } catch (error) {
      console.error(`Error calling OpenAI API with model ${model}:`, error);
      // Continue to the next model in the list
    }
  }
  
  // If all models failed, return fallback
  return { ...FALLBACK_ANALYSIS, model_used: "Sample Analysis (All API calls failed)" };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey, property, model = "gpt-3.5-turbo" } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API key is required' });
  }

  if (!property || !property.description) {
    return res.status(400).json({ error: 'Property description is required' });
  }

  try {
    const analysis = await analyzeProperty(apiKey, property, model);
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error in handler:', error);
    // Return fallback analysis only when there's a genuine error
    res.status(200).json({ 
      ...FALLBACK_ANALYSIS, 
      model_used: "Sample Analysis (Error handler)" 
    });
  }
}
