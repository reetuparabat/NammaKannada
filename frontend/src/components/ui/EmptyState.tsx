import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm backdrop-blur-sm sm:p-12 dark:border-slate-800/80 dark:bg-slate-900/50 ${className}`}
    >
      {/* Subtle ambient amber backdrop glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-40 w-40 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      {/* Icon container */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300 bg-[#FFF9ED] text-amber-600 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:shadow-lg dark:shadow-amber-500/10">
        {icon ? (
          <div className="flex items-center justify-center">{icon}</div>
        ) : (
          <Sparkles className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[#172554] tracking-tight sm:text-xl dark:text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-2 max-w-md text-sm text-slate-600 leading-relaxed dark:text-slate-400">
        {description}
      </p>

      {/* Action button / link */}
      {(actionHref || onAction) && actionLabel && (
        <div className="mt-6">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-amber-500/20 transition-all duration-150 hover:from-amber-400 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-amber-500/20 transition-all duration-150 hover:from-amber-400 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
