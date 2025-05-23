import React from 'react';
import { Layout, Printer, Square, Palette } from 'lucide-react';
import type { PrintOptions } from '../types/print';

interface CompactPrintOptionsProps {
  options: PrintOptions;
  onChange: (options: PrintOptions) => void;
  pageCount?: number;
  isDarkTheme: boolean;
}

export const CompactPrintOptions: React.FC<CompactPrintOptionsProps> = ({
  options,
  onChange,
  isDarkTheme
}) => {

  return (
    <div className={`rounded-2xl p-1 `}
    >
      <div className="grid grid-cols-2 gap-3">
        {/* Row 1 */}
        <div className="flex items-center space-x-2 relative">
          <Printer className={`h-4 w-4 ${isDarkTheme ? 'text-blue-300' : 'text-blue-600'}`} />
          <div className="relative w-full">
            <select
              value={options.paperSize}
              onChange={e => onChange({ ...options, paperSize: e.target.value as any })}
              className={`
                w-full rounded-md border px-3 py-1.5 text-sm transition-colors
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                appearance-none pr-8
                ${isDarkTheme 
                  ? 'bg-white/10 border-white/10 text-white placeholder:text-white/60 hover:bg-white/20 focus:bg-white/20'
                  : 'bg-white/80 border-black/10 text-gray-900 placeholder:text-gray-400 hover:bg-gray-100 focus:bg-gray-100'
                }
              `}
            >
              <option value="A4" className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"}>A4</option>
              <option value="A3" className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"}>A3</option>
              <option value="Letter" className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"}>Letter</option>
              <option value="Legal" className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"}>Legal</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className={`h-4 w-4 ${isDarkTheme ? 'text-white/60' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 relative">
          <Layout className={`h-4 w-4 ${isDarkTheme ? 'text-blue-300' : 'text-blue-600'}`} />
          <div className="relative w-full">
            <select
              value={options.pagesPerSheet}
              onChange={e => onChange({ ...options, pagesPerSheet: e.target.value as any })}
              className={`
                w-full rounded-md border px-3 py-1.5 text-sm transition-colors
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                appearance-none pr-8
                ${isDarkTheme 
                  ? 'bg-white/10 border-white/10 text-white placeholder:text-white/60 hover:bg-white/20 focus:bg-white/20'
                  : 'bg-white/80 border-black/10 text-gray-900 placeholder:text-gray-400 hover:bg-gray-100 focus:bg-gray-100'
                }
              `}
            >              <option className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"} value="1">1 per page</option>
              <option className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"} value="2">2 per page</option>
              <option className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"} value="4">4 per page</option>
              <option className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"} value="6">6 per page</option>
              <option className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"} value="8">8 per page</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className={`h-4 w-4 ${isDarkTheme ? 'text-white/60' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        {/* Row 2 */}
        <div className="flex items-center space-x-2 relative">
          <Square className={`h-4 w-4 ${isDarkTheme ? 'text-blue-300' : 'text-blue-600'}`} />
          <div className="relative w-full">
            <select
              value={options.borderStyle}
              onChange={e => onChange({ ...options, borderStyle: e.target.value as any })}
              className={`
                w-full rounded-md border px-3 py-1.5 text-sm transition-colors
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                appearance-none pr-8
                ${isDarkTheme 
                  ? 'bg-white/10 border-white/10 text-white placeholder:text-white/60 hover:bg-white/20 focus:bg-white/20'
                  : 'bg-white/80 border-black/10 text-gray-900 placeholder:text-gray-400 hover:bg-gray-100 focus:bg-gray-100'
                }
              `}
            >              <option className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"} value="none">No Border</option>
              <option className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"} value="single">Single Border</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className={`h-4 w-4 ${isDarkTheme ? 'text-white/60' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 relative">
          <div className="relative w-full">
            <select
              value={options.orientation}
              onChange={e => onChange({ ...options, orientation: e.target.value as any })}
              className={`
                w-full rounded-md border px-3 py-1.5 text-sm transition-colors
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                appearance-none pr-8
                ${isDarkTheme 
                  ? 'bg-white/10 border-white/10 text-white placeholder:text-white/60 hover:bg-white/20 focus:bg-white/20'
                  : 'bg-white/80 border-black/10 text-gray-900 placeholder:text-gray-400 hover:bg-gray-100 focus:bg-gray-100'
                }
              `}
            >              <option className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"} value="portrait">Portrait</option>
              <option className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"} value="landscape">Landscape</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className={`h-4 w-4 ${isDarkTheme ? 'text-white/60' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>        </div>        {/* Row 3 - Color mode and Copies counter control */}
        <div className="grid grid-cols-2 gap-3 mt-3">          {/* Color Mode Control */}
          <div className="flex items-center space-x-2 relative">
            <Palette className={`h-4 w-4 ${isDarkTheme ? 'text-blue-300' : 'text-blue-600'}`} />
            <div className="relative w-full">
              <select
                value={options.colorMode}
                onChange={e => onChange({ ...options, colorMode: e.target.value as any })}
                className={`
                  w-full rounded-md border px-3 py-1.5 text-sm transition-colors
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  appearance-none pr-8
                  ${isDarkTheme 
                    ? 'bg-white/10 border-white/10 text-white placeholder:text-white/60 hover:bg-white/20 focus:bg-white/20'
                    : 'bg-white/80 border-black/10 text-gray-900 placeholder:text-gray-400 hover:bg-gray-100 focus:bg-gray-100'
                  }
                `}
              >
                <option className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"} value="monochrome">Black & White</option>
                <option className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"} value="color">Color</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className={`h-4 w-4 ${isDarkTheme ? 'text-white/60' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Copies counter */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 flex items-center space-x-2">
              <button
                onClick={() => onChange({ ...options, copies: Math.max(1, options.copies - 1) })}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  options.copies <= 1
                    ? isDarkTheme
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : isDarkTheme
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={options.copies <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                </svg>
              </button>
              
              <div className={`px-3 py-1.5 rounded-md flex-1 text-center ${
                isDarkTheme ? 'bg-white/10 text-white' : 'bg-white text-gray-900 border border-gray-200'
              }`}>
                <span className="font-medium">{options.copies}</span>
                <span className="ml-1 text-xs opacity-70">copies</span>
              </div>
              
              <button
                onClick={() => onChange({ ...options, copies: Math.min(100, options.copies + 1) })}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  options.copies >= 100
                    ? isDarkTheme
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : isDarkTheme
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={options.copies >= 100}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};