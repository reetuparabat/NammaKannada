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
      className={`relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-slate-900/90 to-slate-950/90 p-6 shadow-lg shadow-red-950/20 backdrop-blur-sm ${className}`}
    >
      {/* Decorative subtle red corner glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-red-500/10 blur-2xl" />

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Red Icon Badge */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 shadow-sm">
          <AlertCircle className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-red-200 tracking-tight">
            {title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300 break-words">
            {message}
          </p>

          {/* Optional Retry Button */}
          {onRetry && (
            <div className="mt-4 flex items-center">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-300 border border-red-500/40 transition-all duration-150 hover:bg-red-500/30 hover:text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400/50"
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
