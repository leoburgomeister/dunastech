'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

const locales = [
  { code: 'pt-BR', flag: '🇧🇷', label: 'Português' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
] as const;

interface LanguageSelectorProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function LanguageSelector({ className, size = 'md' }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('pt-BR');
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Read locale from cookie on mount
  useEffect(() => {
    const cookie = document.cookie.split('; ').find(c => c.startsWith('NEXT_LOCALE='));
    if (cookie) {
      setCurrentLocale(cookie.split('=')[1]);
    }
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;
    setCurrentLocale(code);
    setOpen(false);
    window.location.reload();
  };

  const current = locales.find(l => l.code === currentLocale) || locales[0];

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 rounded-full border border-[var(--color-border)] transition-all duration-200 cursor-pointer',
          'hover:bg-[var(--color-surface-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)]',
          size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-10 px-3 text-sm',
          open && 'bg-[var(--color-surface-hover)] border-[var(--color-primary)]',
        )}
        aria-label="Selecionar idioma"
      >
        <Globe className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        <span className="hidden sm:inline">{current.flag}</span>
      </button>

      {open && (
        <div className={cn(
          'absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden animate-scale-in z-50',
          'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg',
        )}>
          {locales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => handleSelect(locale.code)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors cursor-pointer',
                'hover:bg-[var(--color-surface-hover)]',
                currentLocale === locale.code && 'bg-[var(--color-primary-soft)]',
              )}
            >
              <span className="text-lg">{locale.flag}</span>
              <span className="flex-1 text-left text-[var(--color-text)]">{locale.label}</span>
              {currentLocale === locale.code && (
                <Check className="h-4 w-4 text-[var(--color-primary)]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
