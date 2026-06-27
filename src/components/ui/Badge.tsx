'use client';

import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

const badgeVariants = {
  default: 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
  primary: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20',
  accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/20',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/20',
  warning: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]/20',
  danger: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/20',
  info: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border border-[var(--color-info)]/20',
};

const badgeSizes = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

interface BadgeProps {
  variant?: keyof typeof badgeVariants;
  size?: keyof typeof badgeSizes;
  dot?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Badge({ variant = 'default', size = 'md', dot, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap',
        badgeVariants[variant],
        badgeSizes[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-[var(--color-text-muted)]': variant === 'default',
            'bg-[var(--color-primary)]': variant === 'primary',
            'bg-[var(--color-accent)]': variant === 'accent',
            'bg-[var(--color-success)]': variant === 'success',
            'bg-[var(--color-warning)]': variant === 'warning',
            'bg-[var(--color-danger)]': variant === 'danger',
            'bg-[var(--color-info)]': variant === 'info',
          })}
        />
      )}
      {children}
    </span>
  );
}
