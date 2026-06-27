"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  DollarSign,
  Plane,
  Activity,
  Camera,
  BrainCircuit,
  Loader2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  fluxoData,
  transporteData,
  investimentosData,
  destinosInfo,
  calcularISA,
  type Feedback,
} from "@/data/mockData";
import { subscribeFeedbacks } from "@/lib/firebase";
import ISAGauge from "./ISAGauge";
import AIChatSidebar from "./AIChatSidebar";

interface InstagramPost {
  id: string;
  ownerUsername: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  sentiment: string;
}

interface InstagramResult {
  source: string;
  hashtag: string;
  posts: InstagramPost[];
  totalLikes: number;
  totalComments: number;
}

export default function ManagerView() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedDestino, setSelectedDestino] = useState(destinosInfo[0].nome);
  const [instagramData, setInstagramData] = useState<InstagramResult | null>(null);
  const [loadingInstagram, setLoadingInstagram] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [showFeedbacks, setShowFeedbacks] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Subscribe to real-time feedbacks
  useEffect(() => {
    const unsubscribe = subscribeFeedbacks((data) => {
      // Map legacy or raw structure safely to complete feedback structure
      const formatted = data.map((f: any) => ({
        ...f,
        limpo: !!f.limpo,
        sinalizado: !!f.sinalizado,
        preservado: !!f.preservado,
        acessibilidade: !!f.acessibilidade,
        seguranca: !!f.seguranca,
        custo_beneficio: !!f.custo_beneficio,
        conservacao: !!f.conservacao,
        superlotado: !!f.superlotado,
        nota_geral: typeof f.nota_geral === "number" ? f.nota_geral : 4,
      }));
      setFeedbacks(formatted);
    });
    return () => unsubscribe();
  }, []);

  // Current destination data
  const fluxo = fluxoData.find((f) => f.destino === selectedDestino);
  const transporte = transporteData.find((t) => t.destino === selectedDestino);
  const investimento = investimentosData.find((i) => i.destino === selectedDestino);
  const isaScore = calcularISA(selectedDestino, feedbacks);
  const destinoFeedbacks = feedbacks.filter((f) => f.destino === selectedDestino);

  // Fetch Instagram data
  const fetchInstagram = useCallback(async () => {
    setLoadingInstagram(true);
    try {
      const hashtag = fluxo?.hashtag_instagram || "pontanegranatal";
      const res = await fetch("/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashtag }),
      });
      const data = await res.json();
      setInstagramData(data);
    } catch (error) {
      console.error("Instagram fetch error:", error);
    } finally {
      setLoadingInstagram(false);
    }
  }, [fluxo]);

  // Fetch AI insights
  const fetchAIInsight = useCallback(async () => {
    setLoadingAI(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destino: selectedDestino,
          feedbacks: destinoFeedbacks,
          transporteInfo: transporte,
          investimentoInfo: investimento,
          instagramData,
          isaScore,
        }),
      });
      const data = await res.json();
      setAiInsight(data.insight || data.error);
    } catch (error) {
      console.error("AI insight error:", error);
      setAiInsight("Erro ao gerar diagnóstico. Tente novamente.");
    } finally {
      setLoadingAI(false);
    }
  }, [selectedDestino, destinoFeedbacks, transporte, investimento, instagramData, isaScore]);

  // Chart data covering all destinosInfo list
  const chartDataISA = destinosInfo.map((d) => ({
    destino: d.nome.replace("Praia ", "").replace("Cidade ", "").split(" e ")[0].split(" do ")[0].split(" de ")[0].slice(0, 10),
    ISA: calcularISA(d.nome, feedbacks),
    Saturação: fluxoData.find((f) => f.destino === d.nome)?.saturacao_turistica || 0,
  }));

  const chartDataTransporte = destinosInfo.map((d) => {
    const t = transporteData.find((tr) => tr.destino === d.nome);
    return {
      destino: d.nome.replace("Praia ", "").replace("Cidade ", "").split(" e ")[0].split(" do ")[0].split(" de ")[0].slice(0, 10),
      Aéreo: t?.voos_mensais || 0,
      Ônibus: t?.onibus_mensais || 0,
      Veículos: Math.round((t?.veiculos_terrestres_mensais || 0) / 100),
    };
  });

  // Totals for KPIs
  const totalVisitantes = fluxoData.reduce((s, f) => s + f.fluxo_visitantes_mes, 0);
  const totalReceita = fluxoData.reduce((s, f) => s + f.receita_estimada_milhoes, 0);

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto pb-12 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Observatório de Gestão B2G
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Painel de análise preditiva de sustentabilidade e controle de fluxo do RN.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Ask AI Trigger Button */}
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-violet-600/15"
          >
            <BrainCircuit className="w-4 h-4" />
            Perguntar à DunasIA
          </button>

          <select
            value={selectedDestino}
            onChange={(e) => {
              setSelectedDestino(e.target.value);
              setInstagramData(null);
              setAiInsight("");
            }}
            className="bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:border-amber-500/50 transition-all"
          >
            {destinosInfo.map((d) => (
              <option key={d.nome} value={d.nome}>
                📍 {d.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DETAILED ISA VISUALIZATION COMPONENT */}
      <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            📊 ISA (Índice de Saúde do Atrativo)
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            O principal indicador ecológico da plataforma, calculado em tempo real.
          </p>
        </div>
        <ISAGauge score={isaScore} destinoNome={selectedDestino} feedbacks={feedbacks} />
      </div>

      {/* Secondary KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          icon={<Users className="w-5 h-5" />}
          title="Visitantes no Atrativo"
          value={fluxo?.fluxo_visitantes_mes.toLocaleString("pt-BR") || "—"}
          sub={`${totalVisitantes.toLocaleString("pt-BR")} visitantes / mês em todo o RN`}
          accent="cyan"
        />
        <KPICard
          icon={<DollarSign className="w-5 h-5" />}
          title="Receita Gerada Estimada"
          value={`R$ ${fluxo?.receita_estimada_milhoes || 0}M`}
          sub={`R$ ${totalReceita}M total movimentados no RN`}
          accent="emerald"
        />
        <KPICard
          icon={<Plane className="w-5 h-5" />}
          title="Variação de Tráfego Recente"
          value={transporte ? `${transporte.variacao_percentual}%` : "—"}
          sub={`Modal principal: ${transporte?.modal_principal || "N/A"}`}
          accent="amber"
          trend={transporte?.variacao_percentual}
        />
      </div>

      {/* Web Responsive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ISA Comparison */}
        <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Comparativo Geral: ISA vs Saturação
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Análise cruzada de preservação vs superlotação por destino.
            </p>
          </div>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartDataISA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="destino" tick={{ fill: "#94A3B8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0F172A",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 11,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="ISA" fill="#F59E0B" radius={[4, 4, 0, 0]} name="ISA Geral" />
                  <Bar dataKey="Saturação" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Saturação %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transportation Pressure */}
        <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Pressão de Carga por Eixos Rodoviários
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Volume de transporte em veículos e ônibus monitorados (centenas).
            </p>
          </div>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartDataTransporte}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="destino" tick={{ fill: "#94A3B8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0F172A",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 11,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="Aéreo" stroke="#818CF8" strokeWidth={2} name="Voos" />
                  <Line type="monotone" dataKey="Ônibus" stroke="#F59E0B" strokeWidth={2} name="Ônibus" />
                  <Line type="monotone" dataKey="Veículos" stroke="#06B6D4" strokeWidth={2} name="Veículos (x100)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Social and AI Insight Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social Scraper */}
        <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Sensor Social (Instagram)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Captação automática de sentimentos com hashtag local.
              </p>
            </div>
            <button
              onClick={fetchInstagram}
              disabled={loadingInstagram}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all"
            >
              {loadingInstagram ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              {loadingInstagram ? "Buscando..." : "Atualizar Hashtag"}
            </button>
          </div>

          {instagramData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-3 text-center">
                  <span className="text-xl font-bold text-pink-400">
                    {instagramData.totalLikes.toLocaleString("pt-BR")}
                  </span>
                  <span className="block text-[9px] text-slate-500 uppercase mt-0.5">Curtidas</span>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3 text-center">
                  <span className="text-xl font-bold text-purple-400">
                    {instagramData.totalComments.toLocaleString("pt-BR")}
                  </span>
                  <span className="block text-[9px] text-slate-500 uppercase mt-0.5">Comentários</span>
                </div>
              </div>
              <div className="space-y-2">
                {instagramData.posts.map((post) => (
                  <div key={post.id} className="bg-slate-950/40 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white font-bold">@{post.ownerUsername}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          post.sentiment === "Positivo"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        {post.sentiment}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 italic line-clamp-2">&ldquo;{post.caption}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Insight report */}
        <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Diagnóstico Executivo da IA
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Parecer estruturado de riscos preditivos e sugestão de gabinete.
              </p>
            </div>
            <button
              onClick={fetchAIInsight}
              disabled={loadingAI}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all"
            >
              {loadingAI ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BrainCircuit className="w-3.5 h-3.5" />
              )}
              Gerar Diagnóstico
            </button>
          </div>

          {aiInsight && (
            <div className="bg-violet-500/5 border border-violet-500/10 rounded-2xl p-4">
              <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                {aiInsight}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Feedbacks Log */}
      {destinoFeedbacks.length > 0 && (
        <div className="bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden">
          <button
            onClick={() => setShowFeedbacks(!showFeedbacks)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
          >
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Feedbacks do Turista (Últimos {destinoFeedbacks.length})
            </h3>
            {showFeedbacks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showFeedbacks && (
            <div className="border-t border-white/5 p-4 space-y-3 max-h-64 overflow-y-auto">
              {destinoFeedbacks.map((f, i) => (
                <div key={i} className="bg-slate-950/40 rounded-xl p-3.5 border border-white/[0.03] space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-semibold">
                      {new Date(f.timestamp).toLocaleString("pt-BR")}
                    </span>
                    <span className="text-amber-400 font-bold flex gap-0.5">
                      {"★".repeat(f.nota_geral)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {f.limpo && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] border border-emerald-500/20">limpo</span>}
                    {f.preservado && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] border border-emerald-500/20">preservado</span>}
                    {f.seguranca && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] border border-emerald-500/20">segurança</span>}
                    {!f.conservacao && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px] border border-red-500/20">manutenção</span>}
                    {f.superlotado && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px] border border-red-500/20">superlotado</span>}
                  </div>
                  {f.comentario && <p className="text-xs text-slate-300 italic leading-relaxed">&ldquo;{f.comentario}&rdquo;</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHAT AI SIDEBAR INTEGRATION */}
      <AIChatSidebar
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        feedbacks={feedbacks}
        destinoAtual={selectedDestino}
      />
    </div>
  );
}

// --- KPI Card Component ---
function KPICard({
  icon,
  title,
  value,
  sub,
  accent,
  trend,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  accent: "cyan" | "emerald" | "amber";
  trend?: number;
}) {
  const colors = {
    cyan: { bg: "bg-cyan-500/5", border: "border-cyan-500/10", text: "text-cyan-400" },
    emerald: { bg: "bg-emerald-500/5", border: "border-emerald-500/10", text: "text-emerald-400" },
    amber: { bg: "bg-amber-500/5", border: "border-amber-500/10", text: "text-amber-400" },
  };
  const c = colors[accent];

  return (
    <div className={`${c.bg} border ${c.border} rounded-3xl p-5 flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-3">
        <span className={c.text}>{icon}</span>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-[9px] font-extrabold ${
              trend > 15 ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {trend > 15 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend}% var.
          </span>
        )}
      </div>
      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{title}</span>
      <span className="text-2xl font-extrabold text-white mt-1.5">{value}</span>
      <span className="text-[10px] text-slate-500 mt-2 leading-relaxed">{sub}</span>
    </div>
  );
}
