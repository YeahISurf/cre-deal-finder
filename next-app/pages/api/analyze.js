import OpenAI from 'openai';

const analyzeProperty = async (apiKey, property) => {
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
    
    Provide your response in JSON format with the following structure:
    {
        "seller_motivation_score": <1-10>,
        "transaction_complexity_score": <1-10>,
        "property_characteristics_score": <1-10>,
        "total_score": <1-10>,
        "seller_motivation_analysis": {
            "explanation": "<brief explanation>",
            "keywords": ["<keyword1>", "<keyword2>", ...]
        },
        "transaction_complexity_analysis": {
            "explanation": "<brief explanation>",
            "keywords": ["<keyword1>", "<keyword2>", ...]
        },
        "property_characteristics_analysis": {
            "explanation": "<brief explanation>",
            "keywords": ["<keyword1>", "<keyword2>", ...]
        },
        "summary": "<brief investment recommendation>"
    }
    
    Here are examples of what to look for in each category:
    
    Seller Motivation:
    - Explicit statements like "motivated seller", "must sell", "priced to sell", "urgent sale", "relocating"
    - Price reductions or below market pricing
    - Mentions of distress, bankruptcy, foreclosure, or liquidation
    - Signs of aging or retiring ownership
    - Estate sales or inherited properties
    - Passive or inexperienced ownership
    - Time constraints or deadlines
    
    Transaction Complexity:
    - Legal complications or title issues
    - Foreclosures, short sales, REO properties
    - Portfolio sales with multiple properties
    - Complicated zoning or entitlement issues
    - Environmental concerns
    - Special financing considerations
    - Off-market properties or limited marketing
    - Unusual or complex lease structures
    
    Property Characteristics:
    - Below market rents or occupancy
    - Deferred maintenance or renovation needs
    - Mismanagement or operational inefficiencies
    - Outdated amenities or systems
    - Repositioning opportunities
    - Expansion potential or excess land
    - Properties offered at below replacement cost
    - Older Class B/C properties with value-add potential
    - Unusual property types with limited buyer pool
    
    Be thorough but concise in your analysis. Focus on objective signals in the listing description.
  `;

  const userPrompt = `
    Please analyze the following commercial real estate listing:
    
    Property Name: ${property.name}
    Property Type: ${property.property_type}
    Location: ${property.location}
    Price: ${property.price}
    
    Listing Description:
    ${property.description}
    
    Analyze this listing for signs of seller motivation, transaction complexity, and valuable property characteristics.
    Return your analysis in the requested JSON format with scores, explanations, and keywords for each category.
  `;

  const response = await openai.chat.completions.create({
    model: "o1", // Using the most advanced model available with free credits
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey, property } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API key is required' });
  }

  if (!property || !property.description) {
    return res.status(400).json({ error: 'Property description is required' });
  }

  try {
    const analysis = await analyzeProperty(apiKey, property);
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing property:', error);
    res.status(500).json({ 
      error: 'Error analyzing property', 
      details: error.message 
    });
  }
}
