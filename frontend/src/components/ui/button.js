import React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  default: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300",
  outline: "border border-purple-300 text-purple-700 hover:bg-purple-50",
  ghost: "hover:bg-gray-100 text-gray-700",
  destructive: "bg-red-500 hover:bg-red-600 text-white",
}

const buttonSizes = {
  sm: "px-3 py-1.5 text-sm",
  default: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl",
}

export const Button = ({
  children,
  className,
  variant = "default",
  size = "default",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  return (
    <button
      type={type}
      className={cn(
        baseClasses,
        buttonVariants[variant],
        buttonSizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};