import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Printer, Home, Menu, X } from 'lucide-react';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  return (
    <header className="bg-white border-b border-xerox-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Printer className="h-8 w-8 text-xerox-red" />
              <span className="ml-2 text-xl font-bold text-xerox-gray-900">Xerox Wall</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/'
                  ? 'text-xerox-red bg-xerox-gray-50'
                  : 'text-xerox-gray-700 hover:bg-xerox-gray-50 hover:text-xerox-red'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/dashboard'
                  ? 'text-xerox-red bg-xerox-gray-50'
                  : 'text-xerox-gray-700 hover:bg-xerox-gray-50 hover:text-xerox-red'
              }`}
            >
              Dashboard
            </Link>
            <Button size="sm">
              Submit New Job
            </Button>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-xerox-gray-700 hover:text-xerox-red hover:bg-xerox-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-xerox-red"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/'
                  ? 'text-xerox-red bg-xerox-gray-50'
                  : 'text-xerox-gray-700 hover:bg-xerox-gray-50 hover:text-xerox-red'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="inline-block mr-2 h-5 w-5" />
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/dashboard'
                  ? 'text-xerox-red bg-xerox-gray-50'
                  : 'text-xerox-gray-700 hover:bg-xerox-gray-50 hover:text-xerox-red'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Printer className="inline-block mr-2 h-5 w-5" />
              Dashboard
            </Link>
            <div className="pt-2">
              <Button className="w-full">
                Submit New Job
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;