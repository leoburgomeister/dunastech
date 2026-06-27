'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  trend?: { value: number; direction: 'up' | 'down' };
  icon: LucideIcon;
  accentColor?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const accentColors = {
  primary: {
    bg: 'bg-[var(--color-primary-soft)]',
    icon: 'text-[var(--color-primary)]',
    ring: 'ring-[var(--color-primary)]/10',
  },
  accent: {
    bg: 'bg-[var(--color-accent-soft)]',
    icon: 'text-[var(--color-accent)]',
    ring: 'ring-[var(--color-accent)]/10',
  },
  success: {
    bg: 'bg-[var(--color-success-soft)]',
    icon: 'text-[var(--color-success)]',
    ring: 'ring-[var(--color-success)]/10',
  },
  warning: {
    bg: 'bg-[var(--color-warning-soft)]',
    icon: 'text-[var(--color-warning)]',
    ring: 'ring-[var(--color-warning)]/10',
  },
  danger: {
    bg: 'bg-[var(--color-danger-soft)]',
    icon: 'text-[var(--color-danger)]',
    ring: 'ring-[var(--color-danger)]/10',
  },
  info: {
    bg: 'bg-[var(--color-info-soft)]',
    icon: 'text-[var(--color-info)]',
    ring: 'ring-[var(--color-info)]/10',
  },
};

export function KPICard({ title, value, trend, icon: Icon, accentColor = 'primary', className }: KPICardProps) {
  const colors = accentColors[accentColor];

  return (
    <div className={cn('surface-card p-5 flex items-start gap-4', className)}>
      <div className={cn('flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ring-1', colors.bg, colors.ring)}>
        <Icon className={cn('h-5 w-5', colors.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold text-[var(--color-text)] font-[var(--font-heading)] tracking-tight">{value}</p>
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-semibold pb-1',
                trend.direction === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
