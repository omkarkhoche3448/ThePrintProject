import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../slices/themeSlice';
import FileUploadSection from '../components/PrintPage/FileUploadSection';
import QuickOptions from '../components/PrintPage/QuickOptions';
import FileDetails from '../components/PrintPage/FileDetails';
import CheckoutSection from '../components/PrintPage/CheckoutSection';
import { getPageCount, generateThumbnail } from '../utils/pdfUtils';
import { calculatePrice, savePricingRulesLocally } from '../utils/pricing';
import type { PrintFile, PrintOptions, UploadStatus} from '../types/print';
import { Printer, Sun, Moon, Wifi, WifiOff } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { UploadProgressIndicator } from '../components/PrintPage/UploadProgressIndicator';
import { FileUploadManager } from '../utils/FileUploadManager';

const defaultPrintOptions: PrintOptions = {
  paperSize: 'A4',
  colorMode: 'BlackAndWhite',
  doubleSided: false,
  copies: 1,
  paperType: 'Standard',
  binding: {
    type: 'None',
    position: 'Left'
  },
  priority: false,
  additionalInstructions: ''
};

// Mock upload function - replace with actual implementation
const mockUploadFile = async (file: File, onProgress: (progress: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        // Simulate some server processing time
        setTimeout(() => {
          // 10% chance of failure for testing
          if (Math.random() < 0.1) {
            reject(new Error('Upload failed'));
          } else {
            resolve(`https://example.com/uploads/${file.name}`);
          }
        }, 500);
      }
    }, 500);
  });
};

function PrintPage() {
  const dispatch = useDispatch();
  const isDarkTheme = useSelector((state: { theme: { isDarkMode: boolean } }) => state.theme.isDarkMode);
  const [files, setFiles] = useState<PrintFile[]>([]);
  const [globalOptions, setGlobalOptions] = useState<PrintOptions>(defaultPrintOptions);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [uploadManager, setUploadManager] = useState<FileUploadManager | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Save pricing rules for offline use
    if (navigator.onLine) {
      savePricingRulesLocally();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const manager = new FileUploadManager(
      mockUploadFile,
      (fileId, status, url) => {
        setFiles(prevFiles => 
          prevFiles.map(file => 
            file.id === fileId 
              ? { ...file, uploadStatus: status } 
              : file
          )
        );
      }
    );
    
    // Initialize from storage
    manager.initFromStorage().then(() => {
      console.log('Upload manager initialized from storage');
    });
    
    // Setup network listeners
    manager.setupNetworkListeners();
    
    setUploadManager(manager);
    
    return () => {
      // Cleanup if needed
    };
  }, []);

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
              price: calculatePrice(pageCount, globalOptions, `1-${pageCount}`),
              isExpanded: false,
              uploadStatus: 'pending',
              retryCount: 0,
            };
          } catch (error) {
            throw new Error(`Error processing ${file.name}: ${(error as Error).message}`);
          }
        })
      );
      setFiles((prev) => [...prev, ...processedFiles]);
    } catch (error) {
      console.error('Error processing files:', error);
      setError('Failed to process PDF files. Please make sure they are valid PDF documents.');
    } finally {
      setIsProcessing(false);
    }
  }, [globalOptions]);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

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
            pages
          );
          return updatedFile;
        }
        return file;
      })
    );
  }, []);

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
            file.selectedPages
          );
          return updatedFile;
        }
        return file;
      })
    );
  }, []);

  const handleGlobalOptionsChange = useCallback((options: PrintOptions) => {
    setGlobalOptions(options);
  }, []);

  const applyGlobalOptions = useCallback(() => {
    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        options: globalOptions,
        price: calculatePrice(file.pageCount, globalOptions, file.selectedPages),
      }))
    );
  }, [globalOptions]);

  const handleCheckout = useCallback(() => {
    const orderData = {
      files: files.map((file) => ({
        name: file.file.name,
        pageCount: file.pageCount,
        selectedPages: file.selectedPages,
        options: file.options,
        price: file.price,
      })),
      totalPrice: files.reduce((sum, file) => sum + file.price, 0),
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(orderData),
      'print-order-secret'
    ).toString();

    console.log('Encrypted order data:', encryptedData);
    alert('Order submitted! Check console for encrypted order data.');
  }, [files]);

  const handleRetryUpload = (fileId: string) => {
    if (uploadManager) {
      uploadManager.retryUpload(fileId);
    }
  };

  const themeClass = isDarkTheme 
    ? 'bg-gray-900 text-white' 
    : 'bg-gradient-to-br from-blue-50 to-indigo-50';

  return (
    <div className={`min-h-screen ${themeClass} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Printer className={`h-8 w-8 ${isDarkTheme ? 'text-blue-400' : 'text-blue-500'}`} />
            <h1 className="text-3xl font-bold">Print Order</h1>
          </div>
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <div className="flex items-center text-green-500">
                <Wifi className="h-5 w-5 mr-1" />
                <span className="text-sm">Online</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-500">
                <WifiOff className="h-5 w-5 mr-1" />
                <span className="text-sm">Offline Mode</span>
              </div>
            )}
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`p-2 rounded-full ${isDarkTheme ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'} shadow-lg transition-colors duration-300`}
            >
              {isDarkTheme ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <FileUploadSection
              onFilesAdded={handleFilesAdded}
              files={files}
              onRemoveFile={handleRemoveFile}
              isDarkTheme={isDarkTheme}
              error={error}
            />

            {files.length > 0 && (
              <QuickOptions
                globalOptions={globalOptions}
                onChange={handleGlobalOptionsChange}
                applyGlobalOptions={applyGlobalOptions}
                isDarkTheme={isDarkTheme}
              />
            )}

            {files.length > 0 && (
              <div className="space-y-4">
                <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                  Your Files
                </h2>
                {files.map((file) => (
                  <div key={file.id} className="space-y-2">
                    <FileDetails
                      file={file}
                      onPageSelection={(pages) => handlePageSelection(file.id, pages)}
                      onOptionsChange={(options) => handleOptionsChange(file.id, options)}
                      onRemoveFile={handleRemoveFile}
                      isDarkTheme={isDarkTheme}
                    />
                    <div className={`px-4 py-2 ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'} rounded-md`}>
                      <UploadProgressIndicator
                        status={file.uploadStatus}
                        progress={file.uploadStatus === 'uploading' ? 50 : undefined}
                        onRetry={() => handleRetryUpload(file.id)}
                        isDarkTheme={isDarkTheme}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <CheckoutSection
            files={files}
            isProcessing={isProcessing}
            isDarkTheme={isDarkTheme}
            handleCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}

export default PrintPage;