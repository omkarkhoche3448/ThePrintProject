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
      ? 'bg-black/20 border-white/10 text-white placeholder:text-white/40 hover:bg-black/30 focus:bg-black/30'
      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 hover:bg-gray-50 focus:bg-gray-50'}
  `;

  // Add handler for copies input
  const handleCopiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(100, Number(e.target.value)));
    onChange({ ...options, copies: value });
  };

  return (
    <div className={`space-y-4 rounded-2xl p-4 backdrop-blur-lg border
      ${isDarkTheme 
        ? 'bg-white/5 border-white/10'
        : 'bg-white/80 border-black/5 shadow-lg'
      }`}
    >
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
            <option value="None">No Border</option>
            <option value="Single">Single Border</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={options.orientation}
            onChange={e => onChange({ ...options, orientation: e.target.value as any })}
            className={baseInputClass}
          >
            <option value="Portrait">Portrait</option>
            <option value="Landscape">Landscape</option>
          </select>
        </div>
        {/* Row 3 */}
        <div className="col-span-2 flex items-center space-x-4">
          <Copy className="h-4 w-4" />
          <input
            type="number"
            min={1}
            max={100}
            value={options.copies}
            onChange={handleCopiesChange}
            className={baseInputClass}
            placeholder="Copies"
          />
          <Maximize className="h-4 w-4" />
          <input
            type="text"
            value={options.pageRange}
            onChange={e => onChange({ ...options, pageRange: e.target.value })}
            className={baseInputClass}
            placeholder={`e.g., 1-${pageCount}`}
          />
        </div>
      </div>
    </div>
  );
};