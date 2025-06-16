import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { mockProperties } from './data/mockProperties';
import PropertyCard from './components/PropertyCard';
import SearchBar from './components/SearchBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PropertyModal from './components/PropertyModal';
import Loader from './components/Loader';
import AboutPage from './pages/AboutPage';
import ContactUs from './pages/ContactUs';
import BackButton from './components/BackButton';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './context/AuthContext.jsx'; 


function App() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    type: 'all',
    purpose: 'all'
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
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

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setIsLoading(true);
    
    setTimeout(() => {
      const filtered = properties.filter(property => {
        const locationMatch = property.location.toLowerCase().includes(newFilters.location.toLowerCase());
        const typeMatch = newFilters.type === 'all' || property.type === newFilters.type;
        const purposeMatch = newFilters.purpose === 'all' || property.purpose === newFilters.purpose;
        return locationMatch && typeMatch && purposeMatch;
      });
      setFilteredProperties(filtered);
      setIsLoading(false);
    }, 200);
  };

  const openPropertyModal = (property) => {
    setSelectedProperty(property);
  };

  const closePropertyModal = () => {
    setSelectedProperty(null);
  };

  const HomeContent = () => (
    <main className="flex-grow container mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Welcome to Havenora</h1>
        <p className="text-gray-600 mt-2">Find your dream property in Kerala</p>
      </div>
      
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>
      
      {isLoading ? (
        <Loader />
      ) : (
        <div className="mt-6">
          {filteredProperties.length > 0 ? (
            <>
              {(filters.location || filters.type !== 'all' || filters.purpose !== 'all') && (
                <p className="text-gray-600 mb-4">
                  Showing {filteredProperties.length} properties matching:
                  {filters.location && ` Location: ${filters.location}`}
                  {filters.type !== 'all' && ` Type: ${filters.type}`}
                  {filters.purpose !== 'all' && ` Purpose: ${filters.purpose}`}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map(property => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onClick={() => openPropertyModal(property)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-700">
                {properties.length === 0 ? 'No properties available' : 'No matching properties found'}
              </h3>
              <p className="text-gray-500 mt-2">
                {properties.length === 0 
                  ? 'Please check back later' 
                  : 'Try adjusting your search criteria'}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );

  return (
    <AuthProvider> 
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">    
      <Navbar />
      
      <Routes>
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomeContent />} />
      </Routes>
      
      <Footer />
      
      <BackButton />

      {selectedProperty && (
        <PropertyModal 
          property={selectedProperty} 
          onClose={closePropertyModal} 
        />
      )}
    </div>
    </AuthProvider>
  );
}

export default App;
