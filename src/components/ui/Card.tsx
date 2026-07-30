'use client';

import { type ReactNode, type KeyboardEvent } from 'react';
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
  id?: string;
  /** Passe false quando o card já tem um controle focável próprio (evita aninhar semântica de botão). */
  asButton?: boolean;
  /** Para cards-botão que abrem/fecham um bloco de detalhes. */
  'aria-expanded'?: boolean;
  /** Para cards-botão que abrem um popup, ex.: 'dialog'. */
  'aria-haspopup'?: 'dialog' | 'menu' | 'listbox' | true;
}

export function Card({ variant = 'default', padding = 'md', className, children, onClick, id, asButton = true, 'aria-expanded': ariaExpanded, 'aria-haspopup': ariaHasPopup }: CardProps) {
  const isButton = Boolean(onClick) && asButton;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      id={id}
      onClick={onClick}
      onKeyDown={isButton ? handleKeyDown : undefined}
      role={isButton ? 'button' : undefined}
      tabIndex={isButton ? 0 : undefined}
      aria-expanded={isButton ? ariaExpanded : undefined}
      aria-haspopup={isButton ? ariaHasPopup : undefined}
      className={cn(cardVariants[variant], paddings[padding], onClick && 'cursor-pointer', className)}
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
