import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileX, Upload, File as FileIcon, X } from 'lucide-react';
import type { PrintFile } from '../../types/print';

interface FileUploaderProps {
  onFilesAdded: (newFiles: File[]) => void;
  files: PrintFile[];
  onRemoveFile: (id: string) => void;
  isDarkTheme: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesAdded,
  files,
  onRemoveFile,
  isDarkTheme,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pdfFiles = acceptedFiles.filter(
        (file) => file.type === 'application/pdf'
      );
      if (pdfFiles.length > 0) {
        onFilesAdded(pdfFiles);
      }
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 cursor-pointer
          ${
            dragActive || isDragActive
              ? isDarkTheme
                ? 'border-blue-400 bg-blue-900/20'
                : 'border-blue-500 bg-blue-50'
              : isDarkTheme
              ? 'border-gray-600 hover:border-gray-500'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload
            className={`h-12 w-12 ${
              isDarkTheme ? 'text-blue-400' : 'text-blue-500'
            }`}
          />
          <p className="text-lg font-medium">
            Drag & drop PDF files here, or click to select
          </p>
          <p
            className={`text-sm ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            Only PDF files are supported
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Uploaded Files</h3>
          <ul
            className={`divide-y ${
              isDarkTheme ? 'divide-gray-700' : 'divide-gray-200'
            }`}
          >
            {files.map((file) => (
              <li
                key={file.id}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <FileIcon
                    className={`h-5 w-5 ${
                      isDarkTheme ? 'text-blue-400' : 'text-blue-500'
                    }`}
                  />
                  <span className="truncate max-w-xs">{file.file.name}</span>
                </div>
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className={`p-1 rounded-full ${
                    isDarkTheme
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};