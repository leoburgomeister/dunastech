"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin,
  Star,
  Phone,
  Send,
  CheckCircle2,
  Building2,
  Utensils,
  Compass,
  Hotel,
  Briefcase,
  ShieldCheck,
  CompassIcon,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  destinosInfo,
  cadasturData,
  avaliacaoOptions,
  type Feedback,
  DestinoInfo,
} from "@/data/mockData";
import { addFeedback } from "@/lib/firebase";

// Dynamically import Leaflet map to prevent SSR window reference crash
const DestinationMap = dynamic(() => import("./DestinationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
      Carregando mapa da rota...
    </div>
  ),
});

const tipoIcons: Record<string, React.ReactNode> = {
  Hotel: <Hotel className="w-4 h-4" />,
  Restaurante: <Utensils className="w-4 h-4" />,
  Guia: <Compass className="w-4 h-4" />,
  Pousada: <Hotel className="w-4 h-4" />,
  Agência: <Briefcase className="w-4 h-4" />,
};

export default function TouristView() {
  const [selectedDestinoNome, setSelectedDestinoNome] = useState(destinosInfo[0].nome);
  const [avaliacoes, setAvaliacoes] = useState<Record<string, boolean>>({});
  const [notaGeral, setNotaGeral] = useState<number>(5);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const destino = destinosInfo.find((d) => d.nome === selectedDestinoNome)!;
  const negocios = cadasturData.filter(
    (b) => b.destino === selectedDestinoNome && b.regularizado
  );

  // Compute validation progress percentage for visual helper
  const totalOptions = avaliacaoOptions.length;
  const checkedOptionsCount = Object.keys(avaliacoes).filter((k) => avaliacoes[k]).length;
  const completionProgress = Math.round((checkedOptionsCount / totalOptions) * 100);

  const handleSubmit = async () => {
    setEnviando(true);
    try {
      const feedback: Omit<Feedback, "id" | "timestamp"> = {
        destino: selectedDestinoNome,
        limpo: !!avaliacoes["limpo"],
        sinalizado: !!avaliacoes["sinalizado"],
        preservado: !!avaliacoes["preservado"],
        acessibilidade: !!avaliacoes["acessibilidade"],
        seguranca: !!avaliacoes["seguranca"],
        custo_beneficio: !!avaliacoes["custo_beneficio"],
        conservacao: !!avaliacoes["conservacao"],
        superlotado: !!avaliacoes["superlotado"],
        nota_geral: notaGeral,
        comentario: comentario.trim() || undefined,
      };
      await addFeedback(feedback);
      setEnviado(true);
      setTimeout(() => {
        setEnviado(false);
        setAvaliacoes({});
        setComentario("");
        setNotaGeral(5);
      }, 3000);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto px-1 sm:px-4">
      {/* Header */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5" />
          Sensor Social B2C
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Explore o Rio Grande do Norte
        </h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Selecione um destino do RN abaixo, explore as rotas mapeadas de parceiros oficiais e ajude a avaliar a saúde do local.
        </p>
      </div>

      {/* CONTINUOUS DESTINATIONS CAROUSEL (Horizontal Scroll) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          📍 Destinos em Foco
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          {destinosInfo.map((d) => {
            const isSelected = d.nome === selectedDestinoNome;
            return (
              <button
                key={d.nome}
                onClick={() => {
                  setSelectedDestinoNome(d.nome);
                  setEnviado(false);
                  setAvaliacoes({});
                }}
                className={`relative flex-shrink-0 w-64 h-36 rounded-2xl overflow-hidden border text-left transition-all ${
                  isSelected
                    ? "border-amber-500 shadow-lg shadow-amber-500/10 scale-[0.98]"
                    : "border-white/5 hover:border-white/20 hover:scale-[1.01]"
                }`}
              >
                <img
                  src={d.imagem}
                  alt={d.nome}
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex flex-col justify-end">
                  <span className="text-[9px] uppercase font-bold text-amber-400 tracking-wider">
                    {d.municipio}
                  </span>
                  <h4 className="text-sm font-extrabold text-white truncate">{d.nome}</h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMN GRID FOR LARGE WEB VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Destination Info & Route Map */}
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center justify-between">
              {destino.nome}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {destino.descricao}
            </p>

            {/* Attractions with Images */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                🎯 Experiências Recomendadas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destino.atracoes.map((act) => {
                  const partner = cadasturData.find((p) => p.id === act.parceiroId);
                  return (
                    <div
                      key={act.id}
                      className="bg-slate-800/40 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/15 transition-all group flex flex-col"
                    >
                      <div className="h-28 w-full relative">
                        <img
                          src={act.imagem}
                          alt={act.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                      </div>
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white">{act.nome}</h4>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                            {act.descricao}
                          </p>
                        </div>
                        {partner && (
                          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[9px] uppercase font-semibold text-slate-500">
                              Oferecido por:
                            </span>
                            <Link
                              href={`/vitrine/${partner.id}`}
                              className="text-[10px] text-amber-400 font-bold hover:underline flex items-center gap-0.5"
                            >
                              {partner.nome} <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Route Map */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <CompassIcon className="w-5 h-5 text-amber-500" />
                Rotas e Operadores Mapeados
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Explore os pontos da rota no mapa e clique para abrir a vitrine de cada parceiro.
              </p>
            </div>
            <DestinationMap destino={destino} />
          </div>
        </div>

        {/* Right Side: Cadastur List & Assessment */}
        <div className="space-y-6">
          {/* Certified Partners */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                🏢 Cadastro Ministério do Turismo (Cadastur)
              </h3>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
                Validados
              </span>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {negocios.map((n) => (
                <div
                  key={n.id}
                  className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex items-center gap-3 hover:border-amber-500/20 transition-all group"
                >
                  <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                    {tipoIcons[n.tipo] || <Building2 className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white truncate">{n.nome}</p>
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-bold">
                        ★ {n.nota}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-slate-500 uppercase font-semibold">
                        {n.tipo}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/vitrine/${n.id}`}
                    className="text-[10px] bg-white/5 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-bold px-3 py-1.5 rounded-lg transition-all"
                  >
                    Ver Vitrine
                  </Link>
                </div>
              ))}
              {negocios.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  Nenhum parceiro Cadastur registrado neste ponto.
                </p>
              )}
            </div>
          </div>

          {/* Health Assessment Form Redesign */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                📋 Avaliação da Saúde Ambiental
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Sua resposta retroalimenta o ISA (Índice de Saúde do Atrativo) e gera alertas preditivos de monitoramento ambiental.
              </p>
            </div>

            {/* Stars Rating */}
            <div className="flex items-center justify-between bg-slate-950/40 border border-white/5 rounded-2xl p-4">
              <span className="text-xs font-semibold text-slate-400">Satisfação Geral:</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNotaGeral(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= notaGeral
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-600 hover:text-slate-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox criteria grid */}
            <div className="grid grid-cols-2 gap-2">
              {avaliacaoOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer border transition-all ${
                    avaliacoes[opt.id]
                      ? opt.negative
                        ? "bg-red-500/10 border-red-500/25"
                        : "bg-emerald-500/10 border-emerald-500/25"
                      : "bg-slate-950/40 border-white/5 hover:bg-white/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!avaliacoes[opt.id]}
                    onChange={(e) =>
                      setAvaliacoes((prev) => ({
                        ...prev,
                        [opt.id]: e.target.checked,
                      }))
                    }
                    className="sr-only"
                  />
                  <span className="text-sm">{opt.emoji}</span>
                  <span
                    className={`text-[10px] font-bold leading-tight ${
                      avaliacoes[opt.id]
                        ? opt.negative
                          ? "text-red-400"
                          : "text-emerald-400"
                        : "text-slate-400"
                    }`}
                  >
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Comentários */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-semibold block">
                Comentários ou Reclamações (Opcional):
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Ex: Banheiros sujos, buracos no acesso, mar limpo..."
                rows={2}
                className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {enviado ? (
              <div className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Obrigado por ajudar a preservar o RN!
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={enviando}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/15"
              >
                <Send className="w-4 h-4" />
                {enviando ? "Enviando..." : "Submeter Avaliação"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
