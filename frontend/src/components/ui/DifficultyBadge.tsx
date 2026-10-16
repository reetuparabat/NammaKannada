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
      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
    dotClasses: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]',
  },
  intermediate: {
    label: 'Intermediate',
    kannadaLabel: 'ಮಧ್ಯಮ',
    badgeClasses:
      'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
    dotClasses: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]',
  },
  advanced: {
    label: 'Advanced',
    kannadaLabel: 'ಕಠಿಣ',
    badgeClasses:
      'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/20',
    dotClasses: 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.7)]',
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
      badgeClasses: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
      dotClasses: 'bg-slate-400',
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
