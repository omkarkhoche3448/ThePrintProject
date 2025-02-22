import React from 'react';
import { Loader } from '../../icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  isDarkTheme?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  isDarkTheme,
  ...props
}) => {
  const baseStyles = 'flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: isDarkTheme 
      ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white' 
      : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white',
    secondary: isDarkTheme 
      ? 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white' 
      : 'bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-black',
    outline: isDarkTheme 
      ? 'border border-gray-600 hover:bg-gray-700 hover:text-white text-gray-200' 
      : 'border border-gray-300 hover:bg-gray-50 hover:text-gray-700 text-gray-700',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${isLoading ? 'cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
