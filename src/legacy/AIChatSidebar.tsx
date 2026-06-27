"use client";

import { useState, useRef, useEffect } from "react";
import {
  BrainCircuit,
  X,
  Send,
  Loader2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { DestinoInfo, Feedback } from "@/data/mockData";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  feedbacks: Feedback[];
  destinoAtual: string;
}

export default function AIChatSidebar({
  isOpen,
  onClose,
  feedbacks,
  destinoAtual,
}: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Olá, Gestor! Sou o Assistente IA da DunasTech. Posso responder perguntas sobre o ISA dos destinos, reportes de manutenção, saturação de fluxo e sugerir planos de ação. O que deseja saber?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      // Send chat message along with current system state to Gemini route
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatMode: true,
          message: userMessage,
          history: messages,
          destino: destinoAtual,
          feedbacks, // Send overall feedbacks so IA knows the live updates
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "model", text: data.insight || data.error || "Sem resposta da IA." },
      ]);
    } catch (error) {
      console.error("AI Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Erro ao se conectar com a IA. Tente novamente mais tarde." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sugestoes = [
    "Qual atrativo tem o pior ISA?",
    "Resumo de reclamações sobre Ponta Negra",
    "Qual modal é mais usado no estado?",
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-950 border-l border-white/[0.06] shadow-2xl flex flex-col">
      {/* Sidebar Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#04060c]">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-violet-400" />
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1">
              DunasIA Chat
              <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
            </h3>
            <p className="text-[10px] text-slate-500">Inteligência Turística Potiguar</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col max-w-[85%] ${
              msg.role === "user" ? "ml-auto items-end" : "items-start"
            }`}
          >
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-none"
                  : "bg-slate-900 border border-white/5 text-slate-300 rounded-tl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
            <span className="text-[9px] text-slate-600 mt-1 px-1">
              {msg.role === "user" ? "Você" : "DunasIA"}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3 max-w-[85%] rounded-tl-none">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
            <span>Processando dados reais...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Overlay */}
      {messages.length === 1 && (
        <div className="px-5 py-3 border-t border-white/[0.04] bg-[#04060c]/30">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Dúvidas frequentes:
          </p>
          <div className="flex flex-col gap-1.5">
            {sugestoes.map((sug) => (
              <button
                key={sug}
                onClick={() => setInput(sug)}
                className="text-left text-xs text-slate-400 bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-violet-500/30 px-3 py-2 rounded-xl transition-all"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="p-4 border-t border-white/[0.06] bg-[#04060c]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pergunte sobre os destinos ou dados..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
