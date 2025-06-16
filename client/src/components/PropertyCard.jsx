import { Link } from 'react-router-dom';

export default function PropertyCard({ property, onClick }) {
  const formatPrice = (price) => {
    if (property.purpose === 'Rent') {
      return `₹${price.toLocaleString()}/month`;
    }
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
      <div 
        className="h-48 overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{property.title}</h3>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-semibold shrink-0">
            {property.type}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.location}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
          {property.bedrooms && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {property.bedrooms} Beds
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {property.bathrooms} Baths
            </div>
          )}
          {property.area && (
            <div className="flex items-center col-span-2">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {property.area}
            </div>
          )}
        </div>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold text-blue-800">{formatPrice(property.price)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              property.purpose === 'Buy' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {property.purpose}
            </span>
          </div>
          
          <Link 
            to={`/properties/${property.id}`}
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}