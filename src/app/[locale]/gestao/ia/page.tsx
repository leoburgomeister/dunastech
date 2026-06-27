"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { destinosInfo, fluxoData, transporteData, investimentosData, calcularISA } from "@/data/mockData";
import type { Feedback } from "@/data/mockData";
import { subscribeFeedbacks } from "@/lib/firebase";
import { Brain, Sparkles, Loader2, Send, MessageSquare, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

// Local high-fidelity mock reports so that the UI is instantly populated and never empty!
const localMockDiagnostics: Record<string, string> = {
  "Ponta Negra e Morro do Careca": `RELATÓRIO DE SAÚDE TURÍSTICA & ECOLOGIA (PONTA NEGRA)
-----------------------------------------------------------
• Índice ISA: 42/100 (Estado Crítico)
• Saturação de Visitantes: 88% (Alerta de Sobrecarga)
• Tendência de Fluxo: Alta Pressão (Voo + Ônibus de Excursão)

DIAGNÓSTICO PREDITIVO:
O Morro do Careca e a Orla de Ponta Negra registram picos de saturação nos finais de semana que excedem a capacidade de suporte sanitário e de segurança. Os dados de feedbacks indicam forte insatisfação nos quesitos "Limpeza de Areia" e "Sensação de Segurança" no entardecer.

PROPOSTAS DE INVESTIMENTO DE ZELADORIA:
1. Saneamento e Limpeza: Alocar R$ 1.5M extraordinários para coleta mecanizada de resíduos na areia em 3 turnos.
2. Controle de Fluxo: Proibir tráfego de ônibus de turismo de grande porte na rota litorânea direta a partir das sextas-feiras.
3. Certificação: Exigir o selo do Cadastur para todos os quiosques cooperados da orla para coibir preços abusivos.`,

  "Praia da Pipa": `RELATÓRIO DE SAÚDE TURÍSTICA & ECOLOGIA (PIPA)
-----------------------------------------------------------
• Índice ISA: 79/100 (Estado Saudável)
• Saturação de Visitantes: 76% (Atenção Moderada)
• Tendência de Fluxo: Alta Pressão Terrestre (Veículos Particulares)

DIAGNÓSTICO PREDITIVO:
A Baía dos Golfinhos e a Praia do Amor mantêm estabilidade de preservação, contudo o centro histórico de Pipa sofre com gargalos de tráfego de automóveis e estacionamento irregular, gerando insatisfação em "Sinalização e Mobilidade".

PROPOSTAS DE INVESTIMENTO DE ZELADORIA:
1. Mobilidade Ativa: Criação de bolsões de estacionamento rotativo periférico com shuttles elétricos para o centro histórico.
2. Monitoramento Ambiental: Instalação de barreira física móvel no topo das falésias para delimitar segurança de caminhadas.
3. Cadastur: Lançamento de edital para regularizar e treinar 100% dos guias informais que operam na descida ecológica.`,

  "São Miguel do Gostoso": `RELATÓRIO DE SAÚDE TURÍSTICA & ECOLOGIA (GOSTOSO)
-----------------------------------------------------------
• Índice ISA: 86/100 (Estado Excelente)
• Saturação de Visitantes: 48% (Sustentabilidade Ótima)
• Tendência de Fluxo: Crescimento Estável (Turismo de Vento/Esportes)

DIAGNÓSTICO PREDITIVO:
Com baixa saturação e altíssima preservação, São Miguel do Gostoso é um exemplo de turismo sustentável. Os gargalos identificados são quase que exclusivamente ligados à falta de iluminação eco-friendly em acessos secundários de praia.

PROPOSTAS DE INVESTIMENTO DE ZELADORIA:
1. Divulgação Qualificada: Impulsionamento em canais nacionais com foco em "Ecoturismo Premium" e "Kitesurf".
2. Iluminação Ecológica: Projeto de R$ 400k para balizamento de praia com painéis solares autônomos de baixa emissão de luz.
3. Fiscalização Cadastur: Manutenção do rastreio de pousadas e instrutores de vela esportiva para blindar a qualidade de serviços.`
};

export default function IAGestaoPage() {
  const [selectedDestino, setSelectedDestino] = useState(destinosInfo[0].nome);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    const unsub = subscribeFeedbacks(setFeedbacks);
    return () => unsub();
  }, []);

  const currentTransport = transporteData.find((t) => t.destino === selectedDestino);
  const currentInvest = investimentosData.find((i) => i.destino === selectedDestino);

  // Auto-load reports and greetings when switching destinations
  useEffect(() => {
    const key = selectedDestino;
    const defaultText = localMockDiagnostics[key] || localMockDiagnostics["Ponta Negra e Morro do Careca"];
    const isa = calcularISA(selectedDestino, feedbacks);
    
    const t = setTimeout(() => {
      setAiInsight(defaultText);
      setChatMessages([
        { 
          sender: "ai", 
          text: `Olá! Sou a DunasIA. Estou monitorando o atrativo "${selectedDestino}". O Índice ISA atual está em ${isa}/100. Posso ajudar a detalhar o relatório ecológico ou discutir alternativas de investimento para esta praia. O que gostaria de saber sobre a gestão deste atrativo?` 
        }
      ]);
    }, 0);

    return () => clearTimeout(t);
  }, [selectedDestino, feedbacks]);

  const generateDiagnostic = async () => {
    setLoadingInsight(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destino: selectedDestino,
          feedbacks,
          transporteInfo: currentTransport,
          investimentoInfo: currentInvest,
          isaScore: calcularISA(selectedDestino, feedbacks),
        }),
      });
      const data = await res.json();
      if (data.insight) {
        setAiInsight(data.insight);
      }
    } catch (err) {
      console.error("Gemini AI error:", err);
      // Keep mock as fallback
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loadingChat) return;

    const userText = inputValue;
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInputValue("");
    setLoadingChat(true);

    try {
      const formattedHistory = chatMessages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text,
      }));

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatMode: true,
          message: userText,
          history: formattedHistory,
          feedbacks,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: "ai", text: data.insight || "Entendi. Gostaria de focar em quais investimentos de mobilidade ou sinalização?" }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) => [...prev, { sender: "ai", text: "Desculpe, tive um problema temporário de conexão para consultar o Gemini." }]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header & Main Selector */}
        <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-[var(--color-primary)]" />
              IA Diagnóstico & Zeladoria Preditiva
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Análise ecológica, cruzamento de dados de transporte e geração de insights com Google Gemini.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[var(--color-text-secondary)]">Atrativo Ativo:</span>
            <select
              value={selectedDestino}
              onChange={(e) => setSelectedDestino(e.target.value)}
              className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-xs font-semibold text-[var(--color-text)] focus:outline-none cursor-pointer"
            >
              {destinosInfo.map((d) => (
                <option key={d.nome} value={d.nome}>
                  📍 {d.nome.split(" e ")[0]}
                </option>
              ))}
            </select>

            <Button
              onClick={generateDiagnostic}
              disabled={loadingInsight}
              size="sm"
            >
              {loadingInsight ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Atualizando...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Reanalisar
                </span>
              )}
            </Button>
          </div>
        </Card>

        {/* Dynamic Panels layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Diagnostic Panel */}
          <div className="lg:col-span-6 flex flex-col">
            <Card className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-2.5">
                  <h3 className="font-extrabold text-sm text-[var(--color-text)] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Auditoria Preditiva de Sustentabilidade
                  </h3>
                  <Badge variant="info" size="sm">Gemini 1.5 Pro</Badge>
                </div>

                <div className="flex-1 pt-4 text-left leading-relaxed text-xs text-[var(--color-text-secondary)]">
                  <div className="whitespace-pre-line bg-[var(--color-surface-alt)] p-4 rounded-xl border border-[var(--color-border-light)] font-mono text-[11px] leading-relaxed text-slate-300">
                    {aiInsight}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex gap-2 text-left mt-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-slate-400 leading-normal">
                  A IA analisa em tempo real o fluxo de visitantes diários vs. a capacidade de suporte sanitário e os cadastros ativos do Cadastur.
                </span>
              </div>
            </Card>
          </div>

          {/* DunasIA Chat Panel */}
          <div className="lg:col-span-6 flex flex-col">
            <Card className="p-5 flex-1 flex flex-col h-[480px]">
              <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-2.5">
                <h3 className="font-extrabold text-sm text-[var(--color-text)] flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" />
                  Contexto de Chat: {selectedDestino.split(" e ")[0]}
                </h3>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin select-text text-left">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex max-w-[80%] flex-col rounded-2xl p-3 text-xs leading-relaxed",
                      msg.sender === "ai"
                        ? "bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text)] mr-auto"
                        : "bg-[var(--color-primary)] text-white ml-auto"
                    )}
                  >
                    {msg.text}
                  </div>
                ))}
                {loadingChat && (
                  <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text)] rounded-2xl p-3 text-xs mr-auto flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-primary)]" />
                    <span>DunasIA está redigindo...</span>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="border-t border-[var(--color-border-light)] pt-3 flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Pergunte à DunasIA sobre a zeladoria de ${selectedDestino.split(" e ")[0]}...`}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                />
                <button
                  type="submit"
                  disabled={loadingChat || !inputValue.trim()}
                  className="p-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
