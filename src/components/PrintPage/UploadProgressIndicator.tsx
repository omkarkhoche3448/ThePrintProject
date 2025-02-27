import React from 'react';
import { CheckCircle, AlertCircle, Clock, UploadCloud } from 'lucide-react';
import type { UploadStatus } from '../../types/print';

interface UploadProgressIndicatorProps {
  status: UploadStatus;
  progress?: number;
  onRetry?: () => void;
  isDarkTheme: boolean;
}

export const UploadProgressIndicator: React.FC<UploadProgressIndicatorProps> = ({
  status,
  progress = 0,
  onRetry,
  isDarkTheme,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return isDarkTheme ? 'text-green-400' : 'text-green-500';
      case 'error':
        return isDarkTheme ? 'text-red-400' : 'text-red-500';
      case 'uploading':
        return isDarkTheme ? 'text-blue-400' : 'text-blue-500';
      default:
        return isDarkTheme ? 'text-gray-400' : 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className={`h-5 w-5 ${getStatusColor()}`} />;
      case 'error':
        return <AlertCircle className={`h-5 w-5 ${getStatusColor()}`} />;
      case 'uploading':
        return <UploadCloud className={`h-5 w-5 ${getStatusColor()}`} />;
      case 'queued':
        return <Clock className={`h-5 w-5 ${getStatusColor()}`} />;
      default:
        return <Clock className={`h-5 w-5 ${getStatusColor()}`} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Upload complete';
      case 'error':
        return 'Upload failed';
      case 'uploading':
        return `Uploading (${progress}%)`;
      case 'queued':
        return 'Queued for upload';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {getStatusIcon()}
      <span className={`text-sm ${getStatusColor()}`}>{getStatusText()}</span>
      
      {status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className={`ml-2 text-xs px-2 py-1 rounded ${
            isDarkTheme
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          Retry
        </button>
      )}
      
      {status === 'uploading' && (
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full ${isDarkTheme ? 'bg-blue-500' : 'bg-blue-600'}`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};