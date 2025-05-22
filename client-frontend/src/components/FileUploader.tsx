import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import type { PrintFile } from '../types/print';

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
  files: PrintFile[];
  onRemoveFile: (id: string) => void;
  isDarkTheme?: boolean; // Add theme prop (optional)
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesAdded,
  files,
  onRemoveFile,
  isDarkTheme = false // Default to false if not provided
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pdfFiles = acceptedFiles.filter(
        (file) => file.type === 'application/pdf'
      );
      onFilesAdded(pdfFiles);
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? isDarkTheme
                ? 'border-blue-400 bg-blue-900/30'
                : 'border-blue-500 bg-blue-50'
              : isDarkTheme
                ? 'border-white/10 bg-black/30 hover:border-blue-400'
                : 'border-gray-300 hover:border-blue-400'
          }`}
      >
        <input {...getInputProps()} />
        <Upload className={`mx-auto h-12 w-12 ${isDarkTheme ? 'text-white/40' : 'text-gray-400'}`} />
        <p className={`mt-2 text-sm ${isDarkTheme ? 'text-white/70' : 'text-gray-600'}`}>
          {isDragActive
            ? 'Drop your PDF files here'
            : 'Drag & drop PDF files here, or click to select files'}
        </p>
      </div>

      {files.length > 0 && (
        <ul className={`divide-y ${isDarkTheme ? 'divide-white/10' : 'divide-gray-200'}`}>
          {files.map((file) => (
            <li
              key={file.id}
              className="py-3 flex justify-between items-center"
            >
              <div className="flex items-center">
                {file.thumbnail && (
                  <img
                    src={file.thumbnail}
                    alt="PDF preview"
                    className="h-12 w-12 object-cover rounded mr-3"
                  />
                )}
                <div>
                  <p className={`text-sm font-medium truncate max-w-xs ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                    {file.file.name}
                  </p>
                  <p className={`text-sm ${isDarkTheme ? 'text-white/60' : 'text-gray-500'}`}>
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(file.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};