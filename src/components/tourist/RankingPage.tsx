'use client';

import { useMemo } from 'react';
import { Trophy, Shield, AlertTriangle, Activity, TrendingUp, TrendingDown, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/Card';
import { destinosInfo, fluxoData, calcularISA } from '@/data/mockData';
import type { Feedback } from '@/data/mockData';

function getISAConfig(score: number) {
  if (score >= 80) return { label: 'Saudável', variant: 'success' as const, icon: Shield, color: 'success' as const };
  if (score >= 60) return { label: 'Atenção', variant: 'warning' as const, icon: Activity, color: 'warning' as const };
  return { label: 'Crítico', variant: 'danger' as const, icon: AlertTriangle, color: 'danger' as const };
}

export default function RankingPage() {
  const ranked = useMemo(() => {
    return destinosInfo.map(d => {
      const isa = calcularISA(d.nome, [] as Feedback[]);
      const fluxo = fluxoData.find(f => f.destino === d.nome);
      return { ...d, isa, fluxo };
    }).sort((a, b) => b.isa - a.isa);
  }, []);

  const avgISA = Math.round(ranked.reduce((s, d) => s + d.isa, 0) / ranked.length);
  const healthy = ranked.filter(d => d.isa >= 80).length;
  const attention = ranked.filter(d => d.isa >= 60 && d.isa < 80).length;
  const critical = ranked.filter(d => d.isa < 60).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Trophy className="h-6 w-6 text-[var(--color-accent)]" />
          <h1 className="text-3xl font-extrabold text-[var(--color-text)]">Ranking dos Destinos</h1>
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          Índice de Saúde do Atrativo (ISA) calculado em tempo real
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 stagger-children">
        <Card className="text-center">
          <p className="text-3xl font-bold text-[var(--color-primary)] font-[var(--font-mono)]">{avgISA}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">ISA Médio</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-[var(--color-success)] font-[var(--font-mono)]">{healthy}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Saudáveis</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-[var(--color-warning)] font-[var(--font-mono)]">{attention}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Atenção</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-[var(--color-danger)] font-[var(--font-mono)]">{critical}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Críticos</p>
        </Card>
      </div>

      {/* Ranking List */}
      <div className="space-y-3 stagger-children">
        {ranked.map((dest, i) => {
          const config = getISAConfig(dest.isa);
          const StatusIcon = config.icon;
          return (
            <Card key={dest.nome} variant="interactive" className="flex items-center gap-4 !p-4">
              {/* Position */}
              <div className={cn(
                'flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm',
                i === 0 && 'gradient-sand text-white',
                i === 1 && 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
                i === 2 && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                i > 2 && 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]',
              )}>
                {i + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[var(--color-text)] truncate">{dest.nome}</h3>
                  <Badge variant={config.variant} size="sm" dot>
                    {config.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {dest.municipio}</span>
                  {dest.fluxo && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {(dest.fluxo.fluxo_visitantes_mes / 1000).toFixed(0)}k/mês
                    </span>
                  )}
                </div>
              </div>

              {/* ISA Score + Bar */}
              <div className="flex-shrink-0 w-32">
                <div className="flex items-center justify-between mb-1">
                  <StatusIcon className={cn('h-4 w-4', {
                    'text-[var(--color-success)]': config.color === 'success',
                    'text-[var(--color-warning)]': config.color === 'warning',
                    'text-[var(--color-danger)]': config.color === 'danger',
                  })} />
                  <span className="text-lg font-bold font-[var(--font-mono)] text-[var(--color-text)]">{dest.isa}</span>
                </div>
                <ProgressBar value={dest.isa} color={config.color} size="sm" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
