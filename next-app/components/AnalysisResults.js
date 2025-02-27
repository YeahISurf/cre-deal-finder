import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

SyntaxHighlighter.registerLanguage('json', json);

// Helper function to extract keywords from text
function extractKeywordsFromText(text) {
  if (!text) return [];
  
  // Common keywords to look for in real estate listings
  const keywordPatterns = [
    // Seller motivation keywords
    { pattern: /motivated\s+seller/i, category: 'seller', keyword: 'motivated seller' },
    { pattern: /must\s+sell/i, category: 'seller', keyword: 'must sell' },
    { pattern: /price\s+reduced/i, category: 'seller', keyword: 'price reduced' },
    { pattern: /urgent\s+sale/i, category: 'seller', keyword: 'urgent sale' },
    { pattern: /relocating/i, category: 'seller', keyword: 'relocating' },
    { pattern: /distressed/i, category: 'seller', keyword: 'distressed' },
    { pattern: /quick\s+sale/i, category: 'seller', keyword: 'quick sale' },
    { pattern: /below\s+market\s+value/i, category: 'seller', keyword: 'below market value' },
    
    // Transaction complexity keywords
    { pattern: /deferred\s+maintenance/i, category: 'transaction', keyword: 'deferred maintenance' },
    { pattern: /below\s+market/i, category: 'transaction', keyword: 'below market' },
    { pattern: /complex\s+deal/i, category: 'transaction', keyword: 'complex deal' },
    { pattern: /legal\s+issues/i, category: 'transaction', keyword: 'legal issues' },
    { pattern: /title\s+issues/i, category: 'transaction', keyword: 'title issues' },
    { pattern: /foreclosure/i, category: 'transaction', keyword: 'foreclosure' },
    { pattern: /bankruptcy/i, category: 'transaction', keyword: 'bankruptcy' },
    { pattern: /tenant\s+issues/i, category: 'transaction', keyword: 'tenant issues' },
    
    // Property characteristics keywords
    { pattern: /value[\s-]add/i, category: 'property', keyword: 'value-add' },
    { pattern: /below\s+market\s+rents/i, category: 'property', keyword: 'below market rents' },
    { pattern: /good\s+location/i, category: 'property', keyword: 'good location' },
    { pattern: /upside\s+potential/i, category: 'property', keyword: 'upside potential' },
    { pattern: /renovation/i, category: 'property', keyword: 'renovation opportunity' },
    { pattern: /development\s+potential/i, category: 'property', keyword: 'development potential' },
    { pattern: /prime\s+location/i, category: 'property', keyword: 'prime location' },
    { pattern: /high\s+demand\s+area/i, category: 'property', keyword: 'high demand area' }
  ];
  
  // Find all matching keywords in the text
  const foundKeywords = [];
  keywordPatterns.forEach(({ pattern, keyword }) => {
    if (pattern.test(text)) {
      foundKeywords.push(keyword);
    }
  });
  
  return foundKeywords;
}

function ScoreCard({ title, score = 0, className }) {
  // Default to 0 if score is undefined
  const safeScore = typeof score === 'number' ? score : 0;
  const scoreClass = safeScore >= 7 ? 'score-high' : safeScore >= 4 ? 'score-medium' : 'score-low';
  
  return (
    <div className={`score-card ${scoreClass} ${className}`}>
      <h3 className="text-xs sm:text-sm font-medium mb-1 truncate">{title}</h3>
      <p className="text-2xl sm:text-3xl font-semibold">{safeScore.toFixed(1)}</p>
      <p className="text-xs mt-1 text-gray-500 font-medium">out of 10</p>
    </div>
  );
}

