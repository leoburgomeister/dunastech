'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, MapPin, MessageSquare, Share2, Brain, FileText,
  Sun, ChevronLeft, ChevronRight, LogOut, Settings, ShieldCheck, Building,
  ShieldAlert, Loader2, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { PanelSwitcher } from '@/components/ui/PanelSwitcher';
import { useAuth } from '@/providers/AuthProvider';

const navItems = [
  { href: '/gestao', icon: LayoutDashboard, label: 'Visão Geral' },
  { href: '/gestao/destinos', icon: MapPin, label: 'Destinos' },
  { href: '/gestao/cidades', icon: Building, label: 'Municípios' },
  { href: '/gestao/cadastur', icon: ShieldCheck, label: 'Cadastur' },
  { href: '/gestao/feedbacks', icon: MessageSquare, label: 'Feedbacks' },
  { href: '/gestao/social', icon: Share2, label: 'Social' },
  { href: '/gestao/ia', icon: Brain, label: 'IA Diagnóstico' },
  { href: '/gestao/relatorios', icon: FileText, label: 'Relatórios' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAuthenticated, signOutUser } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 text-[var(--color-primary)] animate-spin" />
          <p className="text-sm font-semibold text-[var(--color-text-secondary)] animate-pulse">
            Verificando Credenciais...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 text-[var(--color-primary)] animate-spin" />
          <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
            Redirecionando para login...
          </p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-[scale-in_0.3s_ease-out] text-center space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-xl shadow-black/10 space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto flex items-center justify-center text-red-500 shadow-lg shadow-red-500/5">
              <ShieldAlert className="h-8 w-8 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-[var(--color-text)]">Acesso Restrito</h2>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Você está conectado como <strong className="text-[var(--color-text-secondary)] font-bold">{user?.displayName || 'visitante'}</strong> ({user?.email}). Esta área de gestão exige credenciais de administrador.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link 
                href="/"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o Início
              </Link>
              
              <button
                onClick={async () => {
                  await signOutUser();
                  router.push('/login?redirect=/gestao');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Conectar com outra conta
              </button>
            </div>
          </div>
          
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-extrabold">
            DunasTech · Observatório Potiguar 2026
          </p>
        </div>
      </div>
    );
  }

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[280px]';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex">
      {/* ═══ Sidebar ═══ */}
      <aside className={cn(
        'fixed top-0 left-0 bottom-0 z-50 flex flex-col transition-all duration-300 ease-out',
        'bg-[var(--color-surface)] border-r border-[var(--color-border)]',
        'hidden lg:flex',
        sidebarWidth,
      )}>
        {/* Logo */}
        <div className={cn('h-16 flex items-center border-b border-[var(--color-border)] px-4', collapsed && 'justify-center')}>
          <div className="h-9 w-9 rounded-xl gradient-ocean flex items-center justify-center flex-shrink-0">
            <Sun className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="ml-3">
              <h1 className="text-sm font-bold text-[var(--color-text)] tracking-tight leading-none">
                DUNAS<span className="text-[var(--color-primary)]">TECH</span>
              </h1>
              <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest mt-0.5">Gestão</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/gestao' 
              ? pathname === '/gestao' 
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-[var(--color-primary)]')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className={cn('border-t border-[var(--color-border)] p-3 space-y-2', collapsed && 'flex flex-col items-center')}>
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2">
              <ThemeToggle size="sm" />
              <LanguageSelector size="sm" />
            </div>
          )}
          {collapsed && <ThemeToggle size="sm" />}
          
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors',
              collapsed && 'justify-center px-0',
            )}
            title="Voltar ao app"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Voltar ao App</span>}
          </Link>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] shadow-sm cursor-pointer transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className={cn('flex-1 transition-all duration-300', collapsed ? 'lg:ml-[72px]' : 'lg:ml-[280px]')}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 glass-strong border-b border-[var(--color-border)] flex items-center px-6">
          {/* Mobile menu button */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mr-4">
            <div className="h-8 w-8 rounded-lg gradient-ocean flex items-center justify-center">
              <Sun className="h-4 w-4 text-white" />
            </div>
          </Link>

          {/* Breadcrumb */}
          <div className="flex-1">
            <p className="text-xs text-[var(--color-text-muted)]">Painel de Gestão</p>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {navItems.find(n => pathname === n.href || (n.href !== '/gestao' && pathname.startsWith(n.href)))?.label || 'Visão Geral'}
            </p>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2">
            <PanelSwitcher />
            <div className="h-4 w-px bg-[var(--color-border)] hidden lg:block" />
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle size="sm" />
              <LanguageSelector size="sm" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
