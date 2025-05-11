import React from 'react';
import { cn } from '../../lib/utils';

const Button = React.forwardRef(
  ({ variant = 'primary', size = 'md', loading = false, className, children, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-xerox-red hover:bg-xerox-red/90 text-white',
      secondary: 'bg-xerox-gray-200 hover:bg-xerox-gray-300 text-xerox-gray-800',
      outline: 'border border-xerox-gray-300 hover:bg-xerox-gray-100 text-xerox-gray-800',
      ghost: 'hover:bg-xerox-gray-100 text-xerox-gray-800',
      destructive: 'bg-red-500 hover:bg-red-600 text-white',
      success: 'bg-xerox-green-500 hover:bg-xerox-green-600 text-white',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xerox-blue-500 disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;