function ExpandableSection({ title, content, keywords = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden bg-white shadow-sm">
      <button
        className="w-full p-3 sm:p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-base sm:text-lg font-medium text-gray-800">{title}</h3>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-3 sm:p-5">
          <p className="text-gray-700 mb-4 leading-relaxed">{content}</p>
          
          {keywords && keywords.length > 0 ? (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Keywords Detected:</h4>
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                {keywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-primary-50 text-primary-600 text-sm rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic">
              No relevant keywords detected for this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalysisResults({ results }) {
  const [showRawJson, setShowRawJson] = useState(false);
  
  if (!results) return null;
  
  const { property, model_used, models_attempted, ...rawAnalysis } = results;
  
  // Extract explanations from the analysis string if available
  // This handles the case where the API returns a single analysis string instead of separate explanations
  const extractedExplanations = (() => {
    if (typeof rawAnalysis.analysis === 'string') {
      const analysis = rawAnalysis.analysis;
      
      // Try to extract explanations for each category from the analysis string
      // Using more flexible regex patterns to catch more variations
      const sellerMotivationMatch = analysis.match(/seller\s+motivation[:\.]?\s*([^\.]+\.)/i) || 
                                   analysis.match(/motivation[:\.]?\s*([^\.]+\.)/i) ||
                                   analysis.match(/seller[:\.]?\s*([^\.]+\.)/i);
      
      const transactionComplexityMatch = analysis.match(/transaction\s+complexity[:\.]?\s*([^\.]+\.)/i) || 
                                        analysis.match(/complexity[:\.]?\s*([^\.]+\.)/i) ||
                                        analysis.match(/transaction[:\.]?\s*([^\.]+\.)/i);
      
      const propertyCharacteristicsMatch = analysis.match(/property\s+characteristics[:\.]?\s*([^\.]+\.)/i) || 
                                          analysis.match(/characteristics[:\.]?\s*([^\.]+\.)/i) ||
                                          analysis.match(/property[:\.]?\s*([^\.]+\.)/i);
      
      return {
        sellerMotivation: sellerMotivationMatch ? sellerMotivationMatch[1].trim() : null,
        transactionComplexity: transactionComplexityMatch ? transactionComplexityMatch[1].trim() : null,
        propertyCharacteristics: propertyCharacteristicsMatch ? propertyCharacteristicsMatch[1].trim() : null,
        // If we couldn't extract specific explanations, use the full analysis for all categories
        fallback: analysis
      };
    }
    
    // Also check for analysis in other formats
    if (rawAnalysis.analysis && typeof rawAnalysis.analysis === 'object') {
      return {
        sellerMotivation: rawAnalysis.analysis.sellerMotivationExplanation || null,
        transactionComplexity: rawAnalysis.analysis.transactionComplexityExplanation || null,
        propertyCharacteristics: rawAnalysis.analysis.propertyCharacteristicsExplanation || null,
        fallback: JSON.stringify(rawAnalysis.analysis)
      };
    }
    
    return null;
  })();
  
  // Handle different API response formats
  // Create a normalized analysis object that works with both formats
  const analysis = {
    // Handle scores - adding support for nested score objects
    seller_motivation_score: rawAnalysis.seller_motivation_score || 
                             (rawAnalysis.scores && rawAnalysis.scores.sellerMotivation && typeof rawAnalysis.scores.sellerMotivation === 'object' ? rawAnalysis.scores.sellerMotivation.score : rawAnalysis.scores.sellerMotivation) || 
                             (rawAnalysis.scores && rawAnalysis.scores.seller_motivation && typeof rawAnalysis.scores.seller_motivation === 'object' ? rawAnalysis.scores.seller_motivation.score : rawAnalysis.scores.seller_motivation) || 
                             (rawAnalysis.seller_motivation && typeof rawAnalysis.seller_motivation === 'object' ? rawAnalysis.seller_motivation.score : rawAnalysis.seller_motivation) || 
                             (typeof rawAnalysis.sellerMotivation === 'number' ? rawAnalysis.sellerMotivation : 0),
    transaction_complexity_score: rawAnalysis.transaction_complexity_score || 
                                 (rawAnalysis.scores && rawAnalysis.scores.transactionComplexity && typeof rawAnalysis.scores.transactionComplexity === 'object' ? rawAnalysis.scores.transactionComplexity.score : rawAnalysis.scores.transactionComplexity) || 
                                 (rawAnalysis.scores && rawAnalysis.scores.transaction_complexity && typeof rawAnalysis.scores.transaction_complexity === 'object' ? rawAnalysis.scores.transaction_complexity.score : rawAnalysis.scores.transaction_complexity) || 
                                 (rawAnalysis.transaction_complexity && typeof rawAnalysis.transaction_complexity === 'object' ? rawAnalysis.transaction_complexity.score : rawAnalysis.transaction_complexity) || 
                                 (typeof rawAnalysis.transactionComplexity === 'number' ? rawAnalysis.transactionComplexity : 0),
    property_characteristics_score: rawAnalysis.property_characteristics_score || 
                                   (rawAnalysis.scores && rawAnalysis.scores.propertyCharacteristics && typeof rawAnalysis.scores.propertyCharacteristics === 'object' ? rawAnalysis.scores.propertyCharacteristics.score : rawAnalysis.scores.propertyCharacteristics) || 
                                   (rawAnalysis.scores && rawAnalysis.scores.property_characteristics && typeof rawAnalysis.scores.property_characteristics === 'object' ? rawAnalysis.scores.property_characteristics.score : rawAnalysis.scores.property_characteristics) || 
                                   (rawAnalysis.property_characteristics && typeof rawAnalysis.property_characteristics === 'object' ? rawAnalysis.property_characteristics.score : rawAnalysis.property_characteristics) || 
                                   (typeof rawAnalysis.propertyCharacteristics === 'number' ? rawAnalysis.propertyCharacteristics : 0),
    total_score: rawAnalysis.total_score || 
                rawAnalysis.totalWeightedScore ||
                (rawAnalysis.scores && rawAnalysis.scores.totalWeightedScore) || 
                (rawAnalysis.scores && rawAnalysis.scores.total_weighted_score) || 
                (typeof rawAnalysis.totalScore === 'number' ? rawAnalysis.totalScore : 0),
    
    // Handle explanations - adding support for nested explanation objects and extracted explanations
    seller_motivation_analysis: rawAnalysis.seller_motivation_analysis || 
                               (rawAnalysis.scores && rawAnalysis.scores.sellerMotivation && {
                                 explanation: rawAnalysis.scores.sellerMotivation.explanation,
                                 keywords: rawAnalysis.scores.sellerMotivation.keywords || 
                                          (rawAnalysis.keywords && rawAnalysis.keywords.sellerMotivation) || 
                                          extractKeywordsFromText(rawAnalysis.scores.sellerMotivation.explanation)
                               }) ||
                               (rawAnalysis.scores && rawAnalysis.scores.seller_motivation && {
                                 explanation: rawAnalysis.scores.seller_motivation.explanation,
                                 keywords: rawAnalysis.scores.seller_motivation.keywords || 
                                          (rawAnalysis.keywords && rawAnalysis.keywords.seller_motivation) || 
                                          extractKeywordsFromText(rawAnalysis.scores.seller_motivation.explanation)
                               }) ||
                               (rawAnalysis.explanations && { 
                                 explanation: rawAnalysis.explanations.seller_motivation,
                                 keywords: (rawAnalysis.keywords && rawAnalysis.keywords.seller_motivation) || 
                                          extractKeywordsFromText(rawAnalysis.explanations.seller_motivation)
                               }) ||
                               (rawAnalysis.analysis && typeof rawAnalysis.analysis === 'object' && {
                                 explanation: rawAnalysis.analysis.sellerMotivationExplanation,
                                 keywords: (rawAnalysis.keywords && rawAnalysis.keywords.sellerMotivation) || 
                                          extractKeywordsFromText(rawAnalysis.analysis.sellerMotivationExplanation)
                               }) ||
                               (extractedExplanations && {
                                 explanation: extractedExplanations.sellerMotivation || 
                                             "Seller Motivation: " + extractedExplanations.fallback,
                                 keywords: extractKeywordsFromText(extractedExplanations.sellerMotivation || extractedExplanations.fallback)
                               }) ||
                               (rawAnalysis.seller_motivation && {
                                 explanation: rawAnalysis.seller_motivation.explanation,
                                 keywords: rawAnalysis.seller_motivation.keywords || 
                                          extractKeywordsFromText(rawAnalysis.seller_motivation.explanation)
                               }) || { explanation: "No seller motivation detected in this listing.", keywords: [] },
    transaction_complexity_analysis: rawAnalysis.transaction_complexity_analysis || 
                                    (rawAnalysis.scores && rawAnalysis.scores.transactionComplexity && {
                                      explanation: rawAnalysis.scores.transactionComplexity.explanation,
                                      keywords: rawAnalysis.scores.transactionComplexity.keywords || 
                                               (rawAnalysis.keywords && rawAnalysis.keywords.transactionComplexity) || 
                                               extractKeywordsFromText(rawAnalysis.scores.transactionComplexity.explanation)
                                    }) ||
                                    (rawAnalysis.scores && rawAnalysis.scores.transaction_complexity && {
                                      explanation: rawAnalysis.scores.transaction_complexity.explanation,
                                      keywords: rawAnalysis.scores.transaction_complexity.keywords || 
                                               (rawAnalysis.keywords && rawAnalysis.keywords.transaction_complexity) || 
                                               extractKeywordsFromText(rawAnalysis.scores.transaction_complexity.explanation)
                                    }) ||
                                    (rawAnalysis.explanations && {
                                      explanation: rawAnalysis.explanations.transaction_complexity,
                                      keywords: (rawAnalysis.keywords && rawAnalysis.keywords.transaction_complexity) || 
                                               extractKeywordsFromText(rawAnalysis.explanations.transaction_complexity)
                                    }) ||
                                    (rawAnalysis.analysis && typeof rawAnalysis.analysis === 'object' && {
                                      explanation: rawAnalysis.analysis.transactionComplexityExplanation,
                                      keywords: (rawAnalysis.keywords && rawAnalysis.keywords.transactionComplexity) || 
                                               extractKeywordsFromText(rawAnalysis.analysis.transactionComplexityExplanation)
                                    }) ||
                                    (extractedExplanations && {
                                      explanation: extractedExplanations.transactionComplexity || 
                                                  "Transaction Complexity: " + extractedExplanations.fallback,
                                      keywords: extractKeywordsFromText(extractedExplanations.transactionComplexity || extractedExplanations.fallback)
                                    }) ||
                                    (rawAnalysis.transaction_complexity && {
                                      explanation: rawAnalysis.transaction_complexity.explanation,
                                      keywords: rawAnalysis.transaction_complexity.keywords || 
                                               extractKeywordsFromText(rawAnalysis.transaction_complexity.explanation)
                                    }) || { explanation: "No transaction complexity factors detected in this listing.", keywords: [] },
    property_characteristics_analysis: rawAnalysis.property_characteristics_analysis || 
                                      (rawAnalysis.scores && rawAnalysis.scores.propertyCharacteristics && {
                                        explanation: rawAnalysis.scores.propertyCharacteristics.explanation,
                                        keywords: rawAnalysis.scores.propertyCharacteristics.keywords || 
                                                 (rawAnalysis.keywords && rawAnalysis.keywords.propertyCharacteristics) || 
                                                 extractKeywordsFromText(rawAnalysis.scores.propertyCharacteristics.explanation)
                                      }) ||
                                      (rawAnalysis.scores && rawAnalysis.scores.property_characteristics && {
                                        explanation: rawAnalysis.scores.property_characteristics.explanation,
                                        keywords: rawAnalysis.scores.property_characteristics.keywords || 
                                                 (rawAnalysis.keywords && rawAnalysis.keywords.property_characteristics) || 
                                                 extractKeywordsFromText(rawAnalysis.scores.property_characteristics.explanation)
                                      }) ||
                                      (rawAnalysis.explanations && {
                                        explanation: rawAnalysis.explanations.property_characteristics,
                                        keywords: (rawAnalysis.keywords && rawAnalysis.keywords.property_characteristics) || 
                                                 extractKeywordsFromText(rawAnalysis.explanations.property_characteristics)
                                      }) ||
                                      (rawAnalysis.analysis && typeof rawAnalysis.analysis === 'object' && {
                                        explanation: rawAnalysis.analysis.propertyCharacteristicsExplanation,
                                        keywords: (rawAnalysis.keywords && rawAnalysis.keywords.propertyCharacteristics) || 
                                                 extractKeywordsFromText(rawAnalysis.analysis.propertyCharacteristicsExplanation)
                                      }) ||
                                      (extractedExplanations && {
                                        explanation: extractedExplanations.propertyCharacteristics || 
                                                    "Property Characteristics: " + extractedExplanations.fallback,
                                        keywords: extractKeywordsFromText(extractedExplanations.propertyCharacteristics || extractedExplanations.fallback)
                                      }) ||
                                      (rawAnalysis.property_characteristics && {
                                        explanation: rawAnalysis.property_characteristics.explanation,
                                        keywords: rawAnalysis.property_characteristics.keywords || 
                                                 extractKeywordsFromText(rawAnalysis.property_characteristics.explanation)
                                      }) || { explanation: "No specific property characteristics detected in this listing.", keywords: [] },
    
    // Handle summary
    summary: rawAnalysis.summary || 
            rawAnalysis.analysis ||
            (rawAnalysis.explanations && rawAnalysis.explanations.overall_analysis) ||
            (rawAnalysis.analysis && rawAnalysis.analysis.overallAnalysis)
  };
  
  return (
    <div>
      {property && (
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-medium mb-3 text-gray-900">{property.name || 'Unnamed Property'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-700">Type:</span> <span className="text-gray-600">{property.property_type || 'N/A'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-700">Location:</span> <span className="text-gray-600">{property.location || 'N/A'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-700">Price:</span> <span className="text-gray-600">{property.price || 'N/A'}</span></div>
          </div>
        </div>
      )}
      
      {model_used && (
        <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm">
          <p>
            <span className="font-semibold">AI Model Used:</span> {model_used}
          </p>
          {models_attempted && models_attempted.length > 0 && (
            <p className="mt-1">
              <span className="font-semibold">Models Attempted:</span> {models_attempted.join(' → ')}
            </p>
          )}
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-lg sm:text-xl font-medium mb-4 text-gray-900">Scores</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ScoreCard 
            title="Seller Motivation" 
            score={analysis.seller_motivation_score} 
          />
          <ScoreCard 
            title="Transaction Complexity" 
            score={analysis.transaction_complexity_score} 
          />
          <ScoreCard 
            title="Property Characteristic" 
            score={analysis.property_characteristics_score} 
          />
          <ScoreCard 
            title="TOTAL SCORE" 
            score={analysis.total_score} 
            className="shadow border-2 border-primary-100" 
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg sm:text-xl font-medium mb-4 text-gray-900">Detailed Analysis</h3>
        
        <ExpandableSection 
          title="Seller Motivation" 
          content={analysis.seller_motivation_analysis?.explanation || 
                  "Based on the property listing, the seller motivation score reflects factors such as price reductions, urgency language, and market positioning."}
          keywords={analysis.seller_motivation_analysis?.keywords || []}
        />
        
        <ExpandableSection 
          title="Transaction Complexity" 
          content={analysis.transaction_complexity_analysis?.explanation || 
                  "The transaction complexity score considers factors like property condition, tenant situation, financing requirements, and potential legal considerations."}
          keywords={analysis.transaction_complexity_analysis?.keywords || []}
        />
        
        <ExpandableSection 
          title="Property Characteristics" 
          content={analysis.property_characteristics_analysis?.explanation || 
                  "The property characteristics score evaluates location quality, building condition, tenant mix, and potential for value-add improvements."}
          keywords={analysis.property_characteristics_analysis?.keywords || []}
        />
      </div>
      
      {analysis.summary && (
        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-medium mb-4 text-gray-900">Investment Recommendation</h3>
          <div className="p-5 bg-primary-50 border border-primary-100 rounded-xl">
            <p className="text-gray-800 leading-relaxed">{analysis.summary}</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-center">
        <button
          type="button"
          className="btn btn-secondary text-sm flex items-center"
          onClick={() => setShowRawJson(!showRawJson)}
        >
          {showRawJson ? 'Hide' : 'Show'} Raw JSON
          {showRawJson ? (
            <ChevronUpIcon className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
      </div>
      
      {showRawJson && (
        <div className="mt-4 border rounded-xl overflow-hidden">
          <SyntaxHighlighter language="json" style={docco} customStyle={{ margin: 0, borderRadius: '0.75rem' }}>
            {JSON.stringify(analysis, null, 2)}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
