'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-sm hover:shadow-md active:scale-[0.98]',
  secondary:
    'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]',
  ghost:
    'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
  danger:
    'bg-[var(--color-danger)] text-white hover:opacity-90 active:scale-[0.98]',
  accent:
    'bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:bg-[var(--color-accent-hover)] shadow-sm hover:shadow-md active:scale-[0.98]',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon: Icon, iconRight: IconRight, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : Icon ? (
          <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        ) : null}
        {children}
        {IconRight && !loading && <IconRight className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
      </button>
    );
  },
);

Button.displayName = 'Button';
