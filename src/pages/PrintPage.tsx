import React, { useState, useCallback } from 'react';
import { FileUploader } from '../components/FileUploader';
import { PageSelector } from '../components/PageSelector';
import { PrintOptionsForm } from '../components/PrintOptionsForm';
import { PriceCalculator } from '../components/PriceCalculator';
import { getPageCount, generateThumbnail } from '../utils/pdfUtils';
import { calculatePrice } from '../utils/pricing';
import type { PrintFile, PrintOptions } from '../types/print';
import { Printer, Lock, Sun, Moon } from 'lucide-react';
import CryptoJS from 'crypto-js';

const defaultPrintOptions: PrintOptions = {
  paperSize: 'A4',
  colorMode: 'BlackAndWhite',
  doubleSided: false,
  copies: 1,
  paperType: 'Standard',
};

function PrintPage() {
  const [files, setFiles] = useState<PrintFile[]>([]);
  const [globalOptions, setGlobalOptions] = useState<PrintOptions>(defaultPrintOptions);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

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
            };
          } catch (error) {
            throw new Error(`Error processing ${file.name}: ${error.message}`);
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
    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        options,
        price: calculatePrice(file.pageCount, options, file.selectedPages),
      }))
    );
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
  }, [files]);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={`rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                  {error}
                </div>
              )}
              <FileUploader
                onFilesAdded={handleFilesAdded}
                files={files}
                onRemoveFile={handleRemoveFile}
                isDarkTheme={isDarkTheme}
              />
            </div>

            {files.length > 0 && (
              <div className={`rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Quick Options</h2>
                  <button
                    onClick={applyGlobalOptions}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    Apply to All Files
                  </button>
                </div>
                <PrintOptionsForm
                  options={globalOptions}
                  onChange={handleGlobalOptionsChange}
                  isGlobal
                  isDarkTheme={isDarkTheme}
                />
              </div>
            )}

            {files.map((file) => (
              <div
                key={file.id}
                className={`rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-center space-x-4 mb-4">
                  {file.thumbnail && (
                    <img
                      src={file.thumbnail}
                      alt="PDF preview"
                      className="h-16 w-16 object-cover rounded-lg shadow"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-medium">{file.file.name}</h3>
                    <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                      {file.pageCount} pages
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className={`text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
                    <h4 className={`text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Custom Options
                    </h4>
                    <PrintOptionsForm
                      options={file.options}
                      onChange={(options) => handleOptionsChange(file.id, options)}
                      isDarkTheme={isDarkTheme}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <PriceCalculator files={files} isDarkTheme={isDarkTheme} />
              
              <button
                onClick={handleCheckout}
                disabled={files.length === 0 || isProcessing}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-white font-medium transition-colors duration-200
                  ${
                    files.length === 0 || isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
              >
                <Lock className="h-5 w-5" />
                <span>Proceed to Checkout</span>
              </button>
              
              {isProcessing && (
                <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                  Processing files...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrintPage;