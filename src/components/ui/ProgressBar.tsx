'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const colorMap = {
  primary: 'bg-[var(--color-primary)]',
  accent: 'bg-[var(--color-accent)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]',
};

export function ProgressBar({ value, color = 'primary', label, showPercentage = false, size = 'md', className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-semibold text-[var(--color-text)] font-[var(--font-mono)]">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div className={cn(
        'w-full rounded-full bg-[var(--color-surface-alt)] overflow-hidden',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            colorMap[color],
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
