import React from 'react';
import { CompactPrintOptions } from './CompactPrintOptions';
import type { PrintOptions } from '../types/print';

const defaultPrintOptions: PrintOptions = {
  paperSize: 'A4',
  colorMode: 'monochrome',
  doubleSided: false,
  pagesPerSheet: '1',
  orientation: 'portrait',
  borderStyle: 'none',
  pageRange: '',
  copies: 1,
  isPriority: false
};

interface PrintOptionsFormProps {
  options: PrintOptions;
  onChange: (options: PrintOptions) => void;
  pageCount: number;
  isDarkTheme: boolean;
}

export const PrintOptionsForm: React.FC<PrintOptionsFormProps> = ({
  options,
  onChange,
  pageCount,
  isDarkTheme
}) => {  return (
    <div className={`p-4 rounded-lg transition-colors duration-200 ${
      isDarkTheme 
        ? 'bg-black/20 border border-white/10' 
        : 'bg-white border border-gray-200'
    }`}>      <CompactPrintOptions
        options={options}
        onChange={onChange}
        isDarkTheme={isDarkTheme}
        pageCount={pageCount}
      />
    </div>
  );
};