import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-blue-800">Havenora</span>
        </Link>
        
        <div className="hidden md:flex space-x-6">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/properties?purpose=Buy" 
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Buy
          </Link>
          <Link 
            to="/properties?purpose=Rent" 
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Rent
          </Link>
          <Link 
            to="/add-property" 
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            List Property
          </Link>
          <Link 
            to="/contact" 
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Contact
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link 
            to="/login" 
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}