'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  suggestions?: string[];
  onSelect?: (value: string) => void;
  onChange?: (value: string) => void;
  className?: string;
  variant?: 'default' | 'hero';
}

export function SearchBar({ placeholder = 'Buscar destinos...', suggestions = [], onSelect, onChange, className, variant = 'default' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filterSuggestions = useCallback((q: string) => {
    if (!q.trim()) return [];
    return suggestions.filter(s => s.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  }, [suggestions]);

  useEffect(() => {
    const results = filterSuggestions(query);
    setFiltered(results);
    setOpen(results.length > 0 && query.length > 0);
  }, [query, filterSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setQuery(value);
    setOpen(false);
    onSelect?.(value);
  };

  const isHero = variant === 'hero';

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      <div className={cn(
        'relative flex items-center transition-all duration-200',
        isHero
          ? 'glass-strong rounded-2xl shadow-xl'
          : 'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl',
        open && 'rounded-b-none',
      )}>
        <Search className={cn(
          'absolute left-4 text-[var(--color-text-muted)]',
          isHero ? 'h-5 w-5' : 'h-4 w-4',
        )} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e.target.value);
          }}
          onFocus={() => filtered.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none',
            isHero ? 'h-14 pl-12 pr-12 text-base' : 'h-10 pl-10 pr-10 text-sm',
          )}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); onChange?.(''); }}
            className="absolute right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className={cn(
          'absolute left-0 right-0 top-full z-50 overflow-hidden animate-fade-in',
          isHero
            ? 'glass-strong rounded-b-2xl shadow-xl border-t border-[var(--color-border)]'
            : 'bg-[var(--color-surface)] border border-t-0 border-[var(--color-border)] rounded-b-xl shadow-lg',
        )}>
          {filtered.map((item, i) => (
            <button
              key={item}
              onClick={() => handleSelect(item)}
              className={cn(
                'w-full flex items-center gap-3 px-4 text-left text-sm transition-colors cursor-pointer',
                'hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]',
                isHero ? 'py-3' : 'py-2.5',
                i === 0 && 'border-t-0',
              )}
            >
              <MapPin className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" />
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
