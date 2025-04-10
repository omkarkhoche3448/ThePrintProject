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
  CreditCard,
  ClipboardList,
  ChevronRight,
  Upload,
  AlertCircle,
  Clock,
  Check
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

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
  isPriority: false,
};

interface Shopkeeper {
  _id: string;
  name: string;
  printCosts: {
    blackAndWhite: number;
    color: number;
  };
  priorityRate: number;
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
  // Theme state with localStorage
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
  const [isPriorityOrder, setIsPriorityOrder] = useState(false);
  const [uploadHovered, setUploadHovered] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Clerk User Context
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  
  // Scroll animations
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);

  // Apply theme to document and localStorage
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

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
  const handleCheckout = useCallback(async () => {
    if (!user || !selectedShopkeeper) {
      setError("Please select a shopkeeper and ensure you're logged in");
      return;
    }
  
    try {
      setIsProcessing(true);
      const formData = new FormData();
  
      // Add order metadata
      const orderMetadata = {
        userId: user.id,
        userName: user.fullName || user.username,
        userEmail: user.emailAddresses[0]?.emailAddress,
        shopkeeperId: selectedShopkeeper._id,
        isPriorityOrder,
        totalPrice: files.reduce((sum, file) => sum + file.price, 0),
        timestamp: new Date().toISOString()
      };
      formData.append('orderMetadata', JSON.stringify(orderMetadata));
  
      // Add files and their configurations
      files.forEach((file, index) => {
        // Append the actual file
        formData.append(`file${index}`, file.file);
        
        // Append file configuration
        const fileConfig = {
          fileName: file.file.name,
          pageCount: file.pageCount,
          selectedPages: file.selectedPages,
          options: file.options,
          price: file.price
        };
        formData.append(`fileConfig${index}`, JSON.stringify(fileConfig));
      });
  
      // Send the request to your backend
      const response = await fetch(`http://localhost:3000/orders/create`, {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
  
      const orderData = await response.json();
      
      // Show confirmation modal instead of redirecting immediately
      setShowConfirmationModal(true);
      
      // Start countdown for auto-redirect
      setRedirectCountdown(5);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process order');
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [files, user, selectedShopkeeper, isPriorityOrder, navigate]);

  // Handle countdown and redirect
  useEffect(() => {
    let timer;
    if (showConfirmationModal && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
    } else if (showConfirmationModal && redirectCountdown === 0) {
      // Redirect to orders page
      navigate('/orders');
    }
    return () => clearTimeout(timer);
  }, [showConfirmationModal, redirectCountdown, navigate]);

  // Theme toggle method
  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
  };

  // Logout handler
  const handleLogout = () => {
    signOut(() => navigate('/'));
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 
      ${isDarkTheme 
        ? 'bg-[#0a0a0a] text-white' 
        : 'bg-[#f5f5f7] text-[#1d1d1f]'
      }`}
    >
      {/* Glassmorphic Navigation */}
      <motion.nav 
        style={{ opacity: headerOpacity }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl
          ${isDarkTheme 
            ? 'bg-black/30 border-b border-white/5' 
            : 'bg-white/30 border-b border-black/5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link to="/">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Printer className={`h-7 w-7 ${isDarkTheme ? 'text-white' : 'text-[#1d1d1f]'}`} />
              <h1 className="text-xl font-medium tracking-tight">PrintEasy</h1>
            </motion.div>
          </Link>
          
          <div className="flex items-center space-x-8">
            {user && (
              <div className="flex items-center space-x-6">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm font-medium px-4 py-2 rounded-full
                    ${isDarkTheme ? 'bg-white/10' : 'bg-black/5'}`}>
                  Hello, {user.firstName || user.username}
                </motion.div>
                
                <Link
                  to="/orders"
                  className={`hidden md:flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all
                    ${isDarkTheme 
                      ? 'bg-white/10 hover:bg-white/20' 
                      : 'bg-black/5 hover:bg-black/10'
                    }`}
                >
                  <span>My Orders</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className={`p-2.5 rounded-full transition-all
                    ${isDarkTheme 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    }`}
                >
                  <LogOut className="h-5 w-5" />
                </motion.button>
              </div>
            )}

            <motion.button
              whileHover={{ rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-all
                ${isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20' 
                  : 'bg-black/5 hover:bg-black/10'
                }`}
            >
              {isDarkTheme 
                ? <Sun className="h-5 w-5 text-yellow-300" /> 
                : <Moon className="h-5 w-5 text-blue-700" />
              }
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-3xl md:text-4xl font-medium mb-2 tracking-tight text-center
              ${isDarkTheme ? 'text-white' : 'text-[#1d1d1f]'}`}
          >
            Perfect Prints. Precise Control.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-lg text-center max-w-3xl mx-auto mb-16
              ${isDarkTheme ? 'text-white/70' : 'text-[#1d1d1f]/70'}`}
          >
            Configure your documents with premium options for exceptional results.
          </motion.p>
          
          {/* Error alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl flex items-start space-x-3
                  ${isDarkTheme 
                    ? 'bg-red-900/30 border border-red-800/50 text-red-200' 
                    : 'bg-red-50 border border-red-100 text-red-800'
                  }`}
              >
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">An error occurred</h3>
                  <p className={`text-sm ${isDarkTheme ? 'text-red-300/80' : 'text-red-700/80'}`}>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Main grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column - Upload and configuration */}
            <div className="lg:col-span-8 space-y-8">
              {/* Shop selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`rounded-2xl overflow-hidden backdrop-blur-lg border
                  ${isDarkTheme 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-white/80 border-black/5 shadow-lg'
                  }`}
              >
                <div className="p-6">
                  <h2 className="text-xl font-medium mb-6">Select Print Shop</h2>
                  <ShopkeeperSelector
                    onSelect={setSelectedShopkeeper}
                    isDarkTheme={isDarkTheme}
                  />
                </div>
              </motion.div>
              
              {/* File Upload Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`rounded-2xl overflow-hidden backdrop-blur-lg border relative
                  ${isDarkTheme 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-white/80 border-black/5 shadow-lg'
                  }`}
                onMouseEnter={() => setUploadHovered(true)}
                onMouseLeave={() => setUploadHovered(false)}
              >
                {/* Glassmorphic decorative elements */}
                <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full blur-3xl opacity-10 bg-blue-500" />
                <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full blur-3xl opacity-10 bg-purple-500" />
                
                <div className="p-6 relative z-10">
                  <h2 className="text-xl font-medium mb-6">Upload Documents</h2>
                  <FileUploader
                    onFilesAdded={handleFilesAdded}
                    files={files}
                    onRemoveFile={handleRemoveFile}
                    isDarkTheme={isDarkTheme}
                  />
                </div>
                
                {/* Floating action button for upload (visible on hover) */}
                <AnimatePresence>
                  {uploadHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute bottom-6 right-6"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <button
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                          ${isDarkTheme 
                            ? 'bg-white text-black hover:bg-white/90' 
                            : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                          }`}
                      >
                        <Upload className="h-4 w-4" />
                        <span>Add More</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* File configurations */}
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                  className={`rounded-2xl overflow-hidden backdrop-blur-lg border
                    ${isDarkTheme 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-white/80 border-black/5 shadow-lg'
                    }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${isDarkTheme ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                          <FileText className={`h-5 w-5 ${isDarkTheme ? 'text-blue-300' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{file.file.name}</h3>
                          <p className={`text-sm ${isDarkTheme ? 'text-white/60' : 'text-black/60'}`}>
                            {file.pageCount} pages • {Math.round(file.file.size / 1024)} KB
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className={`p-1.5 rounded-full transition-colors
                          ${isDarkTheme 
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                            : 'bg-red-100 text-red-500 hover:bg-red-200'
                          }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                    
                    <div className={`p-4 rounded-xl mb-4 
                      ${isDarkTheme ? 'bg-black/30' : 'bg-gray-50'}`}>
                      {/* File preview/thumbnail would go here */}
                      {file.thumbnail && (
                        <img 
                          src={file.thumbnail} 
                          alt={`Preview of ${file.file.name}`}
                          className="h-32 mx-auto object-contain rounded-lg"
                        />
                      )}
                    </div>
                    
                    {/* Page selector and print options sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className={`text-sm font-medium mb-3 ${isDarkTheme ? 'text-white/80' : 'text-black/80'}`}>
                          Page Selection
                        </h4>
                        <PageSelector
                          pageCount={file.pageCount}
                          value={file.selectedPages}
                          onChange={(pages) => handlePageSelection(file.id, pages)}
                          isDarkTheme={isDarkTheme}
                        />
                      </div>
                      
                      <div>
                        <h4 className={`text-sm font-medium mb-3 ${isDarkTheme ? 'text-white/80' : 'text-black/80'}`}>
                          Print Options
                        </h4>
                        <PrintOptionsForm
                          options={file.options}
                          onChange={(options) => handleOptionsChange(file.id, options)}
                          isDarkTheme={isDarkTheme}
                          shopkeeper={selectedShopkeeper}
                        />
                      </div>
                    </div>
                    
                    <div className={`mt-4 p-3 rounded-xl text-sm font-medium
                      ${isDarkTheme ? 'bg-white/5' : 'bg-black/5'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span>Subtotal for this document:</span>
                        <span className={`${isDarkTheme ? 'text-blue-300' : 'text-blue-600'}`}>
                          ${file.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-4 text-center
                    ${isDarkTheme 
                      ? 'bg-white/5 border border-white/10' 
                      : 'bg-white/80 border border-black/5 shadow-md'
                    }`}
                >
                  <button
                    onClick={applyGlobalOptions}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${isDarkTheme 
                        ? 'bg-white/10 hover:bg-white/20' 
                        : 'bg-black/5 hover:bg-black/10'
                      }`}
                  >
                    Apply Global Options to All Files
                  </button>
                </motion.div>
              )}
            </div>
            
            {/* Right column - Checkout card */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="sticky top-24"
              >
                <div className={`rounded-2xl overflow-hidden backdrop-blur-lg border
                  ${isDarkTheme 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-white/80 border-black/5 shadow-lg'
                  }`}
                >
                  <div className="p-6">
                    <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                    
                    {/* Order summary */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className={`${isDarkTheme ? 'text-white/70' : 'text-black/70'}`}>
                          Documents
                        </span>
                        <span className="font-medium">{files.length}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`${isDarkTheme ? 'text-white/70' : 'text-black/70'}`}>
                          Total Pages
                        </span>
                        <span className="font-medium">
                          {files.reduce((count, file) => {
                            // Simplified calculation - in reality would need to parse the selected pages string
                            return count + file.pageCount;
                          }, 0)}
                        </span>
                      </div>
                      
                      {selectedShopkeeper && (
                        <div className="flex justify-between items-center">
                          <span className={`${isDarkTheme ? 'text-white/70' : 'text-black/70'}`}>
                            Print Shop
                          </span>
                          <span className="font-medium">{selectedShopkeeper.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Price calculator component */}
                    <PriceCalculator 
                      files={files} 
                      isDarkTheme={isDarkTheme}
                      shopkeeper={selectedShopkeeper}
                      isPriority={isPriorityOrder}
                      onPriorityChange={setIsPriorityOrder}
                    />
                    
                    {/* Priority option */}
                    <div className={`mt-6 mb-8 p-4 rounded-xl 
                      ${isDarkTheme ? 'bg-amber-900/20 border border-amber-800/30' : 'bg-amber-50 border border-amber-100'}`}
                    >
                      <div className="flex items-start">
                        <div className={`p-1.5 rounded-full mt-0.5 mr-3
                          ${isDarkTheme ? 'bg-amber-500/20' : 'bg-amber-100'}`}
                        >
                          <Clock className={`h-4 w-4 ${isDarkTheme ? 'text-amber-300' : 'text-amber-600'}`} />
                        </div>
                        <div>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isPriorityOrder}
                              onChange={(e) => setIsPriorityOrder(e.target.checked)}
                              className={`mr-2 h-4 w-4 rounded 
                                ${isDarkTheme 
                                  ? 'bg-white/10 border-white/30 checked:bg-amber-500 checked:border-amber-500' 
                                  : 'bg-white border-gray-300 checked:bg-amber-500 checked:border-amber-500'
                                }`}
                            />
                            <span className={`text-sm font-medium 
                              ${isDarkTheme ? 'text-amber-300' : 'text-amber-800'}`}
                            >
                              Priority Processing
                            </span>
                          </label>
                          <p className={`text-xs mt-1 
                            ${isDarkTheme ? 'text-amber-300/70' : 'text-amber-700/80'}`}
                          >
                            Get your order processed with highest priority. Extra fee applies.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Checkout button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCheckout}
                      disabled={files.length === 0 || isProcessing || !selectedShopkeeper}
                      className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-full text-base font-medium transition-all
                        ${files.length === 0 || isProcessing || !selectedShopkeeper
                          ? `${isDarkTheme ? 'bg-white/20 text-white/50' : 'bg-black/20 text-black/50'} cursor-not-allowed`
                          : isDarkTheme 
                            ? 'bg-white text-black hover:bg-white/90' 
                            : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                        }`}
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                    </motion.button>
                    
                    {(files.length === 0 || !selectedShopkeeper) && (
                      <p className={`text-xs text-center mt-2
                        ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`}
                      >
                        {files.length === 0 
                          ? 'Please upload at least one document'
                          : !selectedShopkeeper
                            ? 'Select a print shop to continue'
                            : ''
                        }
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {showConfirmationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-md w-full rounded-2xl p-8 ${
                isDarkTheme ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white shadow-xl'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                {/* Success animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.3 
                  }}
                  className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center ${
                    isDarkTheme ? 'bg-green-900/30' : 'bg-green-100'
                  }`}
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    <Check className={`w-12 h-12 ${
                      isDarkTheme ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </motion.div>
                </motion.div>
                
                <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                <p className={`mb-6 ${
                  isDarkTheme ? 'text-white/70' : 'text-black/70'
                }`}>
                  Thank you for your order. Your documents are being processed.
                </p>
                
                <div className={`px-4 py-2 rounded-full text-sm ${
                  isDarkTheme ? 'bg-white/10' : 'bg-black/5'
                }`}>
                  Redirecting to orders page in {redirectCountdown} seconds...
                </div>
                
                <div className="mt-6 flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/orders')}
                    className={`px-6 py-2 rounded-full font-medium ${
                      isDarkTheme 
                        ? 'bg-white text-black hover:bg-white/90' 
                        : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                    }`}
                  >
                    View My Orders
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmationModal(false)}
                    className={`px-6 py-2 rounded-full font-medium ${
                      isDarkTheme 
                        ? 'bg-white/10 hover:bg-white/20' 
                        : 'bg-black/5 hover:bg-black/10'
                    }`}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}

export default PrintPage;