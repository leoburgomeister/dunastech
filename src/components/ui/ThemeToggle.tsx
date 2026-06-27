'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className={cn(
        'rounded-full bg-[var(--color-surface-alt)]',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
      )} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer',
        'hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        isDark ? 'bg-[var(--color-surface-alt)]' : 'bg-[var(--color-accent-soft)]',
        className,
      )}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <Sun
        className={cn(
          'absolute transition-all duration-300',
          size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
          isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100 text-[var(--color-accent)]',
        )}
      />
      <Moon
        className={cn(
          'absolute transition-all duration-300',
          size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
          isDark ? 'opacity-100 rotate-0 scale-100 text-[var(--color-primary)]' : 'opacity-0 -rotate-90 scale-0',
        )}
      />
    </button>
  );
}
