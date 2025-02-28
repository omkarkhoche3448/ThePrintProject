import React from 'react';
import { PriceCalculator } from './PriceCalculator';
import { Lock, Printer } from 'lucide-react';
import type { PrintFile } from '../../types/print';

interface CheckoutSectionProps {
  files: PrintFile[];
  isProcessing: boolean;
  isDarkTheme: boolean;
  handleCheckout: () => void;
}

const CheckoutSection: React.FC<CheckoutSectionProps> = ({
  files,
  isProcessing,
  isDarkTheme,
  handleCheckout,
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-8 space-y-6">
        <PriceCalculator files={files} isDarkTheme={isDarkTheme} />
        
        <div className={`rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-medium mb-4">Ready to Print?</h3>
          <button
            onClick={handleCheckout}
            disabled={files.length === 0 || isProcessing}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-white font-medium transition-colors duration-200
              ${files.length === 0 || isProcessing 
                ? isDarkTheme ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-400 cursor-not-allowed' 
                : isDarkTheme ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            <Lock className="h-5 w-5" />
            <span>Proceed to Checkout</span>
          </button>
          
          {isProcessing && (
            <p className={`mt-3 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'} text-center`}>
              Processing files...
            </p>
          )}
          
          {files.length > 0 && !isProcessing && (
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Printer className={`h-4 w-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                  {files.length} {files.length === 1 ? 'file' : 'files'} ready for printing
                </p>
              </div>
              <p className={`mt-2 text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-600'}`}>
                Your order will be processed securely. You'll receive a confirmation email with order details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSection;