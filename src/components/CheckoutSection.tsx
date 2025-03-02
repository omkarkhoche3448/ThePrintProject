import React from 'react';
import { PriceCalculator } from './PriceCalculator';
import { Lock } from 'lucide-react';

interface CheckoutSectionProps {
  files: any[]; // Replace with the correct type
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
      <div className="sticky top-8 space-y-4">
        <PriceCalculator files={files} isDarkTheme={isDarkTheme} />
        <button
          onClick={handleCheckout}
          disabled={files.length === 0 || isProcessing}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-white font-medium transition-colors duration-200
            ${files.length === 0 || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
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
  );
};

export default CheckoutSection;
