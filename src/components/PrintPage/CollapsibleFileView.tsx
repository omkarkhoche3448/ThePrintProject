import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PageSelector } from './PageSelector';
import { PrintOptionsForm } from './PrintOptionsForm';
import type { PrintFile, PrintOptions } from '../../types/print';

interface CollapsibleFileViewProps {
  file: PrintFile;
  onPageSelection: (pages: string) => void;
  onOptionsChange: (options: PrintOptions) => void;
  onRemoveFile: (id: string) => void;
  isDarkTheme: boolean;
}

export const CollapsibleFileView: React.FC<CollapsibleFileViewProps> = ({
  file,
  onPageSelection,
  onOptionsChange,
  onRemoveFile,
  isDarkTheme,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
        isDarkTheme ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div
        className={`p-4 flex items-center justify-between cursor-pointer ${
          isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
        }`}
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-4">
          {file.thumbnail && (
            <img
              src={file.thumbnail}
              alt="PDF preview"
              className="h-12 w-12 object-cover rounded-md shadow"
            />
          )}
          <div>
            <h3 className="text-base font-medium truncate max-w-xs">
              {file.file.name}
            </h3>
            <p
              className={`text-xs ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {file.pageCount} pages • {file.options.paperSize} •{' '}
              {file.options.colorMode === 'Color' ? 'Color' : 'B&W'} •{' '}
              {file.options.copies} {file.options.copies > 1 ? 'copies' : 'copy'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <p className="font-medium">${file.price.toFixed(2)}</p>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div
          className={`p-4 border-t ${
            isDarkTheme ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="space-y-6">
            <div>
              <h4
                className={`text-sm font-medium ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                } mb-2`}
              >
                Page Selection
              </h4>
              <PageSelector
                pageCount={file.pageCount}
                value={file.selectedPages}
                onChange={onPageSelection}
                isDarkTheme={isDarkTheme}
              />
            </div>

            <div>
              <h4
                className={`text-sm font-medium ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                } mb-2`}
              >
                Print Options
              </h4>
              <PrintOptionsForm
                options={file.options}
                onChange={onOptionsChange}
                isDarkTheme={isDarkTheme}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => onRemoveFile(file.id)}
                className={`px-4 py-2 text-sm rounded-md ${
                  isDarkTheme
                    ? 'bg-red-900 hover:bg-red-800 text-white'
                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                }`}
              >
                Remove File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};