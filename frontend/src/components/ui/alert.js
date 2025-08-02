import React from 'react';
import { cn } from '../../lib/utils';

const alertVariants = {
  default: "border-gray-200 bg-gray-50 text-gray-900",
  success: "border-green-200 bg-green-50 text-green-900",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
};

export const Alert = ({ children, className, variant = "default" }) => {
  return (
    <div className={cn(
      "border rounded-lg p-4 transition-all duration-300",
      alertVariants[variant],
      className
    )}>
      {children}
    </div>
  );
};

export const AlertTitle = ({ children, className }) => {
  return (
    <h4 className={cn("font-semibold mb-1 text-sm", className)}>
      {children}
    </h4>
  );
};

export const AlertDescription = ({ children, className }) => {
  return (
    <div className={cn("text-sm opacity-90", className)}>
      {children}
    </div>
  );
};