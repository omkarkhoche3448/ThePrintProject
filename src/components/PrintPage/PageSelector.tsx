import React, { useState, useEffect } from 'react';

interface PageSelectorProps {
  pageCount: number;
  value: string;
  onChange: (pages: string) => void;
  isDarkTheme: boolean;
}

export const PageSelector: React.FC<PageSelectorProps> = ({
  pageCount,
  value,
  onChange,
  isDarkTheme,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const validateAndUpdate = (val: string) => {
    if (val.trim() === '') {
      setError('Page selection cannot be empty');
      return;
    }

    // Validate page ranges (e.g., "1-5,7,9-12")
    const rangePattern = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
    if (!rangePattern.test(val)) {
      setError('Invalid format. Use numbers and ranges (e.g., "1-5,7,9-12")');
      return;
    }

    // Check if page numbers are within range
    let valid = true;
    const ranges = val.split(',');
    
    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        if (start < 1 || end > pageCount || start > end) {
          valid = false;
          break;
        }
      } else {
        const page = Number(range);
        if (page < 1 || page > pageCount) {
          valid = false;
          break;
        }
      }
    }

    if (!valid) {
      setError(`Page numbers must be between 1 and ${pageCount}`);
      return;
    }

    setError(null);
    onChange(val);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    validateAndUpdate(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      validateAndUpdate(inputValue);
    }
  };

  const selectAll = () => {
    setInputValue(`1-${pageCount}`);
    onChange(`1-${pageCount}`);
    setError(null);
  };

  const selectEven = () => {
    const even = Array.from({ length: Math.floor(pageCount / 2) }, (_, i) => (i + 1) * 2).join(',');
    setInputValue(even);
    onChange(even);
    setError(null);
  };

  const selectOdd = () => {
    const odd = Array.from({ length: Math.ceil(pageCount / 2) }, (_, i) => i * 2 + 1).join(',');
    setInputValue(odd);
    onChange(odd);
    setError(null);
  };

  const inputClass = isDarkTheme
    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500';

  const buttonClass = isDarkTheme
    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={selectAll}
          className={`px-3 py-1 text-xs rounded-md ${buttonClass}`}
        >
          All Pages
        </button>
        <button
          type="button"
          onClick={selectEven}
          className={`px-3 py-1 text-xs rounded-md ${buttonClass}`}
        >
          Even Pages
        </button>
        <button
          type="button"
          onClick={selectOdd}
          className={`px-3 py-1 text-xs rounded-md ${buttonClass}`}
        >
          Odd Pages
        </button>
      </div>
      
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="e.g., 1-5,7,9-12"
          className={`block w-full rounded-md border ${inputClass} p-2.5 text-sm`}
          aria-describedby="page-selector-help"
        />
        <p
          id="page-selector-help"
          className={`mt-1 text-xs ${
            error
              ? 'text-red-500'
              : isDarkTheme
              ? 'text-gray-400'
              : 'text-gray-500'
          }`}
        >
          {error || `Enter page numbers or ranges (e.g., "1-5,7,9-12"). Total pages: ${pageCount}`}
        </p>
      </div>
    </div>
  );
};