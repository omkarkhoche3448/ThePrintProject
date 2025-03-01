import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, FileText, Clock, CreditCard, Sun, Moon } from 'lucide-react';

const HomePage = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const themeClass = isDarkTheme 
    ? 'bg-gray-900 text-white' 
    : 'bg-gradient-to-br from-blue-50 to-indigo-50';

  const features = [
    {
      icon: <Printer className="h-8 w-8" />,
      title: "High-Quality Printing",
      description: "Professional grade printing services for all your document needs, from simple black and white to premium color prints."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Multiple File Formats",
      description: "Support for various document formats including PDF, ensuring your files are printed exactly as intended."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Quick Turnaround",
      description: "Fast and efficient printing service with options for same-day printing for urgent requirements."
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Secure Payment",
      description: "Safe and encrypted payment processing for all your orders with multiple payment options available."
    }
  ];

  return (
    <div className={`min-h-screen ${themeClass} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Printer className={`h-8 w-8 ${isDarkTheme ? 'text-blue-400' : 'text-blue-500'}`} />
            <h1 className="text-3xl font-bold">PrintService</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className={`p-2 rounded-full ${
                isDarkTheme 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              } shadow-lg transition-colors duration-300`}
            >
              {isDarkTheme ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className={`rounded-lg shadow-lg p-12 mb-12 text-center ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} transform transition-transform duration-300 `}>
          <h2 className="text-4xl font-bold mb-6">Professional Printing Solutions</h2>
          <p className={`text-xl mb-8 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
            Fast, reliable, and high-quality printing services for all your needs
          </p>
          <Link
            to="/print-page"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Printer className="h-5 w-5 mr-2" />
            Start Printing Now
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} transform transition-transform duration-300 `}
            >
              <div className={`mb-4 ${isDarkTheme ? 'text-blue-400' : 'text-blue-500'}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className={isDarkTheme ? 'text-gray-300' : 'text-gray-600'}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className={`rounded-lg shadow-lg p-8 text-center ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} transform transition-transform duration-300 `}>
          <h2 className="text-2xl font-bold mb-4">Ready to start printing?</h2>
          <p className={`mb-6 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
            Upload your documents and get started with our easy-to-use printing service
          </p>
          <Link
            to="/print"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;