import { clsx } from "clsx"

export function cn(...inputs) {
  return clsx(inputs)
}

// Design Tokens
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  },
  purple: {
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
  },
  accent: {
    500: '#22c55e',
    600: '#16a34a',
  }
}

export const typography = {
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem', 
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
}

export const spacing = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
}

export const animations = {
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  }
}