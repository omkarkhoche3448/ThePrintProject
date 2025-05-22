import React, { useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';

interface PageSelectorProps {
  pageCount: number;
  value: string;
  onChange: (value: string) => void;
  isDarkTheme?: boolean; // Add theme prop (optional for backward compatibility)
}

export const PageSelector: React.FC<PageSelectorProps> = ({
  pageCount,
  value,
  onChange,
  isDarkTheme = false
}) => {
  const [error, setError] = useState<string>('');

  const validatePageRange = useCallback(
    (input: string) => {
      if (!input.trim()) {
        setError('Please select pages');
        return false;
      }

      const ranges = input.split(',').map((range) => range.trim());
      const isValid = ranges.every((range) => {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(Number);
          return (
            !isNaN(start) &&
            !isNaN(end) &&
            start > 0 &&
            end <= pageCount &&
            start <= end
          );
        }
        const page = Number(range);
        return !isNaN(page) && page > 0 && page <= pageCount;
      });

      if (!isValid) {
        setError(`Please enter valid page numbers between 1 and ${pageCount}`);
        return false;
      }

      setError('');
      return true;
    },
    [pageCount]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validatePageRange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="e.g., 1-3, 5, 7-9"
          className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${
              error
                ? isDarkTheme
                  ? 'border-red-500 bg-red-900/30 text-white placeholder:text-red-200'
                  : 'border-red-500 bg-red-100 text-red-700 placeholder:text-red-400'
                : isDarkTheme
                  ? 'bg-black/40 border-white/10 text-white placeholder:text-white/60 hover:bg-black/60 focus:bg-black/60'
                  : 'bg-white border-gray-300 text-black placeholder:text-gray-400 hover:bg-gray-50 focus:bg-gray-50'
            }`}
        />
        <span className={`text-sm ${isDarkTheme ? 'text-white/60' : 'text-gray-500'}`}>
          of {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </span>
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};