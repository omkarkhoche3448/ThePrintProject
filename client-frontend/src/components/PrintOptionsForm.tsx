import React from 'react';
import { CompactPrintOptions } from './CompactPrintOptions';
import type { PrintOptions } from '../types/print';

const defaultPrintOptions: PrintOptions = {
  paperSize: 'A4',
  colorMode: 'BlackAndWhite',
  doubleSided: false,
  pagesPerSheet: '1',
  orientation: 'Portrait',
  borderStyle: 'None',
  pageRange: '',
  copies: 1
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
}) => {
  return (
    <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
      <CompactPrintOptions
        options={options}
        onChange={onChange}
        pageCount={pageCount}
        isDarkTheme={isDarkTheme}
      />
    </div>
  );
};