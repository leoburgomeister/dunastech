'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const cardVariants = {
  default: 'surface-card',
  glass: 'glass',
  interactive: 'surface-card-interactive',
  flat: 'bg-[var(--color-surface)] rounded-[var(--radius-lg)]',
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
};

interface CardProps {
  variant?: keyof typeof cardVariants;
  padding?: keyof typeof paddings;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export function Card({ variant = 'default', padding = 'md', className, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(cardVariants[variant], paddings[padding], className)}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children?: ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  className?: string;
  children?: ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn('font-semibold text-[var(--color-text)] font-[var(--font-heading)]', className)}>
      {children}
    </h3>
  );
}
