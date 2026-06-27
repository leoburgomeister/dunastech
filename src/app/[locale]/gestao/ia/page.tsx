"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { destinosInfo, fluxoData, transporteData, investimentosData, calcularISA } from "@/data/mockData";
import { Brain, Sparkles, Loader2, Send, MessageSquare, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function IAGestaoPage() {
  const [selectedDestino, setSelectedDestino] = useState(destinosInfo[0].nome);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "ai", text: "Olá! Sou a DunasIA. Posso ajudar a analisar o fluxo de visitantes, sugerir investimentos ou detalhar o Índice ISA dos destinos turísticos. O que gostaria de saber?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const currentFluxo = fluxoData.find((f) => f.destino === selectedDestino);
  const currentTransport = transporteData.find((t) => t.destino === selectedDestino);
  const currentInvest = investimentosData.find((i) => i.destino === selectedDestino);

  const generateDiagnostic = async () => {
    setLoadingInsight(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destino: selectedDestino,
          feedbacks: [], // Will load live feedbacks in background or fallbacks
          transporteInfo: currentTransport,
          investimentoInfo: currentInvest,
          isaScore: calcularISA(selectedDestino, []),
        }),
      });
      const data = await res.json();
      setAiInsight(data.insight || data.error);
    } catch (err) {
      console.error("Gemini AI error:", err);
      setAiInsight("Falha ao conectar à API do Gemini. Verifique as credenciais no servidor.");
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
      // Simulate/call Gemini for chat context
      const prompt = `Analise no contexto do turismo do Rio Grande do Norte (Destino selecionado: ${selectedDestino}). Pergunta do gestor: ${userText}`;
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destino: selectedDestino,
          customPrompt: prompt,
          isaScore: calcularISA(selectedDestino, []),
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: "ai", text: data.insight || "Entendi. Como posso ajudar com mais informações sobre o observatório?" }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) => [...prev, { sender: "ai", text: "Desculpe, tive um problema de conexão para processar essa pergunta agora." }]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Diagnóstico com Inteligência Artificial</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Geração de relatórios executivos com a API do Google Gemini.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedDestino}
              onChange={(e) => {
                setSelectedDestino(e.target.value);
                setAiInsight("");
              }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-xs font-semibold text-[var(--color-text)] focus:outline-none cursor-pointer"
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
              icon={loadingInsight ? undefined : Brain}
            >
              {loadingInsight ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processando...
                </span>
              ) : (
                "Gerar Diagnóstico"
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Diagnostic Panel */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <Card className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-2.5">
                  <h3 className="font-extrabold text-sm text-[var(--color-text)] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Zeladoria Preditiva: {selectedDestino.split(" e ")[0]}
                  </h3>
                  <Badge variant="info" size="sm">Gemini 1.5 Pro</Badge>
                </div>

                <div className="pt-4 text-left leading-relaxed text-xs text-[var(--color-text-secondary)]">
                  {aiInsight ? (
                    <div className="space-y-2 bg-[var(--color-surface-alt)] p-4 rounded-xl border border-[var(--color-border-light)] font-medium">
                      <p className="whitespace-pre-line">{aiInsight}</p>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-[var(--color-text-muted)]">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
                      <p className="font-semibold">Nenhum diagnóstico gerado para esta praia</p>
                      <p className="text-[10px] mt-1">Selecione o destino e clique no botão superior para interrogar o Gemini.</p>
                    </div>
                  )}
                </div>
              </div>

              {aiInsight && (
                <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex gap-2 text-left">
                  <ShieldAlert className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <span className="text-[10px] text-slate-400">
                    O diagnóstico cruza tráfego aéreo, volume de ônibus e o feedback em tempo real para propor investimentos.
                  </span>
                </div>
              )}
            </Card>
          </div>

          {/* DunasIA Chat Panel */}
          <div className="lg:col-span-6 flex flex-col">
            <Card className="p-5 flex-1 flex flex-col h-[450px]">
              <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-2.5">
                <h3 className="font-extrabold text-sm text-[var(--color-text)] flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" />
                  Assistente de Conversação DunasIA
                </h3>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
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
                        : "bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 text-[var(--color-primary-text)] ml-auto bg-[var(--color-primary)]"
                    )}
                  >
                    {msg.text}
                  </div>
                ))}
                {loadingChat && (
                  <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text)] rounded-2xl p-3 text-xs mr-auto flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-primary)]" />
                    <span>DunasIA está pensando...</span>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="border-t border-[var(--color-border-light)] pt-3 flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escreva sua pergunta para a DunasIA..."
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
