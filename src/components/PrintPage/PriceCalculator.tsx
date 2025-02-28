import React, { useState } from 'react';
import type { PrintFile } from '../../types/print';
import { calculatePriceWithBreakdown, PriceBreakdown, savePricingRulesLocally } from '../../utils/pricing';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface PriceCalculatorProps {
  files: PrintFile[];
  isDarkTheme: boolean;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  files,
  isDarkTheme,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Save pricing rules locally for offline use
  React.useEffect(() => {
    savePricingRulesLocally();
  }, []);

  const subtotal = files.reduce((sum, file) => sum + file.price, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatMultiplier = (multiplier: number) => {
    if (multiplier === 1) return '1x';
    return multiplier > 1 ? `${multiplier}x` : `${(multiplier * 100).toFixed(0)}%`;
  };

  const toggleBreakdown = (fileId: string) => {
    if (selectedFileId === fileId) {
      setSelectedFileId(null);
      setShowBreakdown(false);
    } else {
      setSelectedFileId(fileId);
      setShowBreakdown(true);
    }
  };

  const getBreakdown = (file: PrintFile): PriceBreakdown => {
    return calculatePriceWithBreakdown(
      file.pageCount,
      file.options,
      file.selectedPages
    );
  };

  const renderBreakdown = (file: PrintFile) => {
    const breakdown = getBreakdown(file);
    
    return (
      <div className={`mt-2 p-3 rounded-md text-sm ${
        isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        <h4 className="font-medium mb-2">Price Breakdown</h4>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Base price ({breakdown.selectedPageCount} pages)</span>
            <span>{formatPrice(breakdown.basePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Color ({file.options.colorMode})</span>
            <span>{formatMultiplier(breakdown.colorMultiplier)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paper ({file.options.paperSize})</span>
            <span>{formatMultiplier(breakdown.paperSizeMultiplier)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paper type ({file.options.paperType})</span>
            <span>{formatMultiplier(breakdown.paperTypeMultiplier)}</span>
          </div>
          {file.options.doubleSided && (
            <div className="flex justify-between">
              <span>Double-sided discount</span>
              <span>{formatMultiplier(breakdown.doubleSidedDiscount)}</span>
            </div>
          )}
          {file.options.binding?.type !== 'None' && (
            <div className="flex justify-between">
              <span>Binding ({file.options.binding?.type})</span>
              <span>+{formatPrice(breakdown.bindingCost)}</span>
            </div>
          )}
          {file.options.priority && (
            <div className="flex justify-between">
              <span>Priority printing</span>
              <span>{formatMultiplier(breakdown.priorityMultiplier)}</span>
            </div>
          )}
          <div className={`flex justify-between pt-1 mt-1 border-t ${
            isDarkTheme ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <span>Subtotal (per copy)</span>
            <span>{formatPrice(breakdown.subtotal)}</span>
          </div>
          {breakdown.copiesCount > 1 && (
            <div className="flex justify-between">
              <span>Copies</span>
              <span>× {breakdown.copiesCount}</span>
            </div>
          )}
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(breakdown.totalPrice)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`rounded-lg shadow-lg p-6 ${
        isDarkTheme ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      {files.length === 0 ? (
        <p
          className={`text-sm ${
            isDarkTheme ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          No files added yet
        </p>
      ) : (
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className={`py-2 ${
                  files.indexOf(file) !== files.length - 1 ? 'border-b' : ''
                } ${
                  isDarkTheme ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium truncate">
                      {file.file.name}
                    </p>
                    <p
                      className={`text-xs ${
                        isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {file.options.copies} {file.options.copies > 1 ? 'copies' : 'copy'},{' '}
                      {file.options.colorMode === 'Color' ? 'Color' : 'B&W'},{' '}
                      {file.options.paperSize}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm font-medium mr-2">{formatPrice(file.price)}</p>
                    <button 
                      onClick={() => toggleBreakdown(file.id)}
                      className={`p-1 rounded-full ${
                        isDarkTheme 
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      }`}
                      aria-label="Show price breakdown"
                    >
                      {selectedFileId === file.id ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <Info className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </div>
                {showBreakdown && selectedFileId === file.id && renderBreakdown(file)}
              </div>
            ))}
          </div>

          <div
            className={`pt-4 border-t ${
              isDarkTheme ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between py-1">
              <p
                className={`text-sm ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Subtotal
              </p>
              <p
                className={`text-sm ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {formatPrice(subtotal)}
              </p>
            </div>
            <div className="flex justify-between py-1">
              <p
                className={`text-sm ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Tax (10%)
              </p>
              <p
                className={`text-sm ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {formatPrice(tax)}
              </p>
            </div>
            <div className="flex justify-between py-2 font-medium">
              <p className="text-base">Total</p>
              <p className="text-base">{formatPrice(total)}</p>
            </div>
            <div className={`mt-2 text-xs ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <p>Pricing available offline</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};