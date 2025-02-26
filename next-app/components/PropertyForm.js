import { useState, useEffect } from 'react';

const SAMPLE_PROPERTY = {
  name: 'Retail Strip Center',
  property_type: 'Retail',
  location: 'Suburban Location',
  price: '$3,950,000',
  description: `PRICE REDUCED - OWNER MUST SELL! Retail Strip Center in Prime Location

Offering Summary
Sale Price: $3,950,000 (Reduced from $4,200,000)
Building Size: 15,400 SF
Price/SF: $256.49
Lot Size: 1.2 Acres
Year Built: 1985
Occupancy: 78%

Property Overview
Excellent value-add opportunity in a rapidly developing area! This retail strip center is being offered at below market price due to owner's urgent need to liquidate assets. The current owner is relocating out of state and needs a quick closing.

The property shows significant deferred maintenance but has solid bones and excellent upside potential. Current rents are approximately 15% below market, providing immediate upside for a new owner willing to implement a basic renovation program and more active management.

Property Highlights
- Prime corner location with excellent visibility and traffic counts of 25,000+ vehicles per day
- Below market rents with opportunity to increase by 15-20% upon lease renewal
- Value-add opportunity through renovation and repositioning
- Motivated seller - bring all offers!
- Strong tenant mix with national credit tenant as anchor (5-year lease remaining)
- High-growth area with new development nearby
- Potential for additional pad site development`
};

export default function PropertyForm({ onSubmit, isSubmitting }) {
  const [formType, setFormType] = useState('manual');
  const [property, setProperty] = useState({
    name: '',
    property_type: '',
    location: '',
    price: '',
    description: ''
  });

  useEffect(() => {
    if (formType === 'sample') {
      setProperty(SAMPLE_PROPERTY);
    } else if (formType === 'manual' && JSON.stringify(property) === JSON.stringify(SAMPLE_PROPERTY)) {
      // Only clear if currently showing sample
      setProperty({
        name: '',
        property_type: '',
        location: '',
        price: '',
        description: ''
      });
    }
  }, [formType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProperty(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(property);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <div className="flex border rounded-xl overflow-hidden shadow-sm">
          <button
            type="button"
            className={`flex-1 py-3 transition-colors ${formType === 'manual' ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-sm' : 'bg-gray-50 hover:bg-gray-100'}`}
            onClick={() => setFormType('manual')}
          >
            Enter Manually
          </button>
          <button
            type="button"
            className={`flex-1 py-3 transition-colors ${formType === 'sample' ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-sm' : 'bg-gray-50 hover:bg-gray-100'}`}
            onClick={() => setFormType('sample')}
          >
            Use Sample
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Property Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={property.name}
            onChange={handleInputChange}
            placeholder="Office Building"
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <input
            type="text"
            id="property_type"
            name="property_type"
            value={property.property_type}
            onChange={handleInputChange}
            placeholder="Office, Retail, Industrial, etc."
            className="form-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={property.location}
            onChange={handleInputChange}
            placeholder="City, State"
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price
          </label>
          <input
            type="text"
            id="price"
            name="price"
            value={property.price}
            onChange={handleInputChange}
            placeholder="$1,000,000"
            className="form-input"
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Property Description
        </label>
        <textarea
          id="description"
          name="description"
          value={property.description}
          onChange={handleInputChange}
          rows={10}
          placeholder="Paste the full property listing description here..."
          className="form-input font-light"
        ></textarea>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </div>
        ) : 'Analyze Property'}
      </button>
      
      {!isSubmitting && (
        <p className="mt-3 text-sm text-center text-gray-500">
          Analysis runs the property through multiple AI models for optimal results
        </p>
      )}
    </form>
  );
}
