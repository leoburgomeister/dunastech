'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn, formatCPF } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  maskType?: 'cpf' | 'phone' | 'none';
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon: Icon, iconRight: IconRight, maskType = 'none', inputSize = 'md', className, onChange, value, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (maskType === 'cpf') {
        const formatted = formatCPF(e.target.value);
        e.target.value = formatted;
      } else if (maskType === 'phone') {
        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
        if (cleaned.length > 7) formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        e.target.value = formatted;
      }
      onChange?.(e);
    };

    const sizeClasses = {
      sm: 'h-8 text-xs',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          )}
          <input
            ref={ref}
            value={value}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              'w-full rounded-lg border bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]',
              'transition-all duration-200 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/30 focus:border-[var(--color-border-focus)]',
              sizeClasses[inputSize],
              Icon ? 'pl-10' : 'pl-3',
              IconRight ? 'pr-10' : 'pr-3',
              error
                ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/30'
                : focused
                ? 'border-[var(--color-border-focus)]'
                : 'border-[var(--color-border)]',
            )}
            {...props}
          />
          {IconRight && (
            <IconRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          )}
        </div>
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
