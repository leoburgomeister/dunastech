'use client';

import { useEffect, useId, useMemo, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ENTER_MS = 280;
const EXIT_MS = 180;
/** Quanto do deslocamento até a origem o painel percorre ao abrir. */
const ORIGIN_PULL = 0.07;
const ORIGIN_MAX_PX = 48;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  /** Ponto do viewport de onde o painel nasce — normalmente o centro do card que abriu. */
  origin?: { x: number; y: number } | null;
  className?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, subtitle, icon, origin, className, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // O painel começa deslocado na direção de quem o abriu, para parecer que saiu dali.
  const closedTransform = useMemo(() => {
    if (!origin || typeof window === 'undefined') return 'scale(0.96)';
    const pull = (delta: number) =>
      Math.max(-ORIGIN_MAX_PX, Math.min(ORIGIN_MAX_PX, delta * ORIGIN_PULL));
    const dx = pull(origin.x - window.innerWidth / 2);
    const dy = pull(origin.y - window.innerHeight / 2);
    return `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(0.96)`;
  }, [origin]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const trapTab = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!items || items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      inert={!open}
      className={cn(
        'fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6',
        !open && 'pointer-events-none'
      )}
    >
      <div
        onClick={onClose}
        style={{ transitionDuration: `${open ? ENTER_MS : EXIT_MS}ms` }}
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-[3px] transition-opacity ease-out motion-reduce:!duration-100',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={trapTab}
        style={{
          transform: open ? 'translate(0, 0) scale(1)' : closedTransform,
          transitionProperty: 'opacity, transform',
          transitionDuration: `${open ? ENTER_MS : EXIT_MS}ms`,
          transitionTimingFunction: open
            ? 'cubic-bezier(0.16, 1, 0.3, 1)'
            : 'cubic-bezier(0.4, 0, 1, 1)',
        }}
        className={cn(
          'surface-card relative w-full max-w-2xl max-h-[85vh] overflow-y-auto p-0 shadow-2xl outline-none',
          'motion-reduce:!transform-none motion-reduce:!duration-100',
          open ? 'opacity-100' : 'opacity-0',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-[var(--color-border-light)]">
          <div className="flex items-center gap-3 min-w-0">
            {icon}
            <div className="min-w-0">
              <h2 id={titleId} className="text-sm font-bold text-[var(--color-text)] leading-snug">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
