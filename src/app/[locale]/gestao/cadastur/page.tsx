"use client";

import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cadasturData } from "@/data/mockData";
import { ShieldCheck, AlertTriangle, CheckCircle, ShieldAlert, Mail, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

// Expiration dates mapping for mock data representation
const mockExpirations: Record<string, { date: string; status: "active" | "expiring" | "expired" }> = {
  "cad-pn-1": { date: "2027-02-15", status: "active" }, // Visual Praia
  "cad-pn-2": { date: "2026-07-08", status: "expiring" }, // Camarões Potiguar (Expires in ~11 days)
  "cad-pn-3": { date: "2027-05-20", status: "active" },
  "cad-pipa-1": { date: "2027-03-10", status: "active" }, // Sombra e Água
  "cad-pipa-2": { date: "2026-07-14", status: "expiring" }, // Pipa Beach Club (Expires in ~17 days)
  "cad-pipa-3": { date: "2026-05-01", status: "expired" }, // Pipa Passeios (Expired)
  "cad-gen-1": { date: "2027-01-30", status: "active" },
  "cad-gen-3": { date: "2026-07-22", status: "expiring" }, // Bugueiros Genipabu (Expires in ~25 days)
  "cad-mar-1": { date: "2027-04-12", status: "active" },
  "cad-mar-3": { date: "2026-04-20", status: "expired" }, // Maracajaú Diver (Expired)
  "cad-gost-1": { date: "2027-08-11", status: "active" },
  "cad-gost-2": { date: "2027-09-05", status: "active" },
  "cad-forte-2": { date: "2027-03-24", status: "active" },
  "cad-gal-2": { date: "2027-06-18", status: "active" },
  "cad-caju-2": { date: "2027-11-02", status: "active" },
  "cad-mad-2": { date: "2027-02-28", status: "active" },
  "cad-pit-2": { date: "2027-01-15", status: "active" },
  "cad-clbi-1": { date: "2027-10-10", status: "active" },
  "cad-cun-2": { date: "2027-12-05", status: "active" },
  "cad-dunas-2": { date: "2027-04-01", status: "active" },
  "cad-mos-2": { date: "2027-07-15", status: "active" },
  "cad-apo-2": { date: "2027-09-30", status: "active" },
};

export default function CadasturGestaoPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expiring" | "expired">("all");
  const [notifiedId, setNotifiedId] = useState<string | null>(null);

  // Extend base mock data with expiration metrics
  const fullCadasturData = useMemo(() => {
    return cadasturData.map((b) => {
      const exp = mockExpirations[b.id] || { date: "2027-06-30", status: "active" };
      return {
        ...b,
        vencimento: exp.date,
        statusCadastur: exp.status,
      };
    });
  }, []);

  // KPIs
  const kpis = useMemo(() => {
    const total = fullCadasturData.length;
    const active = fullCadasturData.filter(b => b.statusCadastur === "active").length;
    const expiring = fullCadasturData.filter(b => b.statusCadastur === "expiring").length;
    const expired = fullCadasturData.filter(b => b.statusCadastur === "expired").length;
    return { total, active, expiring, expired };
  }, [fullCadasturData]);

  // Filtering
  const filteredData = useMemo(() => {
    return fullCadasturData.filter((b) => {
      const matchSearch =
        b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.cnpj.includes(searchTerm) ||
        b.destino.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || b.statusCadastur === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [fullCadasturData, searchTerm, statusFilter]);

  const handleNotify = (id: string, name: string) => {
    setNotifiedId(id);
    setTimeout(() => {
      setNotifiedId(null);
      alert(`Alerta de vencimento enviado com sucesso para o e-mail registrado da empresa: "${name}"!`);
    }, 1200);
  };

  const formatDate = (dateString: string) => {
    const parts = dateString.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Monitoramento Cadastur</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Auditoria de certificação legal e controle de prazos de vigência de operadores turísticos.
            </p>
          </div>
          <Badge variant="primary" size="md">Dados Sincronizados</Badge>
        </div>

        {/* KPIs row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-extrabold">Total Mapeado</span>
              <span className="text-2xl font-black block mt-1 text-[var(--color-text)]">{kpis.total}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-soft)] flex items-center justify-center text-[var(--color-primary)]">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
          </div>

          {/* Active */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-extrabold font-bold">Certidão Ativa</span>
              <span className="text-2xl font-black block mt-1 text-green-400">{kpis.active}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
              <CheckCircle className="w-5.5 h-5.5" />
            </div>
          </div>

          {/* Expiring */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-extrabold font-bold">Para Vencer (30d)</span>
              <span className="text-2xl font-black block mt-1 text-amber-400">{kpis.expiring}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5.5 h-5.5" />
            </div>
          </div>

          {/* Expired */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-extrabold font-bold">Regularidade Pendente</span>
              <span className="text-2xl font-black block mt-1 text-red-400">{kpis.expired}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar input */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar por Razão Social, CNPJ ou destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
            />
          </div>

          {/* Status buttons filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Todos" },
              { id: "active", label: "Ativos" },
              { id: "expiring", label: "Para Vencer" },
              { id: "expired", label: "Vencidos" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as "all" | "active" | "expiring" | "expired")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                  statusFilter === f.id
                    ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "bg-[var(--color-surface-alt)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Cadastur Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto select-text text-left">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] text-[10px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-wider">
                  <th className="px-5 py-3.5">Empresa</th>
                  <th className="px-5 py-3.5">CNPJ</th>
                  <th className="px-5 py-3.5">Categoria</th>
                  <th className="px-5 py-3.5">Atrativo Vinculado</th>
                  <th className="px-5 py-3.5">Vencimento</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)] text-xs">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[var(--color-text-muted)]">
                      Nenhum cadastro encontrado para a busca especificada.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((b) => (
                    <tr key={b.id} className="hover:bg-[var(--color-surface-hover)]/30 transition-colors">
                      {/* Name */}
                      <td className="px-5 py-3.5 font-bold text-[var(--color-text)]">
                        {b.nome}
                      </td>
                      {/* CNPJ */}
                      <td className="px-5 py-3.5 font-mono text-slate-400">
                        {b.cnpj}
                      </td>
                      {/* Type */}
                      <td className="px-5 py-3.5 font-semibold text-slate-300">
                        {b.tipo}
                      </td>
                      {/* Destination */}
                      <td className="px-5 py-3.5 text-slate-400">
                        {b.destino.split(" e ")[0]}
                      </td>
                      {/* Expiration Date */}
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-300">
                        {formatDate(b.vencimento)}
                      </td>
                      {/* Status Badge */}
                      <td className="px-5 py-3.5 text-center">
                        <Badge
                          variant={
                            b.statusCadastur === "active"
                              ? "success"
                              : b.statusCadastur === "expiring"
                              ? "warning"
                              : "danger"
                          }
                          size="sm"
                        >
                          {b.statusCadastur === "active"
                            ? "Ativo"
                            : b.statusCadastur === "expiring"
                            ? "Para Vencer"
                            : "Vencido"}
                        </Badge>
                      </td>
                      {/* Action */}
                      <td className="px-5 py-3.5 text-center">
                        {b.statusCadastur !== "active" ? (
                          <button
                            onClick={() => handleNotify(b.id, b.nome)}
                            disabled={notifiedId === b.id}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded-lg bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-primary)] transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>{notifiedId === b.id ? "Avisando..." : "Avisar"}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
