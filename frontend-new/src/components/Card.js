import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, ...props }) => {
  const baseClasses = 'glass rounded-2xl p-6 shadow-lg border border-white/30 dark:border-white/10 bg-white/20 dark:bg-white/10';
  const hoverClasses = hover ? 'hover:shadow-2xl hover:scale-[1.02] transition-all duration-300' : '';
  
  const classes = `${baseClasses} ${hoverClasses} ${className}`;

  if (hover) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className={classes}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={classes}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;