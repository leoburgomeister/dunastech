"use client";

import dynamic from "next/dynamic";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { destinosInfo, fluxoData, ibgeData } from "@/data/mockData";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Users, Activity } from "lucide-react";
import { slugify } from "@/lib/utils";

const DestinosMap = dynamic(
  () => import("@/components/admin/DestinosMap"),
  { ssr: false }
);

export default function DestinosGestaoPage() {
  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Destinos Turísticos Monitorados</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Zeladoria, saturação e dados demográficos integrados pelo DunasTech.
            </p>
          </div>
          <Badge variant="primary" size="md">15 Destinos Ativos</Badge>
        </div>

        {/* Map Container */}
        <DestinosMap destinations={destinosInfo} />

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinosInfo.map((d) => {
            const fluxo = fluxoData.find((f) => f.destino === d.nome);
            const ibge = ibgeData.find((i) => i.destino === d.nome);
            
            return (
              <Card key={d.nome} id={slugify(d.nome)} className="overflow-hidden flex flex-col justify-between hover:border-[var(--color-primary)] transition-all scroll-mt-20">

                <div>
                  <div className="relative">
                    <img src={d.imagem} alt={d.nome} className="w-full h-44 object-cover rounded-t-xl" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant={fluxo && fluxo.saturacao_turistica > 75 ? "danger" : "success"} size="sm">
                        Saturação: {fluxo?.saturacao_turistica || 0}%
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-[var(--color-text)] leading-snug">{d.nome}</h3>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
                        {d.municipio}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{d.descricao}</p>

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
    </AdminLayout>
  );
}
