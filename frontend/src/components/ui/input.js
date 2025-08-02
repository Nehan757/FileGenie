import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({
  className,
  type = "text",
  placeholder,
  disabled = false,
  error = false,
  ...props
}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all duration-200",
        "placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-300 focus:ring-red-500",
        className
      )}
      placeholder={placeholder}
      disabled={disabled}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export const Textarea = React.forwardRef(({
  className,
  placeholder,
  disabled = false,
  error = false,
  rows = 3,
  ...props
}, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all duration-200",
        "placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        error && "border-red-300 focus:ring-red-500",
        className
      )}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";