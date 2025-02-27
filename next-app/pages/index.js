import { useState } from 'react';
import Head from 'next/head';
import PropertyForm from '../components/PropertyForm';
import AnalysisResults from '../components/AnalysisResults';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

// Fallback mock data in case the API fails completely
const FALLBACK_ANALYSIS = {
  seller_motivation_score: 8.5,
  transaction_complexity_score: 6.0,
  property_characteristics_score: 7.5,
  total_score: 7.4,
  model_used: "Sample Analysis",
  models_attempted: ["No models attempted"],
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

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [usedFallback, setUsedFallback] = useState(false);
  const [skipAPI, setSkipAPI] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [rawResponse, setRawResponse] = useState('');

  const handleAnalysis = async (propertyData) => {
    if (!apiKey && !skipAPI) {
      setError('Please enter your OpenAI API key or use Sample Analysis mode');
      return;
    }

    if (!propertyData.description || propertyData.description.trim() === '') {
      setError('Please enter a property description');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setUsedFallback(false);
    setDebugInfo(null);
    setRawResponse('');
    setResults(null);

    // If skipAPI is true, use the fallback analysis directly
    if (skipAPI) {
      setTimeout(() => {
        setResults({
          ...FALLBACK_ANALYSIS,
          property: propertyData
        });
        setUsedFallback(true);
        setIsAnalyzing(false);
      }, 1000); // Small delay to simulate processing
      return;
    }

    try {
      const start = Date.now();
      console.log('Starting API request at:', new Date().toISOString());
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for model cascade

      const response = await fetch('/api/analyze', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          property: propertyData
        }),
      });

      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Get raw text response first
      const text = await response.text();
      console.log('Raw response body (first 500 chars):', text.substring(0, 500));
      
      // Store the raw response for debugging
      setRawResponse(text);
      
      // If the response is empty
      if (!text || text.trim() === '') {
        throw new Error('Empty response received from server');
      }
      
      let data;
      try {
        // Try to parse as JSON
        data = JSON.parse(text);
        console.log('Parsed JSON data successfully');
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Non-JSON response received');
        throw new Error(`Server returned invalid JSON response: ${text.substring(0, 100)}...`);
      }
      
      // Check if it's an error response
      if (data.error === true) {
        console.error('API returned error object:', data);
        setDebugInfo(data);
        throw new Error(`API Error: ${data.error_message || 'Unknown error'}`);
      }

      // If we got this far, we have valid JSON data
      console.log(`Request completed in ${Date.now() - start}ms`);
      
      // Calculate total score if not provided
      if (!data.total_score && !data.scores?.totalWeightedScore && !data.scores?.total_weighted_score) {
        // Extract scores from different possible formats
        const sellerScore = data.seller_motivation_score || 
                           (data.scores && data.scores.sellerMotivation) || 
                           (data.scores && data.scores.seller_motivation) ||
                           (data.seller_motivation && data.seller_motivation.score) || 0;
        
        const complexityScore = data.transaction_complexity_score || 
                               (data.scores && data.scores.transactionComplexity) || 
                               (data.scores && data.scores.transaction_complexity) ||
                               (data.transaction_complexity && data.transaction_complexity.score) || 0;
        
        const propertyScore = data.property_characteristics_score || 
                             (data.scores && data.scores.propertyCharacteristics) || 
                             (data.scores && data.scores.property_characteristics) ||
                             (data.property_characteristics && data.property_characteristics.score) || 0;
        
        // Calculate weighted average (40% seller, 20% complexity, 40% property)
        const totalScore = (sellerScore * 0.4) + (complexityScore * 0.2) + (propertyScore * 0.4);
        
        // Add total score to data
        data.total_score = parseFloat(totalScore.toFixed(1));
      }
      
      setResults({
        ...data,
        property: propertyData
      });
    } catch (err) {
      console.error('Analysis error:', err);
      
      // Display detailed error info
      setError(`Error: ${err.message || 'An unknown error occurred'}`);
      
      // Store raw response in debug info if it's not already JSON
      if (rawResponse && !debugInfo) {
        try {
          // Try to see if it's valid JSON first
          JSON.parse(rawResponse);
        } catch (e) {
          // If not valid JSON, show the raw response
          setDebugInfo({
            error: true,
            message: "Raw server response (not valid JSON)",
            raw_response: rawResponse
          });
        }
      }
      
      // If the error was due to a timeout, mention that specifically
      if (err.name === 'AbortError') {
        setError('Request timed out after 60 seconds. The server might be overloaded or the analysis is taking too long.');
      }
      
      // Don't use fallback data anymore - show the actual error
      setUsedFallback(false);
      setResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Head>
        <title>PFISH CRE AI DEAL FINDER</title>
        <meta name="description" content="AI-powered commercial real estate deal finder" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-center mb-8 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-3 rounded-2xl shadow-md mr-0 sm:mr-3 mb-3 sm:mb-0">
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">PFISH CRE AI DEAL FINDER</h1>
        </div>
        
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto text-base sm:text-lg px-2">
          Premium AI-powered analysis of commercial real estate listings to identify investment opportunities
          based on seller motivation, transaction complexity, and property characteristics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="card">
            <h2 className="text-xl sm:text-2xl font-medium mb-6 text-gray-900">Property Analysis</h2>
            
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <div className="flex items-center mt-2 sm:mt-0">
                  <label htmlFor="skipAPI" className="block text-sm font-medium text-gray-700 mr-2">
                    Use Sample Analysis
                  </label>
                  <div className="relative inline-block h-6 w-12 cursor-pointer rounded-full bg-gray-200 transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2">
                    <input 
                      type="checkbox" 
                      id="skipAPI" 
                      className="sr-only" 
                      checked={skipAPI} 
                      onChange={(e) => setSkipAPI(e.target.checked)} 
                    />
                    <span 
                      aria-hidden="true" 
                      className={`${skipAPI ? 'translate-x-6 bg-primary-500' : 'translate-x-0 bg-white'} pointer-events-none inline-block h-6 w-6 transform rounded-full shadow ring-0 transition ease-in-out duration-200 border`} 
                    />
                  </div>
                </div>
              </div>
              
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="form-input"
                disabled={skipAPI}
              />
              
              {skipAPI ? (
                <p className="mt-2 text-sm text-gray-500">
                  Using sample analysis mode - no API key required.
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  Your API key is only used for this session and is not stored on our servers. 
                  The system uses a cascade of o1 → o1-mini → GPT-3.5-Turbo models.
                </p>
              )}
            </div>

            <PropertyForm onSubmit={handleAnalysis} isSubmitting={isAnalyzing} />

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl">
                <h3 className="font-bold text-lg mb-2">Error:</h3>
                <p>{error}</p>
              </div>
            )}
            
            {/* Debug Information Section */}
            {(debugInfo || rawResponse) && (
              <div className="mt-6 p-4 bg-gray-100 border border-gray-300 text-gray-800 rounded-xl">
                <h3 className="font-bold text-lg mb-2">Debug Information:</h3>
                
                {debugInfo && (
                  <pre className="text-xs overflow-auto max-h-96 p-2 bg-gray-900 text-gray-200 rounded mb-4">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                )}
                
                {rawResponse && !debugInfo && (
                  <div>
                    <h4 className="font-semibold mb-1">Raw Server Response:</h4>
                    <pre className="text-xs overflow-auto max-h-40 p-2 bg-gray-900 text-gray-200 rounded">
                      {rawResponse.substring(0, 1000)}{rawResponse.length > 1000 ? '...' : ''}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card overflow-auto subtle-scroll max-h-[600px] md:max-h-[800px]">
            <h2 className="text-xl sm:text-2xl font-medium mb-6 text-gray-900 sticky top-0 bg-white pt-1 pb-4 z-10">Analysis Results</h2>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <p className="text-gray-600 mt-6 font-medium">Analyzing property with OpenAI...</p>
                <p className="text-sm text-gray-500 mt-2">Using model cascade: o1 → o1-mini → GPT-3.5-Turbo</p>
              </div>
            ) : results ? (
              <>
                {(usedFallback || skipAPI) && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-xl">
                    {skipAPI ? 
                      "Using sample analysis mode. For AI-powered analysis, toggle off 'Use Sample Analysis' and enter your OpenAI API key." :
                      "API error occurred. Check error details above for debugging information."}
                  </div>
                )}
                <AnalysisResults results={results} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
                <BuildingOfficeIcon className="h-12 w-12 mb-4 text-gray-300" />
                <p>Enter property details and click "Analyze Property" to see results</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 py-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">PFISH CRE AI DEAL FINDER &copy; {new Date().getFullYear()}</p>
          <p className="mt-2 text-sm text-gray-400">Powered by OpenAI and Next.js</p>
        </div>
      </footer>
    </div>
  );
}
