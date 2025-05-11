import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className }) {
  return (
    <div className={cn('rounded-lg border border-xerox-gray-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-4 pb-2', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-xerox-gray-500', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('p-4 pt-0', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('flex items-center p-4 pt-0', className)}>
      {children}
    </div>
  );
}