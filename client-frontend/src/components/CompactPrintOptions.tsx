import React from 'react';
import { Layout, Copy, Maximize, Printer, Square } from 'lucide-react';
import type { PrintOptions } from '../types/print';

interface CompactPrintOptionsProps {
  options: PrintOptions;
  onChange: (options: PrintOptions) => void;
  pageCount: number;
  isDarkTheme: boolean;
}

export const CompactPrintOptions: React.FC<CompactPrintOptionsProps> = ({
  options,
  onChange,
  pageCount,
  isDarkTheme
}) => {
  const baseInputClass = `
    w-full rounded-md border px-3 py-1.5 text-sm transition-colors
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${isDarkTheme 
      ? 'bg-gray-700 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'}
  `;

  const handleCopiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    // Ensure copies is between 1 and 100
    const validCopies = Math.min(100, Math.max(1, value));
    onChange({ ...options, copies: validCopies });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Row 1 */}
        <div className="flex items-center space-x-2">
          <Printer className="h-4 w-4" />
          <select
            value={options.paperSize}
            onChange={e => onChange({ ...options, paperSize: e.target.value as any })}
            className={baseInputClass}
          >
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="Letter">Letter</option>
            <option value="Legal">Legal</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Layout className="h-4 w-4" />
          <select
            value={options.pagesPerSheet}
            onChange={e => onChange({ ...options, pagesPerSheet: e.target.value as any })}
            className={baseInputClass}
          >
            <option value="1">1 per page</option>
            <option value="2">2 per page</option>
            <option value="4">4 per page</option>
            <option value="6">6 per page</option>
          </select>
        </div>

        {/* Row 2 */}
        <div className="flex items-center space-x-2">
          <Square className="h-4 w-4" />
          <select
            value={options.borderStyle}
            onChange={e => onChange({ ...options, borderStyle: e.target.value as any })}
            className={baseInputClass}
          >
            <option value="none">No Border</option>
            <option value="single">Single Border</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={options.orientation}
            onChange={e => onChange({ ...options, orientation: e.target.value as any })}
            className={baseInputClass}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        {/* Row 3 */}
        <div className="col-span-2 flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.doubleSided}
              onChange={e => onChange({ ...options, doubleSided: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Double-sided</span>
          </label>

          <select
            value={options.colorMode}
            onChange={e => onChange({ ...options, colorMode: e.target.value as any })}
            className={baseInputClass}
          >
            <option value="monochrome">Black & White</option>
            <option value="color">Color</option>
          </select>
        </div>

        {/* Row 4 */}
        <div className="col-span-2 flex items-center space-x-2">
          <input
            type="text"
            placeholder={`Page range (1-${pageCount})`}
            value={options.pageRange}
            onChange={e => onChange({ ...options, pageRange: e.target.value })}
            className={`${baseInputClass} flex-grow`}
          />
          <input
            type="number"
            min="1"
            max="100"
            value={options.copies}
            onChange={handleCopiesChange}
            className={`${baseInputClass} w-20`}
            placeholder="Copies"
          />
        </div>
      </div>
    </div>
  );
};