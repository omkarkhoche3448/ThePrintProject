import React, { useMemo } from 'react';
import type { PrintFile } from '../types/print';
import { DollarSign } from 'lucide-react';

interface PriceCalculatorProps {
  files: PrintFile[];
  isDarkTheme?: boolean;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({ 
  files,
  isDarkTheme = false 
}) => {
  const totalPrice = useMemo(() => {
    return files.reduce((sum, file) => sum + file.price, 0);
  }, [files]);

  return (
    <div className={`p-6 rounded-lg shadow-lg ${
      isDarkTheme ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h3 className="text-lg font-medium mb-4">Order Summary</h3>
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex justify-between items-center text-sm"
          >
            <span className={`truncate flex-1 ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {file.file.name}
            </span>
            <span className={`font-medium ${
              isDarkTheme ? 'text-gray-200' : 'text-gray-900'
            }`}>
              ${file.price.toFixed(2)}
            </span>
          </div>
        ))}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className={`text-lg font-medium ${
              isDarkTheme ? 'text-gray-200' : 'text-gray-900'
            }`}>Total</span>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className={`text-lg font-bold ${
                isDarkTheme ? 'text-gray-200' : 'text-gray-900'
              }`}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};