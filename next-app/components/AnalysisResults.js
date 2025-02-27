import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

SyntaxHighlighter.registerLanguage('json', json);

function ScoreCard({ title, score = 0, className }) {
  // Default to 0 if score is undefined
  const safeScore = typeof score === 'number' ? score : 0;
  const scoreClass = safeScore >= 7 ? 'score-high' : safeScore >= 4 ? 'score-medium' : 'score-low';
  
  return (
    <div className={`score-card ${scoreClass} ${className}`}>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-4xl font-semibold">{safeScore.toFixed(1)}</p>
      <p className="text-xs mt-1 text-gray-500 font-medium">out of 10</p>
    </div>
  );
}

function ExpandableSection({ title, content, keywords = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden bg-white shadow-sm">
      <button
        className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-5">
          <p className="text-gray-700 mb-4 leading-relaxed">{content}</p>
          
          {keywords.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Keywords Detected:</h4>
              <div className="flex flex-wrap gap-2">
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
  
  // Handle different API response formats
  // Create a normalized analysis object that works with both formats
  const analysis = {
    // Handle scores
    seller_motivation_score: rawAnalysis.seller_motivation_score || 
                             (rawAnalysis.scores && rawAnalysis.scores.sellerMotivation) || 
                             (rawAnalysis.scores && rawAnalysis.scores.seller_motivation) || 0,
    transaction_complexity_score: rawAnalysis.transaction_complexity_score || 
                                 (rawAnalysis.scores && rawAnalysis.scores.transactionComplexity) || 
                                 (rawAnalysis.scores && rawAnalysis.scores.transaction_complexity) || 0,
    property_characteristics_score: rawAnalysis.property_characteristics_score || 
                                   (rawAnalysis.scores && rawAnalysis.scores.propertyCharacteristics) || 
                                   (rawAnalysis.scores && rawAnalysis.scores.property_characteristics) || 0,
    total_score: rawAnalysis.total_score || 
                (rawAnalysis.scores && rawAnalysis.scores.totalWeightedScore) || 
                (rawAnalysis.scores && rawAnalysis.scores.total_weighted_score) || 0,
    
    // Handle explanations
    seller_motivation_analysis: rawAnalysis.seller_motivation_analysis || 
                               (rawAnalysis.explanations && { 
                                 explanation: rawAnalysis.explanations.seller_motivation,
                                 keywords: rawAnalysis.keywords?.seller_motivation || []
                               }) ||
                               (rawAnalysis.analysis && {
                                 explanation: rawAnalysis.analysis.sellerMotivationExplanation,
                                 keywords: rawAnalysis.keywords?.sellerMotivation || []
                               }),
    transaction_complexity_analysis: rawAnalysis.transaction_complexity_analysis || 
                                    (rawAnalysis.explanations && {
                                      explanation: rawAnalysis.explanations.transaction_complexity,
                                      keywords: rawAnalysis.keywords?.transaction_complexity || []
                                    }) ||
                                    (rawAnalysis.analysis && {
                                      explanation: rawAnalysis.analysis.transactionComplexityExplanation,
                                      keywords: rawAnalysis.keywords?.transactionComplexity || []
                                    }),
    property_characteristics_analysis: rawAnalysis.property_characteristics_analysis || 
                                      (rawAnalysis.explanations && {
                                        explanation: rawAnalysis.explanations.property_characteristics,
                                        keywords: rawAnalysis.keywords?.property_characteristics || []
                                      }) ||
                                      (rawAnalysis.analysis && {
                                        explanation: rawAnalysis.analysis.propertyCharacteristicsExplanation,
                                        keywords: rawAnalysis.keywords?.propertyCharacteristics || []
                                      }),
    
    // Handle summary
    summary: rawAnalysis.summary || 
            (rawAnalysis.explanations && rawAnalysis.explanations.overall_analysis) ||
            (rawAnalysis.analysis && rawAnalysis.analysis.overallAnalysis)
  };
  
  return (
    <div>
      {property && (
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-3 text-gray-900">{property.name || 'Unnamed Property'}</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
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
        <h3 className="text-xl font-medium mb-4 text-gray-900">Scores</h3>
        <div className="grid grid-cols-4 gap-4">
          <ScoreCard 
            title="Seller Motivation" 
            score={analysis.seller_motivation_score} 
          />
          <ScoreCard 
            title="Transaction Complexity" 
            score={analysis.transaction_complexity_score} 
          />
          <ScoreCard 
            title="Property Characteristics" 
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
        <h3 className="text-xl font-medium mb-4 text-gray-900">Detailed Analysis</h3>
        
        <ExpandableSection 
          title="Seller Motivation" 
          content={analysis.seller_motivation_analysis?.explanation || "No explanation available"}
          keywords={analysis.seller_motivation_analysis?.keywords || []}
        />
        
        <ExpandableSection 
          title="Transaction Complexity" 
          content={analysis.transaction_complexity_analysis?.explanation || "No explanation available"}
          keywords={analysis.transaction_complexity_analysis?.keywords || []}
        />
        
        <ExpandableSection 
          title="Property Characteristics" 
          content={analysis.property_characteristics_analysis?.explanation || "No explanation available"}
          keywords={analysis.property_characteristics_analysis?.keywords || []}
        />
      </div>
      
      {analysis.summary && (
        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4 text-gray-900">Investment Recommendation</h3>
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
