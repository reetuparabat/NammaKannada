import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try Again',
  className = '',
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`relative overflow-hidden rounded-2xl border border-red-200 bg-red-50/80 p-6 shadow-sm backdrop-blur-sm dark:border-red-500/30 dark:bg-gradient-to-br dark:from-red-950/40 dark:via-slate-900/90 dark:to-slate-950/90 dark:shadow-lg dark:shadow-red-950/20 ${className}`}
    >
      {/* Decorative subtle red corner glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-red-500/10 blur-2xl" />

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Red Icon Badge */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 border border-red-200 text-red-600 shadow-sm dark:bg-red-500/15 dark:border-red-500/30 dark:text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-red-900 tracking-tight dark:text-red-200">
            {title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-red-700 break-words dark:text-slate-300">
            {message}
          </p>

          {/* Optional Retry Button */}
          {onRetry && (
            <div className="mt-4 flex items-center">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-800 border border-red-300 transition-all duration-150 hover:bg-red-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400/50 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40 dark:hover:bg-red-500/30 dark:hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                <span>{retryText}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;
