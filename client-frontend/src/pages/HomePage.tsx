import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  FileText, 
  Clock, 
  CreditCard, 
  Sun, 
  Moon, 
  LogIn, 
  UserPlus,
  LogOut 
} from 'lucide-react';
import { useUser, SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = () => {
  // Persistent theme state with localStorage
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
           (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  // Apply dark mode to entire document and localStorage
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

  // System preference change listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only change theme if user hasn't manually set a preference
      if (localStorage.getItem('theme') === null) {
        setIsDarkTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const features = [
    {
      icon: <Printer className="h-10 w-10" />,
      title: "Precision Printing",
      description: "Professional grade printing with unparalleled clarity and quality."
    },
    {
      icon: <FileText className="h-10 w-10" />,
      title: "Universal Formats",
      description: "Seamless support for all document types and layouts."
    },
    {
      icon: <Clock className="h-10 w-10" />,
      title: "Instant Printing",
      description: "Lightning-fast processing with intelligent workflow technology."
    },
    {
      icon: <CreditCard className="h-10 w-10" />,
      title: "Secure Transactions",
      description: "Advanced encryption and protected payment ecosystem."
    }
  ];

  const handleLogout = () => {
    signOut(() => navigate('/'));
  };

  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen transition-colors duration-500 
        ${isDarkTheme 
          ? 'bg-[#121212] text-white' 
          : 'bg-white text-black'
        }`}
    >
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 
          ${isDarkTheme 
            ? 'bg-black/80 text-white' 
            : 'bg-white/80 text-black'
          } backdrop-blur-lg shadow-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Printer className={`h-8 w-8 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-black'}`}>PrintEasy</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <SignedOut>
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/sign-in')}
                  className={`px-5 py-2 rounded-full transition-colors 
                    ${isDarkTheme 
                      ? 'bg-blue-700 text-white hover:bg-blue-600' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                  Log In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/sign-up')}
                  className={`px-5 py-2 rounded-full transition-colors 
                    ${isDarkTheme 
                      ? 'bg-gray-800 text-white hover:bg-gray-700' 
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                    }`}
                >
                  Sign Up
                </motion.button>
              </div>
            </SignedOut>

            <SignedIn>
              {user && (
                <div className="flex items-center space-x-4">
                  <div className={`text-lg font-medium ${isDarkTheme ? 'text-white' : 'text-black'}`}>
                    Hi, {user.firstName || user.username}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </motion.button>
                  <Link
                    to="/orders"
                    className={`inline-block px-6 py-3 rounded-full text-lg transition-colors ml-4
                      ${isDarkTheme 
                        ? 'bg-gray-800 text-white hover:bg-gray-700' 
                        : 'bg-gray-100 text-black hover:bg-gray-200'
                      }`}
                  >
                    My Orders
                  </Link>
                </div>
              )}
            </SignedIn>

            <motion.button
              whileHover={{ rotate: 15 }}
              whileTap={{ rotate: -15 }}
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors 
                ${isDarkTheme 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
            >
              {isDarkTheme ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <header className={`relative pt-24 min-h-screen flex items-center justify-center 
        ${isDarkTheme ? 'bg-[#121212] text-white' : 'bg-white text-black'}`}>
        <div className="max-w-4xl px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-6xl font-bold mb-6 ${isDarkTheme ? 'text-white' : 'text-black'}`}
          >
            Professional Printing. 
            Reimagined.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-2xl mb-10 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Intelligent printing solutions that adapt to your workflow
          </motion.p>
          
          <SignedIn>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                to="/print-page"
                className={`inline-block px-8 py-4 rounded-full text-lg transition-colors
                  ${isDarkTheme 
                    ? 'bg-blue-700 text-white hover:bg-blue-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
              >
                Start Printing
              </Link>
            </motion.div>
          </SignedIn>
          
          <SignedOut>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center space-x-6"
            >
              <button
                onClick={() => navigate('/sign-in')}
                className={`px-8 py-4 rounded-full text-lg transition-colors
                  ${isDarkTheme 
                    ? 'bg-blue-700 text-white hover:bg-blue-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/sign-up')}
                className={`px-8 py-4 rounded-full text-lg border-2 transition-colors
                  ${isDarkTheme 
                    ? 'border-blue-600 text-blue-400 hover:bg-blue-700 hover:text-white' 
                    : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
                  }`}
              >
                Create Account
              </button>
            </motion.div>
          </SignedOut>
        </div>
      </header>

      {/* Features Section */}
      <section className={`py-24 
        ${isDarkTheme ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className={`rounded-2xl p-8 text-center shadow-lg transition-colors duration-300
                  ${isDarkTheme 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-white text-black'
                  }`}
              >
                <div className={`mb-6 flex justify-center 
                  ${isDarkTheme ? 'text-blue-300' : 'text-blue-600'}`}>
                  {feature.icon}
                </div>
                <h3 className={`text-2xl font-bold mb-4 
                  ${isDarkTheme ? 'text-white' : 'text-black'}`}>
                  {feature.title}
                </h3>
                <p className={`
                  ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 
        ${isDarkTheme ? 'bg-[#121212] text-white' : 'bg-white text-black'}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`text-4xl font-bold mb-6 
            ${isDarkTheme ? 'text-white' : 'text-black'}`}>
            Ready to Transform Your Printing Experience?
          </h2>
          <p className={`text-xl mb-10 
            ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
            Seamless, intelligent, and professional printing at your fingertips
          </p>
          
          <SignedOut>
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => navigate('/sign-in')}
                className={`px-8 py-4 rounded-full text-lg transition-colors
                  ${isDarkTheme 
                    ? 'bg-blue-700 text-white hover:bg-blue-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/sign-up')}
                className={`px-8 py-4 rounded-full text-lg border-2 transition-colors
                  ${isDarkTheme 
                    ? 'border-blue-600 text-blue-400 hover:bg-blue-700 hover:text-white' 
                    : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
                  }`}
              >
                Create Account
              </button>
            </div>
          </SignedOut>
          
          <SignedIn>
            <Link
              to="/print-page"
              className={`inline-block px-8 py-4 rounded-full text-lg transition-colors
                ${isDarkTheme 
                  ? 'bg-blue-700 text-white hover:bg-blue-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              Go to Print Page
            </Link>
          </SignedIn>
        </div>
      </section>
    </motion.div>
  );
};

export default HomePage;