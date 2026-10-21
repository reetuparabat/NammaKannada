import React from 'react';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | string;

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  size?: 'sm' | 'md';
  className?: string;
  showDot?: boolean;
}

const configMap: Record<
  string,
  { label: string; kannadaLabel: string; badgeClasses: string; dotClasses: string }
> = {
  beginner: {
    label: 'Beginner',
    kannadaLabel: 'ಸುಲಭ',
    badgeClasses:
      'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20',
    dotClasses: 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]',
  },
  intermediate: {
    label: 'Intermediate',
    kannadaLabel: 'ಮಧ್ಯಮ',
    badgeClasses:
      'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30 dark:hover:bg-amber-500/20',
    dotClasses: 'bg-amber-500 dark:bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]',
  },
  advanced: {
    label: 'Advanced',
    kannadaLabel: 'ಕಠಿಣ',
    badgeClasses:
      'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30 dark:hover:bg-rose-500/20',
    dotClasses: 'bg-rose-500 dark:bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.7)]',
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[11px] gap-1.5',
  md: 'px-2.5 py-1 text-xs gap-2',
};

const dotSizeStyles = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
};

export function DifficultyBadge({
  difficulty,
  size = 'sm',
  className = '',
  showDot = true,
}: DifficultyBadgeProps) {
  const normalized = (difficulty || '').toLowerCase().trim();
  const config =
    configMap[normalized] || {
      label: difficulty || 'Unknown',
      kannadaLabel: '',
      badgeClasses: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600/40',
      dotClasses: 'bg-slate-500 dark:bg-slate-400',
    };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide transition-colors ${
        sizeStyles[size]
      } ${config.badgeClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`shrink-0 rounded-full ${dotSizeStyles[size]} ${config.dotClasses}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}

export default DifficultyBadge;
