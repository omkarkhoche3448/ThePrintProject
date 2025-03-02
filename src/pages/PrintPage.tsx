import { useState, useCallback } from 'react';
import FileUploadSection from '../components/FileUploadSection';
import QuickOptions from '../components/QuickOptions';
import FileDetails from '../components/FileDetails';
import CheckoutSection from '../components/CheckoutSection';
import { getPageCount, generateThumbnail } from '../utils/pdfUtils';
import { calculatePrice } from '../utils/pricing';
import type { PrintFile, PrintOptions } from '../types/print';
import { Printer, Sun, Moon } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../slices/themeSlice';

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
  const dispatch = useDispatch();
  const isDarkTheme = useSelector((state) => state.theme.isDarkMode);

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
            onClick={() => dispatch(toggleTheme())}
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

            {files.map((file) => (
              <FileDetails
                key={file.id}
                file={file}
                onPageSelection={(pages) => handlePageSelection(file.id, pages)}
                onOptionsChange={(options) => handleOptionsChange(file.id, options)}
                isDarkTheme={isDarkTheme}
              />
            ))}
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