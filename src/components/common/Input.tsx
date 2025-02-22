import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  isDarkTheme?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  className = '',
  id,
  isDarkTheme,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-lg border transition-colors duration-200
            ${icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5
            ${isDarkTheme ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
            disabled:bg-gray-100
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};