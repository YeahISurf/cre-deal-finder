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
  const [modelUsed, setModelUsed] = useState(null);

  const handleAnalysis = async (propertyData) => {
    if (!apiKey) {
      setError('Please enter your OpenAI API key');
      return;
    }

    if (!propertyData.description || propertyData.description.trim() === '') {
      setError('Please enter a property description');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setUsedFallback(false);
    setModelUsed(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          property: propertyData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error + (errorData.message ? ': ' + errorData.message : ''));
      }

      const data = await response.json();
      
      // Extract model information if available
      const usedModel = data.model || 'o1'; // Default to o1 if not specified
      setModelUsed(usedModel);
      
      setResults({
        ...data,
        property: propertyData
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`${err.message}. Using sample analysis as fallback.`);
      
      // Use fallback data after 1 second delay to make it clear something went wrong
      setTimeout(() => {
        setResults({
          ...FALLBACK_ANALYSIS,
          property: propertyData
        });
        setUsedFallback(true);
      }, 1000);
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
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                OpenAI API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="form-input"
              />
              <p className="mt-1 text-xs text-gray-500">
                Your API key is only used for this session and is not stored on our servers.
              </p>
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
                <p className="text-gray-600">Analyzing property with OpenAI's o1 model...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a moment as we use the most advanced model available</p>
              </div>
            ) : results ? (
              <>
                {usedFallback ? (
                  <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                    Note: Using sample analysis due to API issues. For actual analysis, please check your API key or try again later.
                  </div>
                ) : modelUsed && (
                  <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded-md text-sm">
                    Analysis performed using OpenAI's {modelUsed} model
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
