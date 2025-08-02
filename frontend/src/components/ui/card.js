import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className, variant = "default" }) => {
  const variants = {
    default: "bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg",
    glass: "bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl",
    solid: "bg-white border border-gray-200 shadow-sm",
  };

  return (
    <div className={cn(
      "rounded-xl transition-all duration-300 hover:shadow-xl",
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className }) => {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => {
  return (
    <div className={cn("p-6 pb-3", className)}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, as: Component = "h3" }) => {
  return (
    <Component className={cn("text-xl font-semibold text-gray-900 leading-tight", className)}>
      {children}
    </Component>
  );
};