"use client";

import { Activity, ShieldCheck, AlertTriangle, ArrowUpRight } from "lucide-react";
import { destinosInfo, calcularISA, Feedback } from "@/data/mockData";

interface ISAGaugeProps {
  score: number;
  destinoNome: string;
  feedbacks: Feedback[];
}

export default function ISAGauge({ score, destinoNome, feedbacks }: ISAGaugeProps) {
  // Determine color theme based on score
  let strokeColor = "stroke-emerald-500";
  let textColor = "text-emerald-400";
  let bgFill = "bg-emerald-500/10";
  let borderCol = "border-emerald-500/20";
  let icon = <ShieldCheck className="w-5 h-5 text-emerald-400" />;
  let desc = "Destino Sustentável e Seguro";

  if (score < 60) {
    strokeColor = "stroke-red-500";
    textColor = "text-red-400";
    bgFill = "bg-red-500/10";
    borderCol = "border-red-500/20";
    icon = <AlertTriangle className="w-5 h-5 text-red-400" />;
    desc = "Intervenção Urgente Requerida";
  } else if (score < 80) {
    strokeColor = "stroke-amber-500";
    textColor = "text-amber-400";
    bgFill = "bg-amber-500/10";
    borderCol = "border-amber-500/20";
    icon = <Activity className="w-5 h-5 text-amber-400" />;
    desc = "Atenção e Monitoramento Necessários";
  }

  // Calculate gauges breakdowns from local feedbacks for target destination
  const destFeedbacks = feedbacks.filter((f) => f.destino === destinoNome);
  const total = destFeedbacks.length;

  const calculateRatio = (key: keyof Omit<Feedback, "id" | "destino" | "nota_geral" | "comentario" | "timestamp">) => {
    if (total === 0) return 75; // Default fallback to look full
    const count = destFeedbacks.filter((f) => f[key] === true).length;
    return Math.round((count / total) * 100);
  };

  const cleanPct = calculateRatio("limpo");
  const signPct = calculateRatio("sinalizado");
  const naturePct = calculateRatio("preservado");
  const safetyPct = calculateRatio("seguranca");

  // Calculate ranking list for destinations
  const ranking = destinosInfo
    .map((d) => ({
      nome: d.nome,
      municipio: d.municipio,
      isa: calcularISA(d.nome, feedbacks),
    }))
    .sort((a, b) => b.isa - a.isa);

  // SVG parameters for gauge
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // Semicircular stroke dash offset (gauge maps 0-100 to half circumference)
  const offset = circumference - (score / 100) * (circumference / 2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Gauge Semicircle */}
      <div className={`bg-slate-900/50 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden`}>
        <div className="absolute top-4 left-4 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Métrica Viva</span>
        </div>

        {/* Gauge SVG */}
        <div className="relative w-44 h-28 flex items-center justify-center mt-4">
          <svg className="w-full h-full transform -rotate-180" viewBox="0 0 120 120">
            {/* Background Semicircle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="stroke-slate-800 fill-none"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference / 2}
              strokeLinecap="round"
            />
            {/* Active Colored Arc */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className={`${strokeColor} fill-none transition-all duration-1000 ease-out`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          {/* Central Score Text */}
          <div className="absolute bottom-2 flex flex-col items-center">
            <span className="text-3xl font-extrabold text-white leading-none">{score}</span>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mt-1">ISA Score</span>
          </div>
        </div>

        {/* Status indicator */}
        <div className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${bgFill} ${borderCol} mt-4`}>
          {icon}
          <div className="text-left">
            <p className={`text-xs font-bold ${textColor}`}>{desc}</p>
            <p className="text-[10px] text-slate-500">{total} avaliações processadas</p>
          </div>
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Composição da Saúde do Atrativo</h4>
        <div className="space-y-3">
          <BreakdownBar label="Limpeza & Coleta" pct={cleanPct} color="bg-emerald-500" />
          <BreakdownBar label="Sinalização" pct={signPct} color="bg-blue-500" />
          <BreakdownBar label="Preservação Ambiental" pct={naturePct} color="bg-cyan-500" />
          <BreakdownBar label="Segurança Ativa" pct={safetyPct} color="bg-violet-500" />
        </div>
        <p className="text-[9px] text-slate-500 leading-normal mt-3">
          * O ISA cruza dados de investimentos locais, modais de transporte, pressão de saturação e a percepção direta do turista.
        </p>
      </div>

      {/* Mini Ranking of Destinations */}
      <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ranking de Saúde do RN</h4>
        <div className="space-y-2.5 overflow-y-auto max-h-44 pr-1">
          {ranking.map((item, idx) => (
            <div key={item.nome} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.03] last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-slate-600 font-bold">{idx + 1}º</span>
                <div className="truncate">
                  <p className="font-semibold text-slate-200 truncate">{item.nome}</p>
                  <p className="text-[9px] text-slate-500">{item.municipio}</p>
                </div>
              </div>
              <span className={`font-extrabold font-mono px-2 py-0.5 rounded ${
                item.isa >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                item.isa >= 60 ? "bg-amber-500/10 text-amber-400" :
                "bg-red-500/10 text-red-400"
              }`}>{item.isa}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BreakdownBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-white font-mono">{pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
