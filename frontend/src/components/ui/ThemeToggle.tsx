'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/80 text-amber-400 transition-all duration-200 hover:border-amber-500/50 hover:bg-slate-800 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 active:scale-95 shadow-sm ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-200 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 rotate-0 scale-100 transition-all duration-200 text-indigo-500" />
      )}
    </button>
  );
}

export default ThemeToggle;
