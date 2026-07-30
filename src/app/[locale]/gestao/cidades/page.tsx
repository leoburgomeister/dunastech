"use client";

import { useState, useMemo, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  destinosInfo,
  fluxoData,
  ibgeData,
  investimentosData
} from "@/data/mockData";
import { useSupabaseSync } from "@/lib/supabase-data";
import {
  Building,
  Users,
  Map,
  TrendingUp,
  DollarSign,
  Search,
  ArrowUpDown,
  Eye,
  EyeOff,
  AlertCircle,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MunicipioStats {
  nome: string;
  populacao: number;
  area_km2: number;
  idh: number;
  destinos: typeof destinosInfo;
  receita_milhoes: number;
  investimento_mil: number;
  fluxo_total: number;
}

type KPIKey = "population" | "area" | "investments" | "revenue";

const KPI_DETAIL: Record<KPIKey, {
  title: string;
  icon: LucideIcon;
  chip: string;
  sort: (a: MunicipioStats, b: MunicipioStats) => number;
  value: (m: MunicipioStats) => string;
}> = {
  population: {
    title: "Distribuição populacional por município",
    icon: Users,
    chip: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
    sort: (a, b) => b.populacao - a.populacao,
    value: (m) => m.populacao.toLocaleString("pt-BR")
  },
  area: {
    title: "Área territorial monitorada",
    icon: Map,
    chip: "bg-emerald-100 dark:bg-emerald-950 text-emerald-500",
    sort: (a, b) => b.area_km2 - a.area_km2,
    value: (m) => `${m.area_km2.toLocaleString("pt-BR")} km²`
  },
  investments: {
    title: "Investimentos estaduais em 2026",
    icon: DollarSign,
    chip: "bg-blue-100 dark:bg-blue-950 text-blue-500",
    sort: (a, b) => b.investimento_mil - a.investimento_mil,
    value: (m) => `R$ ${m.investimento_mil.toLocaleString("pt-BR")}k`
  },
  revenue: {
    title: "Receita de turismo por mês",
    icon: TrendingUp,
    chip: "bg-purple-100 dark:bg-purple-950 text-purple-500",
    sort: (a, b) => b.receita_milhoes - a.receita_milhoes,
    value: (m) => `R$ ${m.receita_milhoes.toFixed(1)}M`
  }
};

export default function CidadesGestaoPage() {
  useSupabaseSync();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"nome" | "populacao" | "area" | "idh" | "receita" | "investimento">("receita");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [monitoredSpots, setMonitoredSpots] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dunastech_monitored_spots");
      if (saved) return JSON.parse(saved);
    }
    return destinosInfo.filter(d => d.monitorado !== false).map(d => d.nome);
  });
  // detailKPI nunca zera: mantém o conteúdo em tela enquanto o popup faz a animação de saída.
  const [detailKPI, setDetailKPI] = useState<KPIKey>("population");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // Centro do card clicado: o popup nasce de lá, em vez de surgir no meio da tela.
  const [popupOrigin, setPopupOrigin] = useState<{ x: number; y: number } | null>(null);

  const openDetail = (key: KPIKey) => {
    const card = document.getElementById(`kpi-${key}`);
    if (card) {
      const rect = card.getBoundingClientRect();
      setPopupOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    setDetailKPI(key);
    setIsDetailOpen(true);
  };

  // Load monitored spots from localStorage, fallback to mockData defaults
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dunastech_monitored_spots");
      if (!saved) {
        const defaults = destinosInfo.filter(d => d.monitorado !== false).map(d => d.nome);
        localStorage.setItem("dunastech_monitored_spots", JSON.stringify(defaults));
      }
    }
  }, []);

  const toggleMonitoring = (destinoNome: string) => {
    let updated: string[];
    if (monitoredSpots.includes(destinoNome)) {
      updated = monitoredSpots.filter(name => name !== destinoNome);
    } else {
      updated = [...monitoredSpots, destinoNome];
    }
    setMonitoredSpots(updated);
    localStorage.setItem("dunastech_monitored_spots", JSON.stringify(updated));
  };

  // Compile stats for each municipality
  const municipiosList = useMemo((): MunicipioStats[] => {
    // Unique list of municipalities
    const uniqueNames = Array.from(new Set(destinosInfo.map(d => d.municipio)));

    return uniqueNames.map(name => {
      // Find all destinations in this municipality
      const dests = destinosInfo.filter(d => d.municipio === name);
      
      // Aggregate stats from mockData
      let populacao = 0;
      let area_km2 = 0;
      let idh = 0;
      let receita_milhoes = 0;
      let investimento_mil = 0;
      let fluxo_total = 0;

      // Use first matching ibge record for general demographic stats
      const firstDestIbge = ibgeData.find(i => i.municipio === name);
      if (firstDestIbge) {
        populacao = firstDestIbge.populacao;
        area_km2 = firstDestIbge.area_km2;
        idh = firstDestIbge.idh;
      }

      // Sum values across destinations
      dests.forEach(d => {
        const fluxo = fluxoData.find(f => f.destino === d.nome);
        if (fluxo) {
          receita_milhoes += fluxo.receita_estimada_milhoes;
          fluxo_total += fluxo.fluxo_visitantes_mes;
        }
        const invest = investimentosData.find(i => i.destino === d.nome);
        if (invest) {
          investimento_mil += invest.total_mil;
        }
      });

      return {
        nome: name,
        populacao,
        area_km2,
        idh,
        destinos: dests,
        receita_milhoes: parseFloat(receita_milhoes.toFixed(1)),
        investimento_mil,
        fluxo_total
      };
    });
  }, []);

  // Filter and sort list
  const filteredAndSortedList = useMemo(() => {
    return municipiosList
      .filter(m => m.nome.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const valA = a[sortBy === "area" ? "area_km2" : sortBy === "receita" ? "receita_milhoes" : sortBy === "investimento" ? "investimento_mil" : sortBy] as string | number;
        const valB = b[sortBy === "area" ? "area_km2" : sortBy === "receita" ? "receita_milhoes" : sortBy === "investimento" ? "investimento_mil" : sortBy] as string | number;
        
        if (typeof valA === "string") {
          return sortOrder === "asc" ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
        }
        return sortOrder === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [municipiosList, searchTerm, sortBy, sortOrder]);

  // Overall KPIs
  const kpis = useMemo(() => {
    const totalPop = municipiosList.reduce((sum, m) => sum + m.populacao, 0);
    const totalArea = municipiosList.reduce((sum, m) => sum + m.area_km2, 0);
    const totalInvest = municipiosList.reduce((sum, m) => sum + m.investimento_mil, 0);
    const totalRevenue = municipiosList.reduce((sum, m) => sum + m.receita_milhoes, 0);

    return {
      count: municipiosList.length,
      population: totalPop,
      area: totalArea,
      investments: totalInvest,
      revenue: totalRevenue
    };
  }, [municipiosList]);

  const kpiDetail = KPI_DETAIL[detailKPI];

  const kpiRanking = useMemo(
    () => [...municipiosList].sort(kpiDetail.sort).slice(0, 6),
    [municipiosList, kpiDetail]
  );

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in-up text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Gestão Territorial de Municípios</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Análise estatística demográfica, arrecadação turística e controle de sensores ativos no Rio Grande do Norte.
            </p>
          </div>
          <Badge variant="primary" size="md">{kpis.count} Municípios Mapeados</Badge>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            id="kpi-population"
            onClick={() => openDetail('population')}
            aria-expanded={isDetailOpen && detailKPI === 'population'}
            aria-haspopup="dialog"
            className={cn(
              "p-4 flex items-center gap-4 cursor-pointer hover:border-[var(--color-primary)] hover:shadow-md transition-all border select-none",
              isDetailOpen && detailKPI === 'population' ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]/5 shadow-md" : "border-[var(--color-border-light)]"
            )}
          >
            <div className="p-3 bg-[var(--color-primary-light)] rounded-2xl text-[var(--color-primary)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">População Total</span>
              <p className="text-lg font-black text-[var(--color-text)]">
                {kpis.population.toLocaleString("pt-BR")}
              </p>
            </div>
          </Card>

          <Card
            id="kpi-area"
            onClick={() => openDetail('area')}
            aria-expanded={isDetailOpen && detailKPI === 'area'}
            aria-haspopup="dialog"
            className={cn(
              "p-4 flex items-center gap-4 cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all border select-none",
              isDetailOpen && detailKPI === 'area' ? "border-emerald-500 bg-emerald-500/5 shadow-md" : "border-[var(--color-border-light)]"
            )}
          >
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-2xl text-emerald-500">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Área Monitorada</span>
              <p className="text-lg font-black text-[var(--color-text)]">
                {kpis.area.toLocaleString("pt-BR")} km²
              </p>
            </div>
          </Card>

          <Card
            id="kpi-investments"
            onClick={() => openDetail('investments')}
            aria-expanded={isDetailOpen && detailKPI === 'investments'}
            aria-haspopup="dialog"
            className={cn(
              "p-4 flex items-center gap-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all border select-none",
              isDetailOpen && detailKPI === 'investments' ? "border-blue-500 bg-blue-500/5 shadow-md" : "border-[var(--color-border-light)]"
            )}
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-2xl text-blue-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Investimentos (2026)</span>
              <p className="text-lg font-black text-[var(--color-text)]">
                R$ {(kpis.investments / 1000).toFixed(1)}M
              </p>
            </div>
          </Card>

          <Card
            id="kpi-revenue"
            onClick={() => openDetail('revenue')}
            aria-expanded={isDetailOpen && detailKPI === 'revenue'}
            aria-haspopup="dialog"
            className={cn(
              "p-4 flex items-center gap-4 cursor-pointer hover:border-purple-500 hover:shadow-md transition-all border select-none",
              isDetailOpen && detailKPI === 'revenue' ? "border-purple-500 bg-purple-500/5 shadow-md" : "border-[var(--color-border-light)]"
            )}
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-2xl text-purple-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Receita de Turismo</span>
              <p className="text-lg font-black text-[var(--color-text)]">
                R$ {kpis.revenue.toFixed(1)}M/mês
              </p>
            </div>
          </Card>
        </div>

        {/* KPI Detail Popup */}
        <Modal
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          origin={popupOrigin}
          title={kpiDetail?.title ?? ''}
          subtitle="Top 6 municípios"
          icon={kpiDetail && (
            <span className={cn("p-2.5 rounded-2xl flex-shrink-0", kpiDetail.chip)}>
              <kpiDetail.icon className="w-5 h-5" />
            </span>
          )}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {kpiRanking.map((m, i) => (
              <div
                key={m.nome}
                className="relative p-3 bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] rounded-xl space-y-1"
              >
                <span className="absolute top-2.5 right-3 text-[10px] font-[var(--font-mono)] text-[var(--color-text-muted)]">
                  {i + 1}
                </span>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] truncate block pr-5">{m.nome}</span>
                <span className="font-black text-sm text-[var(--color-text)] block">{kpiDetail?.value(m)}</span>
              </div>
            ))}
          </div>
        </Modal>

        {/* Charts & Comparative Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-primary)]" />
                Receita Turística Mensal por Município (Top 6)
              </CardTitle>
            </CardHeader>
            <div className="space-y-3 p-5 pt-0">
              {[...municipiosList]
                .sort((a, b) => b.receita_milhoes - a.receita_milhoes)
                .slice(0, 6)
                .map((m) => {
                  const maxRevenue = Math.max(...municipiosList.map(item => item.receita_milhoes));
                  const pct = maxRevenue > 0 ? (m.receita_milhoes / maxRevenue) * 100 : 0;
                  return (
                    <div key={m.nome} className="space-y-1">
                       <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[var(--color-text)]">{m.nome}</span>
                        <span className="text-[var(--color-text-secondary)]">R$ {m.receita_milhoes.toFixed(1)}M</span>
                      </div>
                      <div className="w-full bg-[var(--color-border-light)] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-500" />
                Investimentos Estaduais 2026 (Top 6)
              </CardTitle>
            </CardHeader>
            <div className="space-y-3 p-5 pt-0">
              {[...municipiosList]
                .sort((a, b) => b.investimento_mil - a.investimento_mil)
                .slice(0, 6)
                .map((m) => {
                  const maxInvest = Math.max(...municipiosList.map(item => item.investimento_mil));
                  const pct = maxInvest > 0 ? (m.investimento_mil / maxInvest) * 100 : 0;
                  return (
                    <div key={m.nome} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[var(--color-text)]">{m.nome}</span>
                        <span className="text-[var(--color-text-secondary)]">R$ {m.investimento_mil.toLocaleString("pt-BR")}k</span>
                      </div>
                      <div className="w-full bg-[var(--color-border-light)] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>

        {/* Filter and Table Container */}
        <Card className="overflow-hidden">
          <div className="p-4 bg-[var(--color-surface-alt)] border-b border-[var(--color-border-light)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Buscar município..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[var(--color-text-muted)] font-semibold">Ordenar por:</span>
              {(["nome", "populacao", "area", "idh", "receita", "investimento"] as const).map(field => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg border text-[11px] font-bold capitalize transition-colors flex items-center gap-1",
                    sortBy === field
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]"
                  )}
                >
                  {field === "populacao" ? "População" : field === "area" ? "Área" : field === "idh" ? "IDH" : field === "receita" ? "Receita" : field === "investimento" ? "Investimento" : field}
                  {sortBy === field && (
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border-light)] text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  <th className="p-4">Município</th>
                  <th className="p-4">Destinos Cadastrados</th>
                  <th className="p-4">População (IBGE)</th>
                  <th className="p-4">Área Territorial</th>
                  <th className="p-4">IDH-M</th>
                  <th className="p-4">Receita (Mês)</th>
                  <th className="p-4">Investimento (2026)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)] text-xs text-[var(--color-text-secondary)]">
                {filteredAndSortedList.map((m) => (
                  <tr key={m.nome} className="hover:bg-[var(--color-surface-alt)]/50 transition-colors">
                    {/* Name */}
                    <td className="p-4 font-bold text-[var(--color-text)]">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-[var(--color-primary)]" />
                        {m.nome}
                      </div>
                    </td>

                    {/* Attractions & Sensor Control */}
                    <td className="p-4 max-w-xs">
                      <div className="flex flex-col gap-1.5">
                        {m.destinos.map(d => {
                          const isActive = monitoredSpots.includes(d.nome);
                          return (
                            <div key={d.nome} className="flex items-center justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border-light)] px-2 py-1 rounded-lg">
                              <span className="font-semibold text-[11px] truncate text-[var(--color-text)]">
                                {d.nome}
                              </span>
                              <button
                                onClick={() => toggleMonitoring(d.nome)}
                                className={cn(
                                  "flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase transition-all",
                                  isActive
                                    ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200"
                                    : "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-200"
                                )}
                                title={isActive ? "Desativar monitoramento de sensores" : "Ativar monitoramento de sensores"}
                              >
                                {isActive ? (
                                  <>
                                    <Eye className="w-3 h-3" />
                                    Ativo
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3" />
                                    Sugestão
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* Population */}
                    <td className="p-4 font-[var(--font-mono)]">
                      {m.populacao.toLocaleString("pt-BR")}
                    </td>

                    {/* Area */}
                    <td className="p-4">
                      {m.area_km2.toLocaleString("pt-BR")} km²
                    </td>

                    {/* IDH */}
                    <td className="p-4 font-[var(--font-mono)] font-bold">
                      {m.idh.toFixed(3)}
                    </td>

                    {/* Revenue */}
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {m.receita_milhoes.toFixed(1)}M
                    </td>

                    {/* Investments */}
                    <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                      R$ {m.investimento_mil.toLocaleString("pt-BR")}k
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedList.length === 0 && (
            <div className="p-8 text-center text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 text-[var(--color-warning)]" />
              <p className="font-bold">Nenhum município encontrado.</p>
              <p className="text-xs">Tente ajustar o termo de pesquisa.</p>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
