import React from 'react';
import { Difficulty } from '../types';
import { Sparkles, Zap, Flame } from 'lucide-react';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: 'sm' | 'md' | 'lg';
  showDots?: boolean;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  size = 'md',
  showDots = true,
}) => {
  const configs = {
    beginner: {
      label: 'Beginner',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      activeDots: 1,
      dotColor: 'bg-emerald-500',
      icon: Sparkles,
    },
    intermediate: {
      label: 'Intermediate',
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      activeDots: 2,
      dotColor: 'bg-amber-500',
      icon: Zap,
    },
    advanced: {
      label: 'Advanced',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
      activeDots: 3,
      dotColor: 'bg-indigo-500',
      icon: Flame,
    },
  };

  const config = configs[difficulty] || configs.beginner;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs font-medium transition-colors ${config.bg} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{config.label}</span>
      {showDots && (
        <span className="flex items-center gap-1 ml-0.5" aria-hidden="true">
          {[1, 2, 3].map((dot) => (
            <span
              key={dot}
              className={`w-1.5 h-1.5 rounded-full ${
                dot <= config.activeDots ? config.dotColor : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            />
          ))}
        </span>
      )}
    </span>
  );
};
