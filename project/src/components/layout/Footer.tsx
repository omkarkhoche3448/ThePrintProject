import React from 'react';
import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-xerox-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center">
              <Printer className="h-8 w-8 text-xerox-red" />
              <span className="ml-2 text-xl font-bold">Xerox Wall</span>
            </Link>
            <p className="mt-4 text-sm text-xerox-gray-400">
              The campus printing solution that makes document printing fast, reliable, and hassle-free.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Services</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-xerox-gray-400 hover:text-white">Print Documents</a>
              </li>
              <li>
                <a href="#" className="text-sm text-xerox-gray-400 hover:text-white">Scan to Email</a>
              </li>
              <li>
                <a href="#" className="text-sm text-xerox-gray-400 hover:text-white">Binding Services</a>
              </li>
              <li>
                <a href="#" className="text-sm text-xerox-gray-400 hover:text-white">Custom Formats</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-xerox-gray-400 hover:text-white">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-sm text-xerox-gray-400 hover:text-white">FAQs</a>
              </li>
              <li>
                <a href="#" className="text-sm text-xerox-gray-400 hover:text-white">Contact Support</a>
              </li>
              <li>
                <a href="#" className="text-sm text-xerox-gray-400 hover:text-white">Pricing</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Locations</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-xerox-gray-400 hover:text-white">Library</a>
              </li>
              <li>
                <a href="#" className="text-sm text-xerox-gray-400 hover:text-white">Student Center</a>
              </li>
              <li>
                <a href="#" className="text-sm text-xerox-gray-400 hover:text-white">Engineering Building</a>
              </li>
              <li>
                <a href="#" className="text-sm text-xerox-gray-400 hover:text-white">Computer Labs</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-xerox-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-xerox-gray-400">
            &copy; {new Date().getFullYear()} Xerox Wall. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-xerox-gray-400 hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="text-xerox-gray-400 hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;