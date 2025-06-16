import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockProperties } from '../data/mockProperties';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundProperty = mockProperties.find(p => p.id === parseInt(id));
        if (foundProperty) {
          setProperty(foundProperty);
        } else {
          navigate('/not-found');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const formatPrice = (price) => {
    if (property.purpose === 'Rent') {
      return `₹${price.toLocaleString()}/month`;
    }
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 mb-6 hover:text-blue-800"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Properties
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative">
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
              {property.description || `Beautiful ${property.type.toLowerCase()} located in the heart of ${property.location}. This property is perfect for ${property.purpose === 'Buy' ? 'ownership' : 'rental'} with its spacious rooms and modern amenities. Contact us for more details and to schedule a viewing.`}
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