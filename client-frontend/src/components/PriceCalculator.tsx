import React, { useMemo } from 'react';
import type { PrintFile } from '../types/print';
import { DollarSign } from 'lucide-react';

// Add Switch component
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, className = '' }) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full 
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
        focus:ring-blue-500 focus:ring-offset-2 
        ${checked ? 'bg-blue-600' : 'bg-gray-200'} 
        ${className}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full 
          bg-white shadow-lg ring-0 transition duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
};

interface PriceCalculatorProps {
  files: PrintFile[];
  isDarkTheme: boolean;
  shopkeeper: Shopkeeper | null;
  isPriority: boolean;
  onPriorityChange: (value: boolean) => void;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  files,
  isDarkTheme,
  shopkeeper,
  isPriority,
  onPriorityChange
}) => {
  const subtotal = files.reduce((sum, file) => sum + file.price, 0);
  const priorityMultiplier = isPriority && shopkeeper ? shopkeeper.priorityRate : 1;
  const totalPrice = subtotal * priorityMultiplier;

  return (
    <div className={`sticky top-24 rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className="text-lg font-medium mb-4">Order Summary</h3>
      
      {/* Priority Toggle */}
      <div className={`flex items-center justify-between p-4 rounded-lg mb-4
        ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="space-y-1">
          <div className="font-medium">⚡ Priority Order</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isPriority 
              ? `${shopkeeper?.priorityRate}x rate applies` 
              : 'Standard processing time'}
          </p>
        </div>
        <Switch
          checked={isPriority}
          onCheckedChange={onPriorityChange}
          className={`${isPriority 
            ? 'bg-blue-600 dark:bg-blue-500' 
            : 'bg-gray-200 dark:bg-gray-600'}`}
        />
      </div>

      {isPriority && shopkeeper && (
        <div className="text-sm text-amber-500 dark:text-amber-400 mb-4">
          Priority orders are processed faster but cost {((shopkeeper.priorityRate - 1) * 100).toFixed(0)}% more
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {isPriority && (
          <div className="flex justify-between text-sm text-amber-500">
            <span>Priority Rate ({shopkeeper?.priorityRate}x)</span>
            <span>+₹{(subtotal * (priorityMultiplier - 1)).toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};