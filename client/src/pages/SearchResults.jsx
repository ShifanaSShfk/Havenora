import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockProperties } from '../data/mockProperties';
import PropertyCard from '../components/PropertyCard';
import Loader from '../components/Loader';

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        // Simulate API call with search params
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const searchParams = new URLSearchParams(location.search);
        const locationQuery = searchParams.get('location') || '';
        const typeQuery = searchParams.get('type') || 'all';
        const purposeQuery = searchParams.get('purpose') || 'all';

        const filtered = mockProperties.filter(property => {
          const locationMatch = property.location.toLowerCase().includes(locationQuery.toLowerCase());
          const typeMatch = typeQuery === 'all' || property.type === typeQuery;
          const purposeMatch = purposeQuery === 'all' || property.purpose === purposeQuery;
          return locationMatch && typeMatch && purposeMatch;
        });

        setProperties(filtered);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [location.search]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Search Results</h1>
      
      {isLoading ? (
        <Loader />
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              onClick={() => navigate(`/properties/${property.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-2xl font-semibold text-gray-700">No properties found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}