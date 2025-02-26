import { useState } from 'react';
import Head from 'next/head';
import PropertyForm from '../components/PropertyForm';
import AnalysisResults from '../components/AnalysisResults';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

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
        throw new Error(errorData.error || 'Failed to analyze property');
      }

      const data = await response.json();
      setResults({
        ...data,
        property: propertyData
      });
    } catch (err) {
      setError(err.message);
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
                <p className="text-gray-600">Analyzing property with OpenAI...</p>
              </div>
            ) : results ? (
              <AnalysisResults results={results} />
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
