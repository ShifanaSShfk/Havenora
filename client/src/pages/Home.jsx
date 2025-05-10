import { useState, useEffect } from 'react';
import { mockProperties } from '../data/mockProperties';
import PropertyCard from '../components/PropertyCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setProperties(mockProperties);
        setFilteredProperties(mockProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleSearch = (filters) => {
    setIsLoading(true);
    setTimeout(() => {
      const filtered = properties.filter(property => {
        const locationMatch = property.location.toLowerCase().includes(filters.location.toLowerCase());
        const typeMatch = filters.type === 'all' || property.type === filters.type;
        const purposeMatch = filters.purpose === 'all' || property.purpose === filters.purpose;
        return locationMatch && typeMatch && purposeMatch;
      });
      setFilteredProperties(filtered);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">Welcome to Havenora</h1>
        <p className="text-xl text-gray-600">Your trusted real estate partner in Kerala</p>
      </div>
      
      <SearchBar onSearch={handleSearch} />
      
      <div className="mt-8">
        {isLoading ? (
          <Loader />
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-700">
              {properties.length === 0 ? 'No properties available' : 'No properties found'}
            </h3>
            <p className="text-gray-500 mt-2">
              {properties.length === 0 
                ? 'Please check back later' 
                : 'Try adjusting your search criteria'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}