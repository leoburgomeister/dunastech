'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, LayoutDashboard, Sparkles, ChevronDown, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const panels = [
  {
    id: 'tourist',
    href: '/',
    icon: Compass,
    label: 'Explorador',
    sublabel: 'App do Turista',
    color: 'text-[var(--color-primary)]',
    activeBg: 'bg-[var(--color-primary-soft)]',
    activeBorder: 'border-[var(--color-primary)]/40',
    dot: 'bg-[var(--color-primary)]',
  },
  {
    id: 'gestao',
    href: '/gestao',
    icon: LayoutDashboard,
    label: 'Gestão',
    sublabel: 'Painel Administrativo',
    color: 'text-[var(--color-accent)]',
    activeBg: 'bg-[var(--color-accent-soft)]',
    activeBorder: 'border-[var(--color-accent)]/40',
    dot: 'bg-[var(--color-accent)]',
  },
  {
    id: 'pitch',
    href: '/pitch',
    icon: BarChart2,
    label: 'Pitch',
    sublabel: 'Apresentação do Projeto',
    color: 'text-purple-500',
    activeBg: 'bg-purple-500/10',
    activeBorder: 'border-purple-500/40',
    dot: 'bg-purple-500',
  },
];

export function PanelSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Determine active panel
  const activePanel = panels.find(p => {
    if (p.href === '/') return !pathname.startsWith('/gestao') && !pathname.startsWith('/pitch') && !pathname.startsWith('/vitrine');
    return pathname.startsWith(p.href);
  }) ?? panels[0];

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'group flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 transition-all duration-200 cursor-pointer select-none',
          'bg-[var(--color-surface-alt)] border-[var(--color-border-light)]',
          'hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border)]',
          open && 'bg-[var(--color-surface-hover)] border-[var(--color-border)]',
        )}
        title="Trocar painel"
      >
        {/* Active dot */}
        <span className={cn('h-2 w-2 rounded-full flex-shrink-0 shadow-sm', activePanel.dot)} />

        {/* Active label */}
        <span className="text-[10.5px] font-bold text-[var(--color-text)] hidden sm:block">
          {activePanel.label}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            'h-3 w-3 text-[var(--color-text-muted)] transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 w-56 z-50',
            'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl shadow-black/10',
            'animate-fade-in-up overflow-hidden',
          )}
        >
          {/* Header */}
          <div className="px-3.5 py-2.5 border-b border-[var(--color-border-light)] flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)] animate-pulse" />
            <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
              Trocar Painel
            </span>
          </div>

          {/* Panel list */}
          <div className="p-1.5 space-y-0.5">
            {panels.map(panel => {
              const isActive = panel.id === activePanel.id;
              return (
                <Link
                  key={panel.id}
                  href={panel.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group select-none',
                    isActive
                      ? cn(panel.activeBg, panel.activeBorder, 'border')
                      : 'hover:bg-[var(--color-surface-hover)] border border-transparent',
                  )}
                >
                  <div className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    isActive ? panel.activeBg : 'bg-[var(--color-surface-alt)]',
                  )}>
                    <panel.icon className={cn('h-4 w-4', isActive ? panel.color : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]')} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'text-[11px] font-black leading-tight',
                      isActive ? panel.color : 'text-[var(--color-text)]',
                    )}>
                      {panel.label}
                    </p>
                    <p className="text-[9px] text-[var(--color-text-muted)] truncate">
                      {panel.sublabel}
                    </p>
                  </div>
                  {isActive && (
                    <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', panel.dot)} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-3.5 py-2 border-t border-[var(--color-border-light)]">
            <p className="text-[8.5px] text-[var(--color-text-muted)] text-center">
              DunasTech · Observatório Potiguar 2026
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
