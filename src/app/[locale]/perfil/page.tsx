'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, CreditCard, Mail, Calendar, Compass, Navigation, ArrowLeft, LogOut, Trash2 
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/providers/AuthProvider';
import TouristLayout from '@/components/tourist/TouristLayout';
import { slugify } from '@/lib/utils';

interface RouteHistoryItem {
  id: string;
  title: string;
  style: string;
  duration: string;
  transport: string;
  date: string;
  destinations: string[];
}

const styleLabels: Record<string, string> = {
  adventure: 'Aventura & Dunas 🏄‍♂️',
  relax: 'Relaxar & Natureza 🐚',
  culture: 'História & Cultura 🏰',
  gastronomy: 'Gastronomia 🦐',
};

const durationLabels: Record<string, string> = {
  '1day': '1 Dia 📅',
  weekend: 'Fim de Semana 🌅',
  '1week': '1 Semana 🎒',
};

const transportLabels: Record<string, string> = {
  buggy: 'Buggy / 4x4 🚗',
  shuttle: 'Translado / Vans 🚌',
  hike: 'Caminhada / Trilha 🥾',
};

export default function PerfilPage() {
  const { user, isAuthenticated, signOutUser, loading } = useAuth();
  const [history, setHistory] = useState<RouteHistoryItem[]>([]);
  const router = useRouter();

  // Automatic redirect if not logged in
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/perfil');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dunastech_route_history');
      if (stored) {
        setTimeout(() => {
          setHistory(JSON.parse(stored));
        }, 0);
      }
    }
  }, []);

  const handleClearHistory = () => {
    if (confirm('Deseja realmente limpar seu histórico de rotas?')) {
      localStorage.removeItem('dunastech_route_history');
      setHistory([]);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    router.push('/');
  };

  if (loading || !isAuthenticated) {
    return (
      <TouristLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-sm text-[var(--color-text-muted)] animate-pulse">
          Carregando perfil...
        </div>
      </TouristLayout>
    );
  }


  return (
    <TouristLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
        {/* Header navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Explorar
          </Link>
          <Button variant="ghost" size="sm" className="text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]/20" icon={LogOut} onClick={handleLogout}>
            Sair da Conta
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* User Info Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="text-center py-8 space-y-4">
              <div className="h-20 w-20 rounded-full gradient-ocean mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">{user?.displayName || 'Usuário'}</h2>
                <Badge variant="primary" size="sm" className="mt-1">Turista</Badge>
              </div>
            </Card>

            <Card className="space-y-4">
              <CardHeader>
                <CardTitle className="text-sm">Dados da Conta</CardTitle>
              </CardHeader>
              
              <div className="space-y-3 text-xs">
                {user?.email && (
                  <div className="space-y-1">
                    <p className="font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> E-mail</p>
                    <p className="text-[var(--color-text)] font-mono">{user.email}</p>
                  </div>
                )}
                
                {user?.uid && (
                  <div className="space-y-1">
                    <p className="font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Token/CPF Identificador</p>
                    <p className="text-[var(--color-text)] font-mono truncate">{user.uid}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Route History List */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-border)] pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-[var(--color-primary)]" />
                  Histórico de Rotas Geradas
                </CardTitle>
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" className="text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]/20" icon={Trash2} onClick={handleClearHistory}>
                    Limpar
                  </Button>
                )}
              </CardHeader>

              {history.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <Compass className="h-12 w-12 text-[var(--color-text-muted)] mx-auto opacity-40 animate-pulse-soft" />
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-text)]">Nenhuma rota no histórico</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Suas rotas sugeridas pelo planejador IA aparecerão listadas aqui para consulta rápida.
                    </p>
                  </div>
                  <Link href="/">
                    <Button size="sm">Planejar Rota Agora</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border)]">
                  {history.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-[var(--color-text)]">{item.title}</h4>
                        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{item.date}</span>
                      </div>
                      
                      {/* Criteria configuration labels */}
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="primary" size="sm">
                          {styleLabels[item.style] || item.style}
                        </Badge>
                        <Badge variant="info" size="sm">
                          {durationLabels[item.duration] || item.duration}
                        </Badge>
                        <Badge variant="success" size="sm">
                          {transportLabels[item.transport] || item.transport}
                        </Badge>
                      </div>

                      {/* Route stops / Destinations link */}
                      <div className="flex flex-wrap gap-2 pt-1 items-center">
                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mr-1">Roteiro:</span>
                        {item.destinations.map((dest, i) => (
                          <div key={dest} className="flex items-center gap-1.5">
                            {i > 0 && <span className="text-[var(--color-text-muted)] text-xs">→</span>}
                            <Link href={`/destino/${slugify(dest)}`} className="text-xs font-bold text-[var(--color-primary)] hover:underline">
                              📍 {dest}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>
      </div>
    </TouristLayout>
  );
}
