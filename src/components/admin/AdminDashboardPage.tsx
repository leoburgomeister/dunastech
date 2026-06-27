'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, DollarSign, Activity, TrendingUp, AlertTriangle, Star, Clock, Zap, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';
import { KPICard } from '@/components/ui/KPICard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import {
  destinosInfo, fluxoData, transporteData, investimentosData, calcularISA,
} from '@/data/mockData';
import type { Feedback } from '@/data/mockData';
import { subscribeFeedbacks } from '@/lib/firebase';

export default function AdminDashboardPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    const unsub = subscribeFeedbacks(setFeedbacks);
    return () => unsub();
  }, []);

  // KPI calculations
  const kpis = useMemo(() => {
    const totalVisitors = fluxoData.reduce((s, f) => s + f.fluxo_visitantes_mes, 0);
    const totalRevenue = fluxoData.reduce((s, f) => s + f.receita_estimada_milhoes, 0);
    const allISA = destinosInfo.map(d => calcularISA(d.nome, feedbacks));
    const avgISA = Math.round(allISA.reduce((s, v) => s + v, 0) / allISA.length);
    const avgVariation = Math.round(transporteData.reduce((s, t) => s + t.variacao_percentual, 0) / transporteData.length);
    const criticalCount = allISA.filter(s => s < 60).length;
    return { totalVisitors, totalRevenue, avgISA, avgVariation, criticalCount };
  }, [feedbacks]);

  // Chart data: ISA by destination
  const chartISA = useMemo(() => {
    return destinosInfo.map(d => ({
      name: d.nome.length > 12 ? d.nome.substring(0, 12) + '…' : d.nome,
      isa: calcularISA(d.nome, feedbacks),
      saturacao: fluxoData.find(f => f.destino === d.nome)?.saturacao_turistica || 0,
    })).sort((a, b) => b.isa - a.isa);
  }, [feedbacks]);

  // Chart data: Transport pressure
  const chartTransport = useMemo(() => {
    return transporteData.slice(0, 8).map(t => ({
      name: t.destino.length > 10 ? t.destino.substring(0, 10) + '…' : t.destino,
      voos: t.voos_mensais,
      onibus: t.onibus_mensais,
      veiculos: Math.round(t.veiculos_terrestres_mensais / 100),
    }));
  }, []);

  // Recent feedbacks
  const recentFeedbacks = feedbacks.slice(0, 5);

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
          title="Visitantes Totais"
          value={`${(kpis.totalVisitors / 1000).toFixed(0)}k`}
          trend={{ value: 12, direction: 'up' }}
          icon={Users}
          accentColor="primary"
        />
        <KPICard
          title="Receita Estimada"
          value={`R$ ${kpis.totalRevenue.toFixed(1)}M`}
          trend={{ value: 8, direction: 'up' }}
          icon={DollarSign}
          accentColor="success"
        />
        <KPICard
          title="ISA Médio"
          value={`${kpis.avgISA}`}
          trend={{ value: 3, direction: kpis.avgISA >= 70 ? 'up' : 'down' }}
          icon={Activity}
          accentColor={kpis.avgISA >= 70 ? 'accent' : 'warning'}
        />
        <KPICard
          title="Variação de Fluxo"
          value={`${kpis.avgVariation > 0 ? '+' : ''}${kpis.avgVariation}%`}
          trend={{ value: Math.abs(kpis.avgVariation), direction: kpis.avgVariation >= 0 ? 'up' : 'down' }}
          icon={TrendingUp}
          accentColor="info"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ISA by Destination */}
        <Card>
          <CardHeader>
            <CardTitle>ISA por Destino</CardTitle>
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
            Feedbacks Recentes
          </CardTitle>
          <Badge variant="success" size="sm" dot>
            {feedbacks.length} total
          </Badge>
        </CardHeader>

        {recentFeedbacks.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum feedback recebido ainda</p>
            <p className="text-xs mt-1">Os feedbacks aparecem aqui em tempo real</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentFeedbacks.map((fb, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)]">
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
                  {fb.comentario && <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{fb.comentario}</p>}
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
