import { useEffect } from 'react';

export default function PropertyModal({ property, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formatPrice = (price) => {
    if (property.purpose === 'Rent') {
      return `₹${price.toLocaleString()}/month`;
    }
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="h-64 md:h-96 overflow-hidden">
            <img 
              src={property.image} 
              alt={property.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{property.title}</h2>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-blue-800">{formatPrice(property.price)}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                property.purpose === 'Buy' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {property.purpose}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 mt-2 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.location}
          </p>
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {property.bedrooms && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Bedrooms</p>
                <p className="text-lg font-semibold">{property.bedrooms}</p>
              </div>
            )}
            {property.bathrooms && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Bathrooms</p>
                <p className="text-lg font-semibold">{property.bathrooms}</p>
              </div>
            )}
            {property.area && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Area</p>
                <p className="text-lg font-semibold">{property.area}</p>
              </div>
            )}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 text-sm">Type</p>
              <p className="text-lg font-semibold">{property.type}</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Description</h3>
            <p className="text-gray-600">
              Beautiful {property.type.toLowerCase()} located in the heart of {property.location}. This property is perfect for {property.purpose === 'Buy' ? 'ownership' : 'rental'} with its spacious rooms and modern amenities. Contact us for more details and to schedule a viewing.
            </p>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium">
              Express Interest
            </button>
            <button className="flex-1 bg-white text-blue-600 py-3 px-6 rounded-md border border-blue-600 hover:bg-blue-50 transition-colors font-medium">
              Contact Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}