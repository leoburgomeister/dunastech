'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, DollarSign, Activity, TrendingUp, AlertTriangle, Star, Clock, Zap, MessageSquare, Filter, MapPin, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';
import { KPICard } from '@/components/ui/KPICard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  destinosInfo, fluxoData, transporteData, calcularISA,
} from '@/data/mockData';
import type { Feedback } from '@/data/mockData';
import { subscribeFeedbacks } from '@/lib/firebase';

export default function AdminDashboardPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Filtering State
  const [filterMode, setFilterMode] = useState<'all' | 'spot' | 'region'>('all');
  const [selectedSpot, setSelectedSpot] = useState<string>(destinosInfo[0].nome);
  const [selectedRegion, setSelectedRegion] = useState<string>('Natal');

  // Extract unique regions (municipalities) and spots
  const regions = useMemo(() => Array.from(new Set(destinosInfo.map(d => d.municipio))), []);
  const spots = useMemo(() => destinosInfo.map(d => d.nome), []);

  useEffect(() => {
    const unsub = subscribeFeedbacks(setFeedbacks);
    return () => unsub();
  }, []);

  // Filtered feedbacks
  const currentFeedbacks = useMemo(() => {
    if (filterMode === 'all') return feedbacks;
    if (filterMode === 'spot') {
      return feedbacks.filter(fb => fb.destino === selectedSpot);
    }
    // Region
    return feedbacks.filter(fb => {
      const spotObj = destinosInfo.find(d => d.nome === fb.destino);
      return spotObj?.municipio === selectedRegion;
    });
  }, [feedbacks, filterMode, selectedSpot, selectedRegion]);

  // KPI calculations based on active filters
  const kpis = useMemo(() => {
    let filteredSpots = destinosInfo;
    if (filterMode === 'spot') {
      filteredSpots = destinosInfo.filter(d => d.nome === selectedSpot);
    } else if (filterMode === 'region') {
      filteredSpots = destinosInfo.filter(d => d.municipio === selectedRegion);
    }

    const totalVisitors = filteredSpots.reduce((s, d) => {
      const fd = fluxoData.find(f => f.destino === d.nome);
      return s + (fd?.fluxo_visitantes_mes || 0);
    }, 0);

    const totalRevenue = filteredSpots.reduce((s, d) => {
      const fd = fluxoData.find(f => f.destino === d.nome);
      return s + (fd?.receita_estimada_milhoes || 0);
    }, 0);

    const allISA = filteredSpots.map(d => calcularISA(d.nome, feedbacks));
    const avgISA = allISA.length > 0 ? Math.round(allISA.reduce((s, v) => s + v, 0) / allISA.length) : 0;

    const avgVariation = Math.round(
      filteredSpots.reduce((s, d) => {
        const td = transporteData.find(t => t.destino === d.nome);
        return s + (td?.variacao_percentual || 0);
      }, 0) / filteredSpots.length
    );

    // Critical count based on ALL destinations (always show general health warning)
    const generalISA = destinosInfo.map(d => calcularISA(d.nome, feedbacks));
    const criticalCount = generalISA.filter(s => s < 60).length;

    return { totalVisitors, totalRevenue, avgISA, avgVariation, criticalCount };
  }, [feedbacks, filterMode, selectedSpot, selectedRegion]);

  // Chart data: ISA by destination
  const chartISA = useMemo(() => {
    let spotsForChart = destinosInfo;
    
    if (filterMode === 'spot') {
      // Spot compared to state average
      const spotObj = destinosInfo.find(d => d.nome === selectedSpot);
      const spotISA = spotObj ? calcularISA(spotObj.nome, feedbacks) : 0;
      const spotSat = spotObj ? (fluxoData.find(f => f.destino === spotObj.nome)?.saturacao_turistica || 0) : 0;

      const stateISA = destinosInfo.map(d => calcularISA(d.nome, feedbacks));
      const stateAvgISA = Math.round(stateISA.reduce((s, v) => s + v, 0) / stateISA.length);
      const stateAvgSat = Math.round(fluxoData.reduce((s, f) => s + f.saturacao_turistica, 0) / fluxoData.length);

      return [
        { name: selectedSpot.length > 12 ? selectedSpot.substring(0, 12) + '…' : selectedSpot, isa: spotISA, saturacao: spotSat },
        { name: 'Média RN', isa: stateAvgISA, saturacao: stateAvgSat }
      ];
    }

    if (filterMode === 'region') {
      spotsForChart = destinosInfo.filter(d => d.municipio === selectedRegion);
    }

    return spotsForChart.map(d => ({
      name: d.nome.length > 12 ? d.nome.substring(0, 12) + '…' : d.nome,
      isa: calcularISA(d.nome, feedbacks),
      saturacao: fluxoData.find(f => f.destino === d.nome)?.saturacao_turistica || 0,
    })).sort((a, b) => b.isa - a.isa);
  }, [feedbacks, filterMode, selectedSpot, selectedRegion]);

  // Chart data: Transport pressure
  const chartTransport = useMemo(() => {
    let spotsForChart = destinosInfo;
    if (filterMode === 'spot') {
      spotsForChart = destinosInfo.filter(d => d.nome === selectedSpot);
    } else if (filterMode === 'region') {
      spotsForChart = destinosInfo.filter(d => d.municipio === selectedRegion);
    }

    return spotsForChart.map(d => {
      const t = transporteData.find(tr => tr.destino === d.nome);
      return {
        name: d.nome.length > 10 ? d.nome.substring(0, 10) + '…' : d.nome,
        voos: t?.voos_mensais || 0,
        onibus: t?.onibus_mensais || 0,
        veiculos: Math.round((t?.veiculos_terrestres_mensais || 0) / 100),
      };
    });
  }, [filterMode, selectedSpot, selectedRegion]);

  // Recent feedbacks list
  const recentFeedbacks = currentFeedbacks.slice(0, 5);

  // Custom tooltip style
  const tooltipStyle = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    fontSize: '12px',
    color: 'var(--color-text)',
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 1. Filter Control Box */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-secondary)]">
          <Filter className="w-4 h-4 text-[var(--color-primary)] animate-pulse" />
          <span>ESPECIFICIDADE DO PAINEL:</span>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Mode Selector */}
          <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)]">
            {[
              { id: 'all', label: 'Todo o RN', icon: Globe },
              { id: 'spot', label: 'Por Ponto', icon: MapPin },
              { id: 'region', label: 'Por Município', icon: MapPin }
            ].map(btn => {
              const active = filterMode === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setFilterMode(btn.id as 'all' | 'spot' | 'region')}
                  className={cn(
                    "px-3 py-2 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                    active
                      ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]"
                  )}
                >
                  <btn.icon className="w-3.5 h-3.5" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conditional Selectors */}
          {filterMode === 'spot' && (
            <select
              value={selectedSpot}
              onChange={(e) => setSelectedSpot(e.target.value)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-semibold text-[var(--color-text)] focus:outline-none cursor-pointer"
            >
              {spots.map(s => <option key={s} value={s}>📍 {s.split(" e ")[0]}</option>)}
            </select>
          )}

          {filterMode === 'region' && (
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-semibold text-[var(--color-text)] focus:outline-none cursor-pointer"
            >
              {regions.map(r => <option key={r} value={r}>🏙️ {r}</option>)}
            </select>
          )}
        </div>
      </Card>

      {/* Critical Alert Banner */}
      {kpis.criticalCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/20">
          <AlertTriangle className="h-5 w-5 text-[var(--color-danger)] flex-shrink-0" />
          <p className="text-sm text-[var(--color-danger)] font-medium">
            <span className="font-bold">{kpis.criticalCount}</span> destino{kpis.criticalCount > 1 ? 's' : ''} requer{kpis.criticalCount > 1 ? 'em' : ''} atenção urgente (ISA {'<'} 60)
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <KPICard
          title="Visitantes no Perfil"
          value={kpis.totalVisitors >= 1000 ? `${(kpis.totalVisitors / 1000).toFixed(0)}k` : kpis.totalVisitors.toString()}
          trend={{ value: 12, direction: 'up' }}
          icon={Users}
          accentColor="primary"
          formula={{
            expressao: "∑ (Fluxo Mensal dos Destinos)",
            explicacao: "Soma do fluxo de visitantes estimado para o mês nos destinos ativos no filtro."
          }}
        />
        <KPICard
          title="Receita Gerada"
          value={kpis.totalRevenue > 0 ? `R$ ${kpis.totalRevenue.toFixed(1)}M` : "R$ 0M"}
          trend={{ value: 8, direction: 'up' }}
          icon={DollarSign}
          accentColor="success"
          formula={{
            expressao: "∑ (Receita Mensal em Milhões)",
            explicacao: "Soma do impacto financeiro direto estimado em milhões de reais nos destinos ativos no filtro."
          }}
        />
        <KPICard
          title="ISA do Filtro"
          value={`${kpis.avgISA}`}
          trend={{ value: 3, direction: kpis.avgISA >= 70 ? 'up' : 'down' }}
          icon={Activity}
          accentColor={kpis.avgISA >= 70 ? 'accent' : 'warning'}
          formula={{
            expressao: "Média (ISA dos Destinos)",
            explicacao: "Média aritmética do Índice de Saúde do Atrativo (ISA) ponderado por critérios de zeladoria e superlotação dos pontos sob o filtro."
          }}
        />
        <KPICard
          title="Variação de Fluxo"
          value={`${kpis.avgVariation > 0 ? '+' : ''}${kpis.avgVariation}%`}
          trend={{ value: Math.abs(kpis.avgVariation), direction: kpis.avgVariation >= 0 ? 'up' : 'down' }}
          icon={TrendingUp}
          accentColor="info"
          formula={{
            expressao: "Média (Variação de Transporte)",
            explicacao: "Média percentual de crescimento ou queda no fluxo de ônibus, veículos e voos terrestres/aéreos contra o mesmo período anterior."
          }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ISA by Destination */}
        <Card>
          <CardHeader>
            <CardTitle>{filterMode === 'spot' ? 'Desempenho vs Média Geral' : 'ISA por Destino'}</CardTitle>
            <Badge variant="primary" size="sm" dot>Ao vivo</Badge>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartISA} margin={{ top: 5, right: 5, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="isa" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="ISA" />
                <Bar dataKey="saturacao" fill="var(--color-accent)" radius={[4, 4, 0, 0]} name="Saturação" opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Transport Pressure */}
        <Card>
          <CardHeader>
            <CardTitle>Pressão de Transporte</CardTitle>
            <Badge variant="info" size="sm">Mensal</Badge>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartTransport} margin={{ top: 5, right: 5, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="voos" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} name="Voos" />
                <Line type="monotone" dataKey="onibus" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 3 }} name="Ônibus" />
                <Line type="monotone" dataKey="veiculos" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 3 }} name="Veículos (×100)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--color-accent)]" />
            Feedbacks Filtrados
          </CardTitle>
          <Badge variant="success" size="sm" dot>
            {currentFeedbacks.length} no filtro
          </Badge>
        </CardHeader>

        {recentFeedbacks.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum feedback recebido no filtro selecionado</p>
            <p className="text-xs mt-1">Os feedbacks aparecem aqui em tempo real</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentFeedbacks.map((fb, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-left">
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={cn(
                      'h-3 w-3',
                      s <= fb.nota_geral ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--color-border)]',
                    )} />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--color-text)]">{fb.destino}</p>
                  {fb.comentario && <p className="text-xs text-[var(--color-text-secondary)] italic mt-1 bg-[var(--color-surface)] p-2 rounded border border-[var(--color-border-light)]">{fb.comentario}</p>}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {fb.limpo && <Badge variant="success" size="sm">🧹 Limpo</Badge>}
                    {fb.preservado && <Badge variant="success" size="sm">🌿 Preservado</Badge>}
                    {fb.superlotado && <Badge variant="danger" size="sm">🚫 Lotado</Badge>}
                    {fb.seguranca && <Badge variant="info" size="sm">🔒 Seguro</Badge>}
                  </div>
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {fb.timestamp ? new Date(fb.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
