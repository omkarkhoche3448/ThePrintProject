import React, { useState, useCallback, useEffect } from 'react';
import { useUser, SignedIn, useClerk } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  Lock, 
  Sun, 
  Moon, 
  LogOut, 
  FileText, 
  Settings, 
  CreditCard 
} from 'lucide-react';
import { motion } from 'framer-motion';
import CryptoJS from 'crypto-js';

// Component Imports
import { FileUploader } from '../components/FileUploader';
import { PageSelector } from '../components/PageSelector';
import { PrintOptionsForm } from '../components/PrintOptionsForm';
import { PriceCalculator } from '../components/PriceCalculator';
import { ShopkeeperSelector } from '../components/ShopkeeperSelector';

// Utility Imports
import { getPageCount, generateThumbnail } from '../utils/pdfUtils';
import { calculatePrice } from '../utils/pricing';

// Type Imports
import type { PrintFile, PrintOptions } from '../types/print';

// Default Print Options
const defaultPrintOptions: PrintOptions = {
  paperSize: 'A4',
  colorMode: 'BlackAndWhite',
  doubleSided: false,
  copies: 1,
  paperType: 'Standard',
  isPriority: false, // Add this line
};

interface Shopkeeper {
  _id: string;
  name: string;
  printCosts: {
    blackAndWhite: number;
    color: number;
  };
  priorityRate: number; // Add this line
  discountRules: Array<{
    discountPercentage: number;
    minimumOrderAmount: number;
  }>;
  shopHours: {
    [key: string]: { open: string; close: string };
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

function PrintPage() {
  // Persistent theme state with localStorage
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
           (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // State Management
  const [files, setFiles] = useState<PrintFile[]>([]);
  const [globalOptions, setGlobalOptions] = useState<PrintOptions>(defaultPrintOptions);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState<Shopkeeper | null>(null);
  const [isPriorityOrder, setIsPriorityOrder] = useState(false); // Add new state for global priority

  // Clerk User Context
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

  // File Processing Handler
  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    setIsProcessing(true);
    setError(null);
    try {
      const processedFiles = await Promise.all(
        newFiles.map(async (file) => {
          try {
            const pageCount = await getPageCount(file);
            const thumbnail = await generateThumbnail(file);
            return {
              id: crypto.randomUUID(),
              file,
              pageCount,
              selectedPages: `1-${pageCount}`,
              thumbnail,
              options: { ...globalOptions },
              price: calculatePrice(
                pageCount, 
                globalOptions, 
                `1-${pageCount}`,
                selectedShopkeeper
              ),
            };
          } catch (error) {
            throw new Error(`Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        })
      );
      setFiles((prev) => [...prev, ...processedFiles]);
    } catch (error) {
      console.error('Error processing files:', error);
      setError(error instanceof Error ? error.message : 'Failed to process PDF files');
    } finally {
      setIsProcessing(false);
    }
  }, [globalOptions, selectedShopkeeper]);

  // File Removal Handler
  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  // Page Selection Handler
  const handlePageSelection = useCallback((id: string, pages: string) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.id === id) {
          const updatedFile = {
            ...file,
            selectedPages: pages,
          };
          updatedFile.price = calculatePrice(
            file.pageCount,
            file.options,
            pages,
            selectedShopkeeper
          );
          return updatedFile;
        }
        return file;
      })
    );
  }, [selectedShopkeeper]);

  // Individual File Options Handler
  const handleOptionsChange = useCallback((id: string, options: PrintOptions) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.id === id) {
          const updatedFile = {
            ...file,
            options,
          };
          updatedFile.price = calculatePrice(
            file.pageCount,
            options,
            file.selectedPages,
            selectedShopkeeper
          );
          return updatedFile;
        }
        return file;
      })
    );
  }, [selectedShopkeeper]);

  // Global Options Change Handler
  const handleGlobalOptionsChange = useCallback((options: PrintOptions) => {
    setGlobalOptions(options);
    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        options,
        price: calculatePrice(file.pageCount, options, file.selectedPages),
      }))
    );
  }, []);

  // Apply Global Options to All Files
  const applyGlobalOptions = useCallback(() => {
    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        options: globalOptions,
        price: calculatePrice(file.pageCount, globalOptions, file.selectedPages),
      }))
    );
  }, [globalOptions]);

  // Checkout Handler
  const handleCheckout = useCallback(() => {
    if (!user) return;

    const orderData = {
      userId: user.id,
      userName: user.fullName || user.username,
      userEmail: user.emailAddresses[0]?.emailAddress,
      files: files.map((file) => ({
        name: file.file.name,
        pageCount: file.pageCount,
        selectedPages: file.selectedPages,
        options: file.options,
        price: file.price,
      })),
      totalPrice: files.reduce((sum, file) => sum + file.price, 0),
      timestamp: new Date().toISOString(),
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(orderData),
      'print-order-secret'
    ).toString();

    console.log('Encrypted order data:', encryptedData);
  }, [files, user]);

  // Theme toggle method
  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
  };

  // Logout handler
  const handleLogout = () => {
    signOut(() => navigate('/'));
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
              </div>
            )}

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

      {/* Main Content */}
      <div className={`pt-24 min-h-screen
        ${isDarkTheme ? 'bg-[#121212] text-white' : 'bg-white text-black'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Existing print page content goes here, maintaining the previous implementation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <ShopkeeperSelector
                onSelect={setSelectedShopkeeper}
                isDarkTheme={isDarkTheme}
              />
              
              <div className={`rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
                <FileUploader
                  onFilesAdded={handleFilesAdded}
                  files={files}
                  onRemoveFile={handleRemoveFile}
                  isDarkTheme={isDarkTheme}
                />
              </div>

              {/* Existing file handling sections */}
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}
                >
                  {/* File details and options sections */}
                  <PageSelector
                    pageCount={file.pageCount}
                    value={file.selectedPages}
                    onChange={(pages) => handlePageSelection(file.id, pages)}
                    isDarkTheme={isDarkTheme}
                  />
                  <PrintOptionsForm
                    options={file.options}
                    onChange={(options) => handleOptionsChange(file.id, options)}
                    isDarkTheme={isDarkTheme}
                    shopkeeper={selectedShopkeeper} // Add this line
                  />
                </div>
              ))}
            </div>

            {/* Checkout Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <PriceCalculator 
                  files={files} 
                  isDarkTheme={isDarkTheme}
                  shopkeeper={selectedShopkeeper}
                  isPriority={isPriorityOrder}
                  onPriorityChange={setIsPriorityOrder}
                />
                
                <button
                  onClick={handleCheckout}
                  disabled={files.length === 0 || isProcessing}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-full text-lg transition-colors
                    ${
                      files.length === 0 || isProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : `${isDarkTheme 
                            ? 'bg-blue-700 text-white hover:bg-blue-600' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`
                    }`}
                >
                  <Lock className="h-6 w-6 mr-2" />
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PrintPage;