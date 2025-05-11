import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  const variantStyles = {
    default: 'bg-xerox-gray-200 text-xerox-gray-800',
    primary: 'bg-xerox-blue-50 text-xerox-blue-600',
    secondary: 'bg-purple-100 text-purple-800',
    success: 'bg-xerox-green-50 text-xerox-green-600',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;