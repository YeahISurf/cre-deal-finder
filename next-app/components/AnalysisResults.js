import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

SyntaxHighlighter.registerLanguage('json', json);

function ScoreCard({ title, score, className }) {
  const scoreClass = score >= 7 ? 'score-high' : score >= 4 ? 'score-medium' : 'score-low';
  
  return (
    <div className={`score-card ${scoreClass} ${className}`}>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-3xl font-bold">{score.toFixed(1)}</p>
      <p className="text-sm mt-1">out of 10</p>
    </div>
  );
}

function ExpandableSection({ title, content, keywords = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="border rounded-md mb-4 overflow-hidden">
      <button
        className="w-full p-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium">{title}</h3>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4">
          <p className="text-gray-700 mb-3">{content}</p>
          
          {keywords.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Keywords Detected:</h4>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
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
  
  const { property, model_used, models_attempted, ...analysis } = results;
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{property.name}</h3>
        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
          <div><span className="font-medium">Type:</span> {property.property_type}</div>
          <div><span className="font-medium">Location:</span> {property.location}</div>
          <div><span className="font-medium">Price:</span> {property.price}</div>
        </div>
      </div>
      
      {model_used && (
        <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
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
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Scores</h3>
        <div className="grid grid-cols-4 gap-3">
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
            className="border-2 border-primary-200" 
          />
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Detailed Analysis</h3>
        
        <ExpandableSection 
          title="Seller Motivation" 
          content={analysis.seller_motivation_analysis.explanation}
          keywords={analysis.seller_motivation_analysis.keywords}
        />
        
        <ExpandableSection 
          title="Transaction Complexity" 
          content={analysis.transaction_complexity_analysis.explanation}
          keywords={analysis.transaction_complexity_analysis.keywords}
        />
        
        <ExpandableSection 
          title="Property Characteristics" 
          content={analysis.property_characteristics_analysis.explanation}
          keywords={analysis.property_characteristics_analysis.keywords}
        />
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Investment Recommendation</h3>
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-md">
          <p className="text-gray-800">{analysis.summary}</p>
        </div>
      </div>
      
      <div>
        <button
          type="button"
          className="btn btn-secondary text-sm"
          onClick={() => setShowRawJson(!showRawJson)}
        >
          {showRawJson ? 'Hide' : 'Show'} Raw JSON
        </button>
        
        {showRawJson && (
          <div className="mt-3 border rounded-md overflow-hidden">
            <SyntaxHighlighter language="json" style={docco} customStyle={{ margin: 0 }}>
              {JSON.stringify(analysis, null, 2)}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
}
