'use client';

import { useState, useMemo } from 'react';
import { Trophy, Shield, AlertTriangle, Activity, MapPin, Users, Info, ChevronDown, ChevronUp, AlertCircle, Heart, ArrowRight } from 'lucide-react';
import { cn, slugify } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { destinosInfo, fluxoData, calcularISA, investimentosData, Feedback } from '@/data/mockData';
import Link from 'next/link';

function getISAConfig(score: number) {
  if (score >= 80) return { label: 'Saudável', variant: 'success' as const, icon: Shield, color: 'success' as const };
  if (score >= 60) return { label: 'Atenção', variant: 'warning' as const, icon: Activity, color: 'warning' as const };
  return { label: 'Crítico', variant: 'danger' as const, icon: AlertTriangle, color: 'danger' as const };
}

export default function RankingPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'healthy' | 'attention' | 'critical'>('all');
  const [expandedDestName, setExpandedDestName] = useState<string | null>(null);

  const ranked = useMemo(() => {
    return destinosInfo.map(d => {
      const isa = calcularISA(d.nome, [] as Feedback[]);
      const fluxo = fluxoData.find(f => f.destino === d.nome);
      const investimento = investimentosData.find(i => i.destino === d.nome);
      return { ...d, isa, fluxo, investimento };
    }).sort((a, b) => b.isa - a.isa);
  }, []);

  const avgISA = Math.round(ranked.reduce((s, d) => s + d.isa, 0) / ranked.length);
  const healthySpots = ranked.filter(d => d.isa >= 80);
  const attentionSpots = ranked.filter(d => d.isa >= 60 && d.isa < 80);
  const criticalSpots = ranked.filter(d => d.isa < 60);

  const filteredSpots = useMemo(() => {
    if (selectedCategory === 'healthy') return healthySpots;
    if (selectedCategory === 'attention') return attentionSpots;
    if (selectedCategory === 'critical') return criticalSpots;
    return ranked;
  }, [selectedCategory, ranked, healthySpots, attentionSpots, criticalSpots]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Trophy className="h-6 w-6 text-[var(--color-accent)] animate-bounce" />
          <h1 className="text-3xl font-extrabold text-[var(--color-text)]">Ranking dos Destinos</h1>
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          Índice de Saúde do Atrativo (ISA) calculado em tempo real para o Rio Grande do Norte
        </p>
      </div>

      {/* Summary Cards (Clickable) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 stagger-children">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            "surface-card text-center p-4 cursor-pointer transition-all duration-300 hover:scale-[1.03] focus:outline-none border",
            selectedCategory === 'all' 
              ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-lg bg-[var(--color-primary-soft)]/20" 
              : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
          )}
        >
          <p className="text-3xl font-bold text-[var(--color-primary)] font-[var(--font-mono)]">{avgISA}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-semibold flex items-center justify-center gap-1">
            <Activity className="h-3 w-3" /> ISA Médio
          </p>
        </button>

        <button
          onClick={() => setSelectedCategory('healthy')}
          className={cn(
            "surface-card text-center p-4 cursor-pointer transition-all duration-300 hover:scale-[1.03] focus:outline-none border",
            selectedCategory === 'healthy' 
              ? "border-[var(--color-success)] ring-2 ring-[var(--color-success)]/20 shadow-lg bg-[var(--color-success-soft)]/20" 
              : "border-[var(--color-border)] hover:border-[var(--color-success)]/50"
          )}
        >
          <p className="text-3xl font-bold text-[var(--color-success)] font-[var(--font-mono)]">{healthySpots.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-semibold flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" /> Saudáveis
          </p>
        </button>

        <button
          onClick={() => setSelectedCategory('attention')}
          className={cn(
            "surface-card text-center p-4 cursor-pointer transition-all duration-300 hover:scale-[1.03] focus:outline-none border",
            selectedCategory === 'attention' 
              ? "border-[var(--color-warning)] ring-2 ring-[var(--color-warning)]/20 shadow-lg bg-[var(--color-warning-soft)]/20" 
              : "border-[var(--color-border)] hover:border-[var(--color-warning)]/50"
          )}
        >
          <p className="text-3xl font-bold text-[var(--color-warning)] font-[var(--font-mono)]">{attentionSpots.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-semibold flex items-center justify-center gap-1">
            <Info className="h-3 w-3" /> Atenção
          </p>
        </button>

        <button
          onClick={() => setSelectedCategory('critical')}
          className={cn(
            "surface-card text-center p-4 cursor-pointer transition-all duration-300 hover:scale-[1.03] focus:outline-none border",
            selectedCategory === 'critical' 
              ? "border-[var(--color-danger)] ring-2 ring-[var(--color-danger)]/20 shadow-lg bg-[var(--color-danger-soft)]/20 animate-pulse" 
              : "border-[var(--color-border)] hover:border-[var(--color-danger)]/50"
          )}
        >
          <p className="text-3xl font-bold text-[var(--color-danger)] font-[var(--font-mono)]">{criticalSpots.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-semibold flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Críticos
          </p>
        </button>
      </div>

      {/* Expanded Diagnostic Section based on active selection */}
      <Card className="mb-8 p-5 border border-[var(--color-border)] bg-[var(--color-surface-alt)]/40">
        {selectedCategory === 'all' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--color-primary)]" />
              Diagnóstico do Estado (Geral)
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              O Rio Grande do Norte apresenta uma média geral de <strong>{avgISA} pontos</strong>, classificada como <strong>Atenção</strong>.
              O índice ISA é calculado a partir de taxas de superlotação de visitantes, investimentos em infraestrutura e saneamento, e feedback em tempo real sobre limpeza, segurança e conservação.
            </p>
            <div className="flex gap-2 pt-2 text-[10px] text-[var(--color-text-muted)] font-medium">
              <span>🟢 {healthySpots.length} Saudáveis</span>
              <span>🟡 {attentionSpots.length} Em Atenção</span>
              <span className="text-[var(--color-danger)] font-bold">🔴 {criticalSpots.length} Críticos</span>
            </div>
          </div>
        )}

        {selectedCategory === 'healthy' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--color-success)] flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Selo de Zeladoria Potiguar
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Estes <strong>{healthySpots.length} destinos</strong> operam com altos padrões de sustentabilidade e infraestrutura. Possuem ótima acessibilidade, investimentos contínuos de saneamento e uma recepção de público excelente. 
              Parabéns aos municípios de <strong>{Array.from(new Set(healthySpots.map(s => s.municipio))).join(', ')}</strong> pelo cuidado!
            </p>
            <div className="bg-[var(--color-success-soft)] text-[var(--color-success)] text-[10px] p-2 rounded-lg font-semibold flex items-center gap-1.5 mt-2">
              <Heart className="h-3.5 w-3.5 fill-[var(--color-success)]" />
              Boas Práticas recomendadas: Monitoramento constante da capacidade de carga e incentivo ao comércio Cadastur local.
            </div>
          </div>
        )}

        {selectedCategory === 'attention' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--color-warning)] flex items-center gap-2">
              <Info className="h-4 w-4" />
              Fatores de Atenção
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Os <strong>{attentionSpots.length} pontos</strong> em estado de atenção exigem planejamento estratégico. Os principais gargalos identificados são o crescimento acelerado de visitantes sem o devido suporte de infraestrutura turística, e variações bruscas nos modais de transporte terrestre e aéreo.
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              Foco prioritário: Estudo de controle de fluxo sazonal e captação de emendas de melhoria sanitária.
            </p>
          </div>
        )}

        {selectedCategory === 'critical' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--color-danger)]/10 pb-2">
              <h3 className="text-sm font-bold text-[var(--color-danger)] flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-[var(--color-danger)] animate-pulse" />
                Pontos de Alerta Máximo (ISA Crítico)
              </h3>
              <Badge variant="danger" size="sm">Urgente</Badge>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Foram identificados <strong>{criticalSpots.length} destinos</strong> com ISA abaixo de 60 pontos. Estes pontos estão sofrendo de severa <strong>superlotação turística</strong>, falta crônica de investimentos locais em saneamento básico ou avaliações de segurança e conservação preocupantes.
            </p>
            <div className="space-y-1.5 bg-[var(--color-danger-soft)]/40 p-3 rounded-xl border border-[var(--color-danger)]/15">
              <p className="text-[10px] font-bold text-[var(--color-danger)] uppercase tracking-wider">Ações de Contingência Recomendadas:</p>
              <ul className="text-[10px] text-[var(--color-text-secondary)] space-y-1 list-disc pl-4">
                <li>Limitação temporária de licenças de passeios comerciais/veículos.</li>
                <li>Auditoria urgente nas instalações de descarte de resíduos e banheiros públicos.</li>
                <li>Reforço na sinalização e segurança no entorno dos pontos críticos.</li>
              </ul>
            </div>
          </div>
        )}
      </Card>

      {/* Title indicating what is filtered */}
      <h2 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
        {selectedCategory === 'all' && `Todos os Destinos (${filteredSpots.length})`}
        {selectedCategory === 'healthy' && `Destinos Saudáveis (${filteredSpots.length})`}
        {selectedCategory === 'attention' && `Destinos em Atenção (${filteredSpots.length})`}
        {selectedCategory === 'critical' && `Destinos Críticos (${filteredSpots.length})`}
      </h2>

      {/* Ranking List */}
      <div className="space-y-3 stagger-children">
        {filteredSpots.map((dest) => {
          const config = getISAConfig(dest.isa);
          const StatusIcon = config.icon;
          const isExpanded = expandedDestName === dest.nome;

          return (
            <Card 
              key={dest.nome} 
              variant="interactive" 
              className={cn(
                "flex flex-col transition-all duration-300 !p-4 border",
                isExpanded 
                  ? "border-[var(--color-primary)] shadow-md" 
                  : "border-[var(--color-border-light)]"
              )}
            >
              {/* Top Row: Click to expand / collapse */}
              <div 
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedDestName(isExpanded ? null : dest.nome)}
              >
                {/* Status Indicator Icon */}
                <div className={cn(
                  'flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm bg-[var(--color-surface-alt)]'
                )}>
                  <StatusIcon className={cn('h-5 w-5', {
                    'text-[var(--color-success)]': config.color === 'success',
                    'text-[var(--color-warning)]': config.color === 'warning',
                    'text-[var(--color-danger)]': config.color === 'danger',
                  })} />
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

                {/* ISA Score + Toggle Button */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-24 text-right">
                    <span className="text-lg font-bold font-[var(--font-mono)] text-[var(--color-text)]">{dest.isa}</span>
                    <ProgressBar value={dest.isa} color={config.color} size="sm" className="mt-1" />
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-[var(--color-text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />}
                </div>
              </div>

              {/* Expandable Section */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border-light)] animate-fade-in space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: General Description and Stats */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Sobre o Ponto</h4>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{dest.descricao}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-[var(--color-surface)] p-2.5 rounded-xl border border-[var(--color-border-light)]">
                          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Investimento Anual</p>
                          <p className="text-sm font-bold text-[var(--color-primary)] font-[var(--font-mono)]">
                            {dest.investimento ? `R$ ${(dest.investimento.total_mil).toLocaleString('pt-BR')}k` : '—'}
                          </p>
                        </div>
                        <div className="bg-[var(--color-surface)] p-2.5 rounded-xl border border-[var(--color-border-light)]">
                          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Saturação Turística</p>
                          <p className={cn(
                            "text-sm font-bold font-[var(--font-mono)]",
                            dest.fluxo && dest.fluxo.saturacao_turistica > 80 ? "text-[var(--color-danger)]" : "text-[var(--color-text)]"
                          )}>
                            {dest.fluxo ? `${dest.fluxo.saturacao_turistica}%` : '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Metrics Analysis & Actions */}
                    <div className="space-y-3 bg-[var(--color-surface-alt)] p-3.5 rounded-xl border border-[var(--color-border-light)]/60">
                      <h4 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1">
                        🔬 Análise de Métricas do Ponto
                      </h4>

                      {/* Critério checklist based on destination index or ISA values */}
                      <div className="space-y-2 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--color-text-muted)]">Zeladoria e Limpeza</span>
                          <span className={cn("font-semibold", dest.isa >= 70 ? "text-[var(--color-success)]" : "text-[var(--color-warning)]")}>
                            {dest.isa >= 80 ? "Excelente" : dest.isa >= 60 ? "Suficiente" : "Deficiente"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--color-text-muted)]">Sinalização de Segurança</span>
                          <span className={cn("font-semibold", dest.isa >= 75 ? "text-[var(--color-success)]" : "text-[var(--color-warning)]")}>
                            {dest.isa >= 75 ? "Adequada" : "Insuficiente"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--color-text-muted)]">Capacidade Sanitária</span>
                          <span className={cn("font-semibold", dest.investimento && dest.investimento.investimento_saneamento_mil > 300 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]")}>
                            {dest.investimento && dest.investimento.investimento_saneamento_mil > 300 ? "Segura" : "Risco de Sobrecarga"}
                          </span>
                        </div>
                      </div>

                      {/* Warnings or actions */}
                      <div className="pt-2 border-t border-[var(--color-border-light)]">
                        {dest.isa < 60 ? (
                          <div className="text-[10px] text-[var(--color-danger)] bg-[var(--color-danger-soft)] p-2 rounded-lg font-medium flex items-start gap-1">
                            <AlertCircle className="h-3.5 w-3.5 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Alerta de Degradação:</strong> Altíssima pressão de visitantes com saneamento vulnerável. Ação prioritária necessária!
                            </div>
                          </div>
                        ) : dest.isa < 80 ? (
                          <div className="text-[10px] text-[var(--color-warning)] bg-[var(--color-warning-soft)] p-2 rounded-lg font-medium flex items-start gap-1">
                            <Info className="h-3.5 w-3.5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Alerta Moderado:</strong> Acompanhar capacidade de carga nos finais de semana e feriados nacionais.
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-[var(--color-success)] bg-[var(--color-success-soft)] p-2 rounded-lg font-medium flex items-start gap-1">
                            <Shield className="h-3.5 w-3.5 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Ponto de Referência:</strong> Excelente equilíbrio entre volume de visitantes e preservação local.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between border-t border-[var(--color-border-light)] pt-3 text-xs">
                    <span className="text-[10px] text-[var(--color-text-muted)]">Código Slug: <code>{slugify(dest.nome)}</code></span>
                    <Link href={`/destino/${slugify(dest.nome)}`} className="inline-flex items-center gap-1 text-[var(--color-primary)] font-bold hover:underline">
                      Abrir Vitrine Completa <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
