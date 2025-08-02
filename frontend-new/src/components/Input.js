import React from 'react';
import { motion } from 'framer-motion';

const Input = ({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  ...props 
}) => {
  const baseClasses = 'w-full px-4 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-700 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-medium';
  const errorClasses = error ? 'border-red-400 focus:ring-red-500' : '';
  
  const classes = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-bold text-gray-800 dark:text-gray-300">
          {label}
        </label>
      )}
      <motion.input
        whileFocus={{ scale: 1.01 }}
        className={classes}
        type={type}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;