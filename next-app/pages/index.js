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
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout (increased for model cascade)

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
          property: propertyData,
          model_used: "Sample Analysis (Error Fallback)",
          models_attempted: ["Error occurred during API call"]
        });
        setUsedFallback(true);
      }, 500);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Head>
        <title>PFISH LOBSTER COIN CRE Deal Finder</title>
        <meta name="description" content="AI-powered commercial real estate deal finder" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-3 rounded-2xl shadow-md mr-3">
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-semibold text-gray-900">PFISH LOBSTER COIN CRE</h1>
        </div>
        
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto text-lg">
          Premium AI-powered analysis of commercial real estate listings to identify investment opportunities
          based on seller motivation, transaction complexity, and property characteristics.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-medium mb-6 text-gray-900">Property Analysis</h2>
            
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <div className="flex items-center">
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
                  The system uses GPT-3.5 Turbo for reliable analysis.
                </p>
              )}
            </div>

            <PropertyForm onSubmit={handleAnalysis} isSubmitting={isAnalyzing} />

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl">
                {error}
              </div>
            )}
          </div>

          <div className="card overflow-auto subtle-scroll max-h-[800px]">
            <h2 className="text-2xl font-medium mb-6 text-gray-900 sticky top-0 bg-white pt-1 pb-4 z-10">Analysis Results</h2>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <p className="text-gray-600 mt-6 font-medium">Analyzing property with OpenAI...</p>
                <p className="text-sm text-gray-500 mt-2">Using GPT-3.5 Turbo for reliable analysis</p>
              </div>
            ) : results ? (
              <>
                {(usedFallback || skipAPI) && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-xl">
                    {skipAPI ? 
                      "Using sample analysis mode. For AI-powered analysis, toggle off 'Use Sample Analysis' and enter your OpenAI API key." :
                      "Using sample analysis due to API issues. For actual analysis, please check your API key or try again later."}
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
          <p className="text-gray-500">PFISH LOBSTER COIN CRE Deal Finder &copy; {new Date().getFullYear()}</p>
          <p className="mt-2 text-sm text-gray-400">Powered by OpenAI and Next.js</p>
        </div>
      </footer>
    </div>
  );
}
