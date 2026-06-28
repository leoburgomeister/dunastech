'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Info, type LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  trend?: { value: number; direction: 'up' | 'down' };
  icon: LucideIcon;
  accentColor?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  formula?: { expressao: string; explicacao: string };
  onClick?: () => void;
  active?: boolean;
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

export function KPICard({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  accentColor = 'primary', 
  className, 
  formula,
  onClick,
  active
}: KPICardProps) {
  const colors = accentColors[accentColor];
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      onClick={onClick}
      className={cn(
        'surface-card p-5 flex items-start gap-4 relative overflow-visible transition-all duration-300 border',
        onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md' : '',
        active 
          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/15 bg-[var(--color-surface-alt)]' 
          : 'border-[var(--color-border-light)]',
        className
      )}
    >
      <div className={cn('flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ring-1', colors.bg, colors.ring)}>
        <Icon className={cn('h-5 w-5', colors.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{title}</p>
          
          {formula && (
            <div 
              className="relative flex items-center"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors focus:outline-none cursor-pointer"
              >
                <Info className="h-3.5 w-3.5" />
              </button>

              {showTooltip && (
                <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl z-50 text-left animate-fade-in text-xs space-y-1.5 pointer-events-none">
                  <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-1 mb-1">
                    <span className="font-bold text-[var(--color-text)]">Fórmula de Cálculo</span>
                    <Info className="h-3 w-3 text-[var(--color-primary)]" />
                  </div>
                  <div className="font-mono text-[var(--color-primary)] bg-[var(--color-surface-alt)] px-2 py-1 rounded border border-[var(--color-border-light)] break-words text-center text-[10px]">
                    {formula.expressao}
                  </div>
                  <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">
                    {formula.explicacao}
                  </p>
                  {/* Arrow tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[var(--color-surface)] border-r border-b border-[var(--color-border)]" />
                </div>
              )}
            </div>
          )}
        </div>

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
