import React from 'react';
import { PageSelector } from './PageSelector';
import { PrintOptionsForm } from './PrintOptionsForm';

interface FileDetailsProps {
  file: any; // Replace with the correct type
  onPageSelection: (pages: string) => void;
  onOptionsChange: (options: any) => void; // Replace with the correct type
  isDarkTheme: boolean;
}

const FileDetails: React.FC<FileDetailsProps> = ({
  file,
  onPageSelection,
  onOptionsChange,
  isDarkTheme,
}) => {
  return (
    <div className={`rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center space-x-4 mb-4">
        {file.thumbnail && (
          <img
            src={file.thumbnail}
            alt="PDF preview"
            className="h-16 w-16 object-cover rounded-lg shadow"
          />
        )}
        <div>
          <h3 className="text-lg font-medium">{file.file.name}</h3>
          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            {file.pageCount} pages
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className={`text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
          <h4 className={`text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Custom Options
          </h4>
          <PrintOptionsForm
            options={file.options}
            onChange={onOptionsChange}
            isDarkTheme={isDarkTheme}
          />
        </div>
      </div>
    </div>
  );
};

export default FileDetails;
