import React from 'react';
import { PrintOptionsForm } from './PrintOptionsForm';
import type { PrintOptions } from '../../types/print';

interface QuickOptionsProps {
  globalOptions: PrintOptions;
  onChange: (options: PrintOptions) => void;
  applyGlobalOptions: () => void;
  isDarkTheme: boolean;
}

const QuickOptions: React.FC<QuickOptionsProps> = ({
  globalOptions,
  onChange,
  applyGlobalOptions,
  isDarkTheme,
}) => {
  return (
    <div className={`rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Quick Options</h2>
        <button
          onClick={applyGlobalOptions}
          className={`px-4 py-2 ${
            isDarkTheme 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white rounded-lg transition-colors duration-200`}
        >
          Apply to All Files
        </button>
      </div>
      <PrintOptionsForm
        options={globalOptions}
        onChange={onChange}
        isGlobal={true}
        isDarkTheme={isDarkTheme}
      />
    </div>
  );
};

export default QuickOptions;