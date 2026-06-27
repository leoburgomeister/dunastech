'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Trophy, ClipboardCheck, User, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn, slugify } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { SearchBar } from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';
import { allDestinos } from '@/data/mockData';
import { useState } from 'react';

const bottomTabs = [
  { href: '/', icon: Compass, translationKey: 'explore' },
  { href: '/ranking', icon: Trophy, translationKey: 'ranking' },
  { href: '/avaliar', icon: ClipboardCheck, translationKey: 'evaluate' },
  { href: '/perfil', icon: User, translationKey: 'profile' },
];

export default function TouristLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const tNav = useTranslations('nav');
  const tAuth = useTranslations('auth');

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="h-9 w-9 rounded-xl gradient-sand flex items-center justify-center">
              <Sun className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-[var(--color-text)] tracking-tight leading-none">
                DUNAS<span className="text-[var(--color-accent)]">TECH</span>
              </h1>
              <p className="text-[10px] text-[var(--color-text-muted)] leading-none mt-0.5">Observatório Potiguar</p>
            </div>
          </Link>

          {/* Search — desktop */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <SearchBar
              placeholder="Buscar destinos..."
              suggestions={allDestinos}
              onSelect={(dest) => {
                window.location.href = `/destino/${slugify(dest)}`;
              }}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <LanguageSelector size="sm" />
            <ThemeToggle size="sm" />
            {isAuthenticated ? (
              <Link href="/perfil" className="h-8 w-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform">
                {user?.displayName?.charAt(0) || 'U'}
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="primary">{tAuth('login')}</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Bottom Navigation — Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-strong border-t border-[var(--color-border)]">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomTabs.map((tab) => {
            const isActive = tab.href === '/' 
              ? pathname === '/' 
              : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                )}
              >
                <tab.icon className={cn('h-5 w-5', isActive && 'scale-110')} />
                <span className="text-[10px] font-medium">
                  {tNav(tab.translationKey)}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0 h-0.5 w-8 rounded-full bg-[var(--color-primary)]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer — Desktop */}
      <footer className="hidden lg:block border-t border-[var(--color-border)] py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <p>© 2026 DunasTech. Feito com ❤️ para o Hackathon do Sol.</p>
          <div className="flex items-center gap-4">
            <Link href="/gestao" className="hover:text-[var(--color-text)] transition-colors">Gestão</Link>
            <Link href="/pitch" className="hover:text-[var(--color-text)] transition-colors">Pitch</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
