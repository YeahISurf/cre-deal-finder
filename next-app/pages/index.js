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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error + (errorData.message ? ': ' + errorData.message : ''));
      }

      const data = await response.json();
      setResults({
        ...data,
        property: propertyData
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`${err.message || 'An error occurred'}. Using sample analysis as fallback.`);
      
      // Use fallback data after a short delay to make it clear something went wrong
      setTimeout(() => {
        setResults({
          ...FALLBACK_ANALYSIS,
          property: propertyData
        });
        setUsedFallback(true);
      }, 500);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>PFISH LOBSTER COIN CRE Deal Finder</title>
        <meta name="description" content="AI-powered commercial real estate deal finder" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-6">
          <BuildingOfficeIcon className="h-8 w-8 text-primary-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-900">PFISH LOBSTER COIN CRE Deal Finder</h1>
        </div>
        
        <p className="text-center text-gray-600 mb-8">
          AI-powered analysis of commercial real estate listings to identify investment opportunities
          based on seller motivation, transaction complexity, and property characteristics.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Property Analysis</h2>
            
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  OpenAI API Key
                </label>
                <div className="flex items-center">
                  <label htmlFor="skipAPI" className="block text-sm font-medium text-gray-700 mr-2">
                    Use Sample Analysis
                  </label>
                  <input
                    type="checkbox"
                    id="skipAPI"
                    checked={skipAPI}
                    onChange={(e) => setSkipAPI(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
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
                <p className="mt-1 text-xs text-gray-500">
                  Using sample analysis mode - no API key required.
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Your API key is only used for this session and is not stored on our servers.
                </p>
              )}
            </div>

            <PropertyForm onSubmit={handleAnalysis} isSubmitting={isAnalyzing} />

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-gray-600">Analyzing property...</p>
              </div>
            ) : results ? (
              <>
                {(usedFallback || skipAPI) && (
                  <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                    {skipAPI ? 
                      "Using sample analysis mode. For AI-powered analysis, uncheck 'Use Sample Analysis' and enter your OpenAI API key." :
                      "Using sample analysis due to API issues. For actual analysis, please check your API key or try again later."}
                  </div>
                )}
                <AnalysisResults results={results} />
              </>
            ) : (
              <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                <p>Enter property details and click &quot;Analyze Property&quot; to see results</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>PFISH LOBSTER COIN CRE Deal Finder &copy; {new Date().getFullYear()}</p>
          <p className="mt-2">Powered by OpenAI and Next.js</p>
        </div>
      </footer>
    </div>
  );
}
