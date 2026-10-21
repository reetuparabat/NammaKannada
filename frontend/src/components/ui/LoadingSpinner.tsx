import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
  centered?: boolean;
}

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
  xl: 'h-16 w-16 border-4',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export function LoadingSpinner({
  size = 'md',
  message,
  className = '',
  centered = true,
}: LoadingSpinnerProps) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Subtle glowing background aura */}
        <div
          className={`absolute rounded-full bg-amber-500/20 blur-md ${
            size === 'sm'
              ? 'h-6 w-6'
              : size === 'md'
              ? 'h-10 w-10'
              : size === 'lg'
              ? 'h-16 w-16'
              : 'h-20 w-20'
          }`}
        />
        {/* Amber spinning ring */}
        <div
          className={`animate-spin rounded-full border-solid border-amber-500/20 border-t-amber-400 border-r-amber-500 shadow-sm ${sizeClasses[size]}`}
          aria-hidden="true"
        />
      </div>

      {message && (
        <p
          className={`font-medium tracking-wide text-slate-600 dark:text-slate-300 animate-pulse text-center ${textSizeClasses[size]}`}
        >
          {message}
        </p>
      )}
      <span className="sr-only">{message || 'Loading...'}</span>
    </div>
  );

  if (centered) {
    return (
      <div className="flex min-h-[140px] w-full items-center justify-center p-6">
        {content}
      </div>
    );
  }

  return content;
}

export default LoadingSpinner;
