"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { PlaceImage } from "@/components/ui/PlaceImage";
import { destinosInfo, fluxoData, ibgeData, transporteData, calcularISA, type Feedback, type DestinoInfo } from "@/data/mockData";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Users, Activity, Maximize2 } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { subscribeFeedbacks } from "@/lib/firebase";
import { useSupabaseSync } from "@/lib/supabase-data";

const DestinosMap = dynamic(
  () => import("@/components/admin/DestinosMap"),
  { ssr: false }
);

export default function DestinosGestaoPage() {
  useSupabaseSync();
  const [monitoredSpots] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dunastech_monitored_spots");
      if (saved) return JSON.parse(saved);
    }
    return destinosInfo.filter(d => d.monitorado !== false).map(d => d.nome);
  });
  // detailSpot nunca zera: mantém o conteúdo em tela enquanto o popup faz a animação de saída.
  const [detailSpot, setDetailSpot] = useState<DestinoInfo>(destinosInfo[0]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // Centro do card clicado: o popup nasce de lá, em vez de surgir no meio da tela.
  const [popupOrigin, setPopupOrigin] = useState<{ x: number; y: number } | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const openDetail = (d: DestinoInfo) => {
    const card = document.getElementById(slugify(d.nome));
    if (card) {
      const rect = card.getBoundingClientRect();
      setPopupOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    setDetailSpot(d);
    setIsDetailOpen(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dunastech_monitored_spots");
      if (!saved) {
        const defaults = destinosInfo.filter(d => d.monitorado !== false).map(d => d.nome);
        localStorage.setItem("dunastech_monitored_spots", JSON.stringify(defaults));
      }
    }
    const unsub = subscribeFeedbacks(setFeedbacks);
    return () => unsub();
  }, []);

  const activeSpots = useMemo(() => {
    return destinosInfo.filter(d => monitoredSpots.includes(d.nome));
  }, [monitoredSpots]);

  const inactiveSpots = useMemo(() => {
    return destinosInfo.filter(d => !monitoredSpots.includes(d.nome));
  }, [monitoredSpots]);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in-up text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Destinos Turísticos Monitorados</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Zeladoria, saturação e dados demográficos integrados pelo POTI.
            </p>
          </div>
          <Badge variant="primary" size="md">
            {activeSpots.length} Sensores Ativos | {inactiveSpots.length} Inativos
          </Badge>
        </div>

        {/* Map Container - always show all spots */}
        <DestinosMap destinations={destinosInfo} feedbacks={feedbacks} />

        {/* SECTION: Active sensors */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping" />
            Sensores de IoT Ativos ({activeSpots.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {activeSpots.map((d) => {
              const fluxo = fluxoData.find((f) => f.destino === d.nome);
              const ibge = ibgeData.find((i) => i.destino === d.nome);
              const isOpen = isDetailOpen && detailSpot.nome === d.nome;

              return (
                <Card
                  key={d.nome}
                  id={slugify(d.nome)}
                  onClick={() => openDetail(d)}
                  asButton={false}
                  className={cn(
                    "overflow-hidden flex flex-col justify-between hover:border-[var(--color-primary)] hover:shadow-md transition-all scroll-mt-20 border cursor-pointer",
                    isOpen ? "border-[var(--color-primary)] shadow-md" : "border-[var(--color-border-light)]"
                  )}
                >
                  <div>
                    <div className="relative h-44">
                      <PlaceImage
                        src={d.imagem}
                        alt={d.nome}
                        local={d.nome}
                        latitude={d.latitude}
                        longitude={d.longitude}
                        variant="card"
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover rounded-t-xl"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant={fluxo && fluxo.saturacao_turistica > 75 ? "danger" : "success"} size="sm">
                          Saturação: {fluxo?.saturacao_turistica || 0}%
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-sm text-[var(--color-text)] leading-snug truncate">{d.nome}</h3>
                          <span className="text-[10px] text-[var(--color-text-muted)] font-semibold flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
                            {d.municipio}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(d);
                          }}
                          aria-haspopup="dialog"
                          aria-expanded={isOpen}
                          aria-label={`Ver detalhes de ${d.nome}`}
                          className="p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] transition-colors focus:outline-none cursor-pointer flex-shrink-0"
                          title="Ver métricas de acesso e índice de saúde"
                        >
                          <Maximize2 className={cn("w-4 h-4", isOpen && "text-[var(--color-primary)]")} />
                        </button>
                      </div>

                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">{d.descricao}</p>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border-light)]">
                        <div className="text-left">
                          <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider block font-bold">Fluxo Mensal</span>
                          <span className="text-xs font-black text-[var(--color-text)] flex items-center gap-1">
                            <Users className="w-3 h-3 text-[var(--color-primary)]" />
                            {fluxo?.fluxo_visitantes_mes.toLocaleString("pt-BR") || "0"}
                          </span>
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider block font-bold">População (IBGE)</span>
                          <span className="text-xs font-black text-[var(--color-text)]">
                            {ibge?.populacao.toLocaleString("pt-BR") || "N/A"}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="p-4 pt-0 flex justify-between items-center border-t border-[var(--color-border-light)] mt-2">
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      IDH: {ibge?.idh || "—"} | Área: {ibge?.area_km2 || "—"} km²
                    </span>
                    <span className="text-xs font-bold text-[var(--color-accent)]">#{d.hashtag}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* SECTION: Inactive/Suggested sensors */}
        {inactiveSpots.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-[var(--color-border-light)]">
            <h2 className="text-sm font-bold text-[var(--color-text-muted)] flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-amber-400 rounded-full" />
              Sugestões e Pontos sem Sensores ({inactiveSpots.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {inactiveSpots.map((d) => {
                const ibge = ibgeData.find((i) => i.destino === d.nome);
                const isOpen = isDetailOpen && detailSpot.nome === d.nome;

                return (
                  <Card
                    key={d.nome}
                    id={slugify(d.nome)}
                    onClick={() => openDetail(d)}
                    asButton={false}
                    className={cn(
                      "overflow-hidden flex flex-col justify-between hover:border-[var(--color-border)] hover:opacity-100 hover:shadow-md opacity-85 transition-all scroll-mt-20 border cursor-pointer",
                      isOpen ? "border-[var(--color-primary)] shadow-md opacity-100" : "border-[var(--color-border-light)]"
                    )}
                  >
                    <div>
                      <div className="relative h-44">
                        <PlaceImage
                          src={d.imagem}
                          alt={d.nome}
                          local={d.nome}
                          latitude={d.latitude}
                          longitude={d.longitude}
                          variant="card"
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover rounded-t-xl grayscale-[15%]"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="warning" size="sm">Sensores Inativos</Badge>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-sm text-[var(--color-text)] leading-snug truncate">{d.nome}</h3>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-semibold flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[var(--color-text-muted)]" />
                              {d.municipio}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(d);
                            }}
                            aria-haspopup="dialog"
                            aria-expanded={isOpen}
                            aria-label={`Ver detalhes de ${d.nome}`}
                            className="p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] transition-colors focus:outline-none cursor-pointer flex-shrink-0"
                            title="Ver métricas de acesso e índice de saúde"
                          >
                            <Maximize2 className={cn("w-4 h-4", isOpen && "text-[var(--color-primary)]")} />
                          </button>
                        </div>

                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">{d.descricao}</p>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border-light)]">
                          <div className="text-left">
                            <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider block font-bold">População (IBGE)</span>
                            <span className="text-xs font-bold text-[var(--color-text)]">
                              {ibge?.populacao.toLocaleString("pt-BR") || "N/A"}
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider block font-bold">Área Territorial</span>
                            <span className="text-xs font-bold text-[var(--color-text)]">
                              {ibge?.area_km2.toLocaleString("pt-BR") || "—"} km²
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="p-4 pt-0 flex justify-between items-center border-t border-[var(--color-border-light)] mt-2">
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        IDH: {ibge?.idh || "—"} | Estaduais recomendados
                      </span>
                      <span className="text-xs font-bold text-[var(--color-text-muted)]">#{d.hashtag}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Spot Detail Popup */}
        <Modal
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          origin={popupOrigin}
          title={detailSpot.nome}
          subtitle={detailSpot.municipio}
          icon={
            <div className="relative h-11 w-11 rounded-xl overflow-hidden flex-shrink-0">
              <PlaceImage
                src={detailSpot.imagem}
                alt=""
                local={detailSpot.nome}
                latitude={detailSpot.latitude}
                longitude={detailSpot.longitude}
                variant="thumb"
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
            {/* Transportation Stats */}
            <div>
              <span className="text-[10px] font-bold text-[var(--color-text)] uppercase tracking-wider block mb-1.5">Métricas de acesso</span>
              {(() => {
                const t = transporteData.find(tr => tr.destino === detailSpot.nome);
                return (
                  <div className="grid grid-cols-2 gap-2 bg-[var(--color-surface-alt)] p-3 rounded-xl text-[var(--color-text-secondary)]">
                    <div>Voos: <strong className="text-[var(--color-text)]">{t?.voos_mensais || 0}/mês</strong></div>
                    <div>Ônibus: <strong className="text-[var(--color-text)]">{t?.onibus_mensais || 0}/mês</strong></div>
                    <div className="col-span-2">Veículos terrestres: <strong className="text-[var(--color-text)]">{t?.veiculos_terrestres_mensais.toLocaleString("pt-BR") || 0}</strong></div>
                    <div className="col-span-2">Modal principal: <strong className="text-[var(--color-text)]">{t?.modal_principal || "N/A"}</strong></div>
                  </div>
                );
              })()}
            </div>

            {/* Live Health Diagnosis (ISA) */}
            <div>
              <span className="text-[10px] font-bold text-[var(--color-text)] uppercase tracking-wider block mb-1.5">Índice de saúde</span>
              {(() => {
                const isaVal = calcularISA(detailSpot.nome, feedbacks);
                return (
                  <div className="flex items-center gap-3 bg-[var(--color-surface-alt)] p-3 rounded-xl">
                    <Activity className="h-5 w-5 text-[var(--color-primary)] animate-pulse flex-shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-[var(--color-text)]">ISA {isaVal}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                        isaVal >= 80 ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" :
                        isaVal >= 60 ? "bg-[var(--color-warning-soft)] text-[var(--color-warning)]" :
                        "bg-[var(--color-danger-soft)] text-[var(--color-danger)] animate-pulse"
                      )}>
                        {isaVal >= 80 ? "Saudável" : isaVal >= 60 ? "Atenção" : "Crítico"}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
