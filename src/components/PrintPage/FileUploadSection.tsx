import React from 'react';
import { FileUploader } from './FileUploader';
import type { PrintFile } from '../../types/print';

interface FileUploadSectionProps {
  onFilesAdded: (newFiles: File[]) => void;
  files: PrintFile[];
  onRemoveFile: (id: string) => void;
  isDarkTheme: boolean;
  error: string | null;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  onFilesAdded,
  files,
  onRemoveFile,
  isDarkTheme,
  error,
}) => {
  return (
    <div className={`rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
      {error && (
        <div className={`mb-4 p-4 ${isDarkTheme ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-md text-red-600`}>
          {error}
        </div>
      )}
      <FileUploader
        onFilesAdded={onFilesAdded}
        files={files}
        onRemoveFile={onRemoveFile}
        isDarkTheme={isDarkTheme}
      />
    </div>
  );
};

export default FileUploadSection;