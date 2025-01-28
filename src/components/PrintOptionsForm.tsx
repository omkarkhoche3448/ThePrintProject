import React from 'react';
import type { PrintOptions } from '../types/print';
import { Settings } from 'lucide-react';

interface PrintOptionsFormProps {
  options: PrintOptions;
  onChange: (options: PrintOptions) => void;
  isGlobal?: boolean;
  isDarkTheme?: boolean;
}

export const PrintOptionsForm: React.FC<PrintOptionsFormProps> = ({
  options,
  onChange,
  isGlobal = false,
  isDarkTheme = false,
}) => {
  const inputClass = `mt-1 block w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
    isDarkTheme
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelClass = isDarkTheme ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className={`rounded-lg ${isDarkTheme ? 'bg-gray-700/50' : 'bg-gray-50'} p-4`}>
      {isGlobal && (
        <div className="flex items-center space-x-2 mb-4">
          <Settings className={`h-5 w-5 ${isDarkTheme ? 'text-blue-400' : 'text-blue-500'}`} />
          <h3 className="font-medium text-lg">Print Settings</h3>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${labelClass}`}>
            Paper Size
          </label>
          <select
            value={options.paperSize}
            onChange={(e) =>
              onChange({ ...options, paperSize: e.target.value as any })
            }
            className={inputClass}
          >
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
            <option value="Legal">Legal</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${labelClass}`}>
            Color Mode
          </label>
          <select
            value={options.colorMode}
            onChange={(e) =>
              onChange({ ...options, colorMode: e.target.value as any })
            }
            className={inputClass}
          >
            <option value="BlackAndWhite">Black & White</option>
            <option value="Color">Color</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${labelClass}`}>
            Paper Type
          </label>
          <select
            value={options.paperType}
            onChange={(e) =>
              onChange({ ...options, paperType: e.target.value as any })
            }
            className={inputClass}
          >
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
            <option value="Recycled">Recycled</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${labelClass}`}>
            Copies
          </label>
          <input
            type="number"
            min="1"
            value={options.copies}
            onChange={(e) =>
              onChange({ ...options, copies: parseInt(e.target.value) || 1 })
            }
            className={inputClass}
          />
        </div>

        <div className="col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.doubleSided}
              onChange={(e) =>
                onChange({ ...options, doubleSided: e.target.checked })
              }
              className={`rounded border-gray-300 text-blue-500 focus:ring-blue-500 ${
                isDarkTheme ? 'bg-gray-700' : 'bg-white'
              }`}
            />
            <span className={`text-sm font-medium ${labelClass}`}>
              Double-sided printing
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};