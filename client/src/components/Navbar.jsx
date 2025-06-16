// src/components/Navbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Branding */}
          <Link to="/" className="text-2xl font-serif font-bold text-blue-800 tracking-tight flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            HAVENORA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="group flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mr-2 group-hover:bg-blue-100 transition-colors">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Contact</span>
            </Link>

            <div className="flex space-x-3">
              <Link 
                to="/login" 
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-3 pb-2 space-y-2">
            <Link 
              to="/about" 
              className="block px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            
            <Link 
              to="/contact" 
              className="block px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span>Contact Us</span>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <Link 
                to="/login" 
                className="px-4 py-2 text-center text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}