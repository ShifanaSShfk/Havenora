// src/components/BackButton.jsx
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function BackButton() {
  const location = useLocation();
  
  if (location.pathname === '/') return null;

  return (
    <div className="fixed bottom-8 right-8 z-40 group">
      <div className="relative">
        <Link 
          to="/" 
          className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-[-4deg]"
          aria-label="Go back to home"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
        
        {/* Enhanced Tooltip */}
        <div className="absolute right-16 bottom-0 bg-white text-gray-800 text-sm font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-1 pointer-events-none border border-gray-100">
          Back to Homepage
          <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-gray-100 rotate-45"></div>
        </div>
      </div>
      
      {/* Subtle floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .group:hover .relative {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}